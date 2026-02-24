'use client'

import Link from 'next/link'
import useSWR from 'swr'
import type { UserProgress } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function ProgressSection() {
  const { data } = useSWR('/api/user/progress', fetcher)

  const progress: UserProgress | null = data?.data?.progress

  return (
    <Link
      href="/dashboard"
      className="w-full mt-16 p-8 bg-[#137fec]/5 dark:bg-[#137fec]/10 rounded-2xl border border-[#137fec]/10 dark:border-[#137fec]/20 flex flex-col md:flex-row items-center justify-between gap-8 hover:bg-[#137fec]/10 dark:hover:bg-[#137fec]/20 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-6 flex-1">
        <div className="size-16 rounded-full bg-[#137fec] flex items-center justify-center text-white shadow-lg shadow-[#137fec]/20 flex-shrink-0">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
          </svg>
        </div>
        <div>
          <h4 className="text-xl font-bold text-[#0d141b] dark:text-white">Keep the momentum going!</h4>
          <p className="text-[#4c739a] dark:text-slate-400">
            You've completed {progress?.completedCourses || 0} courses and {progress?.completedDebates || 0} debates. View your full progress.
          </p>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-[#137fec]">{progress?.streak || 0}</span>
          <span className="text-[10px] uppercase font-bold text-[#4c739a] tracking-widest">
            Day Streak
          </span>
        </div>
        <div className="w-[1px] h-10 bg-[#137fec]/20" />
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-[#137fec]">{progress?.totalXp || 0}</span>
          <span className="text-[10px] uppercase font-bold text-[#4c739a] tracking-widest">
            XP Earned
          </span>
        </div>
      </div>
    </Link>
  )
}
