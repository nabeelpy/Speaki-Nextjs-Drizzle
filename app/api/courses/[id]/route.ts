import { NextResponse } from 'next/server'
import { getCourseById } from '@/lib/courses'

/**
 * GET /api/courses/[id]
 * Returns a single course with its lessons (from lib/courses, in-memory or database).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const course = await getCourseById(id)

  if (!course) {
    return NextResponse.json(
      { success: false, message: 'Course not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    data: course,
  })
}
