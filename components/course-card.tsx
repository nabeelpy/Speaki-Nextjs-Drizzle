'use client'

import Link from 'next/link'
import type { Course } from '@/lib/types'

interface CourseCardProps {
  course: Course
  colorScheme: { bg: string; tag: string }
  isLiked: boolean
  onLikeToggle: () => void
  /** Base path for course link (e.g. "" for /courses, "/quick-start" for /quick-start/courses) */
  basePath?: string
}

export default function CourseCard({
  course,
  colorScheme,
  isLiked,
  onLikeToggle,
  basePath = '',
}: CourseCardProps) {
  const courseHref = `${basePath}/courses/${course.id}`.replace(/^\/+/, '/') || '/courses/' + course.id
  return (
    <div className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group">
      <div className={`h-48 bg-slate-200 dark:bg-slate-800 relative overflow-hidden bg-gradient-to-br ${colorScheme.bg}`}>
        <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          {course.level}
        </div>
        <div className="flex items-center justify-center h-full">
          <span className="text-6xl group-hover:scale-110 transition-transform">
            {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
          </span>
        </div>
      </div>
      <div className="p-6 flex flex-col grow">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-[#0d141b] dark:text-white leading-tight">
              {course.title}
            </h3>
            <p className="text-xs text-[#137fec] mt-1">{course.category}</p>
          </div>
          <button
            onClick={onLikeToggle}
            className={`transition-colors flex-shrink-0 ml-2 ${
              isLiked ? 'text-red-500' : 'text-[#4c739a] hover:text-red-500'
            }`}
          >
            <svg className="w-6 h-6" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>
        <p className="text-[#4c739a] dark:text-slate-400 text-sm mb-4 grow line-clamp-2">
          {course.description}
        </p>
        <div className="flex items-center justify-between text-xs text-[#4c739a] dark:text-slate-400 mb-4">
          <span>{course.lessons} lessons</span>
          <span>{course.duration} min</span>
          <span>{course.rating.toFixed(1)} ★</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={courseHref}
            className="bg-[#137fec] text-white font-bold py-2 px-4 rounded-lg flex-1 text-sm transition-opacity hover:opacity-90 text-center"
          >
            Learn More
          </Link>
          <button className="bg-slate-100 dark:bg-slate-800 text-[#0d141b] dark:text-slate-100 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-2-13h4v6h-4z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
