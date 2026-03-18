'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import Header from '@/components/header'
import MobileNav from '@/components/mobile-nav'
import AudioLessonInterface from '@/components/audio-lesson-interface'
import type { LessonConversation, ConversationMessage } from '@/lib/types'
import {
    SUPPORTED_LANGUAGES,
    VOICE_AGENTS,
    LANGUAGE_LABELS,
    getVoiceAgentsForLanguage,
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

const DEFAULT_LANG = 'en-US'
const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function getLanguageLabel(locale: string): string {
    const normalized = locale.replace('_', '-')
    return LANGUAGE_LABELS[normalized] || locale
}

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
    const [recordDelaySeconds, setRecordDelaySeconds] = useState<number>(1)
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

    const STORAGE_KEY = 'selected-language-code'
    const excludedLanguages = ['fr-FR', 'es-ES', 'ar-SA', 'es-US', 'zh-CH', 'zh-CN']

    const [savedLanguage, setSavedLanguage] = useState<string | null>(null)
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        setSavedLanguage(saved)
    }, [])

    // Auto-select first accent once savedLanguage is resolved and voices are loaded
    useEffect(() => {
        if (savedLanguage === null) return // not yet loaded from localStorage
        const langs = getLanguages()
        if (langs.length > 0) {
            setSelectedLanguage(langs[0])
        }
    }, [savedLanguage, voices])

// Auto-select first agent voice when voices load or language changes
    useEffect(() => {
        if (voices.length === 0) return
        const filtered = voices.filter(
            (v) => v.lang.split('-')[0] === selectedLanguage.split('-')[0]
        )
        if (filtered.length > 0) {
            setSelectedVoiceAgentId(`${filtered[0].name}|${filtered[0].lang}`)
        }
    }, [voices, selectedLanguage])


    const getLanguages = () => {
        const codes = Array.from(new Set(voices.map(v => v.lang)))

        // // If English → show all except excluded
        // if (!savedLanguage || savedLanguage === 'en') {
        //     return codes.filter(code => !excludedLanguages.includes(code))
        // }

        // If another language → show only that one
        return codes.filter(code => code.startsWith(savedLanguage))
    }

    useEffect(() => {
        params.then((p) => setLessonId(p.id))
    }, [params])

    // Load speech synthesis voices
    useEffect(() => {

        const loadVoices = () => {
            setVoices(window.speechSynthesis.getVoices())
        }

        loadVoices()
        window.speechSynthesis.onvoiceschanged = loadVoices
    }, [])

    // When language changes, switch to a valid voice agent for that language
    useEffect(() => {
        const current = VOICE_AGENTS.find((a) => a.id === selectedVoiceAgentId)
        if (current && current.lang.split('-')[0] !== selectedLanguage.split('-')[0]) {
            const defaultAgent = getDefaultVoiceAgentForLang(selectedLanguage)
            if (defaultAgent) setSelectedVoiceAgentId(defaultAgent.id)
        }
    }, [selectedLanguage])

    const { data, isLoading } = useSWR(
        lessonId ? `/api/lessons/${lessonId}` : null,
        fetcher,
    )

    const conversation: LessonConversation = data?.data
    useEffect(() => {
        if (conversation) {
            const configured = conversation.recordingDelaySeconds
            // if (typeof configured === 'number' && configured > 0) {
            //     setRecordDelaySeconds(configured)
            // } else {
            //     const turns = conversation.turns?.length ?? 0
            //     const derived = turns <= 6 ? 5 : turns <= 12 ? 7 : 10
            //     setRecordDelaySeconds(derived)
            // }
        }
    }, [conversation])

    const handleLessonComplete = (messages: ConversationMessage[]) => {
        setHasStarted(false)
        console.log('[v0] Lesson completed with messages:', messages)
    }

    function cleanVoiceName(name: string) {
        return name
            .replace(/Microsoft\s*/gi, "")
            .replace(/Google\s*/gi, "")
            .replace(/Apple\s*/gi, "")
            .replace(/Online\s*\(Natural\)\s*/gi, "")
            .replace(/\(.*?\)/g, "")
            .trim();
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
                    {/*<Link*/}
                    {/*    href="/"*/}
                    {/*    className="flex items-center gap-2 text-[#137fec] hover:opacity-80 transition-opacity mb-8 self-start"*/}
                    {/*>*/}
                    {/*    <svg*/}
                    {/*        className="w-5 h-5"*/}
                    {/*        fill="none"*/}
                    {/*        stroke="currentColor"*/}
                    {/*        viewBox="0 0 24 24"*/}
                    {/*    >*/}
                    {/*        <path*/}
                    {/*            strokeLinecap="round"*/}
                    {/*            strokeLinejoin="round"*/}
                    {/*            strokeWidth={2}*/}
                    {/*            d="M15 19l-7-7 7-7"*/}
                    {/*        />*/}
                    {/*    </svg>*/}
                    {/*    Back to Courses*/}
                    {/*</Link>*/}

                    {!hasStarted && (
                        <div className="text-center max-w-3xl w-full">
                            <h1 className="text-2xl md:text-4xl font-bold text-[#0d141b] dark:text-white mb-4">
                                {conversation.title}
                            </h1>
                            <p className="text-[#4c739a] dark:text-slate-400 mb-8 text-base md:text-lg">
                                {conversation.description}
                            </p>

                            {/* <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg p-6 mb-8">
                                <h3 className="font-bold text-[#0d141b] dark:text-white mb-3">
                                    Scenario: {conversation.scenario}
                                </h3>
                                <p className="text-sm text-[#4c739a] dark:text-slate-400">
                                    {conversation.turns.length} conversation turns
                                </p>
                            </div> */}

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
                                                        {/*{LANGUAGE_LABELS[getLanguageLabel(code)] || code}*/}
                                                        {getLanguageLabel(code)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>                                    </div>
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
                                                    .filter((v: SpeechSynthesisVoice) => v.lang.split('-')[0] === selectedLanguage.split('-')[0])
                                                    .map((v: SpeechSynthesisVoice) => (
                                                        <SelectItem key={`${v.name}|${v.lang}`} value={`${v.name}|${v.lang}`}>
                                                            {cleanVoiceName(v.name)}
                                                            {/*({v.lang})*/}
                                                        </SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col gap-1.5 w-full md:w-auto md:min-w-[200px]">
                                        <Label className="text-left text-xs font-semibold text-[#4c739a] dark:text-slate-400">
                                            Delay Before Recording
                                        </Label>
                                        <Select value={String(recordDelaySeconds)} onValueChange={(v) => setRecordDelaySeconds(Number(v))}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select delay" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[0, 1, 2, 3, 4].map((d) => (
                                                    <SelectItem key={d} value={String(d)}>
                                                        {d} seconds
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>


                            {/*<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8 text-left">*/}
                            {/*    <p className="text-[#0d141b] dark:text-white font-semibold mb-4">*/}
                            {/*        Conversation Practice:*/}
                            {/*    </p>*/}
                            {/*    <ul className="space-y-2 text-sm text-[#4c739a] dark:text-slate-400">*/}
                            {/*        <li className="flex items-start gap-2">*/}
                            {/*            <span className="text-[#137fec] font-bold mt-0.5">1.</span>*/}
                            {/*            <span>Listen to the AI speak their line in the conversation</span>*/}
                            {/*        </li>*/}
                            {/*        <li className="flex items-start gap-2">*/}
                            {/*            <span className="text-[#137fec] font-bold mt-0.5">2.</span>*/}
                            {/*            <span>Then speak your line</span>*/}
                            {/*        </li>*/}
                            {/*        <li className="flex items-start gap-2">*/}
                            {/*            <span className="text-[#137fec] font-bold mt-0.5">3.</span>*/}
                            {/*            <span>Continue through the entire conversation</span>*/}
                            {/*        </li>*/}
                            {/*        <li className="flex items-start gap-2">*/}
                            {/*            <span className="text-[#137fec] font-bold mt-0.5">4.</span>*/}
                            {/*            <span>Review and listen to the complete conversation at the end</span>*/}
                            {/*        </li>*/}
                            {/*    </ul>*/}
                            {/*</div>*/}





                            <button
                                onClick={() => setHasStarted(true)}
                                className="w-full md:w-auto bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold py-3 px-4 md:py-4 md:px-12 rounded-lg text-base md:text-lg shadow-lg shadow-[#137fec]/20 transition-all"
                            >
                                Start Conversation Practice
                            </button>
                        </div>
                    )}

                    {hasStarted && (
                        <AudioLessonInterface
                            conversation={conversation}
                            onComplete={handleLessonComplete}
                            defaultLanguage={selectedLanguage}
                            defaultVoiceAgentId={selectedVoiceAgentId}
                            recordDelaySeconds={recordDelaySeconds}
                        />
                    )}
                </main>
                {/*<MobileNav />*/}
            </div>
        </div>
    )
}
