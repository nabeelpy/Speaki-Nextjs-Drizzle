'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import Header from '@/components/header'
import MobileNav from '@/components/mobile-nav'
import AudioLessonInterface from '@/components/audio-lesson-interface'
import type { LessonConversation, ConversationMessage } from '@/lib/types'
import {
    VOICE_AGENTS,
    LANGUAGE_LABELS,
    getDefaultVoiceAgentForLang,
} from '@/lib/voice-config'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { TextToSpeech, VoiceRecorder } from '@/lib/voice-recorder'
import { loadBrowserVoices, findAnyVoiceForLang } from '@/lib/voice-config'

// ─── Types ──────────────────────────────────────────────────────────────────

type VocabTip = {
    type: 'usage' | 'culture' | 'pronunciation' | string
    text: string
}

type VocabularyItem = {
    id: string
    conversationId: string
    word: string
    translations: Record<string, string>
    romanization?: Record<string, string>
    definition: string
    definitionByLang?: Record<string, string>
    exampleSentences: { text: string; translations?: Record<string, string> }[]
    tips: VocabTip[]
}

type PracticeItem = {
    id: string
    nativeText: string       // original language word / sentence
    translationText: string  // what user will HEAR and must SAY
    romanization?: string    // romanized form of the translation
    isWord: boolean
}

type RecordingResult = {
    id: string
    transcript: string
    score: number
    matchedWords: string[]
    missedWords: string[]
    audioUrl: string | null
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_LANG = 'en-US'
const fetcher = (url: string) => fetch(url).then((res) => res.json())

const TIP_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    usage: {
        label: 'Usage',
        color: 'text-blue-700 dark:text-blue-300',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800/50',
    },
    culture: {
        label: 'Culture',
        color: 'text-purple-700 dark:text-purple-300',
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-200 dark:border-purple-800/50',
    },
    pronunciation: {
        label: 'Pronunciation',
        color: 'text-amber-700 dark:text-amber-300',
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'border-amber-200 dark:border-amber-800/50',
    },
}

const TIP_ICONS: Record<string, string> = {
    usage: '📖',
    culture: '🌍',
    pronunciation: '🗣️',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getLanguageLabel(locale: string): string {
    const normalized = locale.replace('_', '-')
    return LANGUAGE_LABELS[normalized] || locale
}

function cleanVoiceName(name: string) {
    return name
        .replace(/Microsoft\s*/gi, '')
        .replace(/Google\s*/gi, '')
        .replace(/Apple\s*/gi, '')
        .replace(/Online\s*\(Natural\)\s*/gi, '')
        .replace(/\(.*?\)/g, '')
        .trim()
}

function cleanTextForTTS(text: string): string {
    return text
        .replace(/\/[^/]+\//g, '')
        .replace(/[❌✅🐢🎵🚀]/g, '')
        .replace(/→/g, ' becomes ')
        .replace(/\s+/g, ' ')
        .trim()
}

function computePronunciationScore(
    transcript: string,
    expected: string
): { score: number; matchedWords: string[]; missedWords: string[] } {
    const normalize = (s: string) =>
        s.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean)
    const expectedWords = normalize(expected)
    const userWords = normalize(transcript)
    const matched: string[] = []
    const missed: string[] = []
    for (const w of expectedWords) {
        if (userWords.includes(w)) matched.push(w)
        else missed.push(w)
    }
    const score =
        expectedWords.length > 0
            ? Math.round((matched.length / expectedWords.length) * 100)
            : 0
    return { score, matchedWords: matched, missedWords: missed }
}

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
    const radius = 28
    const circ = 2 * Math.PI * radius
    const dash = (score / 100) * circ
    const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'
    return (
        <svg width="72" height="72" className="flex-shrink-0">
            <circle
                cx="36" cy="36" r={radius} fill="none" stroke="currentColor"
                strokeWidth="5" className="text-slate-100 dark:text-slate-800"
            />
            <circle
                cx="36" cy="36" r={radius} fill="none"
                stroke={color} strokeWidth="5"
                strokeDasharray={`${dash} ${circ}`}
                strokeLinecap="round"
                transform="rotate(-90 36 36)"
                style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(.4,0,.2,1)' }}
            />
            <text x="36" y="41" textAnchor="middle" fontSize="15" fontWeight="800" fill={color}>
                {score}%
            </text>
        </svg>
    )
}

// ─── Practice Card ────────────────────────────────────────────────────────────

function PracticeCard({
                          item,
                          selectedLanguage,
                          voiceRef,
                          activeRecordingId,
                          onRecordingStart,
                          onRecordingStop,
                      }: {
    item: PracticeItem
    selectedLanguage: string
    voiceRef: React.MutableRefObject<SpeechSynthesisVoice | null>
    activeRecordingId: string | null
    onRecordingStart: (id: string) => void
    onRecordingStop: (id: string, expected: string) => void
}) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [result, setResult] = useState<RecordingResult | null>(null)
    const [liveTranscript, setLiveTranscript] = useState('')
    const recorderRef = useRef<VoiceRecorder | null>(null)

    const isRecording = activeRecordingId === item.id
    const isOtherRecording = !!activeRecordingId && !isRecording

    const speak = useCallback(() => {
        if (isPlaying) {
            window.speechSynthesis.cancel()
            setIsPlaying(false)
            return
        }
        window.speechSynthesis.cancel()
        const utt = new SpeechSynthesisUtterance(cleanTextForTTS(item.translationText))
        utt.lang = selectedLanguage
        utt.rate = 0.9
        if (voiceRef.current) utt.voice = voiceRef.current
        utt.onend = () => setIsPlaying(false)
        utt.onerror = () => setIsPlaying(false)
        setIsPlaying(true)
        window.speechSynthesis.speak(utt)
    }, [isPlaying, item.translationText, selectedLanguage, voiceRef])

    const startRec = useCallback(async () => {
        window.speechSynthesis.cancel()
        setIsPlaying(false)
        if (result?.audioUrl) URL.revokeObjectURL(result.audioUrl)
        setResult(null)
        setLiveTranscript('')
        let recorder: VoiceRecorder
        try {
            recorder = new VoiceRecorder()
        } catch {
            alert('VoiceRecorder not available.')
            return
        }
        recorderRef.current = recorder
        recorder.setLanguage(selectedLanguage)
        recorder.onTranscriptUpdate = (t: string) => setLiveTranscript(t)
        try {
            await recorder.startRecording()
            onRecordingStart(item.id)
        } catch {
            alert('Could not access microphone.')
        }
    }, [selectedLanguage, result, item.id, onRecordingStart])

    const stopRec = useCallback(async () => {
        const recorder = recorderRef.current
        if (!recorder) return
        try {
            const blob = await recorder.stopRecording()
            const audioUrl = VoiceRecorder.createAudioUrl(blob)
            const finalTranscript = liveTranscript.trim() || 'No speech detected'
            const { score, matchedWords, missedWords } = computePronunciationScore(
                finalTranscript,
                cleanTextForTTS(item.translationText)
            )
            setResult({ id: item.id, transcript: finalTranscript, score, matchedWords, missedWords, audioUrl })
        } catch (e) {
            console.error('[PracticeCard] stopRec error:', e)
        }
        onRecordingStop(item.id, item.translationText)
        recorderRef.current = null
    }, [liveTranscript, item.id, item.translationText, onRecordingStop])

    return (
        <div className={`
            relative rounded-2xl overflow-hidden transition-all duration-300
            ${isRecording
            ? 'ring-2 ring-rose-400 shadow-lg shadow-rose-400/20'
            : 'ring-1 ring-slate-200 dark:ring-slate-700/60'}
            bg-white dark:bg-slate-900
        `}>
            {/* Card header: native → translation */}
            <div className="px-4 pt-4 pb-3">
                {/* Badge */}
                <span className={`
                    inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-3
                    ${item.isWord
                    ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                    : 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400'}
                `}>
                    {item.isWord ? '🔤 Word' : '💬 Phrase'}
                </span>

                {/* Original */}
                <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
                    Original
                </div>
                <div className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-snug mb-3">
                    {item.nativeText}
                </div>

                {/* Divider arrow */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                    <svg className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                </div>

                {/* Translation — what they practice */}
                <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
                    Say this
                </div>
                <div className="text-2xl font-black text-[#137fec] leading-snug tracking-tight">
                    {item.translationText}
                </div>

                {/* Romanization */}
                {item.romanization && (
                    <div className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 font-mono italic">
                        /{item.romanization}/
                    </div>
                )}
            </div>

            {/* Action bar */}
            <div className="px-4 pb-4 flex items-center gap-2">
                {/* Listen */}
                <button
                    onClick={speak}
                    disabled={isOtherRecording || isRecording}
                    title={isPlaying ? 'Stop' : 'Listen to pronunciation'}
                    className={`
                        flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200
                        ${isPlaying
                        ? 'bg-[#137fec] text-white scale-105 shadow-md shadow-[#137fec]/30'
                        : 'bg-blue-50 dark:bg-blue-900/20 text-[#137fec] hover:scale-105 hover:shadow-md hover:shadow-[#137fec]/20'}
                        ${(isOtherRecording || isRecording) ? 'opacity-40 cursor-not-allowed' : ''}
                    `}
                >
                    {isPlaying ? (
                        <>
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                <rect x="6" y="5" width="4" height="14" rx="1" />
                                <rect x="14" y="5" width="4" height="14" rx="1" />
                            </svg>
                            Stop
                        </>
                    ) : (
                        <>
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            Listen
                        </>
                    )}
                </button>

                {/* Record / Stop */}
                {isRecording ? (
                    <button
                        onClick={stopRec}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-all animate-pulse"
                    >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="6" y="6" width="12" height="12" rx="2" />
                        </svg>
                        Stop recording
                    </button>
                ) : (
                    <button
                        onClick={startRec}
                        disabled={isOtherRecording || isPlaying}
                        className={`
                            flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200
                            ${(isOtherRecording || isPlaying)
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:scale-[1.02] hover:shadow-md hover:shadow-rose-400/20'}
                        `}
                    >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                        </svg>
                        Practice
                    </button>
                )}
            </div>

            {/* Live transcript */}
            {isRecording && (
                <div className="mx-4 mb-4 bg-rose-50 dark:bg-rose-950/40 rounded-xl px-4 py-3 border border-rose-200 dark:border-rose-800/40">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Listening…</span>
                    </div>
                    <p className="text-sm text-rose-800 dark:text-rose-300 italic min-h-[1.4rem]">
                        {liveTranscript || 'Start speaking'}
                    </p>
                </div>
            )}

            {/* Result panel */}
            {result && (
                <div className="mx-4 mb-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                    {/* Score */}
                    <div className="flex items-center gap-4">
                        <ScoreRing score={result.score} />
                        <div>
                            <div className="text-base font-black text-slate-800 dark:text-white">
                                {result.score >= 80 ? '🎉 Excellent!' : result.score >= 50 ? '👍 Good effort!' : '💪 Keep going!'}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {result.matchedWords.length} / {result.matchedWords.length + result.missedWords.length} words matched
                            </div>
                        </div>
                    </div>

                    {/* You said */}
                    <div>
                        <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">You said</div>
                        <p className="text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 rounded-lg px-3 py-2 font-mono border border-slate-200 dark:border-slate-700">
                            {result.transcript}
                        </p>
                    </div>

                    {/* Missed words */}
                    {result.missedWords.length > 0 && (
                        <div>
                            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1.5">Words to work on</div>
                            <div className="flex flex-wrap gap-1.5">
                                {result.missedWords.map((w, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold">
                                        {w}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Playback */}
                    {result.audioUrl && (
                        <div>
                            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Your recording</div>
                            <audio controls src={result.audioUrl} className="w-full h-9 rounded-lg" />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                        <button
                            onClick={speak}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-[#137fec] hover:scale-105 transition-transform"
                        >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            Listen again
                        </button>
                        <button
                            onClick={() => { setResult(null); startRec() }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:scale-105 transition-transform"
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
}

// ─── Pronunciation Practice Section ──────────────────────────────────────────

function PronunciationPracticeSection({
                                          vocabulary,
                                          selectedLanguage,
                                      }: {
    vocabulary: VocabularyItem[]
    selectedLanguage: string
}) {
    const ttsRef = useRef<TextToSpeech | null>(null)
    const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
    const [voicesLoaded, setVoicesLoaded] = useState(false)
    const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null)

    useEffect(() => {
        let tts: TextToSpeech
        try {
            tts = new TextToSpeech()
            ttsRef.current = tts
        } catch (e) {
            console.error('[PPS] TextToSpeech FAILED:', e)
            setVoicesLoaded(true)
            return
        }
        loadBrowserVoices().then((voices) => {
            try {
                tts.setBrowserVoices(voices)
                const voice = findAnyVoiceForLang(voices, selectedLanguage)
                voiceRef.current = voice ?? null
            } catch (e) {
                console.error('[PPS] voice load error:', e)
            }
            setVoicesLoaded(true)
        }).catch(() => setVoicesLoaded(true))
        return () => { try { tts.stop() } catch {} }
    }, [selectedLanguage])

    // Build practice items — TTS speaks the TRANSLATION, card shows native → translation + romanization
    const practiceItems: PracticeItem[] = vocabulary.flatMap((v) => {
        const translation = v.translations?.[selectedLanguage]
        const romanization = v.romanization?.[selectedLanguage]
        const items: PracticeItem[] = []

        // Word card — only if translation exists
        if (translation) {
            items.push({
                id: `word-${v.id}`,
                nativeText: v.word,
                translationText: translation,
                romanization,
                isWord: true,
            })
        }

        // Example sentence cards
        ;(v.exampleSentences ?? []).forEach((ex, i) => {
            const exTranslation = ex.translations?.[selectedLanguage]
            if (!exTranslation) return
            items.push({
                id: `ex-${v.id}-${i}`,
                nativeText: ex.text,
                translationText: exTranslation,
                romanization: undefined,
                isWord: false,
            })
        })

        return items
    })

    return (
        <div className="w-full mt-10 text-left">
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
                <div>
                    <h2 className="text-lg font-bold text-[#0d141b] dark:text-white">
                        🗣️ Pronunciation Practice
                    </h2>
                    <p className="text-sm text-[#4c739a] dark:text-slate-400 mt-0.5">
                        Listen to the translation, then record yourself saying it.
                    </p>
                </div>
                <span className={`
                    text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ml-3
                    ${voicesLoaded
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 animate-pulse'}
                `}>
                    {voicesLoaded ? '🔊 Ready' : '⏳ Loading…'}
                </span>
            </div>

            {/* How-it-works hint bar */}
            <div className="mt-3 mb-5 flex items-center gap-2 text-xs text-[#4c739a] dark:text-slate-500 overflow-x-auto pb-1">
                <span className="flex items-center gap-1.5 whitespace-nowrap bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                    <svg className="w-3.5 h-3.5 text-[#137fec]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    Listen
                </span>
                <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="flex items-center gap-1.5 whitespace-nowrap bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                    <svg className="w-3.5 h-3.5 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                    </svg>
                    Repeat it
                </span>
                <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="flex items-center gap-1.5 whitespace-nowrap bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                    ✅ Get your score
                </span>
            </div>

            {practiceItems.length === 0 && (
                <div className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-2xl px-5 py-8 text-center text-sm text-[#4c739a] dark:text-slate-400">
                    {vocabulary.length === 0
                        ? 'Loading vocabulary…'
                        : 'No translated items available for this language yet.'}
                </div>
            )}

            <div className="space-y-3">
                {practiceItems.map((item) => (
                    <PracticeCard
                        key={item.id}
                        item={item}
                        selectedLanguage={selectedLanguage}
                        voiceRef={voiceRef}
                        activeRecordingId={activeRecordingId}
                        onRecordingStart={(id) => setActiveRecordingId(id)}
                        onRecordingStop={() => setActiveRecordingId(null)}
                    />
                ))}
            </div>
        </div>
    )
}

// ─── Vocab Tip Badge ──────────────────────────────────────────────────────────

function VocabTipBadge({ type }: { type: string }) {
    const cfg = TIP_CONFIG[type] ?? {
        label: type,
        color: 'text-slate-700 dark:text-slate-300',
        bg: 'bg-slate-100 dark:bg-slate-800',
        border: 'border-slate-200 dark:border-slate-700',
    }
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            <span style={{ fontSize: 12 }}>{TIP_ICONS[type] ?? '💡'}</span>
            {cfg.label}
        </span>
    )
}

// ─── Vocabulary Details ───────────────────────────────────────────────────────

function VocabularyDetails({
                               vocab,
                               selectedLanguage,
                           }: {
    vocab: VocabularyItem[]
    selectedLanguage: string
}) {
    const [expandedId, setExpandedId] = useState<string | null>(null)
    if (!vocab || vocab.length === 0) return null

    return (
        <div className="w-full mt-8 text-left">
            <h2 className="text-lg font-bold text-[#0d141b] dark:text-white mb-4">
                📚 Vocabulary
            </h2>
            <div className="space-y-3">
                {vocab.map((item) => {
                    const isExpanded = expandedId === item.id
                    const translation = item.translations?.[selectedLanguage]
                    const romanization = item.romanization?.[selectedLanguage]
                    const localDef = item.definitionByLang?.[selectedLanguage]

                    return (
                        <div
                            key={item.id}
                            className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl overflow-hidden"
                        >
                            <button
                                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                                className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="font-bold text-[#0d141b] dark:text-white text-base">
                                            {item.word}
                                        </span>
                                        {translation && (
                                            <span className="text-sm font-semibold text-[#137fec]">
                                                {translation}
                                            </span>
                                        )}
                                        {romanization && (
                                            <span className="text-xs text-[#4c739a] dark:text-slate-400 font-mono italic">
                                                {romanization}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-[#4c739a] dark:text-slate-500 mt-0.5 line-clamp-1">
                                        {localDef || item.definition}
                                    </p>
                                </div>
                                <svg
                                    className={`w-4 h-4 text-[#4c739a] transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isExpanded && (
                                <div className="border-t border-[#e7edf3] dark:border-slate-800 px-5 pb-5 pt-4 space-y-5">
                                    <div>
                                        <p className="text-xs font-bold text-[#4c739a] dark:text-slate-400 uppercase tracking-wider mb-1">
                                            Definition
                                        </p>
                                        <p className="text-sm text-[#0d141b] dark:text-slate-200">
                                            {localDef || item.definition}
                                        </p>
                                    </div>

                                    {(item.exampleSentences ?? []).length > 0 && (
                                        <div>
                                            <p className="text-xs font-bold text-[#4c739a] dark:text-slate-400 uppercase tracking-wider mb-2">
                                                Examples
                                            </p>
                                            <div className="space-y-2">
                                                {(item.exampleSentences ?? []).map((ex, i) => {
                                                    const exTranslation = ex.translations?.[selectedLanguage]
                                                    return (
                                                        <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-4 py-3">
                                                            <p className="text-sm text-[#0d141b] dark:text-slate-200 font-medium">
                                                                {ex.text}
                                                            </p>
                                                            {exTranslation && (
                                                                <p className="text-sm text-[#137fec] mt-1">{exTranslation}</p>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {(item.tips ?? []).length > 0 && (
                                        <div>
                                            <p className="text-xs font-bold text-[#4c739a] dark:text-slate-400 uppercase tracking-wider mb-2">
                                                Tips
                                            </p>
                                            <div className="space-y-2">
                                                {(item.tips ?? []).map((tip, i) => {
                                                    const cfg = TIP_CONFIG[tip.type] ?? {
                                                        color: 'text-slate-700 dark:text-slate-300',
                                                        bg: 'bg-slate-100 dark:bg-slate-800',
                                                        border: 'border-slate-200 dark:border-slate-700',
                                                        label: tip.type,
                                                    }
                                                    return (
                                                        <div key={i} className={`flex items-start gap-3 rounded-lg p-3 border ${cfg.bg} ${cfg.border}`}>
                                                            <span style={{ fontSize: 14, lineHeight: 1.4 }}>
                                                                {TIP_ICONS[tip.type] ?? '💡'}
                                                            </span>
                                                            <div className="flex-1 min-w-0">
                                                                <VocabTipBadge type={tip.type} />
                                                                <p className={`text-sm mt-1 ${cfg.color}`}>{tip.text}</p>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LessonPage({
                                       params,
                                   }: {
    params: Promise<{ id: string }>
}) {
    const [lessonId, setLessonId] = useState<string | null>(null)
    const [hasStarted, setHasStarted] = useState(false)
    const [selectedLanguage, setSelectedLanguage] = useState(DEFAULT_LANG)
    const [selectedVoiceAgentId, setSelectedVoiceAgentId] = useState<string>(
        () => getDefaultVoiceAgentForLang(DEFAULT_LANG)?.id ?? VOICE_AGENTS[0]?.id ?? ''
    )
    const [recordingMode, setRecordingMode] = useState<'automatic' | 'manual'>('automatic')
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
    const [savedLanguage, setSavedLanguage] = useState<string | null>(null)

    const STORAGE_KEY = 'selected-language-code'

    useEffect(() => {
        const storedAccent = localStorage.getItem('speaki_accent')
        const storedRecordingType = localStorage.getItem('speaki_recording_type') as 'automatic' | 'manual' | null
        if (storedAccent) setSelectedLanguage(storedAccent)
        if (storedRecordingType) setRecordingMode(storedRecordingType)
    }, [])

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        setSavedLanguage(saved)
    }, [])

    useEffect(() => {
        if (savedLanguage === null) return
        const langs = getLanguages()
        if (langs.length > 0) setSelectedLanguage(langs[0])
    }, [savedLanguage, voices])

    useEffect(() => {
        if (voices.length === 0) return
        const storedAccent = localStorage.getItem('speaki_accent')
        const storedAgent = localStorage.getItem('speaki_agent')
        const preferredLang = storedAccent || selectedLanguage
        const filtered = voices.filter(
            (v) => v.lang.split('-')[0] === preferredLang.split('-')[0]
        )
        if (filtered.length > 0) {
            const exactAgentMatch = storedAgent
                ? filtered.find((v) => `${v.name}|${v.lang}` === storedAgent)
                : null
            const exactAccentMatch = filtered.find((v) => v.lang === storedAccent)
            const chosen = exactAgentMatch || exactAccentMatch || filtered[0]
            setSelectedVoiceAgentId(`${chosen.name}|${chosen.lang}`)
        }
    }, [voices, selectedLanguage])

    useEffect(() => {
        const current = VOICE_AGENTS.find((a) => a.id === selectedVoiceAgentId)
        if (current && current.lang.split('-')[0] !== selectedLanguage.split('-')[0]) {
            const defaultAgent = getDefaultVoiceAgentForLang(selectedLanguage)
            if (defaultAgent) setSelectedVoiceAgentId(defaultAgent.id)
        }
    }, [selectedLanguage])

    useEffect(() => {
        params.then((p) => setLessonId(p.id))
    }, [params])

    useEffect(() => {
        const loadVoices = () => setVoices(window.speechSynthesis.getVoices())
        loadVoices()
        window.speechSynthesis.onvoiceschanged = loadVoices
    }, [])

    const getLanguages = () => {
        const codes = Array.from(new Set(voices.map((v) => v.lang)))
        return codes.filter((code) => code.startsWith(savedLanguage ?? ''))
    }

    const { data, isLoading } = useSWR(
        lessonId ? `/api/lessons/${lessonId}` : null,
        fetcher
    )
    const conversation: LessonConversation = data?.data
    const vocabulary: VocabularyItem[] = (conversation?.vocabulary as any) ?? []

    const handleLessonComplete = (messages: ConversationMessage[]) => {
        setHasStarted(false)
        console.log('[v0] Lesson completed with messages:', messages)
    }

    if (isLoading || !conversation) {
        return (
            <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
                <div className="layout-container flex h-full grow flex-col">
                    <Header />
                    <main className="flex justify-center items-center min-h-[60vh] w-full">
                        <div className="text-gray-500">Loading lesson...</div>
                    </main>
                    <MobileNav />
                </div>
            </div>
        )
    }

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
                <Header />
                <main className="flex flex-col items-center w-full max-w-[1200px] mx-auto px-4 lg:px-10 py-10 pb-24 md:pb-10">

                    {!hasStarted && (
                        <div className="text-center max-w-3xl w-full">
                            <h1 className="text-2xl md:text-4xl font-bold text-[#0d141b] dark:text-white mb-4">
                                {conversation.title}
                            </h1>
                            <p className="text-[#4c739a] dark:text-slate-400 mb-8 text-base md:text-lg">
                                {conversation.description}
                            </p>

                            {/* Language / voice / mode selector */}
                            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 md:p-6 mb-8">
                                <h3 className="text-left font-bold text-[#0d141b] dark:text-white mb-4">
                                    Language, voice &amp; delay
                                </h3>
                                <p className="text-left text-sm text-[#4c739a] dark:text-slate-400 mb-4">
                                    Choose the language, AI voice accent, and automatic delay before recording.
                                </p>
                                <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end">
                                    <div className="flex flex-col gap-1.5 w-full md:w-auto md:min-w-[180px]">
                                        <Label className="text-left text-xs font-semibold text-[#4c739a] dark:text-slate-400">
                                            Accent
                                        </Label>
                                        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select language" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getLanguages().map((code) => (
                                                    <SelectItem key={code} value={code}>
                                                        {getLanguageLabel(code)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col gap-1.5 w-full md:w-auto md:min-w-[200px]">
                                        <Label className="text-left text-xs font-semibold text-[#4c739a] dark:text-slate-400">
                                            Agent
                                        </Label>
                                        <Select value={selectedVoiceAgentId} onValueChange={setSelectedVoiceAgentId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select voice" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {voices
                                                    .filter((v: SpeechSynthesisVoice) =>
                                                        v.lang.split('-')[0] === selectedLanguage.split('-')[0]
                                                    )
                                                    .map((v: SpeechSynthesisVoice) => (
                                                        <SelectItem key={`${v.name}|${v.lang}`} value={`${v.name}|${v.lang}`}>
                                                            {cleanVoiceName(v.name)}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col gap-1.5 w-full md:w-auto md:min-w-[200px]">
                                        <Label className="text-left text-xs font-semibold text-[#4c739a] dark:text-slate-400">
                                            Recording Mode
                                        </Label>
                                        <Select
                                            value={recordingMode}
                                            onValueChange={(v) => setRecordingMode(v as 'automatic' | 'manual')}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select mode" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="automatic">Automatic</SelectItem>
                                                <SelectItem value="manual">Manual</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Start button */}
                            <button
                                onClick={() => setHasStarted(true)}
                                className="w-full md:w-auto bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold py-3 px-4 md:py-4 md:px-12 rounded-lg text-base md:text-lg shadow-lg shadow-[#137fec]/20 transition-all"
                            >
                                Start Conversation Practice
                            </button>

                            {/* Vocabulary */}
                            <VocabularyDetails vocab={vocabulary} selectedLanguage={selectedLanguage} />

                            {/* Pronunciation Practice */}
                            <PronunciationPracticeSection
                                vocabulary={vocabulary}
                                selectedLanguage={selectedLanguage}
                            />
                        </div>
                    )}

                    {hasStarted && (
                        <>
                            <AudioLessonInterface
                                conversation={conversation}
                                onComplete={handleLessonComplete}
                                defaultLanguage={selectedLanguage}
                                defaultVoiceAgentId={selectedVoiceAgentId}
                                recordingMode={recordingMode}
                            />
                            <div className="w-full max-w-3xl mt-10">
                                <PronunciationPracticeSection
                                    vocabulary={vocabulary}
                                    selectedLanguage={selectedLanguage}
                                />
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    )
}