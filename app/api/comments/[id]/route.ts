import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiError } from '@/lib/api-errors'
import { isAdmin } from '@/lib/auth'

// DELETE: 댓글 삭제 (어드민 전용)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 어드민 권한 확인
    const admin = await isAdmin()
    if (!admin) {
      return apiError(403, '권한이 없습니다')
    }

    const { id } = await params

    await prisma.comment.delete({
      where: { id }
    })

    return NextResponse.json({ message: '댓글이 삭제되었습니다' })
  } catch (error) {
    console.error('댓글 삭제 오류:', error)
    return apiError(500, '댓글 삭제 실패')
  }
}
