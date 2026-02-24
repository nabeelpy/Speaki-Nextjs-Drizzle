'use client'

import Link from 'next/link'

export default function Hero() {
  return (
    <section className="w-full text-center mb-10">
      <h1 className="text-[#0d141b] dark:text-white tracking-tight text-4xl font-bold leading-tight pb-3">
        Master English with AI-Powered Practice
      </h1>
      <p className="text-[#4c739a] dark:text-slate-400 text-lg font-normal leading-normal max-w-2xl mx-auto mb-8">
        Select your CEFR level and engage in realistic, real-time debates and conversations designed to boost your fluency.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/debates"
          className="bg-[#137fec] text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity"
        >
          Start a Debate
        </Link>
        <Link
          href="/dashboard"
          className="bg-slate-100 dark:bg-slate-800 text-[#0d141b] dark:text-white font-bold py-3 px-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          View Progress
        </Link>
      </div>
    </section>
  )
}
