import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    return NextResponse.json(
      { message: '주문 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 새 주문 생성
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, notes, totalCost } = body

    // 필수 필드 검증
    if (!items || items.length === 0) {
      return NextResponse.json(
        { message: '주문할 간식을 선택해주세요.' },
        { status: 400 }
      )
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
    return NextResponse.json(
      { message: '주문 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
