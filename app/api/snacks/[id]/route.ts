import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiError } from '@/lib/api-errors'
import { isAdmin } from '@/lib/auth'

// DELETE: 간식 삭제 (어드민 전용)
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

    // 간식 존재 확인
    const snack = await prisma.snack.findUnique({
      where: { id }
    })

    if (!snack) {
      return apiError(404, '간식을 찾을 수 없습니다')
    }

    // Soft delete: deletedAt을 현재 시간으로 설정
    await prisma.snack.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    })

    return NextResponse.json({ message: '간식이 삭제되었습니다' })
  } catch (error) {
    console.error('간식 삭제 오류:', error)
    return apiError(500, '간식 삭제 실패')
  }
}
