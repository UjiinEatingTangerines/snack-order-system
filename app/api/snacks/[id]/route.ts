import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiError } from '@/lib/api-errors'
import { isAdmin } from '@/lib/auth'

// PATCH: 간식 수정 (어드민 전용)
export async function PATCH(
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
    const body = await request.json()
    const { name, url, imageUrl, category, price, proposedBy } = body

    // 필수 필드 검증
    if (!name || !url) {
      return apiError(400, '간식 이름과 구매 링크는 필수입니다')
    }

    // 간식 존재 확인
    const existingSnack = await prisma.snack.findUnique({
      where: { id }
    })

    if (!existingSnack) {
      return apiError(404, '간식을 찾을 수 없습니다')
    }

    // 가격 파싱
    const parsedPrice = price ? parseFloat(price) : null

    // 간식 업데이트
    const updatedSnack = await prisma.snack.update({
      where: { id },
      data: {
        name,
        url,
        imageUrl: imageUrl || null,
        category: category || null,
        price: parsedPrice,
        proposedBy: proposedBy || null,
      },
      include: {
        _count: {
          select: { votes: true }
        }
      }
    })

    return NextResponse.json(updatedSnack)
  } catch (error) {
    console.error('간식 수정 오류:', error)
    return apiError(500, '간식 수정 실패')
  }
}

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
