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

    useEffect(() => {
        params.then((p) => setLessonId(p.id))
    }, [params])

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
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-[#137fec] hover:opacity-80 transition-opacity mb-8 self-start"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Back to Courses
                    </Link>

                    {!hasStarted && (
                        <div className="text-center max-w-3xl w-full">
                            <h1 className="text-4xl font-bold text-[#0d141b] dark:text-white mb-4">
                                {conversation.title}
                            </h1>
                            <p className="text-[#4c739a] dark:text-slate-400 mb-8 text-lg">
                                {conversation.description}
                            </p>

                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8 text-left">
                                <p className="text-[#0d141b] dark:text-white font-semibold mb-4">
                                    Conversation Practice:
                                </p>
                                <ul className="space-y-2 text-sm text-[#4c739a] dark:text-slate-400">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#137fec] font-bold mt-0.5">1.</span>
                                        <span>Listen to the AI speak their line in the conversation</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#137fec] font-bold mt-0.5">2.</span>
                                        <span>Click "Start Recording" and speak your line</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#137fec] font-bold mt-0.5">3.</span>
                                        <span>Continue through the entire conversation</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#137fec] font-bold mt-0.5">4.</span>
                                        <span>Review and listen to the complete conversation at the end</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg p-6 mb-8">
                                <h3 className="font-bold text-[#0d141b] dark:text-white mb-3">
                                    Scenario: {conversation.scenario}
                                </h3>
                                <p className="text-sm text-[#4c739a] dark:text-slate-400">
                                    {conversation.turns.length} conversation turns
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-6 mb-8">
                                <h3 className="font-bold text-[#0d141b] dark:text-white mb-4">
                                    Language &amp; voice
                                </h3>
                                <p className="text-sm text-[#4c739a] dark:text-slate-400 mb-4">
                                    Choose the language for the conversation and the AI voice accent before you start.
                                </p>
                                <div className="flex flex-wrap items-end gap-4">
                                    <div className="flex flex-col gap-1.5 min-w-[180px]">
                                        <Label className="text-xs font-semibold text-[#4c739a] dark:text-slate-400">
                                            Language
                                        </Label>
                                        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select language" />
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
                                            Voice accent
                                        </Label>
                                        <Select value={selectedVoiceAgentId} onValueChange={setSelectedVoiceAgentId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select voice" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(getVoiceAgentsForLanguage(selectedLanguage).length > 0
                                                    ? getVoiceAgentsForLanguage(selectedLanguage)
                                                    : VOICE_AGENTS
                                                ).map((agent) => (
                                                    <SelectItem key={agent.id} value={agent.id}>
                                                        {agent.accentLabel}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setHasStarted(true)}
                                className="bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold py-4 px-12 rounded-lg text-lg shadow-lg shadow-[#137fec]/20 transition-all"
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
                        />
                    )}
                </main>
                <MobileNav />
            </div>
        </div>
    )
}
