'use client'

import Link from 'next/link'
import type { Course } from '@/lib/types'

interface CourseCardProps {
  course: Course
  colorScheme: { bg: string; tag: string }
  isLiked: boolean
  onLikeToggle: () => void
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
          className="
        group block
        /* ── Mobile: unchanged ── */
        bg-white dark:bg-slate-900
        border border-[#e7edf3] dark:border-slate-800
        rounded-xl overflow-hidden shadow-sm
        /* ── Desktop overrides ── */
        md:rounded-2xl
        md:border md:border-slate-200/80 dark:md:border-slate-700/60
        md:shadow-[0_2px_8px_rgba(0,0,0,0.06)]
        md:hover:shadow-[0_12px_40px_rgba(0,0,0,0.13)]
        md:hover:-translate-y-1
        md:transition-all md:duration-300 md:ease-out
      "
      >
        {/* ─────────────────── DESKTOP LAYOUT ─────────────────── */}
        <div className="hidden md:flex md:flex-col h-full">

          {/* Thumbnail */}
          <div className="relative h-52 overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">

            {/* Level badge */}
            <div className="absolute top-3.5 left-3.5 z-10">
            <span className="
              inline-flex items-center px-2.5 py-1 rounded-md
              text-[10px] font-bold uppercase tracking-widest
              bg-white/95 dark:bg-slate-900/90
              text-slate-700 dark:text-slate-200
              shadow-sm backdrop-blur-sm
              border border-slate-200/60 dark:border-slate-700/60
            ">
              {course.level}
            </span>
            </div>

            {/*/!* Like button *!/*/}
            {/*<button*/}
            {/*    onClick={(e) => { e.preventDefault(); onLikeToggle() }}*/}
            {/*    className={`*/}
            {/*  absolute top-3.5 right-3.5 z-10*/}
            {/*  w-8 h-8 rounded-full flex items-center justify-center*/}
            {/*  bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm*/}
            {/*  border border-slate-200/60 dark:border-slate-700/60*/}
            {/*  shadow-sm transition-all duration-200*/}
            {/*  hover:scale-110*/}
            {/*  ${isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}*/}
            {/*`}*/}
            {/*>*/}
            {/*  <svg className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">*/}
            {/*    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}*/}
            {/*          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />*/}
            {/*  </svg>*/}
            {/*</button>*/}

            {/* Image / gradient fallback */}
            {course.thumbnail ? (
                <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
            ) : (
                <div className={`w-full h-full bg-gradient-to-br ${colorScheme.bg} flex items-center justify-center`}>
              <span className="text-6xl transition-transform duration-500 group-hover:scale-110 select-none">
                {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
              </span>
                </div>
            )}

            {/* Bottom fade for depth */}
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
          </div>

          {/* Body */}
          <div className="flex flex-col flex-1 p-6 gap-3">

            {/* Category */}
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#137fec] dark:text-blue-400">
              {course.category}
            </p>

            {/* Title */}
            <h3 className="
            text-[17px] font-bold leading-snug
            text-slate-900 dark:text-white
            group-hover:text-[#137fec] dark:group-hover:text-blue-400
            transition-colors duration-200
            line-clamp-2
          ">
              {course.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 flex-1">
              {course.description}
            </p>

            {/* Divider */}
            <div className="border-t border-slate-100 dark:border-slate-800 mt-1" />

            {/* Metadata row */}
            <div className="flex items-center justify-between text-[12px] text-slate-500 dark:text-slate-400 pt-0.5">

              {/* Lessons */}
              <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="font-medium text-slate-700 dark:text-slate-300">{course.lessons}</span> lessons
            </span>

              {/* Duration */}
              <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-slate-700 dark:text-slate-300">{course.duration}</span> min
            </span>

              {/* Rating */}
              <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{course.rating.toFixed(1)}</span>
            </span>

            </div>
          </div>
        </div>

        {/* ─────────────────── MOBILE LAYOUT (unchanged) ─────────────────── */}
        <div className="flex md:hidden p-3 gap-3">
          <div className="w-20 h-20 rounded-lg bg-slate-200 dark:bg-slate-800 flex-shrink-0 overflow-hidden">
            {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            ) : (
                <div className={`w-full h-full bg-gradient-to-br ${colorScheme.bg} flex items-center justify-center text-2xl`}>
                  {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
                </div>
            )}
          </div>
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
      </Link>
  )
}