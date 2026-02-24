'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function MobileNav() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path
  const isQuickStart = pathname?.startsWith('/quick-start')

  const tabs = [
    { id: 'home', label: 'Courses', href: '/', icon: 'home' },
    { id: 'quickstart', label: 'Quick Start', href: '/quick-start', icon: 'bolt' },
    { id: 'debate', label: 'Debates', href: '/debates', icon: 'chat' },
    { id: 'progress', label: 'Progress', href: '/dashboard', icon: 'chart' },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around py-3 z-40">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={`flex flex-col items-center gap-1 transition-colors ${
            (tab.id === 'quickstart' ? isQuickStart : isActive(tab.href)) ? 'text-[#137fec]' : 'text-slate-400 hover:text-[#137fec]'
          }`}
        >
          {tab.icon === 'bolt' && (
            <svg className="w-6 h-6" fill={isQuickStart ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
          {tab.icon === 'home' && (
            <svg className="w-6 h-6" fill={isActive(tab.href) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m0 0l4 4m-4-4v6" />
            </svg>
          )}
          {tab.icon === 'chat' && (
            <svg className="w-6 h-6" fill={isActive(tab.href) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}
          {tab.icon === 'chart' && (
            <svg className="w-6 h-6" fill={isActive(tab.href) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )}
          <span className="text-[10px] font-bold">{tab.label}</span>
        </Link>
      ))}
    </div>
  )
}
