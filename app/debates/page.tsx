'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import Header from '@/components/header'
import MobileNav from '@/components/mobile-nav'
import type { DebateTopic } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const DIFFICULTIES = ['easy', 'medium', 'hard']

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  medium: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  hard: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function DebatesPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading } = useSWR('/api/debates', fetcher)

  let topics: DebateTopic[] = data?.data || []

  topics = topics.filter((topic) => {
    const matchesDifficulty = !selectedDifficulty || topic.difficulty === selectedDifficulty
    const matchesSearch =
        !searchQuery ||
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesDifficulty && matchesSearch
  })

  return (
      <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-slate-50 dark:bg-slate-950">
        <div className="layout-container flex h-full grow flex-col">
          <Header />

          <main className="flex flex-col w-full max-w-[1200px] mx-auto pb-24 md:pb-10">

            {/* ── Page header ── */}
            <div className="px-4 pt-6 pb-4 md:px-10 md:pt-10 md:pb-6">
              <h1 className="text-2xl md:text-4xl font-bold text-[#0d141b] dark:text-white leading-tight">
                Debate Topics
              </h1>
              <p className="text-sm md:text-base text-[#4c739a] mt-1">
                Practice speaking by debating real topics with AI
              </p>
            </div>

            {/* ── Search ── */}
            <div className="px-4 md:px-10 mb-3">
              <div className="relative">
                <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4c739a] pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" strokeWidth={2} />
                  <path d="m21 21-4.35-4.35" strokeWidth={2} strokeLinecap="round" />
                </svg>
                <input
                    type="text"
                    placeholder="Search topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 md:py-3 text-sm md:text-base border border-[#e7edf3] dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-[#0d141b] dark:text-white placeholder-[#4c739a] focus:outline-none focus:border-[#137fec] transition-colors"
                />
              </div>
            </div>

            {/* ── Difficulty filter — horizontal scroll on mobile ── */}
            <div className="px-4 md:px-10 mb-4">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
                {/* "All" chip */}
                <button
                    onClick={() => setSelectedDifficulty(null)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                        selectedDifficulty === null
                            ? 'bg-[#137fec] text-white'
                            : 'bg-white dark:bg-slate-800 border border-[#e7edf3] dark:border-slate-700 text-[#4c739a] dark:text-slate-400'
                    }`}
                >
                  All
                </button>

                {DIFFICULTIES.map((difficulty) => (
                    <button
                        key={difficulty}
                        onClick={() =>
                            setSelectedDifficulty(selectedDifficulty === difficulty ? null : difficulty)
                        }
                        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-colors ${
                            selectedDifficulty === difficulty
                                ? 'bg-[#137fec] text-white'
                                : 'bg-white dark:bg-slate-800 border border-[#e7edf3] dark:border-slate-700 text-[#4c739a] dark:text-slate-400'
                        }`}
                    >
                      {difficulty}
                    </button>
                ))}
              </div>
            </div>

            {/* ── Results count ── */}
            {!isLoading && (
                <div className="px-4 md:px-10 mb-3">
                  <p className="text-xs text-[#4c739a]">
                    {topics.length} {topics.length === 1 ? 'topic' : 'topics'} found
                  </p>
                </div>
            )}

            {/* ── Topic list ── */}
            <div className="px-4 md:px-10">
              {isLoading ? (
                  /* Skeleton loaders */
                  <div className="flex flex-col gap-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-2xl p-4 animate-pulse"
                        >
                          <div className="flex gap-2 mb-3">
                            <div className="h-5 w-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
                            <div className="h-5 w-14 bg-slate-200 dark:bg-slate-700 rounded-full" />
                          </div>
                          <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded mb-1" />
                          <div className="h-3 w-2/3 bg-slate-100 dark:bg-slate-800 rounded mb-4" />
                          <div className="flex justify-between items-center">
                            <div className="flex gap-3">
                              <div className="h-3 w-10 bg-slate-100 dark:bg-slate-800 rounded" />
                              <div className="h-3 w-8 bg-slate-100 dark:bg-slate-800 rounded" />
                              <div className="h-3 w-12 bg-slate-100 dark:bg-slate-800 rounded" />
                            </div>
                            <div className="h-7 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                          </div>
                        </div>
                    ))}
                  </div>
              ) : topics.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <svg
                        className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                      <circle cx="11" cy="11" r="8" strokeWidth={1.5} />
                      <path d="m21 21-4.35-4.35" strokeWidth={1.5} strokeLinecap="round" />
                    </svg>
                    <p className="text-[#4c739a] font-medium">No topics found</p>
                    <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
                  </div>
              ) : (
                  /* Card grid — 1 col mobile, 2 col desktop */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                    {topics.map((topic) => (
                        <Link
                            key={topic.id}
                            href={`/debates/${topic.id}`}
                            className="group bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-2xl p-4 md:p-6 hover:shadow-md hover:border-[#137fec]/30 transition-all active:scale-[0.99]"
                        >
                          {/* Badges */}
                          <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
                      <span className="bg-[#137fec]/10 text-[#137fec] px-2 py-0.5 rounded-full text-xs font-bold">
                        {topic.level}
                      </span>
                            <span
                                className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${
                                    DIFFICULTY_STYLES[topic.difficulty] ?? 'bg-slate-100 text-slate-600'
                                }`}
                            >
                        {topic.difficulty}
                      </span>
                            {topic.isFeatured && (
                                <span className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full text-xs font-bold">
                          ★ Featured
                        </span>
                            )}
                          </div>

                          {/* Title */}
                          <h3 className="text-base md:text-xl font-bold text-[#0d141b] dark:text-white leading-snug mb-1.5 group-hover:text-[#137fec] transition-colors line-clamp-2">
                            {topic.title}
                          </h3>

                          {/* Description */}
                          <p className="text-xs md:text-sm text-[#4c739a] dark:text-slate-400 leading-relaxed line-clamp-2 mb-3">
                            {topic.description}
                          </p>

                          {/* Meta + CTA row */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3 text-xs text-[#4c739a] dark:text-slate-500 min-w-0">
                              {/* Participants */}
                              <span className="flex items-center gap-1 shrink-0">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeWidth={2} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" strokeWidth={2} />
                            <path strokeWidth={2} d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                                {topic.participants.toLocaleString()}
                        </span>
                              {/* Rating */}
                              <span className="flex items-center gap-1 shrink-0">
                          <svg className="w-3 h-3 fill-amber-400 stroke-amber-400" viewBox="0 0 24 24">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeWidth={1.5} />
                          </svg>
                                {topic.rating.toFixed(1)}
                        </span>
                              {/* Duration */}
                              <span className="flex items-center gap-1 shrink-0">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" strokeWidth={2} />
                            <polyline points="12 6 12 12 16 14" strokeWidth={2} strokeLinecap="round" />
                          </svg>
                                {topic.duration}m
                        </span>
                            </div>

                            {/* Start button — compact on mobile */}
                            <button className="flex-shrink-0 bg-[#137fec] text-white font-bold py-1.5 px-4 md:py-2 md:px-5 rounded-xl text-sm hover:bg-[#0f6fd4] transition-colors active:scale-95">
                              Start
                            </button>
                          </div>
                        </Link>
                    ))}
                  </div>
              )}
            </div>
          </main>

          <MobileNav />
        </div>
      </div>
  )
}