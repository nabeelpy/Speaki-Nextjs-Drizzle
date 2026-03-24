'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/header'
import MobileNav from '@/components/mobile-nav'
import { getAccent } from '@/lib/accent-data'

export default function AccentDetailPage() {
    const params = useParams()
    const accentId = params.accentId as string
    const accent = getAccent(accentId)
    const [expandedTip, setExpandedTip] = useState<string | null>(null)
    const [showAllMistakes, setShowAllMistakes] = useState(false)

    if (!accent) {
        return (
            <div className="min-h-screen bg-[#f6f7f8]">
                <Header />
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <span className="text-6xl">🔍</span>
                    <p className="text-xl text-gray-500">Accent not found</p>
                    <Link href="/accents" className="text-[#137fec] font-bold hover:underline">← Back to Accents</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
                <Header />
                <main className="flex flex-col w-full max-w-[1200px] mx-auto px-4 lg:px-10 py-10 pb-24 md:pb-10">
                    {/* Back nav */}
                    <Link
                        href="/accents"
                        className="flex items-center gap-2 text-[#137fec] hover:opacity-80 transition-opacity mb-6"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Accents
                    </Link>

                    {/* Accent Banner */}
                    <div
                        className="relative overflow-hidden rounded-2xl p-8 md:p-12 mb-10 text-white"
                        style={{ background: `linear-gradient(135deg, ${accent.color}, ${accent.color}dd, ${accent.color}aa)` }}
                    >
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="absolute -right-10 -top-10 text-[200px] opacity-10 select-none">{accent.flag}</div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-6xl filter drop-shadow-lg">{accent.flag}</span>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{accent.name}</h1>
                                    <p className="text-white/70">{accent.region}</p>
                                </div>
                            </div>
                            <p className="text-white/80 text-lg max-w-2xl mb-6">{accent.description}</p>
                            <div className="flex flex-wrap gap-3 text-sm">
                                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg font-bold">
                                    {accent.modules.length} Modules
                                </span>
                                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg font-bold">
                                    {accent.modules.reduce((a, m) => a + m.totalItems, 0)} Exercises
                                </span>
                                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg font-bold">
                                    {accent.tips.length} Pro Tips
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Progressive Modules List */}
                    <div className="mb-10">
                        <h2 className="text-2xl font-bold text-[#0d141b] dark:text-white mb-6">📚 Learning Modules</h2>
                        <div className="space-y-4">
                            {accent.modules.map((mod, index) => {
                                const isFirst = index === 0
                                return (
                                    <Link
                                        key={mod.id}
                                        href={`/accents/${accent.id}/module/${mod.id}`}
                                        className={`group relative flex items-start gap-5 bg-white dark:bg-slate-900 border rounded-xl p-5 md:p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${isFirst
                                                ? 'border-[#137fec] ring-2 ring-[#137fec]/20'
                                                : 'border-[#e7edf3] dark:border-slate-800'
                                            }`}
                                    >
                                        {/* Module number indicator */}
                                        <div className="flex flex-col items-center gap-1">
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm"
                                                style={{ backgroundColor: accent.colorLight }}
                                            >
                                                {mod.icon}
                                            </div>
                                            {index < accent.modules.length - 1 && (
                                                <div className="w-0.5 h-8 bg-slate-200 dark:bg-slate-700 mt-1" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-xs font-bold text-[#4c739a] dark:text-slate-400 uppercase tracking-wider">
                                                    Module {mod.number}
                                                </span>
                                                {isFirst && (
                                                    <span className="bg-[#137fec] text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                                                        Start Here
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-bold text-[#0d141b] dark:text-white group-hover:text-[#137fec] transition-colors mb-1">
                                                {mod.title}
                                            </h3>
                                            <p className="text-sm text-[#4c739a] dark:text-slate-400 mb-3">{mod.description}</p>

                                            <div className="flex flex-wrap items-center gap-4 text-xs text-[#4c739a]">
                                                <span className="flex items-center gap-1">
                                                    📝 {mod.lessons.length} lessons
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    🎯 {mod.totalItems} items
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center self-center">
                                            <span className="text-[#137fec] font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                Open →
                                            </span>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>

                    {/* Two-column: Tips + Common Mistakes */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                        {/* Accent Tips */}
                        <div>
                            <h2 className="text-2xl font-bold text-[#0d141b] dark:text-white mb-5">✨ Accent Tips</h2>
                            <div className="space-y-3">
                                {accent.tips.map((tip) => (
                                    <button
                                        key={tip.id}
                                        onClick={() => setExpandedTip(expandedTip === tip.id ? null : tip.id)}
                                        className="w-full text-left bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl p-4 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{tip.icon}</span>
                                            <h4 className="font-bold text-[#0d141b] dark:text-white flex-1">{tip.title}</h4>
                                            <svg
                                                className={`w-5 h-5 text-[#4c739a] transition-transform duration-200 ${expandedTip === tip.id ? 'rotate-180' : ''}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                        {expandedTip === tip.id && (
                                            <p className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-sm text-[#4c739a] dark:text-slate-400">
                                                {tip.description}
                                            </p>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Common Mistakes by Country */}
                        <div>
                            <h2 className="text-2xl font-bold text-[#0d141b] dark:text-white mb-5">⚠️ Common Mistakes</h2>
                            <div className="space-y-3">
                                {(showAllMistakes ? accent.commonMistakes : accent.commonMistakes.slice(0, 3)).map((mistake) => (
                                    <div
                                        key={mistake.id}
                                        className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl p-4"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xl">{mistake.flag}</span>
                                            <span className="font-bold text-sm text-[#0d141b] dark:text-white">{mistake.country}</span>
                                        </div>
                                        <p className="text-sm text-red-500 dark:text-red-400 font-medium mb-1">
                                            ❌ {mistake.mistake}
                                        </p>
                                        <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                                            ✅ {mistake.correction}
                                        </p>
                                        <p className="text-xs text-[#4c739a] dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 font-mono">
                                            {mistake.example}
                                        </p>
                                    </div>
                                ))}
                                {accent.commonMistakes.length > 3 && (
                                    <button
                                        onClick={() => setShowAllMistakes(!showAllMistakes)}
                                        className="text-[#137fec] font-bold text-sm hover:underline"
                                    >
                                        {showAllMistakes ? 'Show less' : `Show all ${accent.commonMistakes.length} mistakes`}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Accent Comparison CTA */}
                    <Link
                        href="/accents"
                        className="block bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl p-6 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-4xl">🔀</span>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-[#0d141b] dark:text-white group-hover:text-[#137fec] transition-colors">
                                    Accent Comparison Mode
                                </h3>
                                <p className="text-sm text-[#4c739a] dark:text-slate-400">
                                    Compare {accent.name} side-by-side with other accents — see pronunciation differences instantly.
                                </p>
                            </div>
                            <span className="text-[#137fec] font-bold group-hover:translate-x-1 transition-transform">Open →</span>
                        </div>
                    </Link>
                </main>
                <MobileNav />
            </div>
        </div>
    )
}
