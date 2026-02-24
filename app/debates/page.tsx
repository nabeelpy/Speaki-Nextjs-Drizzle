'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import Header from '@/components/header'
import MobileNav from '@/components/mobile-nav'
import type { DebateTopic } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const LEVELS = ['A1', 'A2', 'B1', 'B2']
const DIFFICULTIES = ['easy', 'medium', 'hard']

export default function DebatesPage() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const queryParams = new URLSearchParams()
  if (selectedLevel) queryParams.append('level', selectedLevel)

  const { data, isLoading } = useSWR(`/api/debates?${queryParams.toString()}`, fetcher)

  let topics: DebateTopic[] = data?.data || []

  // Client-side filtering for difficulty and search
  topics = topics.filter((topic) => {
    const matchesDifficulty = !selectedDifficulty || topic.difficulty === selectedDifficulty
    const matchesSearch =
      !searchQuery ||
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesDifficulty && matchesSearch
  })

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <main className="flex flex-col w-full max-w-[1200px] mx-auto px-4 lg:px-10 py-10 pb-24 md:pb-10">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-[#137fec] hover:opacity-80 transition-opacity mb-4"
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
              Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-[#0d141b] mb-2">Debate Topics</h1>
            <p className="text-[#4c739a]">Practice speaking by debating real topics with AI</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-lg p-6 mb-8">
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-[#e7edf3] dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-[#0d141b] dark:text-white placeholder-[#4c739a] focus:outline-none focus:border-[#137fec]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Level Filter */}
              <div>
                <h3 className="font-bold text-[#0d141b] dark:text-white mb-3">Level</h3>
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map((level) => (
                    <button
                      key={level}
                      onClick={() =>
                        setSelectedLevel(selectedLevel === level ? null : level)
                      }
                      className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                        selectedLevel === level
                          ? 'bg-[#137fec] text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-[#0d141b] dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div>
                <h3 className="font-bold text-[#0d141b] dark:text-white mb-3">Difficulty</h3>
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTIES.map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() =>
                        setSelectedDifficulty(
                          selectedDifficulty === difficulty ? null : difficulty,
                        )
                      }
                      className={`px-4 py-2 rounded-lg font-bold transition-colors capitalize ${
                        selectedDifficulty === difficulty
                          ? 'bg-[#137fec] text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-[#0d141b] dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Topics Grid */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="text-gray-500">Loading topics...</div>
            </div>
          ) : topics.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="text-gray-500">No topics found matching your filters</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topics.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/debates/${topic.id}`}
                  className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-lg p-6 hover:shadow-md transition-shadow group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block bg-[#137fec]/10 text-[#137fec] px-2 py-1 rounded text-xs font-bold">
                          {topic.level}
                        </span>
                        <span className="inline-block bg-slate-100 dark:bg-slate-800 text-[#0d141b] dark:text-white px-2 py-1 rounded text-xs font-bold capitalize">
                          {topic.difficulty}
                        </span>
                        {topic.isFeatured && (
                          <span className="inline-block bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded text-xs font-bold">
                            Featured
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-[#0d141b] dark:text-white mb-2 group-hover:text-[#137fec] transition-colors">
                        {topic.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-[#4c739a] dark:text-slate-400 text-sm mb-4 line-clamp-2">
                    {topic.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-[#4c739a] dark:text-slate-400 mb-4">
                    <span>{topic.participants} participants</span>
                    <span>{topic.rating.toFixed(1)} ★</span>
                    <span>{topic.duration} min</span>
                  </div>

                  <button className="w-full bg-[#137fec] text-white font-bold py-2 px-4 rounded-lg text-sm hover:opacity-90 transition-opacity">
                    Start Debate
                  </button>
                </Link>
              ))}
            </div>
          )}
        </main>
        <MobileNav />
      </div>
    </div>
  )
}
