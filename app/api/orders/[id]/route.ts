import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
      return NextResponse.json(
        { message: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('주문 조회 오류:', error)
    return NextResponse.json(
      { message: '주문 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
