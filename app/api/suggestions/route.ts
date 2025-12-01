import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiError } from '@/lib/api-errors'

// GET: 모든 제안 조회
export async function GET() {
  try {
    const suggestions = await prisma.suggestion.findMany({
      include: {
        _count: {
          select: { comments: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error('제안 목록 조회 오류:', error)
    return apiError(500, '제안 목록 조회 실패')
  }
}

// POST: 새 제안 작성
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, content, authorName } = body

    // 필수 필드 검증
    if (!title || !content || !authorName) {
      return apiError(400, '제목, 내용, 작성자는 필수입니다')
    }

    // 제안 생성
    const suggestion = await prisma.suggestion.create({
      data: {
        title,
        content,
        authorName
      }
    })

    return NextResponse.json(suggestion, { status: 201 })
  } catch (error) {
    console.error('제안 작성 오류:', error)
    return apiError(500, '제안 작성 실패')
  }
}
