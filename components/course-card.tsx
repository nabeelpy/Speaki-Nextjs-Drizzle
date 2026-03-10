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
    <Link
      href={courseHref}
      className="block bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
    >
      {/* Desktop Layout */}
      <div className="hidden md:flex flex-col">
        <div className="h-48 bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
          <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {course.level}
          </div>
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${colorScheme.bg} flex items-center justify-center`}>
              <span className="text-6xl group-hover:scale-110 transition-transform">
                {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
              </span>
            </div>
          )}
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
              onClick={(e) => { e.preventDefault(); onLikeToggle() }}
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
            <span
              className="bg-[#137fec] text-white font-bold py-2 px-4 rounded-lg flex-1 text-sm transition-opacity hover:opacity-90 text-center"
            >
              Learn More
            </span>
            <span className="bg-slate-100 dark:bg-slate-800 text-[#0d141b] dark:text-slate-100 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-2-13h4v6h-4z" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex md:hidden p-3 gap-3">
        {/* Thumbnail */}
        <div className="w-20 h-20 rounded-lg bg-slate-200 dark:bg-slate-800 flex-shrink-0 overflow-hidden">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${colorScheme.bg} flex items-center justify-center text-2xl`}>
              {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
            </div>
          )}
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold px-2 py-0.5 rounded">
              {course.level}
            </span>
            <span className="text-xs text-amber-500 font-bold">★ {course.rating.toFixed(1)}</span>
          </div>
          <h3 className="text-base font-bold text-[#0d141b] dark:text-white leading-tight mb-1 truncate">
            {course.title}
          </h3>
          <p className="text-xs text-[#4c739a] dark:text-slate-400 line-clamp-1 mb-2">
            {course.description}
          </p>
          <div className="flex items-center gap-3 text-xs text-[#4c739a] dark:text-slate-400">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {course.lessons} Lessons
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {course.duration}m
            </span>
          </div>
        </div>
      </div>
      {/* Mobile Progress Bar */}
      <div className="hidden md:hidden px-3 pb-3">
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }} />
        </div>
      </div>
    </Link>
  )
}
