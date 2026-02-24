import { getCourses } from '@/lib/courses'

/**
 * GET /api/courses
 * Query: level, category, search
 * Returns courses from lib/courses (in-memory or database).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const level = searchParams.get('level') ?? undefined
  const category = searchParams.get('category') ?? undefined
  const search = searchParams.get('search') ?? undefined

  const data = await getCourses({ level, category, search })

  return Response.json({
    success: true,
    data,
    total: data.length,
  })
}
