'use client'

import { useState } from 'react'
import Header from '@/components/header'
import LevelTabs from '@/components/level-tabs'
import CourseGrid from '@/components/course-grid'
import MobileNav from '@/components/mobile-nav'

export default function QuickStartPage() {
  const [activeLevel, setActiveLevel] = useState('A1')

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <main className="flex flex-col items-center w-full max-w-[1200px] mx-auto px-4 lg:px-10 py-10 pb-24 md:pb-10">
          {/* Quick Start Hero */}
          <section className="w-full text-center mb-10">
            <h1 className="text-[#0d141b] dark:text-white tracking-tight text-4xl font-bold leading-tight pb-3">
              Quick Start
            </h1>
            <p className="text-[#4c739a] dark:text-slate-400 text-lg font-normal leading-normal max-w-2xl mx-auto">
              Jump into conversation practice. Same courses and lessons—get started quickly.
            </p>
          </section>

          <LevelTabs activeLevel={activeLevel} setActiveLevel={setActiveLevel} />
          <CourseGrid level={activeLevel} basePath="/quick-start" />
        </main>
        <MobileNav />
      </div>
    </div>
  )
}
