'use client'

import { useState } from 'react'
import { accents, getComparisons } from '@/lib/accent-data'
import type { AccentComparison as ComparisonType } from '@/lib/accent-types'

type Category = ComparisonType['category']

const categories: { value: Category; label: string; icon: string }[] = [
    { value: 'vowels', label: 'Vowels', icon: '🔤' },
    { value: 'consonants', label: 'Consonants', icon: '🗣️' },
    { value: 'common-words', label: 'Common Words', icon: '📖' },
    { value: 'phrases', label: 'Phrases', icon: '💬' },
]

export default function AccentComparison() {
    const [leftAccent, setLeftAccent] = useState('us')
    const [rightAccent, setRightAccent] = useState('uk')
    const [activeCategory, setActiveCategory] = useState<Category>('common-words')

    const comparisons = getComparisons(activeCategory)
    const leftAccentData = accents.find((a) => a.id === leftAccent)!
    const rightAccentData = accents.find((a) => a.id === rightAccent)!

    return (
        <div className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white">
                <div className="flex items-center gap-3 mb-1">
                    <span className="text-2xl">🔀</span>
                    <h2 className="text-xl font-bold">Accent Comparison Mode</h2>
                </div>
                <p className="text-white/70 text-sm">Compare pronunciation differences side-by-side</p>
            </div>

            {/* Accent Selectors */}
            <div className="px-6 py-5 border-b border-[#e7edf3] dark:border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Left accent */}
                    <div>
                        <label className="text-xs font-bold text-[#4c739a] dark:text-slate-400 uppercase tracking-wider mb-2 block">
                            Accent A
                        </label>
                        <div className="grid grid-cols-5 gap-1.5">
                            {accents.map((a) => (
                                <button
                                    key={a.id}
                                    onClick={() => setLeftAccent(a.id)}
                                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${leftAccent === a.id
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-500 scale-105'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="text-2xl">{a.flag}</span>
                                    <span className="text-[10px] font-bold text-[#0d141b] dark:text-white truncate w-full text-center">
                                        {a.id.toUpperCase()}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right accent */}
                    <div>
                        <label className="text-xs font-bold text-[#4c739a] dark:text-slate-400 uppercase tracking-wider mb-2 block">
                            Accent B
                        </label>
                        <div className="grid grid-cols-5 gap-1.5">
                            {accents.map((a) => (
                                <button
                                    key={a.id}
                                    onClick={() => setRightAccent(a.id)}
                                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${rightAccent === a.id
                                            ? 'bg-purple-50 dark:bg-purple-900/30 ring-2 ring-purple-500 scale-105'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="text-2xl">{a.flag}</span>
                                    <span className="text-[10px] font-bold text-[#0d141b] dark:text-white truncate w-full text-center">
                                        {a.id.toUpperCase()}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="px-6 py-3 border-b border-[#e7edf3] dark:border-slate-800 flex gap-2 overflow-x-auto">
                {categories.map((cat) => (
                    <button
                        key={cat.value}
                        onClick={() => setActiveCategory(cat.value)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${activeCategory === cat.value
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                                : 'text-[#4c739a] hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                    >
                        <span>{cat.icon}</span>
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Comparison Table Header */}
            <div className="grid grid-cols-[1fr_1fr_1fr] px-6 py-3 border-b border-[#e7edf3] dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold uppercase tracking-wider text-[#4c739a]">
                <div>Word / Phrase</div>
                <div className="text-center">
                    {leftAccentData.flag} {leftAccentData.name}
                </div>
                <div className="text-center">
                    {rightAccentData.flag} {rightAccentData.name}
                </div>
            </div>

            {/* Comparison Rows */}
            <div className="divide-y divide-[#e7edf3] dark:divide-slate-800">
                {comparisons.map((comp) => {
                    const leftPron = comp.pronunciations[leftAccent] || '—'
                    const rightPron = comp.pronunciations[rightAccent] || '—'
                    const isDifferent = leftPron !== rightPron

                    return (
                        <div
                            key={comp.word}
                            className={`grid grid-cols-[1fr_1fr_1fr] px-6 py-4 items-center transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${isDifferent ? '' : ''
                                }`}
                        >
                            <div>
                                <span className="font-bold text-[#0d141b] dark:text-white">{comp.word}</span>
                                {comp.notes && (
                                    <p className="text-xs text-[#4c739a] dark:text-slate-400 mt-0.5 line-clamp-1">{comp.notes}</p>
                                )}
                            </div>
                            <div className="text-center">
                                <span
                                    className={`inline-block font-mono text-sm px-3 py-1.5 rounded-lg ${isDifferent
                                            ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400'
                                            : 'bg-slate-50 dark:bg-slate-800 text-[#4c739a]'
                                        }`}
                                >
                                    {leftPron}
                                </span>
                            </div>
                            <div className="text-center">
                                <span
                                    className={`inline-block font-mono text-sm px-3 py-1.5 rounded-lg ${isDifferent
                                            ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                                            : 'bg-slate-50 dark:bg-slate-800 text-[#4c739a]'
                                        }`}
                                >
                                    {rightPron}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Visual Difference Indicator */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-[#e7edf3] dark:border-slate-800">
                <div className="flex items-center justify-between flex-wrap gap-2 text-sm">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-300 dark:border-indigo-700" />
                            <span className="text-[#4c739a] dark:text-slate-400">{leftAccentData.name}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded bg-purple-100 dark:bg-purple-900/40 border border-purple-300 dark:border-purple-700" />
                            <span className="text-[#4c739a] dark:text-slate-400">{rightAccentData.name}</span>
                        </span>
                    </div>
                    <span className="text-[#4c739a] dark:text-slate-400">
                        {comparisons.filter((c) => c.pronunciations[leftAccent] !== c.pronunciations[rightAccent]).length} of{' '}
                        {comparisons.length} words differ
                    </span>
                </div>
            </div>
        </div>
    )
}
