'use client'

import { useState } from 'react'
import useSWR from 'swr'
import CourseGrid from './course-grid'
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

interface CoursesBrowseProps {
  basePath?: string
}

const LEVELS = ['A1', 'A2', 'B1', 'B2'] as const

export default function CoursesBrowse({ basePath = '' }: CoursesBrowseProps) {
  const [level, setLevel] = useState<string | null>('A1')
  const [category, setCategory] = useState<string | null>(null)
  const [search, setSearch] = useState<string | null>(null)

  const fetcher = (url: string) => fetch(url).then((r) => r.json())
  const { data: categoriesRes } = useSWR('/api/courses/categories', fetcher)
  const categories: string[] = (categoriesRes?.data as string[]) ?? []

  const clearFilters = () => {
    setLevel(null)
    setCategory(null)
    setSearch(null)
  }

  return (
    <div className="w-full flex gap-6">
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0">
        <div className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-lg p-4 space-y-6">
          <div>
            <h3 className="font-bold text-[#0d141b] dark:text-white mb-3">Level</h3>
            <div className="grid grid-cols-2 gap-2">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevel(level === lvl ? null : lvl)}
                  className={`px-3 py-2 rounded-md text-sm font-bold transition-colors ${
                    level === lvl
                      ? 'bg-[#137fec] text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-[#0d141b] dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-bold text-[#0d141b] dark:text-white mb-2 block">
              Category
            </Label>
            <Select value={category ?? 'all'} onValueChange={(v) => setCategory(v === 'all' ? null : v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="search" className="text-sm font-bold text-[#0d141b] dark:text-white mb-2 block">
              Search
            </Label>
            <Input
              id="search"
              placeholder="Title, description, instructor"
              defaultValue={search ?? ''}
              onChange={(e) => setSearch(e.target.value ? e.target.value : null)}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" type="button" onClick={clearFilters} className="w-full">
              Clear
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content with mobile filters trigger */}
      <div className="flex-1">
        {/* Mobile Filters Trigger */}
        <div className="md:hidden mb-4">
          <Dialog>
            <DialogTrigger asChild>
              <button className="w-full bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-lg py-3 font-bold text-[#0d141b] dark:text-white">
                Filters
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter Courses</DialogTitle>
              </DialogHeader>
              <div className="p-4 space-y-6">
                <div>
                  <h3 className="font-bold text-[#0d141b] dark:text-white mb-3">Level</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {LEVELS.map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setLevel(level === lvl ? null : lvl)}
                        className={`px-3 py-2 rounded-md text-sm font-bold transition-colors ${
                          level === lvl
                            ? 'bg-[#137fec] text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-[#0d141b] dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-bold text-[#0d141b] dark:text-white mb-2 block">
                    Category
                  </Label>
                  <Select value={category ?? 'all'} onValueChange={(v) => setCategory(v === 'all' ? null : v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="m-search" className="text-sm font-bold text-[#0d141b] dark:text-white mb-2 block">
                    Search
                  </Label>
                  <Input
                    id="m-search"
                    placeholder="Title, description, instructor"
                    defaultValue={search ?? ''}
                    onChange={(e) => setSearch(e.target.value ? e.target.value : null)}
                  />
                </div>
              </div>
              <DialogFooter>
                <div className="flex gap-2">
                  <DialogClose asChild>
                    <Button className="flex-1">Apply</Button>
                  </DialogClose>
                  <Button variant="secondary" className="flex-1" onClick={clearFilters}>
                    Clear
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Grid */}
        <CourseGrid level={level ?? undefined} category={category ?? undefined} search={search ?? undefined} basePath={basePath} />
      </div>
    </div>
  )
}
