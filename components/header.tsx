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
          <svg className="w-40 sm:w-45 md:w-50 h-auto" viewBox="0 0 240 60" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="fullGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4F46E5"/>
                <stop offset="100%" stopColor="#7C3AED"/>
              </linearGradient>

              <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4F46E5"/>
                <stop offset="100%" stopColor="#7C3AED"/>
              </linearGradient>
            </defs>

            <g transform="translate(6, 10)">
              <rect x="0" y="0" width="40" height="40" rx="10" fill="url(#iconGrad)"/>

              <g transform="translate(11, 20)">
                <rect x="0" y="-3" width="2.5" height="6" rx="1.25" fill="white" opacity="0.9"/>
                <rect x="4" y="-6" width="2.5" height="12" rx="1.25" fill="white"/>
                <rect x="8" y="-8" width="2.5" height="16" rx="1.25" fill="white"/>
                <rect x="12" y="-6" width="2.5" height="12" rx="1.25" fill="white"/>
                <rect x="16" y="-4" width="2.5" height="8" rx="1.25" fill="white" opacity="0.9"/>
              </g>
            </g>

            <text x="58" y="38" fontFamily="'Poppins', sans-serif"
                  fontSize="26" fontWeight="700" fill="url(#fullGrad)"
                  letterSpacing="-0.5">
              FreeSpeaki
            </text>
          </svg>
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
            href="/languages"
            className={`text-sm font-medium leading-normal transition-colors ${
              pathname?.startsWith('/languages')
                ? 'text-[#137fec]'
                : 'text-[#0d141b] dark:text-slate-300 hover:text-[#137fec]'
            }`}
          >
            Languages
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
        {/* <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=User"
          alt="User avatar"
          className="w-10 h-10 rounded-full border-2 border-[#137fec]/20"
        /> */}
      </div>
    </header>
  )
}
