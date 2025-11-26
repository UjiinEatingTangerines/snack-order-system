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

    // 이번 주에 생성된 주문 조회
    const weeklyOrders = await prisma.order.findMany({
      where: {
        orderDate: {
          gte: thisWeekMonday
        }
      }
    })

    // 총 금액 계산
    const totalCost = weeklyOrders.reduce((sum, order) => {
      return sum + (order.totalCost || 0)
    }, 0)

    // 주문 개수
    const orderCount = weeklyOrders.length

    return NextResponse.json({
      orderCount,
      totalCost
    })
  } catch (error) {
    console.error('주간 주문 조회 오류:', error)
    return NextResponse.json(
      { orderCount: 0, totalCost: 0 },
      { status: 500 }
    )
  }
}
