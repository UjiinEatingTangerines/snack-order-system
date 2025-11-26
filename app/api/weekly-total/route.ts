import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // 이번 주 시작일 계산 (월요일 기준)
    const getThisWeekMonday = () => {
      const today = new Date()
      const dayOfWeek = today.getDay()
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      const monday = new Date(today)
      monday.setDate(today.getDate() + diff)
      monday.setHours(0, 0, 0, 0)
      return monday
    }

    const thisWeekMonday = getThisWeekMonday()

    // 이번 주에 생성된 주문 조회 (주문 항목과 간식 정보 포함)
    const weeklyOrders = await prisma.order.findMany({
      where: {
        orderDate: {
          gte: thisWeekMonday
        }
      },
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

    // 총 금액 계산
    const totalCost = weeklyOrders.reduce((sum, order) => {
      return sum + (order.totalCost || 0)
    }, 0)

    // 주문 개수
    const orderCount = weeklyOrders.length

    // 주문된 간식 목록 정리
    const orderedSnacks = weeklyOrders.flatMap(order =>
      order.items.map(item => ({
        name: item.snack.name,
        quantity: item.quantity,
        orderDate: order.orderDate
      }))
    )

    return NextResponse.json({
      orderCount,
      totalCost,
      orderedSnacks
    })
  } catch (error) {
    console.error('주간 주문 조회 오류:', error)
    return NextResponse.json(
      { orderCount: 0, totalCost: 0, orderedSnacks: [] },
      { status: 500 }
    )
  }
}
