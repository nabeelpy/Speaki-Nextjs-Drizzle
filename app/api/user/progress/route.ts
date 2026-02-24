import { mockUser, mockUserProgress } from '@/lib/mock-data'

export async function GET() {
  return Response.json({
    success: true,
    data: {
      user: mockUser,
      progress: mockUserProgress,
    },
  })
}
