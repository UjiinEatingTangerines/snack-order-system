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

    // 이번 주에 생성된 PENDING 상태의 주문만 조회 (주문 항목과 간식 정보 포함)
    const weeklyOrders = await prisma.order.findMany({
      where: {
        orderDate: {
          gte: thisWeekMonday
        },
        status: 'PENDING'
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

    // 주문된 간식 목록 정리 (간식별로 수량 합산)
    const snackMap = new Map<string, {
      id: string
      name: string
      quantity: number
      orders: number
      imageUrl: string | null
      url: string
      proposedBy: string | null
    }>()

    weeklyOrders.forEach(order => {
      order.items.forEach(item => {
        const existing = snackMap.get(item.snack.id)
        if (existing) {
          existing.quantity += item.quantity
          existing.orders += 1
        } else {
          snackMap.set(item.snack.id, {
            id: item.snack.id,
            name: item.snack.name,
            quantity: item.quantity,
            orders: 1,
            imageUrl: item.snack.imageUrl,
            url: item.snack.url,
            proposedBy: item.snack.proposedBy
          })
        }
      })
    })

    const orderedSnacks = Array.from(snackMap.values()).sort((a, b) => b.quantity - a.quantity)

    // 총 간식 개수 계산
    const totalQuantity = orderedSnacks.reduce((sum, snack) => sum + snack.quantity, 0)

    // 총 간식 종류
    const totalTypes = orderedSnacks.length

    // 주문 상세 정보
    const orderDetails = weeklyOrders.map(order => ({
      id: order.id,
      orderDate: order.orderDate,
      totalCost: order.totalCost,
      notes: order.notes,
      itemCount: order.items.length,
      totalQuantity: order.items.reduce((sum, item) => sum + item.quantity, 0)
    }))

    return NextResponse.json({
      orderCount,
      totalCost,
      totalQuantity,
      totalTypes,
      orderedSnacks,
      orderDetails
    })
  } catch (error) {
    console.error('주간 주문 조회 오류:', error)
    return NextResponse.json(
      { orderCount: 0, totalCost: 0, orderedSnacks: [] },
      { status: 500 }
    )
  }
}
