import { getDebateTopicById } from '@/lib/debates'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const topic = await getDebateTopicById(id)

  if (!topic) {
    return Response.json(
      { success: false, message: 'Debate topic not found' },
      { status: 404 },
    )
  }

  return Response.json({
    success: true,
    data: topic,
  })
}
