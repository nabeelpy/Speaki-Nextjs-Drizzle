import { getDebateTopics } from '@/lib/debates'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const level = searchParams.get('level') || undefined
  const category = searchParams.get('category') || undefined
  const featured = searchParams.get('featured') === 'true'

  const topics = await getDebateTopics({ level, category, featured })

  return NextResponse.json({
    success: true,
    data: topics,
    total: topics.length,
  })
}
