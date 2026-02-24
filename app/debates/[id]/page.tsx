'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import Header from '@/components/header'
import MobileNav from '@/components/mobile-nav'
import AudioDebateInterface from '@/components/audio-debate-interface'
import type { DebateTopic, DebateMessage } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function DebatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [topicId, setTopicId] = useState<string | null>(null)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    params.then((p) => setTopicId(p.id))
  }, [params])

  const { data, isLoading } = useSWR(
    topicId ? `/api/debates/${topicId}` : null,
    fetcher,
  )

  const topic: DebateTopic = data?.data

  const handleDebateComplete = (transcript: DebateMessage[]) => {
    setHasStarted(false)
    console.log('[v0] Debate completed with transcript:', transcript)
  }

  if (isLoading || !topic) {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <Header />
          <main className="flex justify-center items-center min-h-[60vh] w-full">
            <div className="text-gray-500">Loading debate topic...</div>
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
            href="/debates"
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
            Back to Topics
          </Link>

          {!hasStarted && (
            <div className="text-center max-w-3xl w-full">
              <h1 className="text-4xl font-bold text-[#0d141b] dark:text-white mb-4">
                {topic.title}
              </h1>
              <p className="text-[#4c739a] dark:text-slate-400 mb-8 text-lg">
                {topic.description}
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8 text-left">
                <p className="text-[#0d141b] dark:text-white font-semibold mb-4">
                  Audio-Based Speaking Practice:
                </p>
                <ul className="space-y-2 text-sm text-[#4c739a] dark:text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-[#137fec] font-bold mt-0.5">1.</span>
                    <span>Listen to AI speak the debate topic and arguments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#137fec] font-bold mt-0.5">2.</span>
                    <span>Click "Start Speaking" and respond using your voice</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#137fec] font-bold mt-0.5">3.</span>
                    <span>Get instant feedback on your speech quality and suggestions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#137fec] font-bold mt-0.5">4.</span>
                    <span>Continue the debate across multiple rounds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#137fec] font-bold mt-0.5">5.</span>
                    <span>Review complete combined audio session at the end</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setHasStarted(true)}
                className="bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold py-4 px-12 rounded-lg text-lg shadow-lg shadow-[#137fec]/20 transition-all"
              >
                Start Audio Debate
              </button>
            </div>
          )}

          {hasStarted && (
            <AudioDebateInterface topic={topic} onComplete={handleDebateComplete} />
          )}
        </main>
        <MobileNav />
      </div>
    </div>
  )
}
