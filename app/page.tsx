'use client'
import Header from '@/components/header'
import Hero from '@/components/hero'
import CoursesBrowse from '@/components/courses-browse'
import ProgressSection from '@/components/progress-section'
import MobileNav from '@/components/mobile-nav'

export default function Page() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <main className="flex flex-col items-center w-full max-w-[1200px] mx-auto px-4 lg:px-10 py-10 pb-24 md:pb-10">
          <Hero />
          <CoursesBrowse />
          <ProgressSection />
        </main>
        <MobileNav />
      </div>
    </div>
  )
}
