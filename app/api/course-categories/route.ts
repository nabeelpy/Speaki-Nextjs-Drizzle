import { NextResponse } from 'next/server'
import { db } from '@/db'
import { courses } from '@/db/schema'

export async function GET() {
  try {
    const rows = await db
      .select({
        category: courses.category,
      })
      .from(courses)

    const categories = Array.from(
      new Set(
        rows
          .map((r) => (r.category ?? '').trim())
          .filter((v) => v && v.length > 0),
      ),
    ).sort((a, b) => a.localeCompare(b))

    return NextResponse.json({ success: true, data: categories })
  } catch (e) {
    console.error('Failed to load categories', e)
    return NextResponse.json({ success: false, data: [] }, { status: 500 })
  }
}
