import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiError } from '@/lib/api-errors'

export const dynamic = 'force-dynamic'

// GET: 특정 주문 조회
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            snack: true
          }
        }
      }
    })

    if (!order) {
      return apiError(404, '주문을 찾을 수 없습니다')
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('주문 조회 오류:', error)
    return apiError(500, '주문 조회 실패')
  }
}
