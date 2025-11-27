import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiError } from '@/lib/api-errors'
import { isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET: 활성화된 공지사항 조회
export async function GET() {
  try {
    const announcement = await prisma.announcement.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(announcement)
  } catch (error) {
    console.error('공지사항 조회 오류:', error)
    return apiError(500, '공지사항 조회 실패')
  }
}

// POST: 새 공지사항 생성 (어드민 전용)
export async function POST(request: Request) {
  try {
    // 어드민 권한 확인
    const admin = await isAdmin()
    if (!admin) {
      return apiError(403, '권한이 없습니다')
    }

    const { message } = await request.json()

    if (!message || message.trim() === '') {
      return apiError(400, '메시지를 입력해주세요')
    }

    // 기존 활성화된 공지사항 비활성화
    await prisma.announcement.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    })

    // 새 공지사항 생성
    const announcement = await prisma.announcement.create({
      data: {
        message: message.trim(),
        createdBy: 'admin',
        isActive: true,
      }
    })

    return NextResponse.json(announcement, { status: 201 })
  } catch (error) {
    console.error('공지사항 생성 오류:', error)
    return apiError(500, '공지사항 생성 실패')
  }
}

// DELETE: 공지사항 삭제/비활성화 (어드민 전용)
export async function DELETE() {
  try {
    // 어드민 권한 확인
    const admin = await isAdmin()
    if (!admin) {
      return apiError(403, '권한이 없습니다')
    }

    // 모든 공지사항 비활성화
    await prisma.announcement.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    })

    return NextResponse.json({ message: '공지사항이 삭제되었습니다' })
  } catch (error) {
    console.error('공지사항 삭제 오류:', error)
    return apiError(500, '공지사항 삭제 실패')
  }
}
