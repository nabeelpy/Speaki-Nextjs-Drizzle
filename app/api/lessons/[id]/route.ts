import { NextResponse } from 'next/server'
import { getLessonConversationById } from '@/lib/lesson-conversations'

/**
 * GET /api/lessons/[id]
 * Returns conversation data for a lesson (e.g. id = l1, l2, l3, l4).
 * Data is loaded from lib/lesson-conversations (in-memory or database).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const conversation = await getLessonConversationById(id)

  if (!conversation) {
    return NextResponse.json(
      { error: 'Lesson conversation not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    data: conversation,
  })
}
