'use client'
import { useState } from 'react'
import useSWR from 'swr'
import CourseGrid from './course-grid'
import LanguageSelector from './language-selector'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose, } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select'
import { Search, SlidersHorizontal } from 'lucide-react'
interface CoursesBrowseProps { basePath?: string } const LEVELS = ['A1', 'A2', 'B1', 'B2'] as const
export default function CoursesBrowse({ basePath = '' }: CoursesBrowseProps) { const [level, setLevel] = useState<string | null>('A1')
    const [category, setCategory] = useState<string | null>(null)
    const [search, setSearch] = useState<string | null>(null)
    const [selectedLanguage, setSelectedLanguage] = useState<string>('en')
    const fetcher = (url: string) => fetch(url).then((r) => r.json())
    const { data: categoriesRes } = useSWR('/api/course-categories', fetcher)
    const categories: string[] = (categoriesRes?.data as string[]) ?? []
    const clearFilters = () => { setLevel(null)
        setCategory(null)
        setSearch(null) }
        return (
            <div className="w-full flex flex-col gap-6"> {/* Language selector */}
                {/* Mobile Search + Filter */}
                <div className="flex items-center gap-3 md:hidden">

                    {/* Search */}
                    <div className="flex items-center flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-[#137fec]">
                        <Search className="text-slate-400 mr-2" size={18} />

                        <input
                            placeholder="Search courses, tutors..."
                            className="bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400 w-full"
                            onChange={(e) =>
                                setSearch(e.target.value ? e.target.value : null)
                            }
                        />
                    </div>

                    {/* Filter Button */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <button
                                className="
        flex items-center justify-center
        w-11 h-11
        rounded-xl
        border border-slate-200
        bg-white
        hover:bg-slate-50
        transition
        shadow-sm
        "
                            >
                                <SlidersHorizontal size={18} className="text-slate-600" />
                            </button>
                        </DialogTrigger>

                        <DialogContent>

                            <DialogHeader>
                                <DialogTitle>Filters</DialogTitle>
                            </DialogHeader>

                            {/* Filter Content Here */}




                            <div className="space-y-5"> <div>
                                <Label className="mb-2 block font-bold">Level</Label>
                                <div className="grid grid-cols-2 gap-2"> {LEVELS.map((lvl) => ( <button key={lvl} onClick={() => setLevel(level === lvl ? null : lvl)} className={`px-3 py-2 rounded-md text-sm font-bold ${level === lvl ? 'bg-[#137fec] text-white' : 'bg-slate-100 dark:bg-slate-800'} `} > {lvl} </button> ))} </div> </div>
                                <div> <Label className="mb-2 block font-bold">Category</Label> <Select value={category ?? 'all'} onValueChange={(v) => setCategory(v === 'all' ? null : v)} >
                                    <SelectTrigger> <SelectValue placeholder="All categories" /> </SelectTrigger> <SelectContent> <SelectItem value="all">All categories</SelectItem> {categories.map((c) => ( <SelectItem key={c} value={c}> {c} </SelectItem> ))} </SelectContent> </Select> </div> </div>

                            <DialogFooter className="flex gap-2">

                                <Button
                                    variant="secondary"
                                    onClick={clearFilters}
                                >
                                    Clear
                                </Button>

                                <DialogClose asChild>
                                    <button className="bg-[#137fec] text-white px-4 py-2 rounded-md">
                                        Apply
                                    </button>
                                </DialogClose>

                            </DialogFooter>

                        </DialogContent> </Dialog> </div> {/* Courses Grid */}
            <LanguageSelector onLanguageChange={setSelectedLanguage} />
            <div className="w-full flex gap-6"> {/* Desktop Sidebar Filters */}
            <aside className="hidden md:block w-64 flex-shrink-0">
                <div className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-lg p-4 space-y-6"> <div>
                    <h3 className="font-bold mb-3">Level</h3>
                    <div className="grid grid-cols-2 gap-2"> {LEVELS.map((lvl) => ( <button key={lvl} onClick={() => setLevel(level === lvl ? null : lvl)} className={`px-3 py-2 rounded-md text-sm font-bold transition-colors ${level === lvl ? 'bg-[#137fec] text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'} `} > {lvl} </button> ))} </div> </div>
                    <div> <Label className="mb-2 block font-bold">Category</Label>
                        <Select value={category ?? 'all'} onValueChange={(v) => setCategory(v === 'all' ? null : v)} > <SelectTrigger> <SelectValue placeholder="All categories" /> </SelectTrigger>
                            <SelectContent> <SelectItem value="all">All categories</SelectItem> {categories.map((c) => ( <SelectItem key={c} value={c}> {c} </SelectItem> ))} </SelectContent> </Select> </div>
                    <div> <Label className="mb-2 block font-bold">Search</Label>
                        <Input placeholder="Title, description, instructor" defaultValue={search ?? ''} onChange={(e) => setSearch(e.target.value ? e.target.value : null) } /> </div> <Button variant="secondary" onClick={clearFilters}> Clear </Button> </div>
            </aside> {/* Main content */}
            <div className="flex-1 flex flex-col gap-4">




                        <CourseGrid level={level ?? undefined} category={category ?? undefined} search={search ?? undefined} basePath={basePath} />
            </div> </div> </div> ) }