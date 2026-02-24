'use client'

import { useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import type { DebateTopic } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function FeaturedCard() {
  const [liked, setLiked] = useState(false)
  const { data } = useSWR('/api/debates?featured=true', fetcher)

  const featuredTopic: DebateTopic = data?.data?.[0] || {
    id: 'd4',
    title: 'Social Media Debate',
    description: 'Express your opinions on the impact of social media on modern society.',
    level: 'B1',
    category: 'Social Issues',
    proArguments: [],
    conArguments: [],
    vocabularyTips: [],
    phrasesSuggested: [],
    difficulty: 'medium',
    duration: 12,
    participants: 156,
    rating: 4.5,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  }

  return (
    <>
      <div className="col-span-full pt-8 pb-4 w-full">
        <h2 className="text-[#0d141b] dark:text-white text-2xl font-bold leading-tight tracking-tight">
          Recommended for You
        </h2>
      </div>
      <div className="bg-white dark:bg-slate-900 border border-[#137fec]/30 dark:border-[#137fec]/50 rounded-xl overflow-hidden shadow-md flex flex-col md:flex-row w-full group">
        <div className="md:w-1/3 h-48 md:h-auto bg-gradient-to-br from-[#137fec] to-blue-800 relative overflow-hidden">
          <div className="absolute inset-0 opacity-90 bg-gradient-to-br from-[#137fec] to-blue-800" />
          <div className="flex flex-col items-center justify-center h-full text-white p-6 relative z-10">
            <span className="text-7xl mb-2">💭</span>
            <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-2 py-1 rounded">
              Level {featuredTopic.level}
            </span>
          </div>
        </div>
        <div className="p-8 flex flex-col grow md:w-2/3">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-2xl font-bold text-[#0d141b] dark:text-white leading-tight mb-1">
                {featuredTopic.title}
              </h3>
              <span className="text-xs font-medium text-[#137fec] px-2 py-1 bg-[#137fec]/10 rounded">
                Trending Topic
              </span>
            </div>
            <button
              onClick={() => setLiked(!liked)}
              className={`transition-colors ${liked ? 'text-red-500' : 'text-[#4c739a] hover:text-red-500'}`}
            >
              <svg className="w-8 h-8" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>
          <p className="text-[#4c739a] dark:text-slate-400 text-base mb-6">
            {featuredTopic.description} Learn to use powerful debate phrases in a structured
            AI conversation.
          </p>
          <div className="flex items-center gap-4 mt-auto">
            <Link
              href={`/debates/${featuredTopic.id}`}
              className="bg-[#137fec] text-white font-bold py-3 px-8 rounded-lg text-base shadow-lg shadow-[#137fec]/20 hover:shadow-[#137fec]/40 transition-all"
            >
              Launch Debate Session
            </Link>
            <div className="flex -space-x-2">
              <div
                className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-300"
                style={{
                  backgroundImage:
                    'url("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop")',
                  backgroundSize: 'cover',
                }}
              />
              <div
                className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-300"
                style={{
                  backgroundImage:
                    'url("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop")',
                  backgroundSize: 'cover',
                }}
              />
              <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                +{featuredTopic.participants}
              </div>
            </div>
            <span className="text-xs text-[#4c739a] font-medium">Practicing now</span>
          </div>
        </div>
      </div>
    </>
  )
}
