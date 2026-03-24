'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/header'
import MobileNav from '@/components/mobile-nav'
import AccentComparison from '@/components/accent-comparison'
import { accents } from '@/lib/accent-data'

export default function AccentsPage() {
    const [showComparison, setShowComparison] = useState(false)

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
                <Header />
                <main className="flex flex-col w-full max-w-[1200px] mx-auto px-4 lg:px-10 py-10 pb-24 md:pb-10">
                    {/* Hero */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-8 md:p-12 mb-10 text-white">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-30" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-4xl">🎙️</span>
                                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">New Module</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight">English Accent Master</h1>
                            <p className="text-white/80 text-lg max-w-2xl mb-6">
                                Master 5 major English accents with progressive modules — from sound foundations to native-speed shadowing.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => setShowComparison(!showComparison)}
                                    className="bg-white text-purple-700 font-bold px-6 py-3 rounded-xl hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    🔀 {showComparison ? 'Hide' : 'Open'} Accent Comparison
                                </button>
                                <a
                                    href="#accents"
                                    className="bg-white/20 backdrop-blur-sm text-white font-bold px-6 py-3 rounded-xl hover:bg-white/30 transition-all border border-white/30"
                                >
                                    📚 Explore Accents
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Accent Comparison Mode */}
                    {showComparison && (
                        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
                            <AccentComparison />
                        </div>
                    )}

                    {/* 5 Accent Cards */}
                    <div id="accents" className="mb-10">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl md:text-3xl font-bold text-[#0d141b] dark:text-white">Choose Your Accent</h2>
                            <span className="text-sm text-[#4c739a] dark:text-slate-400">{accents.length} accents available</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {accents.map((accent, index) => (
                                <Link
                                    key={accent.id}
                                    href={`/accents/${accent.id}`}
                                    className="group relative bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                                    style={{ animationDelay: `${index * 80}ms` }}
                                >
                                    {/* Color accent bar */}
                                    <div className="absolute top-0 left-0 right-0 h-1 transition-all group-hover:h-1.5" style={{ backgroundColor: accent.color }} />

                                    <div className="flex items-start gap-4 mb-4">
                                        <span className="text-5xl filter drop-shadow-sm">{accent.flag}</span>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-[#0d141b] dark:text-white group-hover:text-[#137fec] transition-colors truncate">
                                                {accent.name}
                                            </h3>
                                            <p className="text-sm text-[#4c739a] dark:text-slate-400">{accent.region}</p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-[#4c739a] dark:text-slate-400 mb-5 line-clamp-2">
                                        {accent.description}
                                    </p>

                                    {/* Module progress mini-bar */}
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between text-xs mb-1.5">
                                            <span className="font-bold text-[#0d141b] dark:text-white">{accent.modules.length} Modules</span>
                                            <span className="text-[#4c739a]">{accent.modules.reduce((a, m) => a + m.totalItems, 0)} exercises</span>
                                        </div>
                                        <div className="flex gap-1">
                                            {accent.modules.map((mod) => (
                                                <div
                                                    key={mod.id}
                                                    className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:bg-opacity-80 transition-colors"
                                                    title={mod.title}
                                                >
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{ backgroundColor: accent.color, width: '0%' }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-1.5">
                                            {accent.modules.map((mod) => (
                                                <span key={mod.id} className="text-sm" title={mod.title}>{mod.icon}</span>
                                            ))}
                                        </div>
                                        <span className="text-[#137fec] text-sm font-bold group-hover:translate-x-1 transition-transform">
                                            Start →
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Quick Tips Preview */}
                    <div className="mb-10">
                        <h2 className="text-2xl md:text-3xl font-bold text-[#0d141b] dark:text-white mb-6">💡 Quick Accent Tips</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {accents.slice(0, 4).map((accent) => (
                                <div key={accent.id} className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl p-5">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-2xl">{accent.flag}</span>
                                        <h3 className="font-bold text-[#0d141b] dark:text-white">{accent.name}</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {accent.tips.slice(0, 2).map((tip) => (
                                            <div key={tip.id} className="flex items-start gap-2 text-sm">
                                                <span className="text-base mt-0.5">{tip.icon}</span>
                                                <div>
                                                    <span className="font-bold text-[#0d141b] dark:text-white">{tip.title}: </span>
                                                    <span className="text-[#4c739a] dark:text-slate-400">{tip.description}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Common Mistakes Highlight */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-6 md:p-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-[#0d141b] dark:text-white mb-2">⚠️ Common Mistakes by Country</h2>
                        <p className="text-[#4c739a] dark:text-slate-400 mb-6">Learn from the most frequent pronunciation errors made by speakers from different countries.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {accents[0].commonMistakes.slice(0, 3).map((mistake) => (
                                <div key={mistake.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-amber-200 dark:border-slate-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xl">{mistake.flag}</span>
                                        <span className="font-bold text-sm text-[#0d141b] dark:text-white">{mistake.country}</span>
                                    </div>
                                    <p className="text-sm text-red-500 dark:text-red-400 font-medium mb-1">❌ {mistake.mistake}</p>
                                    <p className="text-sm text-green-600 dark:text-green-400">✅ {mistake.correction}</p>
                                </div>
                            ))}
                        </div>
                        <Link
                            href={`/accents/${accents[0].id}`}
                            className="inline-block mt-5 text-[#137fec] font-bold text-sm hover:underline"
                        >
                            View all common mistakes →
                        </Link>
                    </div>
                </main>
                <MobileNav />
            </div>
        </div>
    )
}
