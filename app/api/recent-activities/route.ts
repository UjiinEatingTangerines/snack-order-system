import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const since = searchParams.get('since')
    const sinceDate = since ? new Date(since) : new Date(Date.now() - 60000) // 기본값: 1분 전

    // 최근 간식 제안 조회
    const recentSnacks = await prisma.snack.findMany({
      where: {
        createdAt: {
          gte: sinceDate
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 3
    })

    // 최근 주문 조회
    const recentOrders = await prisma.order.findMany({
      where: {
        orderDate: {
          gte: sinceDate
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
      },
      take: 2
    })

    const activities = [
      ...recentSnacks.map(snack => ({
        id: `snack-${snack.id}`,
        type: 'snack_proposal' as const,
        message: `${snack.proposedBy || '누군가'}님이 "${snack.name}" 간식을 조르고 있어요!`,
        emoji: '🍪',
        timestamp: snack.createdAt
      })),
      ...recentOrders.map(order => ({
        id: `order-${order.id}`,
        type: 'order_created' as const,
        message: `새로운 주문이 생성되었어요! ${order.items.length}개 간식 도착 예정 🎉`,
        emoji: '📦',
        timestamp: order.orderDate
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({ activities })
  } catch (error) {
    console.error('최근 활동 조회 오류:', error)
    return NextResponse.json({ activities: [] })
  }
}
