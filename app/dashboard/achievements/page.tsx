'use client'

import Link from 'next/link'
import Header from '@/components/header'
import MobileNav from '@/components/mobile-nav'

const ACHIEVEMENTS = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Complete your first course',
    icon: '🚀',
    unlocked: true,
  },
  {
    id: '2',
    name: 'Debate Master',
    description: 'Complete 5 debate sessions',
    icon: '🥊',
    unlocked: true,
    progress: 3,
    total: 5,
  },
  {
    id: '3',
    name: 'Streak Legend',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    unlocked: true,
  },
  {
    id: '4',
    name: 'XP Hunter',
    description: 'Earn 2,000 XP',
    icon: '⭐',
    unlocked: true,
  },
  {
    id: '5',
    name: 'Course Collector',
    description: 'Complete 5 courses',
    icon: '📚',
    unlocked: false,
    progress: 3,
    total: 5,
  },
  {
    id: '6',
    name: 'Fluency Expert',
    description: 'Reach level B2',
    icon: '🎓',
    unlocked: false,
    progress: 0,
    total: 1,
  },
  {
    id: '7',
    name: 'Social Butterfly',
    description: 'Participate in 10 group debates',
    icon: '🦋',
    unlocked: false,
    progress: 2,
    total: 10,
  },
  {
    id: '8',
    name: 'Vocabulary Expert',
    description: 'Learn 500 new words',
    icon: '📖',
    unlocked: false,
    progress: 234,
    total: 500,
  },
]

export default function AchievementsPage() {
  const unlockedCount = ACHIEVEMENTS.filter((a) => a.unlocked).length

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <main className="flex flex-col w-full max-w-[1200px] mx-auto px-4 lg:px-10 py-10 pb-24 md:pb-10">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
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
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-[#0d141b] mb-2">Achievements</h1>
            <p className="text-[#4c739a]">
              You've unlocked {unlockedCount} of {ACHIEVEMENTS.length} achievements
            </p>
          </div>

          {/* Progress Overview */}
          <div className="bg-gradient-to-r from-[#137fec]/20 to-[#137fec]/5 rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#0d141b] mb-2">
                  Achievement Progress
                </h2>
                <p className="text-[#4c739a]">
                  Keep completing courses and debates to unlock more achievements
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-[#137fec]">{unlockedCount}</p>
                <p className="text-sm text-[#4c739a]">of {ACHIEVEMENTS.length}</p>
              </div>
            </div>
            <div className="mt-6 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#137fec] to-blue-600 h-full transition-all duration-500 rounded-full"
                style={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Unlocked Achievements */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[#0d141b] dark:text-white mb-6">
              Unlocked
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ACHIEVEMENTS.filter((a) => a.unlocked).map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-white dark:bg-slate-900 border-2 border-[#137fec] rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="text-6xl mb-4">{achievement.icon}</div>
                  <h3 className="text-lg font-bold text-[#0d141b] dark:text-white mb-2">
                    {achievement.name}
                  </h3>
                  <p className="text-sm text-[#4c739a] dark:text-slate-400 mb-4">
                    {achievement.description}
                  </p>
                  <div className="inline-block bg-[#137fec] text-white px-3 py-1 rounded-full text-xs font-bold">
                    Unlocked
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Locked Achievements */}
          <div>
            <h2 className="text-2xl font-bold text-[#0d141b] dark:text-white mb-6">
              In Progress
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ACHIEVEMENTS.filter((a) => !a.unlocked).map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg p-6 text-center hover:shadow-lg transition-shadow opacity-75"
                >
                  <div className="text-6xl mb-4 filter grayscale">{achievement.icon}</div>
                  <h3 className="text-lg font-bold text-[#0d141b] dark:text-white mb-2">
                    {achievement.name}
                  </h3>
                  <p className="text-sm text-[#4c739a] dark:text-slate-400 mb-4">
                    {achievement.description}
                  </p>
                  {achievement.progress !== undefined && achievement.total !== undefined && (
                    <>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2 overflow-hidden">
                        <div
                          className="bg-[#137fec] h-full transition-all duration-300 rounded-full"
                          style={{
                            width: `${(achievement.progress / achievement.total) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-[#4c739a] dark:text-slate-400 font-bold">
                        {achievement.progress}/{achievement.total}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  )
}
