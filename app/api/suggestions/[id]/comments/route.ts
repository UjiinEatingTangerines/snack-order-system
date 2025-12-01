import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiError } from '@/lib/api-errors'

// POST: 댓글/대댓글 작성
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { content, authorName, parentCommentId } = body

    // 필수 필드 검증
    if (!content || !authorName) {
      return apiError(400, '내용과 작성자는 필수입니다')
    }

    // 댓글 생성
    const comment = await prisma.comment.create({
      data: {
        content,
        authorName,
        suggestionId: id,
        parentCommentId: parentCommentId || null
      }
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('댓글 작성 오류:', error)
    return apiError(500, '댓글 작성 실패')
  }
}
