'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e7edf3] dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-10 py-3 sticky top-0 z-50">
      <div className="flex items-center gap-4 md:gap-8">
        <Link href="/" className="flex items-center gap-4 text-[#137fec]">
          <div className="size-8 flex items-center justify-center bg-[#137fec]/10 rounded-lg">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
          </div>
          <h2 className="hidden md:block text-[#0d141b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            Speaking Practice
          </h2>
        </Link>
        <nav className="hidden md:flex items-center gap-9">
          <Link
            href="/"
            className={`text-sm font-medium leading-normal transition-colors ${
              isActive('/')
                ? 'text-[#137fec]'
                : 'text-[#0d141b] dark:text-slate-300 hover:text-[#137fec]'
            }`}
          >
            Courses
          </Link>
          <Link
            href="/quick-start"
            className={`text-sm font-medium leading-normal transition-colors ${
              pathname?.startsWith('/quick-start')
                ? 'text-[#137fec]'
                : 'text-[#0d141b] dark:text-slate-300 hover:text-[#137fec]'
            }`}
          >
            Quick Start
          </Link>
          <Link
            href="/debates"
            className={`text-sm font-medium leading-normal transition-colors ${
              isActive('/debates')
                ? 'text-[#137fec]'
                : 'text-[#0d141b] dark:text-slate-300 hover:text-[#137fec]'
            }`}
          >
            Debates
          </Link>
          <Link
            href="/dashboard"
            className={`text-sm font-medium leading-normal transition-colors ${
              isActive('/dashboard')
                ? 'text-[#137fec]'
                : 'text-[#0d141b] dark:text-slate-300 hover:text-[#137fec]'
            }`}
          >
            Dashboard
          </Link>
        </nav>
      </div>
      <div className="flex flex-1 justify-end gap-2 md:gap-6 items-center">
        <label className="hidden lg:flex flex-col min-w-40 h-10 max-w-64">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full overflow-hidden">
            <div className="text-[#4c739a] flex border-none bg-[#e7edf3] dark:bg-slate-800 items-center justify-center pl-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              className="flex w-full min-w-0 flex-1 resize-none overflow-hidden text-[#0d141b] dark:text-slate-100 focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] dark:bg-slate-800 placeholder:text-[#4c739a] px-4 pl-2 text-base font-normal leading-normal"
              placeholder="Search courses..."
            />
          </div>
        </label>
        <Link
          href="/debates"
          className="hidden md:block bg-[#137fec] hover:bg-[#137fec]/90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
        >
          Debate Now
        </Link>
        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=User"
          alt="User avatar"
          className="w-10 h-10 rounded-full border-2 border-[#137fec]/20"
        />
      </div>
    </header>
  )
}
