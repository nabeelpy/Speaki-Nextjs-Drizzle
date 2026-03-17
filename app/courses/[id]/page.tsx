'use client'

import {useEffect, useState} from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import Header from '@/components/header'
import MobileNav from '@/components/mobile-nav'
import type {Course} from '@/lib/types'

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

    const {data, isLoading} = useSWR(
        courseId ? `/api/courses/${courseId}` : null,
        fetcher,
    )

    const course: Course & { lessons: any[] } = data?.data

    if (isLoading || !course) {
        return (
            <div className="min-h-screen bg-[#f6f7f8]">
                <Header/>
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="text-gray-500">Loading...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
                <Header/>
                <main className="flex flex-col w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 py-6 md:py-12 pb-24 md:pb-12">                    {/* Back Link */}
                    {/*<div className="flex items-center gap-4 mb-8">*/}
                    {/*    <Link*/}
                    {/*        href="/"*/}
                    {/*        className="flex items-center gap-2 text-[#137fec] hover:opacity-80 transition-opacity"*/}
                    {/*    >*/}
                    {/*        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">*/}
                    {/*            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>*/}
                    {/*        </svg>*/}
                    {/*        Back to Courses*/}
                    {/*    </Link>*/}
                    {/*</div>*/}

                    {/* Course Header */}
                    <div className="bg-gradient-to-r from-[#137fec]/20 to-[#137fec]/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">

                            {/* Thumbnail */}
                            <div className="
      w-full sm:w-40 md:w-48
      aspect-[16/9] sm:aspect-square
      rounded-lg sm:rounded-xl overflow-hidden
      bg-slate-100
      flex-shrink-0
    ">
                                <img
                                    src={course.thumbnail}
                                    alt={course.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-1 flex flex-col justify-center gap-2 sm:gap-3">

                                {/* Level badge */}
                                <span className="
        inline-block self-start
        bg-[#137fec] text-white
        px-3 py-1 sm:px-4
        text-xs sm:text-sm
        rounded-full font-semibold
      ">
        {course.level}
      </span>

                                {/* Title */}
                                <h1 className="
        text-lg sm:text-2xl md:text-3xl lg:text-4xl
        font-bold sm:font-extrabold
        text-[#0d141b]
        leading-snug
      ">
                                    {course.title}
                                </h1>

                                {/* Category */}
                                <p className="text-sm sm:text-base text-[#137fec] font-semibold">
                                    {course.category}
                                </p>

                                {/* Description */}
                                <p className="
        text-xs sm:text-sm md:text-base
        text-[#4c739a]
        leading-snug sm:leading-relaxed
        line-clamp-3 sm:line-clamp-none
      ">
                                    {course.description}
                                </p>

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
                    <span
                        className="bg-[#137fec]/10 text-[#137fec] w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </span>
                                        <div>
                                            <h3 className="
  font-medium sm:font-semibold
  text-[13px] sm:text-sm md:text-base lg:text-lg
  leading-tight
  break-words
  line-clamp-2
">
                                                {lesson.title}
                                            </h3>
                                            <p className="text-sm text-[#4c739a]">{lesson.duration} minutes</p>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/lessons/${(lesson as { conversationId?: string }).conversationId ?? `l${index + 1}`}`}
                                        className="bg-[#137fec] text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity ml-4 flex-shrink-0"
                                    >
                                        Start
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats Section — shown once, not per-lesson */}
                    {course.lessons?.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div
                                className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-lg p-6">
                                <h3 className="text-[#4c739a] text-sm font-bold mb-2">Duration</h3>
                                <p className="text-2xl font-bold text-[#0d141b]">
                                    {course.lessons.reduce((acc: number, l: any) => acc + (l.duration ?? 0), 0)} minutes
                                </p>
                            </div>
                            <div
                                className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-lg p-6">
                                <h3 className="text-[#4c739a] text-sm font-bold mb-2">Lessons</h3>
                                <p className="text-2xl font-bold text-[#0d141b]">
                                    {course.lessons.length} lessons
                                </p>
                            </div>
                            <div
                                className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-lg p-6">
                                <h3 className="text-[#4c739a] text-sm font-bold mb-2">Rating</h3>
                                <p className="text-2xl font-bold text-[#137fec]">{course.rating.toFixed(1)} ★</p>
                            </div>
                        </div>
                    )}
                </main>
                <MobileNav/>
            </div>
        </div>
    )
}