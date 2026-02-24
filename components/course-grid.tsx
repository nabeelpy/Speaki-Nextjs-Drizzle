'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import CourseCard from './course-card'
import type { Course } from '@/lib/types'

interface CourseGridProps {
  level: string
  /** Base path for course links (e.g. "" for /courses, "/quick-start" for /quick-start/courses) */
  basePath?: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function CourseGrid({ level, basePath = '' }: CourseGridProps) {
  const [likedCourses, setLikedCourses] = useState<string[]>([])
  const { data, isLoading } = useSWR(`/api/courses?level=${level}`, fetcher)

  const courses: Course[] = data?.data || []

  const toggleLike = (id: string) => {
    setLikedCourses((prev) =>
      prev.includes(id) ? prev.filter((courseId) => courseId !== id) : [...prev, id],
    )
  }

  const colors = [
    { bg: 'from-[#137fec]/20 to-[#137fec]/5', tag: 'text-[#137fec]' },
    { bg: 'from-green-500/20 to-green-500/5', tag: 'text-green-600' },
    { bg: 'from-orange-500/20 to-orange-500/5', tag: 'text-orange-600' },
    { bg: 'from-pink-500/20 to-pink-500/5', tag: 'text-pink-600' },
    { bg: 'from-red-500/20 to-red-500/5', tag: 'text-red-600' },
    { bg: 'from-purple-500/20 to-purple-500/5', tag: 'text-purple-600' },
    { bg: 'from-blue-500/20 to-blue-500/5', tag: 'text-blue-600' },
    { bg: 'from-indigo-500/20 to-indigo-500/5', tag: 'text-indigo-600' },
    { bg: 'from-cyan-500/20 to-cyan-500/5', tag: 'text-cyan-600' },
    { bg: 'from-violet-500/20 to-violet-500/5', tag: 'text-violet-600' },
    { bg: 'from-emerald-500/20 to-emerald-500/5', tag: 'text-emerald-600' },
    { bg: 'from-teal-500/20 to-teal-500/5', tag: 'text-teal-600' },
  ]

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {isLoading ? (
        <div className="col-span-full flex justify-center py-12">
          <div className="text-gray-500">Loading courses...</div>
        </div>
      ) : (
        courses.map((course, index) => (
          <CourseCard
            key={course.id}
            course={course}
            colorScheme={colors[index % colors.length]}
            isLiked={likedCourses.includes(course.id)}
            onLikeToggle={() => toggleLike(course.id)}
            basePath={basePath}
          />
        ))
      )}
    </div>
  )
}
