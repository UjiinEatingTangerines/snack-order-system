import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiError } from '@/lib/api-errors'

// GET: 모든 주문 조회
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            snack: true
          }
        }
      },
      orderBy: {
        orderDate: 'desc'
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    return apiError(500, '주문 목록 조회 실패')
  }
}

// POST: 새 주문 생성
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, notes, totalCost } = body

    // 필수 필드 검증
    if (!items || items.length === 0) {
      return apiError(400, '주문할 간식을 선택해주세요')
    }

    // 주문 생성 (트랜잭션 사용)
    const order = await prisma.order.create({
      data: {
        notes: notes || null,
        totalCost: totalCost || null,
        items: {
          create: items.map((item: { snackId: string; quantity: number }) => ({
            snackId: item.snackId,
            quantity: item.quantity
          }))
        }
      },
      include: {
        items: {
          include: {
            snack: true
          }
        }
      }
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('주문 생성 오류:', error)
    return apiError(500, '주문 생성 실패')
  }
}
