'use client'

import { useState, useEffect, useRef } from 'react'
import { VoiceRecorder, TextToSpeech } from '@/lib/voice-recorder'
import type { LessonConversation, ConversationMessage, ConversationTurn } from '@/lib/types'
import {
    SUPPORTED_LANGUAGES,
    VOICE_AGENTS,
    getVoiceAgentsForLanguage,
    getDefaultVoiceAgentForLang,
    loadBrowserVoices,
    hasVoiceForLang,
    type VoiceAgent,
} from '@/lib/voice-config'
import { t, getUILocale } from '@/lib/i18n/audio-lesson'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface AudioLessonInterfaceProps {
    conversation: LessonConversation
    onComplete: (messages: ConversationMessage[]) => void
    defaultLanguage?: string
    defaultVoiceAgentId?: string
    delayBeforeRecording?: number
    recordDelaySeconds?: number
}

const DEFAULT_LANG = 'en-US'
const USER_ROLE_ALIASES = ['passenger', 'user', 'you', 'student', 'customer', 'learner', 'friend']
const AI_ROLE_ALIASES = ['officer', 'ai', 'agent', 'system', 'teacher', 'assistant', 'me']

function getTurnText(turn: ConversationTurn | undefined, lang: string): string {
    if (!turn) return ''
    const byLang = turn.textByLang
    if (!byLang) return turn.text
    const exact = byLang[lang]
    if (exact != null && exact !== '') return exact
    const prefix = lang.split('-')[0]?.toLowerCase()
    if (prefix) {
        const variant = Object.keys(byLang).find((k) => k.toLowerCase().startsWith(prefix))
        if (variant && byLang[variant]) return byLang[variant]
    }
    return turn.text
}

function getRomanization(turn: ConversationTurn | undefined, lang: string): string {
    if (!turn?.romanizationByLang) return ''
    const byLang = turn.romanizationByLang
    const exact = byLang[lang]
    if (exact != null && exact !== '') return exact
    const prefix = lang.split('-')[0]?.toLowerCase()
    if (prefix) {
        const variant = Object.keys(byLang).find((k) => k.toLowerCase().startsWith(prefix))
        if (variant && byLang[variant]) return byLang[variant]
    }
    return ''
}

function normalizeRole(r?: string) {
    return (r ?? '').trim().toLowerCase()
}

export default function AudioLessonInterface({
                                                 conversation,
                                                 onComplete,
                                                 defaultLanguage = DEFAULT_LANG,
                                                 defaultVoiceAgentId,
                                                 recordDelaySeconds = 4,
                                             }: AudioLessonInterfaceProps) {
    const [messages, setMessages] = useState<ConversationMessage[]>([])
    const [currentTurnIndex, setCurrentTurnIndex] = useState(0)
    const [isListening, setIsListening] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [conversationEnded, setConversationEnded] = useState(false)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [liveTranscript, setLiveTranscript] = useState('')
    const [isPlayingCombined, setIsPlayingCombined] = useState(false)
    const [playbackProgress, setPlaybackProgress] = useState(0)
    const [language, setLanguage] = useState(defaultLanguage)
    const [voiceAgentId, setVoiceAgentId] = useState<string>(
        defaultVoiceAgentId ?? getDefaultVoiceAgentForLang(defaultLanguage)?.id ?? VOICE_AGENTS[0]?.id ?? ''
    )
    const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([])
    const [countdownActive, setCountdownActive] = useState(false)
    const [countdownLeft, setCountdownLeft] = useState(0)
    const [recordingTimeLeft, setRecordingTimeLeft] = useState<number | null>(null)
    const [userRoleNorm, setUserRoleNorm] = useState<string | null>(null)
    const [aiRoleNorm, setAiRoleNorm] = useState<string | null>(null)

    // ── Refs for everything that closures need to read synchronously ──
    const voiceRecorderRef = useRef<VoiceRecorder>(new VoiceRecorder())
    const textToSpeechRef = useRef<TextToSpeech>(new TextToSpeech())
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const hasInitialized = useRef(false)
    const countdownRef = useRef<NodeJS.Timeout | null>(null)
    const countdownTurnRef = useRef<number | null>(null)
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)

    // Sync refs — keep in lock-step with state so interval/timeout closures always see fresh values
    const currentTurnIndexRef = useRef(0)
    const isRecordingRef = useRef(false)
    const isListeningRef = useRef(false)
    const isProcessingRef = useRef(false)
    const liveTranscriptRef = useRef('')
    const languageRef = useRef(defaultLanguage)
    const userRoleNormRef = useRef<string | null>(null)
    const aiRoleNormRef = useRef<string | null>(null)
    const selectedVoiceAgentRef = useRef<VoiceAgent | null | undefined>(null)
    const conversationEndedRef = useRef(false)

    useEffect(() => { currentTurnIndexRef.current = currentTurnIndex }, [currentTurnIndex])
    useEffect(() => { isListeningRef.current = isListening }, [isListening])
    useEffect(() => { isProcessingRef.current = isProcessing }, [isProcessing])
    useEffect(() => { liveTranscriptRef.current = liveTranscript }, [liveTranscript])
    useEffect(() => { languageRef.current = language }, [language])
    useEffect(() => { userRoleNormRef.current = userRoleNorm }, [userRoleNorm])
    useEffect(() => { aiRoleNormRef.current = aiRoleNorm }, [aiRoleNorm])
    useEffect(() => { conversationEndedRef.current = conversationEnded }, [conversationEnded])

    // Derive role norms from conversation
    useEffect(() => {
        const t0 = conversation.turns[0]
        const t1 = conversation.turns[1]
        if (t0 && t1 && normalizeRole(t0.role) !== normalizeRole(t1.role)) {
            const ai = normalizeRole(t0.role)
            const user = normalizeRole(t1.role)
            setAiRoleNorm(ai)
            setUserRoleNorm(user)
            aiRoleNormRef.current = ai
            userRoleNormRef.current = user
        } else if (t0) {
            const r0 = normalizeRole(t0.role)
            if (AI_ROLE_ALIASES.includes(r0)) {
                setAiRoleNorm(r0); aiRoleNormRef.current = r0
                setUserRoleNorm(null); userRoleNormRef.current = null
            } else if (USER_ROLE_ALIASES.includes(r0)) {
                setUserRoleNorm(r0); userRoleNormRef.current = r0
                setAiRoleNorm(null); aiRoleNormRef.current = null
            }
        }
    }, [conversation])

    const currentTurn = conversation.turns[currentTurnIndex]
    const roleNorm = normalizeRole(currentTurn?.role)
    const isUserTurn =
        (userRoleNorm ? roleNorm === userRoleNorm : USER_ROLE_ALIASES.includes(roleNorm)) ||
        (!AI_ROLE_ALIASES.includes(roleNorm) && currentTurnIndex % 2 === 1)

    const uiLocale = getUILocale(language)
    const selectedVoiceAgent = VOICE_AGENTS.find((a) => a.id === voiceAgentId) ?? getDefaultVoiceAgentForLang(language)
    const voiceAgentsForLang = getVoiceAgentsForLanguage(language)
    const hasVoiceForCurrentLang = hasVoiceForLang(browserVoices, language)
    const showEnglishTranslation = language.split('-')[0].toLowerCase() !== 'en'

    // Keep selectedVoiceAgent ref in sync
    useEffect(() => { selectedVoiceAgentRef.current = selectedVoiceAgent }, [selectedVoiceAgent])

    // Load browser voices
    useEffect(() => {
        loadBrowserVoices().then((voices) => {
            setBrowserVoices(voices)
            textToSpeechRef.current.setBrowserVoices(voices)
        })
    }, [])

    // Keep speech recognition language in sync
    useEffect(() => {
        voiceRecorderRef.current.setLanguage(language)
    }, [language])

    // When language changes, switch to a valid voice agent
    useEffect(() => {
        const current = VOICE_AGENTS.find((a) => a.id === voiceAgentId)
        if (current && current.lang.split('-')[0] !== language.split('-')[0]) {
            const defaultAgent = getDefaultVoiceAgentForLang(language)
            if (defaultAgent) setVoiceAgentId(defaultAgent.id)
        }
    }, [language])

    // Elapsed timer
    useEffect(() => {
        timerRef.current = setInterval(() => setElapsedTime((prev) => prev + 1), 1000)
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [])

    // ── Helpers ──────────────────────────────────────────────────────────────

    const isUserTurnByIndex = (idx: number): boolean => {
        const turn = conversation.turns[idx]
        if (!turn) return false
        const norm = normalizeRole(turn.role)
        const uRole = userRoleNormRef.current
        const aRole = aiRoleNormRef.current
        return (uRole ? norm === uRole : USER_ROLE_ALIASES.includes(norm)) ||
            (!AI_ROLE_ALIASES.includes(norm) && idx % 2 === 1)
    }

    const cancelCountdown = () => {
        if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null }
        setCountdownActive(false)
        setCountdownLeft(0)
    }

    // ── Core functions (use refs, never state, for async-safe reads) ─────────

    const startRecording = async () => {
        if (isRecordingRef.current) return

        try {
            cancelCountdown()
            isRecordingRef.current = true
            setIsRecording(true)
            isProcessingRef.current = false
            setIsProcessing(false)
            setLiveTranscript('')
            liveTranscriptRef.current = ''

            if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null }

            voiceRecorderRef.current.onTranscriptUpdate = (transcript) => {
                setLiveTranscript(transcript)
                liveTranscriptRef.current = transcript
            }

            voiceRecorderRef.current.setLanguage(languageRef.current)
            await voiceRecorderRef.current.startRecording()

            // Auto-stop timer
            const turnAtStart = conversation.turns[currentTurnIndexRef.current]
            const recordingDuration = conversation?.recordingTime ?? 10
            let timeLeft = recordingDuration
            setRecordingTimeLeft(timeLeft)

            recordingTimerRef.current = setInterval(() => {
                timeLeft -= 1
                setRecordingTimeLeft(timeLeft)
                if (timeLeft <= 0) {
                    if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null }
                    setRecordingTimeLeft(null)
                    if (isRecordingRef.current) stopRecording()
                }
            }, 1000)

        } catch (error) {
            isRecordingRef.current = false
            setIsRecording(false)
            setRecordingTimeLeft(null)
            alert('Microphone access denied. Please allow microphone permissions and try again.')
        }
    }

    const stopRecording = async () => {
        if (!isRecordingRef.current) return
        isRecordingRef.current = false

        if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null }
        setRecordingTimeLeft(null)

        // Snapshot refs NOW before any awaits
        const turnIndex = currentTurnIndexRef.current
        const turn = conversation.turns[turnIndex]
        const transcript = liveTranscriptRef.current
        const lang = languageRef.current

        try {
            isProcessingRef.current = true
            setIsProcessing(true)

            const audioBlob = await voiceRecorderRef.current.stopRecording()
            setIsRecording(false)

            const userText = transcript.trim() || turn.text
            const audioUrl = VoiceRecorder.createAudioUrl(audioBlob)

            const userMessage: ConversationMessage = {
                id: `msg-${Date.now()}`,
                role: turn.role,
                content: userText,
                speaker: 'user',
                audioUrl,
                timestamp: new Date().toISOString(),
                turnOrder: turnIndex,
            }

            setMessages((prev) => [...prev, userMessage])

            // Last turn?
            if (turnIndex >= conversation.turns.length - 1) {
                setTimeout(() => endConversation(), 1000)
                return
            }

            // Advance to next AI turn
            const nextTurnIdx = turnIndex + 1
            const nextTurn = conversation.turns[nextTurnIdx]

            setCurrentTurnIndex(nextTurnIdx)
            currentTurnIndexRef.current = nextTurnIdx

            setTimeout(() => {
                isProcessingRef.current = false
                setIsProcessing(false)
                playAIMessage(getTurnText(nextTurn, lang), nextTurn.role, nextTurnIdx)
            }, 1000)

        } catch (error) {
            isProcessingRef.current = false
            setIsProcessing(false)
            isRecordingRef.current = false
            setIsRecording(false)
            console.error('Error processing audio:', error)
        }
    }

    const startCountdown = (turnIndex: number) => {
        countdownTurnRef.current = turnIndex
        setCountdownLeft(recordDelaySeconds)
        setCountdownActive(true)
        if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null }

        countdownRef.current = setInterval(() => {
            if (
                countdownTurnRef.current !== currentTurnIndexRef.current ||
                isListeningRef.current ||
                conversationEndedRef.current
            ) {
                cancelCountdown()
                return
            }
            setCountdownLeft((prev) => {
                const next = prev - 1
                if (next <= 0) {
                    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null }
                    setCountdownActive(false)
                    if (!isRecordingRef.current && !isListeningRef.current && !isProcessingRef.current) {
                        startRecording()
                    }
                    return 0
                }
                return next
            })
        }, 1000)
    }

    const playAIMessage = (message: string, role: string, turnOrderIndex: number) => {
        cancelCountdown()
        isListeningRef.current = true
        setIsListening(true)

        const aiMessage: ConversationMessage = {
            id: `msg-${Date.now()}`,
            role,
            content: message,
            speaker: 'ai',
            timestamp: new Date().toISOString(),
            turnOrder: turnOrderIndex,
        }

        setMessages((prev) => [...prev, aiMessage])

        textToSpeechRef.current.speak(message, {
            lang: languageRef.current,
            voiceAgent: selectedVoiceAgentRef.current ?? undefined,
            onEnd: () => {
                isListeningRef.current = false
                setIsListening(false)

                const nextIdx = turnOrderIndex + 1
                const nextTurn = conversation.turns[nextIdx]

                setCurrentTurnIndex(nextIdx)
                currentTurnIndexRef.current = nextIdx

                if (nextTurn && isUserTurnByIndex(nextIdx)) {
                    setTimeout(() => startCountdown(nextIdx), 0)
                } else if (nextTurn) {
                    // Back-to-back AI turns
                    setTimeout(() => {
                        playAIMessage(getTurnText(nextTurn, languageRef.current), nextTurn.role, nextIdx)
                    }, 500)
                }
            },
        })
    }

    // Play initial AI message (only once)
    useEffect(() => {
        if (hasInitialized.current) return
        hasInitialized.current = true

        setTimeout(() => {
            const firstTurn = conversation.turns[0]
            if (!firstTurn) return
            const t0 = conversation.turns[0]
            const t1 = conversation.turns[1]
            let detectedAiRole: string | null = null
            if (t0 && t1 && normalizeRole(t0.role) !== normalizeRole(t1.role)) {
                detectedAiRole = normalizeRole(t0.role)
            }
            const firstNorm = normalizeRole(firstTurn.role)
            const firstIsAI = detectedAiRole
                ? firstNorm === detectedAiRole
                : AI_ROLE_ALIASES.includes(firstNorm)
            if (firstIsAI) {
                playAIMessage(getTurnText(firstTurn, languageRef.current), firstTurn.role, 0)
            }
        }, 500)
    }, [])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const playSequentialAudio = async () => {
        setIsPlayingCombined(true)
        setPlaybackProgress(0)
        const numTurns = conversation.turns.length
        const t0 = conversation.turns[0]
        const t1 = conversation.turns[1]
        let uRole: string | null = null
        if (t0 && t1 && normalizeRole(t0.role) !== normalizeRole(t1.role)) uRole = normalizeRole(t1.role)

        for (let turnIdx = 0; turnIdx < numTurns; turnIdx++) {
            const turn = conversation.turns[turnIdx]
            setPlaybackProgress(((turnIdx + 1) / numTurns) * 100)
            const rn = normalizeRole(turn.role)
            const isUser = uRole ? rn === uRole : USER_ROLE_ALIASES.includes(rn) || (!AI_ROLE_ALIASES.includes(rn) && turnIdx % 2 === 1)

            if (isUser) {
                const userMsg = messages.find((m) => m.speaker === 'user' && m.turnOrder === turnIdx)
                if (userMsg?.audioUrl) {
                    await new Promise<void>((resolve) => {
                        const audio = new Audio(userMsg.audioUrl)
                        audio.onended = () => resolve()
                        audio.onerror = () => resolve()
                        audio.play()
                    })
                }
            } else {
                await new Promise<void>((resolve) => {
                    textToSpeechRef.current.speak(getTurnText(turn, language), {
                        lang: language,
                        voiceAgent: selectedVoiceAgent ?? undefined,
                        onEnd: () => resolve(),
                    })
                })
            }
            await new Promise((resolve) => setTimeout(resolve, 500))
        }
        setIsPlayingCombined(false)
        setPlaybackProgress(100)
    }

    const stopCombinedAudio = () => {
        textToSpeechRef.current.stop()
        setIsPlayingCombined(false)
        setPlaybackProgress(0)
        if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current)
    }

    const endConversation = () => {
        textToSpeechRef.current.stop()
        conversationEndedRef.current = true
        setConversationEnded(true)
        isProcessingRef.current = false
        setIsProcessing(false)
    }

    // ── Render ────────────────────────────────────────────────────────────────

    if (conversationEnded) {
        return (
            <div className="w-full max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-8 text-center mb-6">
                    <h2 className="text-3xl font-bold mb-4">{t(uiLocale, 'conversationComplete')} 🎉</h2>
                    <div className="flex justify-center gap-8">
                        <div>
                            <p className="text-4xl font-bold">{messages.filter(m => m.speaker === 'user').length}</p>
                            <p className="text-green-100">{t(uiLocale, 'yourResponses')}</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold">{formatTime(elapsedTime)}</p>
                            <p className="text-green-100">{t(uiLocale, 'totalTime')}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border-2 border-[#137fec]/30 dark:border-[#137fec]/50 rounded-lg p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-[#137fec]/10 dark:bg-[#137fec]/20 p-3 rounded-lg">
                            <svg className="w-6 h-6 text-[#137fec]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[#0d141b] dark:text-white">
                                {t(uiLocale, 'completeConversationAudio')}
                            </h3>
                            <p className="text-sm text-[#4c739a] dark:text-slate-400">
                                {messages.length} {t(uiLocale, 'totalExchanges')} • {conversation.scenario}
                            </p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 rounded-lg p-6 mb-4 border border-blue-200 dark:border-slate-700">
                        <p className="text-sm text-[#4c739a] dark:text-slate-400 mb-4">
                            🎧 {t(uiLocale, 'listenComplete')}
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={isPlayingCombined ? stopCombinedAudio : playSequentialAudio}
                                    disabled={messages.length === 0}
                                    className="bg-[#137fec] hover:bg-[#137fec]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-[#137fec]/20"
                                >
                                    {isPlayingCombined ? (
                                        <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>{t(uiLocale, 'stopPlayback')}</>
                                    ) : (
                                        <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>{t(uiLocale, 'playCompleteConversation')}</>
                                    )}
                                </button>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-xs font-semibold text-[#0d141b] dark:text-white">
                                            {isPlayingCombined ? t(uiLocale, 'playing') : t(uiLocale, 'readyToPlay')}
                                        </p>
                                        <p className="text-xs font-bold text-[#137fec]">{Math.round(playbackProgress)}%</p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-700 rounded-full h-3 overflow-hidden shadow-inner">
                                        <div
                                            className="bg-gradient-to-r from-[#137fec] to-blue-500 h-full rounded-full transition-all duration-300 ease-out"
                                            style={{ width: `${playbackProgress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                            {isPlayingCombined && (
                                <div className="flex items-center gap-2 text-sm text-[#137fec] animate-pulse">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" /></svg>
                                    <span className="font-medium">{t(uiLocale, 'playingCombined')}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-semibold text-[#0d141b] dark:text-white">{t(uiLocale, 'completeTranscript')}</h4>
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`p-4 rounded-lg ${msg.speaker === 'user'
                                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                    : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                                }`}
                            >
                                <p className="text-xs font-bold text-[#137fec] mb-1">{msg.role}:</p>
                                <p className="text-sm text-[#0d141b] dark:text-white mb-2">
                                    {msg.speaker === 'ai'
                                        ? getTurnText(conversation.turns[msg.turnOrder], language) || msg.content
                                        : msg.content}
                                </p>
                                {msg.speaker === 'ai' && (() => {
                                    const rom = getRomanization(conversation.turns[msg.turnOrder], language)
                                    return rom ? <p className="text-xs text-slate-500 dark:text-slate-400 italic mb-2">{rom}</p> : null
                                })()}
                                {msg.speaker === 'ai' && showEnglishTranslation && (() => {
                                    const en = conversation.turns[msg.turnOrder]?.text ?? ''
                                    return en ? <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">{t(uiLocale, 'inEnglish')} {en}</p> : null
                                })()}
                                {msg.audioUrl && <audio controls className="w-full h-8 mt-2" src={msg.audioUrl} />}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => onComplete(messages)}
                        className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-lg transition-all flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {t(uiLocale, 'backToCourse')}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Language & Voice */}
            <div className="flex flex-wrap items-end gap-4 mb-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col gap-1.5 min-w-[180px]">
                    <Label className="text-xs font-semibold text-[#4c739a] dark:text-slate-400">
                        {t(uiLocale, 'language')}
                    </Label>
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={t(uiLocale, 'selectLanguage')} />
                        </SelectTrigger>
                        <SelectContent>
                            {SUPPORTED_LANGUAGES.map((opt) => (
                                <SelectItem key={opt.code} value={opt.code}>
                                    {opt.nativeName} ({opt.name})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col gap-1.5 min-w-[200px]">
                    <Label className="text-xs font-semibold text-[#4c739a] dark:text-slate-400">
                        {t(uiLocale, 'voiceAccent')}
                    </Label>
                    <Select value={voiceAgentId} onValueChange={setVoiceAgentId}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={t(uiLocale, 'selectVoice')} />
                        </SelectTrigger>
                        <SelectContent>
                            {(voiceAgentsForLang.length > 0 ? voiceAgentsForLang : VOICE_AGENTS).map((agent) => (
                                <SelectItem key={agent.id} value={agent.id}>
                                    {agent.accentLabel}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {browserVoices.length > 0 && !hasVoiceForCurrentLang && (
                <div className="mb-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800" role="alert">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        {t(uiLocale, 'noVoiceForLanguage')}
                    </p>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-[#0d141b] dark:text-white">{conversation.scenario}</h2>
                    <p className="text-[#4c739a] dark:text-slate-400">
                        {t(uiLocale, 'turnOf')} {currentTurnIndex + 1} {t(uiLocale, 'of')} {conversation.turns.length}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-bold text-[#137fec]">{formatTime(elapsedTime)}</p>
                    <p className="text-xs text-[#4c739a] dark:text-slate-400">{t(uiLocale, 'elapsedTime')}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                        className="bg-[#137fec] h-full transition-all duration-300"
                        style={{ width: `${((currentTurnIndex + 1) / conversation.turns.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Conversation Transcript */}
            <div className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-lg p-6 mb-6 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-2xl p-4 rounded-lg ${msg.speaker === 'user'
                                ? 'bg-[#137fec] text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-[#0d141b] dark:text-white'}`}
                            >
                                <p className="text-xs font-bold mb-2 opacity-80">{msg.role}</p>
                                <p className="text-sm">
                                    {msg.speaker === 'ai'
                                        ? getTurnText(conversation.turns[msg.turnOrder], language) || msg.content
                                        : msg.content}
                                </p>
                                {msg.speaker === 'ai' && (() => {
                                    const rom = getRomanization(conversation.turns[msg.turnOrder], language)
                                    return rom ? <p className="text-xs opacity-80 mt-1 italic">{rom}</p> : null
                                })()}
                                {msg.speaker === 'ai' && showEnglishTranslation && (() => {
                                    const en = conversation.turns[msg.turnOrder]?.text ?? ''
                                    return en ? <p className="text-xs opacity-80 mt-1">{t(uiLocale, 'inEnglish')} {en}</p> : null
                                })()}
                                {msg.audioUrl && <audio controls className="w-full h-6 mt-2" src={msg.audioUrl} />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Voice Input Controls */}
            <div className="bg-gradient-to-r from-[#137fec]/10 to-blue-500/10 dark:from-[#137fec]/20 dark:to-blue-500/20 border border-[#137fec]/30 dark:border-[#137fec]/50 rounded-lg p-8 text-center">
                {isListening && (
                    <div className="mb-6">
                        <div className="flex justify-center mb-4">
                            <div className="flex gap-2">
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-1 bg-[#137fec] rounded-full animate-pulse"
                                         style={{ height: `${20 + i * 10}px`, animation: `pulse ${0.4 + i * 0.1}s ease-in-out infinite` }} />
                                ))}
                            </div>
                        </div>
                        <p className="text-[#137fec] font-semibold">{t(uiLocale, 'listeningTo')} {currentTurn?.role}...</p>
                    </div>
                )}

                {isRecording && (
                    <div className="mb-6">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full border-4 border-[#137fec] border-t-red-500 animate-spin" />
                        </div>
                        <p className="text-[#0d141b] dark:text-white font-semibold mb-3">
                            {t(uiLocale, 'recording')}
                            {recordingTimeLeft !== null && recordingTimeLeft > 0 && (
                                <span className="ml-2 text-[#137fec]">{recordingTimeLeft}s remaining</span>
                            )}
                        </p>
                        {liveTranscript && (
                            <div className="bg-white dark:bg-slate-800 border border-[#137fec]/30 rounded-lg p-4 mb-4 text-left">
                                <p className="text-xs font-bold text-[#137fec] mb-2">{t(uiLocale, 'liveTranscription')}</p>
                                <p className="text-sm text-[#0d141b] dark:text-white italic">{liveTranscript}</p>
                            </div>
                        )}
                        <p className="text-[#4c739a] dark:text-slate-400 text-sm">
                            {t(uiLocale, 'say')}: "{getTurnText(currentTurn, language)}"
                        </p>
                        {getRomanization(currentTurn, language) && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
                                {getRomanization(currentTurn, language)}
                            </p>
                        )}
                        {showEnglishTranslation && currentTurn?.text && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                                {t(uiLocale, 'inEnglish')} {currentTurn.text}
                            </p>
                        )}
                    </div>
                )}

                {isProcessing && (
                    <div className="mb-6">
                        <p className="text-[#137fec] font-semibold">{t(uiLocale, 'processing')}</p>
                    </div>
                )}

                {!isRecording && !isListening && !isProcessing && isUserTurn && (
                    <div>
                        <p className="text-[#0d141b] dark:text-white font-semibold mb-2">
                            {t(uiLocale, 'yourTurnAs')} {currentTurn?.role}
                        </p>
                        <p className={`text-sm text-[#4c739a] dark:text-slate-400 ${(getRomanization(currentTurn, language) || (showEnglishTranslation && currentTurn?.text)) ? 'mb-1' : 'mb-6'}`}>
                            {t(uiLocale, 'say')}: "{getTurnText(currentTurn, language)}"
                        </p>
                        {getRomanization(currentTurn, language) && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 italic">
                                {getRomanization(currentTurn, language)}
                            </p>
                        )}
                        {showEnglishTranslation && currentTurn?.text && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 mb-6">
                                {t(uiLocale, 'inEnglish')} {currentTurn.text}
                            </p>
                        )}
                    </div>
                )}

                <div className="flex gap-4 justify-center">
                    {isUserTurn && !isRecording && !isListening && !isProcessing ? (
                        <button
                            onClick={startRecording}
                            disabled={countdownActive}
                            className="bg-[#137fec] hover:bg-[#137fec]/90 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg shadow-[#137fec]/20 transition-all flex items-center gap-3"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 1C6.48 1 2 5.48 2 11v8c0 .55.45 1 1 1h2v-6h-2v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-2v6h2v-8c0-5.52-4.48-10-10-10z" />
                            </svg>
                            {t(uiLocale, 'startRecording')}
                        </button>
                    ) : isRecording ? (
                        <button
                            onClick={stopRecording}
                            disabled={isProcessing}
                            className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg transition-all flex items-center gap-3"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 4h12v12H6z" />
                            </svg>
                            {t(uiLocale, 'stopRecording')}
                        </button>
                    ) : null}
                    {!isRecording && !isListening && !isProcessing && countdownActive && (
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#137fec]">
                            <div className="w-3 h-3 rounded-full bg-[#137fec] animate-pulse" />
                            <span>Recording starts in {countdownLeft}…</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
