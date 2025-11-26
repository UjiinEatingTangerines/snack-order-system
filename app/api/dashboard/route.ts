import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // 전체 통계
    const totalSnacks = await prisma.snack.count()
    const totalVotes = await prisma.vote.count()
    const totalOrders = await prisma.order.count()

    // 이번 주 데이터 (지난 7일)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const weeklySnacks = await prisma.snack.count({
      where: { createdAt: { gte: oneWeekAgo } }
    })

    const weeklyVotes = await prisma.vote.count({
      where: { createdAt: { gte: oneWeekAgo } }
    })

    // 이번 주 조르기 목록
    const weeklyProposedSnacks = await prisma.snack.findMany({
      where: { createdAt: { gte: oneWeekAgo } },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { votes: true }
        }
      }
    })

    const weeklyProposedSnacksCount = await prisma.snack.count({
      where: { createdAt: { gte: oneWeekAgo } }
    })

    // 투표 수 기준 상위 5개 간식 조회
    const topSnacks = await prisma.snack.findMany({
      include: {
        _count: {
          select: { votes: true }
        }
      },
      orderBy: {
        votes: {
          _count: 'desc'
        }
      },
      take: 5
    })

    // 역대 인기 간식
    const allTimeTopSnacks = await prisma.snack.findMany({
      include: {
        _count: {
          select: { orderItems: true, votes: true }
        }
      },
      orderBy: {
        orderItems: {
          _count: 'desc'
        }
      },
      take: 3
    })

    // 카테고리별 분포
    const snacksByCategory = await prisma.snack.groupBy({
      by: ['category'],
      _count: true
    })

    const totalCategorized = snacksByCategory.reduce((sum, cat) => sum + cat._count, 0)
    const categoryData = snacksByCategory
      .filter(cat => cat.category)
      .map(cat => ({
        name: cat.category!,
        count: cat._count,
        percentage: Math.round((cat._count / totalCategorized) * 100)
      }))
      .sort((a, b) => b.count - a.count)

    const topCategory = categoryData[0]?.name || '없음'

    // 최근 활동
    const recentVotes = await prisma.vote.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { snack: true }
    })

    const recentProposals = await prisma.snack.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })

    // 이달의 MVP
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    firstDayOfMonth.setHours(0, 0, 0, 0)

    const monthlyMVP = await prisma.snack.findFirst({
      where: {
        votes: {
          some: {
            createdAt: { gte: firstDayOfMonth }
          }
        }
      },
      include: {
        _count: {
          select: {
            votes: {
              where: { createdAt: { gte: firstDayOfMonth } }
            }
          }
        }
      },
      orderBy: {
        votes: { _count: 'desc' }
      }
    })

    // 다음 월요일 계산
    const getNextMonday = () => {
      const today = new Date()
      const dayOfWeek = today.getDay()
      const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
      const nextMonday = new Date(today)
      nextMonday.setDate(today.getDate() + daysUntilMonday)
      return nextMonday
    }

    const nextOrderDate = getNextMonday()

    // 트렌딩 간식
    const trendingSnacks = await prisma.trendingSnack.findMany({
      orderBy: {
        rank: 'asc'
      },
      take: 10
    })

    return NextResponse.json({
      totalSnacks,
      totalVotes,
      totalOrders,
      weeklySnacks,
      weeklyVotes,
      weeklyProposedSnacks,
      weeklyProposedSnacksCount,
      topCategory,
      topSnacks,
      allTimeTopSnacks,
      categoryData,
      recentVotes,
      recentProposals,
      monthlyMVP,
      nextOrderDate,
      trendingSnacks
    })
  } catch (error) {
    console.error('대시보드 데이터 조회 오류:', error)
    return NextResponse.json({ error: '데이터 조회 실패' }, { status: 500 })
  }
}
