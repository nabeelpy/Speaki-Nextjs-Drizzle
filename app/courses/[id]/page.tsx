'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import Header from '@/components/header'
import MobileNav from '@/components/mobile-nav'
import type { Course } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [courseId, setCourseId] = useState<string | null>(null)

  useEffect(() => {
    params.then((p) => setCourseId(p.id))
  }, [params])

  const { data, isLoading } = useSWR(
    courseId ? `/api/courses/${courseId}` : null,
    fetcher,
  )

  const course: Course & { lessons: any[] } = data?.data

  if (isLoading || !course) {
    return (
      <div className="min-h-screen bg-[#f6f7f8]">
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <main className="flex flex-col w-full max-w-[1200px] mx-auto px-4 lg:px-10 py-10 pb-24 md:pb-10">
          {/* Header Section */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-[#137fec] hover:opacity-80 transition-opacity"
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
          </div>

          {/* Course Header */}
          <div className="bg-gradient-to-r from-[#137fec]/20 to-[#137fec]/5 rounded-2xl p-8 mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="inline-block bg-[#137fec] text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                  {course.level}
                </span>
                <h1 className="text-4xl font-bold text-[#0d141b] mb-2">
                  {course.title}
                </h1>
                <p className="text-[#4c739a]">{course.category}</p>
              </div>
            </div>
            <p className="text-lg text-[#4c739a] mb-6">{course.description}</p>
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-[#4c739a] text-sm">Instructor</p>
                <p className="font-bold text-[#0d141b]">{course.instructor}</p>
              </div>
              <div>
                <p className="text-[#4c739a] text-sm">Duration</p>
                <p className="font-bold text-[#0d141b]">{course.duration} minutes</p>
              </div>
              <div>
                <p className="text-[#4c739a] text-sm">Lessons</p>
                <p className="font-bold text-[#0d141b]">{course.lessons.length} lessons</p>
              </div>
              <div>
                <p className="text-[#4c739a] text-sm">Rating</p>
                <p className="font-bold text-[#0d141b]">
                  {course.rating.toFixed(1)} ★ ({course.ratingCount} reviews)
                </p>
              </div>
              <div>
                <p className="text-[#4c739a] text-sm">XP Reward</p>
                <p className="font-bold text-[#137fec]">+{course.xpReward} XP</p>
              </div>
            </div>
          </div>

          {/* Lessons Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#0d141b] mb-6">Course Content</h2>
            <div className="space-y-3">
              {course.lessons?.map((lesson: any, index: number) => (
                <div
                  key={lesson.id}
                  className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-lg p-4 hover:shadow-md transition-shadow flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className="bg-[#137fec]/10 text-[#137fec] w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-[#0d141b] dark:text-white">
                        {lesson.title}
                      </h3>
                      <p className="text-sm text-[#4c739a]">{lesson.duration} minutes</p>
                    </div>
                  </div>
                  <Link
                    href={`/lessons/${(lesson as { conversationId?: string }).conversationId ?? `l${index + 1}`}`}
                    className="bg-[#137fec] text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
                  >
                    Start
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-lg p-6">
              <h3 className="text-[#4c739a] text-sm font-bold mb-2">Enrolled Students</h3>
              <p className="text-2xl font-bold text-[#0d141b]">
                {course.enrollmentCount.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-lg p-6">
              <h3 className="text-[#4c739a] text-sm font-bold mb-2">Average Rating</h3>
              <p className="text-2xl font-bold text-[#0d141b]">
                {course.rating.toFixed(1)}
                <span className="text-lg">★</span>
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-lg p-6">
              <h3 className="text-[#4c739a] text-sm font-bold mb-2">XP Reward</h3>
              <p className="text-2xl font-bold text-[#137fec]">+{course.xpReward}</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-[#137fec] to-[#137fec]/80 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Start?</h2>
            <p className="text-white/90 mb-6">
              Join {course.enrollmentCount.toLocaleString()} other learners improving their
              English skills
            </p>
            <button className="bg-white text-[#137fec] font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity">
              Enroll Now
            </button>
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  )
}
