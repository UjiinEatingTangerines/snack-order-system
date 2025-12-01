import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // 전체 통계 (soft delete된 항목 제외)
    const totalSnacks = await prisma.snack.count({
      where: { deletedAt: null }
    })
    const totalVotes = await prisma.vote.count()
    const totalOrders = await prisma.order.count()

    // 이번 주 월요일 0시 계산
    const getThisWeekMonday = () => {
      const today = new Date()
      const dayOfWeek = today.getDay()
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // 일요일이면 6일 전, 아니면 현재 요일 - 1
      const monday = new Date(today)
      monday.setDate(today.getDate() - daysToSubtract)
      monday.setHours(0, 0, 0, 0)
      return monday
    }

    const thisWeekMonday = getThisWeekMonday()

    // 다음 주 월요일 0시 계산 (이번 주 일요일 23:59:59까지)
    const nextWeekMonday = new Date(thisWeekMonday)
    nextWeekMonday.setDate(thisWeekMonday.getDate() + 7)

    // 이번 주 데이터 (월요일 0시 ~ 일요일 23:59:59)
    const weeklySnacks = await prisma.snack.count({
      where: {
        createdAt: {
          gte: thisWeekMonday,
          lt: nextWeekMonday
        },
        deletedAt: null
      }
    })

    const weeklyVotes = await prisma.vote.count({
      where: {
        createdAt: {
          gte: thisWeekMonday,
          lt: nextWeekMonday
        }
      }
    })

    // 이번 주 조르기 목록 (월요일 0시 ~ 일요일 23:59:59)
    const weeklyProposedSnacks = await prisma.snack.findMany({
      where: {
        createdAt: {
          gte: thisWeekMonday,
          lt: nextWeekMonday
        },
        deletedAt: null
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { votes: true }
        }
      }
    })

    const weeklyProposedSnacksCount = await prisma.snack.count({
      where: {
        createdAt: {
          gte: thisWeekMonday,
          lt: nextWeekMonday
        },
        deletedAt: null
      }
    })

    // 이번 주 투표 수 기준 상위 5개 간식 조회 (매주 월요일 0시부터 집계, soft delete 제외)
    const topSnacks = await prisma.snack.findMany({
      where: {
        deletedAt: null,
        votes: {
          some: {
            createdAt: { gte: thisWeekMonday }
          }
        }
      },
      include: {
        _count: {
          select: {
            votes: {
              where: { createdAt: { gte: thisWeekMonday } }
            }
          }
        }
      },
      orderBy: {
        votes: {
          _count: 'desc'
        }
      },
      take: 5
    })

    // 역대 인기 간식 (주문 이력이 있는 항목은 soft delete되었더라도 표시)
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

    // 카테고리별 분포 (soft delete 제외)
    const snacksByCategory = await prisma.snack.groupBy({
      by: ['category'],
      where: {
        deletedAt: null
      },
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
      where: {
        deletedAt: null
      },
      take: 5,
      orderBy: { createdAt: 'desc' }
    })

    // 이달의 MVP (주문/삭제 여부와 무관하게 이번 달 투표 수 기준으로 선택)
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    firstDayOfMonth.setHours(0, 0, 0, 0)

    // 이번 달 투표가 있는 모든 간식을 가져와서 정렬 (deletedAt 조건 제거)
    const monthlySnacks = await prisma.snack.findMany({
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
      }
    })

    // 이번 달 투표 수로 정렬하여 가장 많은 투표를 받은 간식만 선택
    const monthlyMVP = monthlySnacks.length > 0
      ? monthlySnacks.sort((a, b) => b._count.votes - a._count.votes)[0]
      : null

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
