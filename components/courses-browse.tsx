'use client'
import { useState } from 'react'
import useSWR from 'swr'
import CourseGrid from './course-grid'
import LanguageSelector from './language-selector'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Search, SlidersHorizontal } from 'lucide-react'

interface CoursesBrowseProps { basePath?: string }

const LEVELS = ['A1', 'A2', 'B1', 'B2'] as const

export default function CoursesBrowse({ basePath = '' }: CoursesBrowseProps) {
    const [level, setLevel] = useState<string | null>('')
    const [category, setCategory] = useState<string | null>(null)
    const [search, setSearch] = useState<string | null>(null)
    const [selectedLanguage, setSelectedLanguage] = useState<string>('en')

    const fetcher = (url: string) => fetch(url).then((r) => r.json())
    const { data: categoriesRes } = useSWR('/api/course-categories', fetcher)
    const categories: string[] = (categoriesRes?.data as string[]) ?? []

    const difficultyMap: Record<string, string> = {
        A1: 'Easy',
        A2: 'Medium',
        B1: 'Hard',
        B2: 'Expert',
    }

    const clearFilters = () => {
        setLevel(null)
        setCategory(null)
        setSearch(null)
    }

    return (
        <div className="w-full flex flex-col gap-6">

            {/* Mobile Search + Filter */}
            <div className="flex items-center gap-3 md:hidden">

                {/* Search */}
                <div className="flex items-center flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-[#137fec]">
                    <Search className="text-slate-400 mr-2 shrink-0" size={18} />
                    <input
                        placeholder="Search courses, tutors..."
                        className="bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400 w-full"
                        onChange={(e) => setSearch(e.target.value ? e.target.value : null)}
                    />
                </div>

                {/* Filter Button */}
                <Dialog>
                    <DialogTrigger asChild>
                        <button className="flex items-center justify-center w-11 h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 transition-all shadow-sm">
                            <SlidersHorizontal size={18} className="text-slate-600" />
                        </button>
                    </DialogTrigger>

                    <DialogContent className="left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-slate-100 shadow-2xl p-0 overflow-hidden gap-0">

                        {/* Header */}
                        <DialogHeader className="px-5 pt-5 pb-4 border-b border-slate-100">
                            <DialogTitle className="text-base font-semibold text-slate-800 tracking-tight">
                                Filter Courses
                            </DialogTitle>
                        </DialogHeader>

                        {/* Filter Body */}
                        <div className="px-5 py-5 space-y-6">

                            {/* Level */}
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                                    Difficulty Level
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    {LEVELS.map((lvl) => (
                                        <button
                                            key={lvl}
                                            onClick={() => setLevel(level === lvl ? null : lvl)}
                                            className={`relative px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                                level === lvl
                                                    ? 'bg-[#137fec] text-white shadow-md shadow-blue-200'
                                                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-[#137fec] hover:text-[#137fec]'
                                            }`}
                                        >
                                            {difficultyMap[lvl]}
                                            {level === lvl && (
                                                <span className="absolute top-1 right-1.5 text-[10px] opacity-70">✓</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                                    Category
                                </p>
                                <Select value={category ?? 'all'} onValueChange={(v) => setCategory(v === 'all' ? null : v)}>
                                    <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 h-11 text-sm text-slate-700 focus:ring-[#137fec]">
                                        <SelectValue placeholder="All categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All categories</SelectItem>
                                        {categories.map((c) => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="px-5 pb-5 pt-2 flex gap-2.5">
                            <button
                                onClick={clearFilters}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-sm font-semibold hover:bg-slate-100 active:scale-95 transition-all"
                            >
                                Clear all
                            </button>
                            <DialogClose asChild>
                                <button className="flex-1 py-2.5 rounded-xl bg-[#137fec] text-white text-sm font-semibold shadow-md shadow-blue-200 hover:bg-[#0f6fd4] active:scale-95 transition-all">
                                    Apply filters
                                </button>
                            </DialogClose>
                        </div>

                    </DialogContent>
                </Dialog>
            </div>

            {/* Language Selector + Desktop Layout */}
            <LanguageSelector onLanguageChange={setSelectedLanguage} />

            <div className="w-full flex gap-6">

                {/* Desktop Sidebar Filters */}
                <aside className="hidden md:block w-64 flex-shrink-0">
                    <div className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-lg p-4 space-y-6">
                        <div>
                            <h3 className="font-bold mb-3">Level</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {LEVELS.map((lvl) => (
                                    <button
                                        key={lvl}
                                        onClick={() => setLevel(level === lvl ? null : lvl)}
                                        className={`px-3 py-2 rounded-md text-sm font-bold transition-colors ${
                                            level === lvl
                                                ? 'bg-[#137fec] text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        {difficultyMap[lvl]}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label className="mb-2 block font-bold">Category</Label>
                            <Select value={category ?? 'all'} onValueChange={(v) => setCategory(v === 'all' ? null : v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All categories</SelectItem>
                                    {categories.map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="mb-2 block font-bold">Search</Label>
                            <Input
                                placeholder="Title, description, instructor"
                                defaultValue={search ?? ''}
                                onChange={(e) => setSearch(e.target.value ? e.target.value : null)}
                            />
                        </div>
                        <Button variant="secondary" onClick={clearFilters}>Clear</Button>
                    </div>
                </aside>

                {/* Main content */}
                <div className="flex-1 flex flex-col gap-4">
                    <CourseGrid
                        level={level ?? undefined}
                        category={category ?? undefined}
                        search={search ?? undefined}
                        basePath={basePath}
                    />
                </div>

            </div>
        </div>
    )
}