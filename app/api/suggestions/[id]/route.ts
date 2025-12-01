import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiError } from '@/lib/api-errors'

// GET: 제안 상세 조회
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const suggestion = await prisma.suggestion.findUnique({
      where: { id },
      include: {
        comments: {
          where: {
            parentCommentId: null // 최상위 댓글만
          },
          include: {
            replies: {
              include: {
                replies: true // 대댓글의 대댓글까지
              },
              orderBy: {
                createdAt: 'asc'
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!suggestion) {
      return apiError(404, '제안을 찾을 수 없습니다')
    }

    return NextResponse.json(suggestion)
  } catch (error) {
    console.error('제안 조회 오류:', error)
    return apiError(500, '제안 조회 실패')
  }
}

// DELETE: 제안 삭제
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.suggestion.delete({
      where: { id }
    })

    return NextResponse.json({ message: '제안이 삭제되었습니다' })
  } catch (error) {
    console.error('제안 삭제 오류:', error)
    return apiError(500, '제안 삭제 실패')
  }
}
