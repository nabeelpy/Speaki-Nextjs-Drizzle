'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/header'
import MobileNav from '@/components/mobile-nav'
import { getAccentModule } from '@/lib/accent-data'
import { TextToSpeech, VoiceRecorder } from '@/lib/voice-recorder'
import { loadBrowserVoices, findAnyVoiceForLang } from '@/lib/voice-config'

type PlaybackSpeed = 'slow' | 'normal' | 'fast'

const speedConfig: Record<PlaybackSpeed, { label: string; icon: string; description: string; rate: number }> = {
    slow: { label: 'Slow', icon: '🐢', description: '0.6× — Perfect for learning', rate: 0.6 },
    normal: { label: 'Normal', icon: '🎵', description: '1.0× — Conversational pace', rate: 1.0 },
    fast: { label: 'Fast', icon: '🚀', description: '1.5× — Native speed challenge', rate: 1.5 },
}

// Strip phonetic notation and symbols out of a string so TTS reads natural text
function cleanTextForTTS(text: string): string {
    return text
        .replace(/\/[^/]+\//g, '')      // Remove IPA between slashes
        .replace(/[❌✅🐢🎵🚀]/g, '')   // Remove emoji markers
        .replace(/→/g, ' becomes ')
        .replace(/\s+/g, ' ')
        .trim()
}

// Simple word-level comparison between user transcript and expected text
function computePronunciationScore(transcript: string, expected: string): { score: number; matchedWords: string[]; missedWords: string[] } {
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean)
    const expectedWords = normalize(expected)
    const userWords = normalize(transcript)

    const matched: string[] = []
    const missed: string[] = []

    for (const w of expectedWords) {
        if (userWords.includes(w)) {
            matched.push(w)
        } else {
            missed.push(w)
        }
    }

    const score = expectedWords.length > 0 ? Math.round((matched.length / expectedWords.length) * 100) : 0
    return { score, matchedWords: matched, missedWords: missed }
}

export default function ModuleLessonPage() {
    const params = useParams()
    const accentId = params.accentId as string
    const moduleId = params.moduleId as string
    const result = getAccentModule(accentId, moduleId)
    const [expandedLesson, setExpandedLesson] = useState<string | null>(null)
    const [expandedItem, setExpandedItem] = useState<string | null>(null)
    const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>('normal')

    // --- TTS state ---
    const ttsRef = useRef<TextToSpeech | null>(null)
    const [playingId, setPlayingId] = useState<string | null>(null) // id of currently speaking example
    const [voicesLoaded, setVoicesLoaded] = useState(false)
    const voiceRef = useRef<SpeechSynthesisVoice | null>(null)

    // --- Recording state ---
    const recorderRef = useRef<VoiceRecorder | null>(null)
    const [recordingId, setRecordingId] = useState<string | null>(null) // which example is being recorded
    const [liveTranscript, setLiveTranscript] = useState('')
    const [recordingResult, setRecordingResult] = useState<{
        id: string
        transcript: string
        expected: string
        score: number
        matchedWords: string[]
        missedWords: string[]
        audioUrl: string | null
    } | null>(null)

    // --- Init TTS + voices ---
    useEffect(() => {
        const tts = new TextToSpeech()
        ttsRef.current = tts

        loadBrowserVoices().then((voices) => {
            tts.setBrowserVoices(voices)
            if (result) {
                const voice = findAnyVoiceForLang(voices, result.accent.lang)
                voiceRef.current = voice
            }
            setVoicesLoaded(true)
        })

        return () => {
            tts.stop()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // --- Speak a piece of text ---
    const speak = useCallback((text: string, id: string) => {
        const tts = ttsRef.current
        if (!tts || !result) return

        // If already playing this, stop it
        if (playingId === id) {
            tts.stop()
            setPlayingId(null)
            return
        }

        tts.stop()
        const cleaned = cleanTextForTTS(text)
        const rate = speedConfig[playbackSpeed].rate

        // Build utterance options
        const utterance = new SpeechSynthesisUtterance(cleaned)
        utterance.rate = rate
        utterance.pitch = 1
        utterance.volume = 1
        utterance.lang = result.accent.lang
        if (voiceRef.current) utterance.voice = voiceRef.current

        utterance.onend = () => setPlayingId(null)
        utterance.onerror = () => setPlayingId(null)

        setPlayingId(id)
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(utterance)
    }, [playingId, playbackSpeed, result])

    // --- Start recording ---
    const startRecording = useCallback(async (exampleId: string, expectedText: string) => {
        // Stop any playing TTS
        ttsRef.current?.stop()
        setPlayingId(null)

        // Clean up previous recording result
        if (recordingResult?.audioUrl) {
            URL.revokeObjectURL(recordingResult.audioUrl)
        }
        setRecordingResult(null)
        setLiveTranscript('')

        const recorder = new VoiceRecorder()
        recorderRef.current = recorder
        recorder.setLanguage(result?.accent.lang || 'en-US')
        recorder.onTranscriptUpdate = (transcript: string) => {
            setLiveTranscript(transcript)
        }

        try {
            await recorder.startRecording()
            setRecordingId(exampleId)
        } catch (err) {
            console.error('Failed to start recording:', err)
            alert('Could not access microphone. Please allow microphone permissions.')
        }
    }, [result, recordingResult])

    // --- Stop recording ---
    const stopRecording = useCallback(async (expectedText: string) => {
        const recorder = recorderRef.current
        if (!recorder) return

        try {
            const audioBlob = await recorder.stopRecording()
            const audioUrl = VoiceRecorder.createAudioUrl(audioBlob)
            const finalTranscript = liveTranscript.trim() || 'No speech detected'

            const { score, matchedWords, missedWords } = computePronunciationScore(
                finalTranscript,
                cleanTextForTTS(expectedText)
            )

            setRecordingResult({
                id: recordingId!,
                transcript: finalTranscript,
                expected: expectedText,
                score,
                matchedWords,
                missedWords,
                audioUrl,
            })
        } catch (err) {
            console.error('Failed to stop recording:', err)
        }

        setRecordingId(null)
        recorderRef.current = null
    }, [liveTranscript, recordingId])

    // --- Cleanup on unmount ---
    useEffect(() => {
        return () => {
            ttsRef.current?.stop()
            if (recorderRef.current) {
                recorderRef.current.stopRecording().catch(() => { })
            }
            if (recordingResult?.audioUrl) {
                URL.revokeObjectURL(recordingResult.audioUrl)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (!result) {
        return (
            <div className="min-h-screen bg-[#f6f7f8]">
                <Header />
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <span className="text-6xl">🔍</span>
                    <p className="text-xl text-gray-500">Module not found</p>
                    <Link href="/accents" className="text-[#137fec] font-bold hover:underline">← Back to Accents</Link>
                </div>
            </div>
        )
    }

    const { accent, module: mod } = result

    // Find prev/next modules
    const currentIndex = accent.modules.findIndex((m) => m.id === mod.id)
    const prevModule = currentIndex > 0 ? accent.modules[currentIndex - 1] : null
    const nextModule = currentIndex < accent.modules.length - 1 ? accent.modules[currentIndex + 1] : null

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
                <Header />
                <main className="flex flex-col w-full max-w-[1200px] mx-auto px-4 lg:px-10 py-10 pb-24 md:pb-10">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-[#4c739a] dark:text-slate-400 mb-6 flex-wrap">
                        <Link href="/accents" className="hover:text-[#137fec] transition-colors">Accents</Link>
                        <span>/</span>
                        <Link href={`/accents/${accent.id}`} className="hover:text-[#137fec] transition-colors">
                            {accent.flag} {accent.name}
                        </Link>
                        <span>/</span>
                        <span className="text-[#0d141b] dark:text-white font-medium">Module {mod.number}</span>
                    </nav>

                    {/* Module Header */}
                    <div
                        className="relative overflow-hidden rounded-2xl p-6 md:p-10 mb-8 text-white"
                        style={{ background: `linear-gradient(135deg, ${accent.color}, ${accent.color}cc)` }}
                    >
                        <div className="absolute -right-6 -bottom-6 text-[140px] opacity-10 select-none">{mod.icon}</div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-4xl">{mod.icon}</span>
                                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">
                                    Module {mod.number} of {accent.modules.length}
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-bold mb-2">{mod.title}</h1>
                            <p className="text-white/80 max-w-xl mb-4">{mod.description}</p>

                            {/* Voice status */}
                            <div className="flex items-center gap-2 text-sm text-white/70">
                                <span>{voicesLoaded ? '🔊' : '⏳'}</span>
                                <span>
                                    {voicesLoaded
                                        ? `${accent.name} voice active — click any ▶ to listen`
                                        : 'Loading voices...'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Playback Speed Control */}
                    <div className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl p-5 mb-8">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h3 className="font-bold text-[#0d141b] dark:text-white mb-1">🎚️ Playback Speed</h3>
                                <p className="text-sm text-[#4c739a] dark:text-slate-400">
                                    {speedConfig[playbackSpeed].description}
                                </p>
                            </div>
                            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
                                {(Object.keys(speedConfig) as PlaybackSpeed[]).map((speed) => (
                                    <button
                                        key={speed}
                                        onClick={() => setPlaybackSpeed(speed)}
                                        className={`px-4 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 ${playbackSpeed === speed
                                            ? 'bg-white dark:bg-slate-700 text-[#0d141b] dark:text-white shadow-sm scale-105'
                                            : 'text-[#4c739a] hover:text-[#0d141b] dark:hover:text-white'
                                            }`}
                                    >
                                        <span className="mr-1.5">{speedConfig[speed].icon}</span>
                                        {speedConfig[speed].label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Lessons */}
                    <div className="space-y-5 mb-10">
                        {mod.lessons.map((lesson, lessonIndex) => {
                            const isExpanded = expandedLesson === lesson.id || expandedLesson === null
                            return (
                                <div
                                    key={lesson.id}
                                    className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl overflow-hidden transition-all"
                                >
                                    {/* Lesson header */}
                                    <button
                                        onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                                        className="w-full text-left p-5 md:p-6 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                            style={{ backgroundColor: accent.color }}
                                        >
                                            {lessonIndex + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-[#0d141b] dark:text-white mb-1">{lesson.title}</h3>
                                            <p className="text-sm text-[#4c739a] dark:text-slate-400">{lesson.description}</p>
                                            <span className="text-xs text-[#4c739a] mt-2 inline-block">{lesson.items.length} exercises</span>
                                        </div>
                                        <svg
                                            className={`w-5 h-5 text-[#4c739a] transition-transform duration-200 flex-shrink-0 mt-1 ${isExpanded ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Lesson items */}
                                    {isExpanded && (
                                        <div className="border-t border-[#e7edf3] dark:border-slate-800">
                                            {lesson.items.map((item) => {
                                                const isItemExpanded = expandedItem === item.id
                                                return (
                                                    <div key={item.id} className="border-b last:border-b-0 border-[#e7edf3] dark:border-slate-800">
                                                        <button
                                                            onClick={() => setExpandedItem(isItemExpanded ? null : item.id)}
                                                            className="w-full text-left px-5 md:px-6 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                                                <span className="text-sm">🔊</span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <h4 className="font-bold text-[#0d141b] dark:text-white">{item.title}</h4>
                                                                    <code className="text-xs px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-mono">
                                                                        {item.phonetic}
                                                                    </code>
                                                                </div>
                                                                <p className="text-sm text-[#4c739a] dark:text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>
                                                            </div>
                                                            <svg
                                                                className={`w-4 h-4 text-[#4c739a] transition-transform duration-200 flex-shrink-0 ${isItemExpanded ? 'rotate-180' : ''}`}
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>

                                                        {isItemExpanded && (
                                                            <div className="px-5 md:px-6 pb-5 ml-12">
                                                                <p className="text-sm text-[#4c739a] dark:text-slate-400 mb-3">{item.description}</p>

                                                                {/* Examples with TTS + Record */}
                                                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-3">
                                                                    <h5 className="font-bold text-xs text-[#4c739a] dark:text-slate-400 uppercase tracking-wider mb-3">
                                                                        Examples — Listen & Practice
                                                                    </h5>
                                                                    <div className="space-y-2.5">
                                                                        {item.examples.map((ex, i) => {
                                                                            const exId = `${item.id}-ex-${i}`
                                                                            const isPlaying = playingId === exId
                                                                            const isRecording = recordingId === exId
                                                                            const hasResult = recordingResult?.id === exId

                                                                            return (
                                                                                <div key={i} className="space-y-2">
                                                                                    <div className="flex items-center gap-2">
                                                                                        {/* Play button */}
                                                                                        <button
                                                                                            onClick={() => speak(ex, exId)}
                                                                                            disabled={!!recordingId}
                                                                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${isPlaying
                                                                                                ? 'ring-2 ring-offset-1 scale-110'
                                                                                                : 'hover:scale-105'
                                                                                                } ${recordingId ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                                                            style={{
                                                                                                backgroundColor: isPlaying ? accent.color : accent.colorLight,
                                                                                                color: isPlaying ? 'white' : accent.color,
                                                                                                ringColor: accent.color,
                                                                                            }}
                                                                                            title={isPlaying ? 'Stop' : `Listen (${speedConfig[playbackSpeed].label})`}
                                                                                        >
                                                                                            {isPlaying ? (
                                                                                                <svg className="w-3.5 h-3.5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                                                                                                    <rect x="6" y="5" width="4" height="14" rx="1" />
                                                                                                    <rect x="14" y="5" width="4" height="14" rx="1" />
                                                                                                </svg>
                                                                                            ) : (
                                                                                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                                                                                    <path d="M8 5v14l11-7z" />
                                                                                                </svg>
                                                                                            )}
                                                                                        </button>

                                                                                        {/* Example text */}
                                                                                        <span className="text-sm font-mono text-[#0d141b] dark:text-slate-200 flex-1">{ex}</span>

                                                                                        {/* Record/Practice button */}
                                                                                        {isRecording ? (
                                                                                            <button
                                                                                                onClick={() => stopRecording(ex)}
                                                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500 text-white text-xs font-bold 
                                                                                                           hover:bg-red-600 transition-all animate-pulse"
                                                                                                title="Stop recording"
                                                                                            >
                                                                                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                                                                                    <rect x="6" y="6" width="12" height="12" rx="2" />
                                                                                                </svg>
                                                                                                Stop
                                                                                            </button>
                                                                                        ) : (
                                                                                            <button
                                                                                                onClick={() => startRecording(exId, ex)}
                                                                                                disabled={!!recordingId || isPlaying}
                                                                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all
                                                                                                    ${recordingId || isPlaying
                                                                                                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                                                                                                        : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 hover:scale-105'
                                                                                                    }`}
                                                                                                title="Record yourself"
                                                                                            >
                                                                                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                                                                                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                                                                                                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                                                                                                </svg>
                                                                                                Practice
                                                                                            </button>
                                                                                        )}
                                                                                    </div>

                                                                                    {/* Live transcript while recording */}
                                                                                    {isRecording && (
                                                                                        <div className="ml-10 bg-red-50 dark:bg-red-900/10 rounded-lg p-3 border border-red-200 dark:border-red-800/30">
                                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                                                                <span className="text-xs font-bold text-red-600 dark:text-red-400">Recording — speak now!</span>
                                                                                            </div>
                                                                                            <p className="text-sm text-red-800 dark:text-red-300 italic min-h-[1.5rem]">
                                                                                                {liveTranscript || 'Listening...'}
                                                                                            </p>
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Recording result */}
                                                                                    {hasResult && recordingResult && (
                                                                                        <div className="ml-10 bg-white dark:bg-slate-800 rounded-lg p-4 border border-[#e7edf3] dark:border-slate-700 space-y-3">
                                                                                            {/* Score */}
                                                                                            <div className="flex items-center gap-3">
                                                                                                <div className={`text-2xl font-black ${recordingResult.score >= 80 ? 'text-green-500' : recordingResult.score >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                                                                                                    {recordingResult.score}%
                                                                                                </div>
                                                                                                <div>
                                                                                                    <div className="text-sm font-bold text-[#0d141b] dark:text-white">
                                                                                                        {recordingResult.score >= 80 ? '🎉 Excellent!' : recordingResult.score >= 50 ? '👍 Good effort!' : '💪 Keep practicing!'}
                                                                                                    </div>
                                                                                                    <div className="text-xs text-[#4c739a] dark:text-slate-400">
                                                                                                        {recordingResult.matchedWords.length} of {recordingResult.matchedWords.length + recordingResult.missedWords.length} key words matched
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>

                                                                                            {/* User transcript */}
                                                                                            <div>
                                                                                                <div className="text-xs font-bold text-[#4c739a] dark:text-slate-400 uppercase tracking-wider mb-1">You said:</div>
                                                                                                <p className="text-sm text-[#0d141b] dark:text-slate-200 bg-slate-50 dark:bg-slate-900 rounded px-3 py-2 font-mono">
                                                                                                    {recordingResult.transcript}
                                                                                                </p>
                                                                                            </div>

                                                                                            {/* Missed words */}
                                                                                            {recordingResult.missedWords.length > 0 && (
                                                                                                <div>
                                                                                                    <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Words to work on:</div>
                                                                                                    <div className="flex flex-wrap gap-1">
                                                                                                        {recordingResult.missedWords.map((w, i) => (
                                                                                                            <span key={i} className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-mono">
                                                                                                                {w}
                                                                                                            </span>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                </div>
                                                                                            )}

                                                                                            {/* Play back recording */}
                                                                                            {recordingResult.audioUrl && (
                                                                                                <div>
                                                                                                    <div className="text-xs font-bold text-[#4c739a] dark:text-slate-400 uppercase tracking-wider mb-1">Your recording:</div>
                                                                                                    <audio controls src={recordingResult.audioUrl} className="w-full h-8 [&::-webkit-media-controls-panel]:bg-slate-50 dark:[&::-webkit-media-controls-panel]:bg-slate-900" />
                                                                                                </div>
                                                                                            )}

                                                                                            {/* Retry button */}
                                                                                            <div className="flex gap-2">
                                                                                                <button
                                                                                                    onClick={() => speak(ex, exId)}
                                                                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                                                                                                    style={{ backgroundColor: accent.colorLight, color: accent.color }}
                                                                                                >
                                                                                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                                                                                        <path d="M8 5v14l11-7z" />
                                                                                                    </svg>
                                                                                                    Listen again
                                                                                                </button>
                                                                                                <button
                                                                                                    onClick={() => {
                                                                                                        setRecordingResult(null)
                                                                                                        startRecording(exId, ex)
                                                                                                    }}
                                                                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all hover:scale-105"
                                                                                                >
                                                                                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                                                                                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                                                                                                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                                                                                                    </svg>
                                                                                                    Try again
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                </div>

                                                                {/* Tip if exists */}
                                                                {item.tip && (
                                                                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-3 flex items-start gap-2">
                                                                        <span className="text-base mt-0.5">💡</span>
                                                                        <p className="text-sm text-amber-800 dark:text-amber-300">{item.tip}</p>
                                                                    </div>
                                                                )}

                                                                {/* Playback speed reminder */}
                                                                <div className="mt-3 flex items-center gap-2 text-xs text-[#4c739a] dark:text-slate-500">
                                                                    <span>{speedConfig[playbackSpeed].icon}</span>
                                                                    <span>Playing at {speedConfig[playbackSpeed].label} speed</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Prev / Next Module Navigation */}
                    <div className="flex gap-4 flex-col sm:flex-row">
                        {prevModule ? (
                            <Link
                                href={`/accents/${accent.id}/module/${prevModule.id}`}
                                className="flex-1 bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl p-5 hover:shadow-md transition-all group"
                            >
                                <div className="text-xs text-[#4c739a] mb-1">← Previous Module</div>
                                <div className="flex items-center gap-2">
                                    <span>{prevModule.icon}</span>
                                    <span className="font-bold text-[#0d141b] dark:text-white group-hover:text-[#137fec] transition-colors">
                                        {prevModule.title}
                                    </span>
                                </div>
                            </Link>
                        ) : (
                            <div className="flex-1" />
                        )}
                        {nextModule ? (
                            <Link
                                href={`/accents/${accent.id}/module/${nextModule.id}`}
                                className="flex-1 bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl p-5 hover:shadow-md transition-all group text-right"
                            >
                                <div className="text-xs text-[#4c739a] mb-1">Next Module →</div>
                                <div className="flex items-center justify-end gap-2">
                                    <span className="font-bold text-[#0d141b] dark:text-white group-hover:text-[#137fec] transition-colors">
                                        {nextModule.title}
                                    </span>
                                    <span>{nextModule.icon}</span>
                                </div>
                            </Link>
                        ) : (
                            <Link
                                href={`/accents/${accent.id}`}
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-5 hover:shadow-md transition-all text-right"
                            >
                                <div className="text-xs text-white/70 mb-1">All modules complete! 🎉</div>
                                <span className="font-bold">Back to {accent.name}</span>
                            </Link>
                        )}
                    </div>
                </main>
                <MobileNav />
            </div>
        </div>
    )
}
