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
    nativeText: string       // word/phrase in native language (what user already knows)
    translationText: string  // word/phrase in learning language (what user practices saying)
    romanization?: string    // romanized form of the learning language word
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

// Maps short language codes (from settings localStorage) to full locale codes used in DB
// Normalize locale (fixes en_GB vs en-GB + casing issues)
const normalizeLocale = (locale: string) => {
    if (!locale) return ''
    const [lang, region] = locale.replace('_', '-').split('-')
    return region
        ? `${lang.toLowerCase()}-${region.toUpperCase()}`
        : lang.toLowerCase()
}

export function getLanguageLabelsimple(locale: string): string {
    const normalized = locale.replace('_', '-')
    return normalized
}


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

/**
 * Resolve a value from a locale-keyed record using a language code.
 * Tries: exact match → LANG_TO_LOCALE mapping → prefix match (e.g. 'ur' → 'ur-PK')
 */
function findLocaleValue(
    record: Record<string, string> | undefined,
    langCode: string
): string | undefined {
    if (!record) return undefined

    const normalized = normalizeLocale(langCode)

    // 1. Exact match
    if (record[normalized]) return record[normalized]

    // 2. Prefix match (en → en-GB, en-US, etc)
    const prefix = normalized.split('-')[0]

    for (const key of Object.keys(record)) {
        const normalizedKey = normalizeLocale(key)
        if (normalizedKey.startsWith(prefix + '-')) {
            return record[key]
        }
    }

    return undefined
}

export function getLanguageLabel(locale: string): string {
    const normalized = normalizeLocale(locale)
    return LANGUAGE_LABELS[normalized] || normalized
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
})
{
    const [isPlaying, setIsPlaying] = useState(false)
    const [result, setResult] = useState<RecordingResult | null>(null)
    const [liveTranscript, setLiveTranscript] = useState('')
    const recorderRef = useRef<VoiceRecorder | null>(null)
    const stopTimerRef = useRef<NodeJS.Timeout | null>(null)

    const isRecording = activeRecordingId === item.id
    const isOtherRecording = !!activeRecordingId && !isRecording

    // ✅ PUT IT HERE (top-level inside component)
    useEffect(() => {
        return () => {
            if (stopTimerRef.current) {
                clearTimeout(stopTimerRef.current)
            }
        }
    }, [])


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


    const stopRec = useCallback(async () => {
        const recorder = recorderRef.current
        if (!recorder) return

        // ✅ CLEAR TIMER
        if (stopTimerRef.current) {
            clearTimeout(stopTimerRef.current)
            stopTimerRef.current = null
        }

        try {
            const blob = await recorder.stopRecording()
            const audioUrl = VoiceRecorder.createAudioUrl(blob)

            const finalTranscript = liveTranscript.trim() || 'No speech detected'

            const { score, matchedWords, missedWords } =
                computePronunciationScore(
                    finalTranscript,
                    cleanTextForTTS(item.translationText)
                )

            setResult({
                id: item.id,
                transcript: finalTranscript,
                score,
                matchedWords,
                missedWords,
                audioUrl,
            })
        } catch (e) {
            console.error('[PracticeCard] stopRec error:', e)
        }

        onRecordingStop(item.id, item.translationText)
        recorderRef.current = null
    }, [liveTranscript, item.id, item.translationText, onRecordingStop])


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

            // ✅ AUTO STOP AFTER 10 SEC
            stopTimerRef.current = setTimeout(() => {
                stopRec() // force stop
            }, 10000)

        } catch {
            alert('Could not access microphone.')
        }
    }, [selectedLanguage, result, item.id, onRecordingStart, stopRec])

    return (
        <div className={`
            relative rounded-2xl transition-all duration-300
            ${isRecording
            ? 'ring-2 ring-rose-400 shadow-lg shadow-rose-400/20'
            : 'ring-1 ring-slate-200 dark:ring-slate-700/60'}
            bg-white dark:bg-slate-900 hover:shadow-md
        `}>

            {/* HEADER */}
            <div className="px-4 py-4 flex items-start justify-between gap-3">

                {/* LEFT CONTENT */}
                <div className="min-w-0 flex-1">

                    <div className="flex items-center gap-2 mb-1">
                        {/*<span className={`*/}
                        {/*    text-[9px] font-bold uppercase tracking-widest px-2 py-[2px] rounded-full*/}
                        {/*    ${item.isWord*/}
                        {/*    ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'*/}
                        {/*    : 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400'}*/}
                        {/*`}>*/}
                        {/*    {item.isWord ? 'Word' : 'Phrase'}*/}
                        {/*</span>*/}

                        <div className="text-[15px] font-semibold text-[#0d141b] dark:text-white truncate">
                            {item.translationText}
                        </div>


                        <div className="mt-1 text-[13px] text-[#6b8cae] dark:text-slate-400 truncate">
                            {item.nativeText}
                        </div>
                    </div>

                    {item.romanization && (
                        <div className="text-[13px] text-[#6b8cae] dark:text-slate-400 truncate">
                            {item.romanization}
                        </div>
                    )}


                </div>

                {/* RIGHT ACTIONS */}
                <div className="flex items-center gap-2 shrink-0">

                    {/* LISTEN */}
                    <button
                        onClick={speak}
                        disabled={isOtherRecording || isRecording}
                        className={`
                            w-9 h-9 flex items-center justify-center rounded-xl transition
                            ${isPlaying
                            ? 'bg-[#137fec] text-white shadow-md'
                            : 'bg-blue-50 dark:bg-blue-900/20 text-[#137fec] hover:scale-105'}
                            ${(isOtherRecording || isRecording) ? 'opacity-40 cursor-not-allowed' : ''}
                        `}
                    >
                        {isPlaying ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <rect x="6" y="5" width="4" height="14" rx="1" />
                                <rect x="14" y="5" width="4" height="14" rx="1" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </button>

                    {/* PRACTICE / STOP */}
                    {isRecording ? (
                        <button
                            onClick={stopRec}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-500 text-white animate-pulse"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <rect x="6" y="6" width="12" height="12" rx="2" />
                            </svg>
                        </button>
                    ) : (
                        <button
                            onClick={startRec}
                            disabled={isOtherRecording || isPlaying}
                            className={`
                                w-9 h-9 flex items-center justify-center rounded-xl transition
                                ${(isOtherRecording || isPlaying)
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 hover:scale-105'}
                            `}
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* LIVE TRANSCRIPT */}
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

            {/* RESULT PANEL (UNCHANGED) */}
            {result && (
                <div className="mx-4 mb-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                    {/*<div className="flex items-center gap-4">*/}
                    {/*    <ScoreRing score={result.score} />*/}
                    {/*    <div>*/}
                    {/*        <div className="text-base font-black text-slate-800 dark:text-white">*/}
                    {/*            {result.score >= 80 ? '🎉 Excellent!' : result.score >= 50 ? '👍 Good effort!' : '💪 Keep going!'}*/}
                    {/*        </div>*/}
                    {/*        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">*/}
                    {/*            {result.matchedWords.length} / {result.matchedWords.length + result.missedWords.length} words matched*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}

                    <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">You said</div>
                        <p className="text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 rounded-lg px-3 py-2 font-mono border border-slate-200 dark:border-slate-700">
                            {result.transcript}
                        </p>
                    </div>

                    {result.missedWords.length > 0 && (
                        <div>
                            <div className="text-[11px] font-bold text-amber-600 uppercase tracking-widest mb-1.5">Words to work on</div>
                            <div className="flex flex-wrap gap-1.5">
                                {result.missedWords.map((w, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-mono font-bold">
                                        {w}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {result.audioUrl && (
                        <div>
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Your recording</div>
                            <audio controls src={result.audioUrl} className="w-full h-9 rounded-lg" />
                        </div>
                    )}

                    <div className="flex gap-2 pt-1">
                        <button onClick={speak} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-[#137fec]">
                            Listen again
                        </button>
                        <button onClick={() => { setResult(null); startRec() }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-600">
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
                                          nativeLangCode,
                                      }: {
    vocabulary: VocabularyItem[]
    selectedLanguage: string
    nativeLangCode: string
})
{
    const ttsRef = useRef<TextToSpeech | null>(null)
    const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
    const [voicesLoaded, setVoicesLoaded] = useState(false)
    const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null)

    const normalizedLang = normalizeLocale(selectedLanguage)
    const learningPrefix = normalizedLang.split('-')[0]

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

    // Build practice items:
    //   nativeText   = word in user's NATIVE language (what they know)
    //   translationText = word in LEARNING language (what they must say)
    //   romanization = romanized form of the learning language word
    const practiceItems: PracticeItem[] = vocabulary.flatMap((v) => {
        const learningTranslation = v.translations?.[normalizedLang]
            || findLocaleValue(v.translations, learningPrefix)
        const learningRomanization = v.romanization?.[normalizedLang]
            || findLocaleValue(v.romanization, learningPrefix)
        const nativeWord = findLocaleValue(v.translations, nativeLangCode)
            || v.word
        const items: PracticeItem[] = []

        // Word card — only if learning language translation exists
        if (learningTranslation) {
            items.push({
                id: `word-${v.id}`,
                nativeText: nativeWord,
                translationText: learningTranslation,
                romanization: learningRomanization,
                isWord: true,
            })
        }

        // Example sentence cards
        ;(v.exampleSentences ?? []).forEach((ex, i) => {
            const exLearning = ex.translations?.[normalizedLang]
                || findLocaleValue(ex.translations, learningPrefix)
            if (!exLearning) return
            const exNative = findLocaleValue(ex.translations, nativeLangCode)
                || ex.text
            items.push({
                id: `ex-${v.id}-${i}`,
                nativeText: exNative,
                translationText: exLearning,
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
                        See the word in your language, then record yourself saying it in {getLanguageLabel(selectedLanguage)}.
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
                               nativeLangCode,
                           }: {
    vocab: VocabularyItem[]
    selectedLanguage: string
    nativeLangCode: string
})
{
    const normalizedLang = normalizeLocale(selectedLanguage)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    if (!vocab || vocab.length === 0) return null

    const learningPrefix = normalizedLang.split('-')[0]

    return (
        <div className="w-full mt-8 text-left">
            {/*<h2 className="text-lg font-bold text-[#0d141b] dark:text-white mb-4">*/}
            {/*    📚 Vocabulary*/}
            {/*</h2>*/}
            {/*<div className="space-y-3">*/}
            {/*    {vocab.map((item) => {*/}
            {/*        const isExpanded = expandedId === item.id*/}

            {/*        // ── Learning language values ──*/}
            {/*        const learningWord = item.translations?.[normalizedLang]*/}
            {/*            || findLocaleValue(item.translations, learningPrefix)*/}
            {/*            || item.word*/}
            {/*        const learningRomanization = item.romanization?.[selectedLanguage]*/}
            {/*            || findLocaleValue(item.romanization, learningPrefix)*/}

            {/*        // ── Native language values ──*/}
            {/*        const nativeWord = findLocaleValue(item.translations, nativeLangCode)*/}
            {/*            || item.word*/}
            {/*        const nativeMeaning = findLocaleValue(item.definitionByLang, nativeLangCode)*/}
            {/*            || item.definition*/}

            {/*        return (*/}
            {/*            <div*/}
            {/*                key={item.id}*/}
            {/*                className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl overflow-hidden"*/}
            {/*            >*/}
            {/*                <button*/}
            {/*                    onClick={() => setExpandedId(isExpanded ? null : item.id)}*/}
            {/*                    className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"*/}
            {/*                >*/}
            {/*                    <div className="flex-1 min-w-0">*/}
            {/*                        <div className="flex items-center gap-3 flex-wrap">*/}
            {/*                            /!* Learning language word — PRIMARY *!/*/}
            {/*                            <span className="font-bold text-[#0d141b] dark:text-white text-base">*/}
            {/*                                {learningWord}*/}
            {/*                            </span>*/}
            {/*                            /!* Native language word — secondary context *!/*/}
            {/*                            {nativeWord && nativeWord !== learningWord && (*/}
            {/*                                <span className="text-sm text-[#4c739a] dark:text-slate-400">*/}
            {/*                                    {nativeWord}*/}
            {/*                                </span>*/}
            {/*                            )}*/}
            {/*                            /!* Romanization of learning word *!/*/}
            {/*                            {learningRomanization && (*/}
            {/*                                <span className="text-xs text-[#4c739a] dark:text-slate-400 font-mono italic">*/}
            {/*                                    /{learningRomanization}/*/}
            {/*                                </span>*/}
            {/*                            )}*/}
            {/*                        </div>*/}
            {/*                        /!* Native language meaning / definition *!/*/}
            {/*                        <p className="text-xs text-[#4c739a] dark:text-slate-500 mt-0.5 line-clamp-1">*/}
            {/*                            {nativeMeaning}*/}
            {/*                        </p>*/}
            {/*                    </div>*/}
            {/*                    <svg*/}
            {/*                        className={`w-4 h-4 text-[#4c739a] transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}*/}
            {/*                        fill="none" stroke="currentColor" viewBox="0 0 24 24"*/}
            {/*                    >*/}
            {/*                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />*/}
            {/*                    </svg>*/}
            {/*                </button>*/}

            {/*                {isExpanded && (*/}
            {/*                    <div className="border-t border-[#e7edf3] dark:border-slate-800 px-5 pb-5 pt-4 space-y-5">*/}
            {/*                        /!* Meaning — native language *!/*/}
            {/*                        <div>*/}
            {/*                            <p className="text-xs font-bold text-[#4c739a] dark:text-slate-400 uppercase tracking-wider mb-1">*/}
            {/*                                Meaning*/}
            {/*                            </p>*/}
            {/*                            <p className="text-sm text-[#0d141b] dark:text-slate-200">*/}
            {/*                                {nativeMeaning}*/}
            {/*                            </p>*/}
            {/*                        </div>*/}

            {/*                        /!* Pronunciation — learning language romanization *!/*/}
            {/*                        {learningRomanization && (*/}
            {/*                            <div>*/}
            {/*                                <p className="text-xs font-bold text-[#4c739a] dark:text-slate-400 uppercase tracking-wider mb-1">*/}
            {/*                                    Pronunciation*/}
            {/*                                </p>*/}
            {/*                                <p className="text-sm text-[#0d141b] dark:text-slate-200 font-mono">*/}
            {/*                                    {learningRomanization}*/}
            {/*                                </p>*/}
            {/*                            </div>*/}
            {/*                        )}*/}

            {/*                        /!* Examples — learning language text with native language translation *!/*/}
            {/*                        {(item.exampleSentences ?? []).length > 0 && (*/}
            {/*                            <div>*/}
            {/*                                <p className="text-xs font-bold text-[#4c739a] dark:text-slate-400 uppercase tracking-wider mb-2">*/}
            {/*                                    Examples*/}
            {/*                                </p>*/}
            {/*                                <div className="space-y-2">*/}
            {/*                                    {(item.exampleSentences ?? []).map((ex, i) => {*/}
            {/*                                        const exLearning = ex.translations?.[normalizedLang]*/}
            {/*                                            || findLocaleValue(ex.translations, learningPrefix)*/}
            {/*                                        const exNative = findLocaleValue(ex.translations, nativeLangCode)*/}
            {/*                                        const displayLearning = exLearning || ex.text*/}
            {/*                                        return (*/}
            {/*                                            <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-4 py-3">*/}
            {/*                                                <p className="text-sm text-[#0d141b] dark:text-slate-200 font-medium">*/}
            {/*                                                    {displayLearning}*/}
            {/*                                                </p>*/}
            {/*                                                {exNative && exNative !== displayLearning && (*/}
            {/*                                                    <p className="text-sm text-[#4c739a] dark:text-slate-400 mt-1">{exNative}</p>*/}
            {/*                                                )}*/}
            {/*                                            </div>*/}
            {/*                                        )*/}
            {/*                                    })}*/}
            {/*                                </div>*/}
            {/*                            </div>*/}
            {/*                        )}*/}

            {/*                        /!* Tips — language-neutral *!/*/}
            {/*                        {(item.tips ?? []).length > 0 && (*/}
            {/*                            <div>*/}
            {/*                                <p className="text-xs font-bold text-[#4c739a] dark:text-slate-400 uppercase tracking-wider mb-2">*/}
            {/*                                    Tips*/}
            {/*                                </p>*/}
            {/*                                <div className="space-y-2">*/}
            {/*                                    {(item.tips ?? []).map((tip, i) => {*/}
            {/*                                        const cfg = TIP_CONFIG[tip.type] ?? {*/}
            {/*                                            color: 'text-slate-700 dark:text-slate-300',*/}
            {/*                                            bg: 'bg-slate-100 dark:bg-slate-800',*/}
            {/*                                            border: 'border-slate-200 dark:border-slate-700',*/}
            {/*                                            label: tip.type,*/}
            {/*                                        }*/}
            {/*                                        return (*/}
            {/*                                            <div key={i} className={`flex items-start gap-3 rounded-lg p-3 border ${cfg.bg} ${cfg.border}`}>*/}
            {/*                                                <span style={{ fontSize: 14, lineHeight: 1.4 }}>*/}
            {/*                                                    {TIP_ICONS[tip.type] ?? '💡'}*/}
            {/*                                                </span>*/}
            {/*                                                <div className="flex-1 min-w-0">*/}
            {/*                                                    <VocabTipBadge type={tip.type} />*/}
            {/*                                                    <p className={`text-sm mt-1 ${cfg.color}`}>{tip.text}</p>*/}
            {/*                                                </div>*/}
            {/*                                            </div>*/}
            {/*                                        )*/}
            {/*                                    })}*/}
            {/*                                </div>*/}
            {/*                            </div>*/}
            {/*                        )}*/}
            {/*                    </div>*/}
            {/*                )}*/}
            {/*            </div>*/}
            {/*        )*/}
            {/*    })}*/}
            {/*</div>*/}
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
    const [nativeLangCode, setNativeLangCode] = useState('en')

    const STORAGE_KEY = 'selected-language-code'
    const normalizedLang = normalizeLocale(selectedLanguage)

    useEffect(() => {
        const storedAccent = localStorage.getItem('speaki_accent')
        const storedRecordingType = localStorage.getItem('speaki_recording_type') as 'automatic' | 'manual' | null
        const storedNative = localStorage.getItem('speaki_native_lang')
        if (storedAccent) setSelectedLanguage(storedAccent)
        if (storedRecordingType) setRecordingMode(storedRecordingType)
        if (storedNative) setNativeLangCode(storedNative)
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

        if (!current) return

        const currentPrefix = current.lang.replace('_', '-').split('-')[0]
        const selectedPrefix = normalizedLang.split('-')[0]

        if (currentPrefix !== selectedPrefix) {
            const defaultAgent = getDefaultVoiceAgentForLang(selectedLanguage)
            if (defaultAgent) setSelectedVoiceAgentId(defaultAgent.id)
        }
    }, [selectedLanguage, selectedVoiceAgentId, normalizedLang])

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
                                                        v.lang.split('-')[0] === normalizedLang.split('-')[0]
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
                            <VocabularyDetails
                                vocab={vocabulary}
                                selectedLanguage={selectedLanguage}
                                nativeLangCode={nativeLangCode}
                            />

                            {/* Pronunciation Practice */}
                            <PronunciationPracticeSection
                                vocabulary={vocabulary}
                                selectedLanguage={selectedLanguage}
                                nativeLangCode={nativeLangCode}
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
                                    nativeLangCode={nativeLangCode}
                                />
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    )
}