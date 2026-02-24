'use client'

import useSWR from 'swr'
import Link from 'next/link'
import Header from '@/components/header'
import MobileNav from '@/components/mobile-nav'
import type { User, UserProgress } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function DashboardPage() {
  const { data, isLoading } = useSWR('/api/user/progress', fetcher)

  const user: User | null = data?.data?.user
  const progress: UserProgress | null = data?.data?.progress

  if (isLoading || !user || !progress) {
    return (
      <div className="min-h-screen bg-[#f6f7f8]">
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    )
  }

  // Mock data for recent activity
  const recentActivity = [
    {
      id: '1',
      type: 'course',
      title: 'Completed Professional Presentations',
      xp: 200,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'debate',
      title: 'Debated Remote Work vs Office',
      xp: 150,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      type: 'course',
      title: 'Completed Interview Preparation',
      xp: 210,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  const nextLevelXp = 3000
  const progressPercent = (progress.totalXp / nextLevelXp) * 100

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <main className="flex flex-col w-full max-w-[1200px] mx-auto px-4 lg:px-10 py-10 pb-24 md:pb-10">
          {/* User Profile Header */}
          <div className="bg-gradient-to-r from-[#137fec]/20 to-[#137fec]/5 rounded-2xl p-8 mb-8 flex items-center gap-6">
            <img
              src={user.avatar || "/placeholder.svg"}
              alt={user.name}
              className="w-20 h-20 rounded-full border-4 border-[#137fec]"
            />
            <div>
              <h1 className="text-4xl font-bold text-[#0d141b] mb-2">{user.name}</h1>
              <p className="text-[#4c739a] mb-3">{user.email}</p>
              <div className="flex items-center gap-4">
                <span className="bg-[#137fec] text-white px-3 py-1 rounded-full text-sm font-bold">
                  Level {progress.level}
                </span>
                <span className="text-sm text-[#4c739a]">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-lg p-6">
              <h3 className="text-[#4c739a] text-sm font-bold mb-2">Total XP</h3>
              <p className="text-3xl font-bold text-[#137fec] mb-2">
                {progress.totalXp.toLocaleString()}
              </p>
              <p className="text-xs text-[#4c739a]">
                {Math.floor(progressPercent)}% to next level
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-lg p-6">
              <h3 className="text-[#4c739a] text-sm font-bold mb-2">Current Streak</h3>
              <p className="text-3xl font-bold text-orange-500 mb-2">{progress.streak} days</p>
              <p className="text-xs text-[#4c739a]">Keep it up!</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-lg p-6">
              <h3 className="text-[#4c739a] text-sm font-bold mb-2">Courses Completed</h3>
              <p className="text-3xl font-bold text-green-500 mb-2">
                {progress.completedCourses}
              </p>
              <p className="text-xs text-[#4c739a]">Keep learning!</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-lg p-6">
              <h3 className="text-[#4c739a] text-sm font-bold mb-2">Debates Completed</h3>
              <p className="text-3xl font-bold text-purple-500 mb-2">
                {progress.completedDebates}
              </p>
              <p className="text-xs text-[#4c739a]">Great discussions!</p>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-[#0d141b] dark:text-white">Progress to Level {progress.level === 'B2' ? 'Expert' : String.fromCharCode(progress.level.charCodeAt(0) + 1)}</h3>
              <span className="text-sm text-[#4c739a]">
                {progress.totalXp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#137fec] to-blue-600 h-full transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-[#0d141b] dark:text-white mb-6">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                          activity.type === 'course'
                            ? 'bg-green-500/20 text-green-600'
                            : 'bg-purple-500/20 text-purple-600'
                        }`}
                      >
                        {activity.type === 'course' ? '📚' : '💭'}
                      </div>
                      <div>
                        <p className="font-bold text-[#0d141b] dark:text-white">
                          {activity.title}
                        </p>
                        <p className="text-xs text-[#4c739a]">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-[#137fec]">+{activity.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h2 className="text-2xl font-bold text-[#0d141b] dark:text-white mb-6">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  href="/debates"
                  className="block bg-gradient-to-r from-[#137fec] to-blue-600 text-white font-bold py-3 px-4 rounded-lg text-center hover:opacity-90 transition-opacity"
                >
                  Start a Debate
                </Link>
                <Link
                  href="/"
                  className="block bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg text-center hover:opacity-90 transition-opacity"
                >
                  Take a Course
                </Link>
                <Link
                  href="/dashboard/achievements"
                  className="block bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold py-3 px-4 rounded-lg text-center hover:opacity-90 transition-opacity"
                >
                  View Achievements
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-[#0d141b] dark:text-white mb-4">
                Level Progression
              </h3>
              <div className="space-y-3">
                {['A1', 'A2', 'B1', 'B2'].map((level) => (
                  <div key={level} className="flex items-center gap-3">
                    <span
                      className={`text-sm font-bold px-2 py-1 rounded ${
                        level === progress.level
                          ? 'bg-[#137fec] text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-[#0d141b] dark:text-white'
                      }`}
                    >
                      {level}
                    </span>
                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-full rounded-full ${
                          level === progress.level
                            ? 'bg-[#137fec]'
                            : level < progress.level
                              ? 'bg-green-500'
                              : 'bg-slate-300'
                        }`}
                        style={{
                          width:
                            level === progress.level ? '50%' : level < progress.level ? '100%' : '0%',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-[#0d141b] dark:text-white mb-4">
                Learning Summary
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[#4c739a] mb-1">Time Spent Learning</p>
                  <p className="text-2xl font-bold text-[#0d141b] dark:text-white">
                    {(progress.completedCourses * 45 + progress.completedDebates * 12).toLocaleString()} min
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#4c739a] mb-1">Average Session Duration</p>
                  <p className="text-2xl font-bold text-[#0d141b] dark:text-white">
                    {Math.floor((progress.completedCourses * 45 + progress.completedDebates * 12) / (progress.completedCourses + progress.completedDebates))} min
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  )
}
