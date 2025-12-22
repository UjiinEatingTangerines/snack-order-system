import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // 총 투표 수
    const totalVotes = await prisma.vote.count()

    // 간식별 투표 통계 (전체)
    const votesBySnack = await prisma.vote.groupBy({
      by: ['snackId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    })

    // 간식 정보와 함께 반환
    const snacksWithVotes = await Promise.all(
      votesBySnack.map(async (vote) => {
        const snack = await prisma.snack.findUnique({
          where: { id: vote.snackId },
          select: {
            id: true,
            name: true,
            imageUrl: true,
            category: true,
            proposedBy: true,
          },
        })
        return {
          snack,
          voteCount: vote._count.id,
        }
      })
    )

    // 최근 투표 활동 (최근 20개)
    const recentVotes = await prisma.vote.findMany({
      take: 20,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        snack: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
      },
    })

    // 카테고리별 투표 통계
    const categoryStats = snacksWithVotes.reduce((acc, item) => {
      if (item.snack?.category) {
        const category = item.snack.category
        if (!acc[category]) {
          acc[category] = {
            category,
            totalVotes: 0,
            snackCount: 0,
          }
        }
        acc[category].totalVotes += item.voteCount
        acc[category].snackCount += 1
      }
      return acc
    }, {} as Record<string, { category: string; totalVotes: number; snackCount: number }>)

    // 투표자 통계 (익명 vs 실명)
    const anonymousVotes = await prisma.vote.count({
      where: {
        voterName: null,
      },
    })

    const namedVotes = totalVotes - anonymousVotes

    // 시간대별 투표 통계 (최근 7일)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentVotesByDay = await prisma.vote.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      _count: {
        id: true,
      },
    })

    // 일별로 그룹화
    const votesByDay = recentVotesByDay.reduce((acc, vote) => {
      const date = new Date(vote.createdAt).toLocaleDateString('ko-KR')
      if (!acc[date]) {
        acc[date] = 0
      }
      acc[date] += vote._count.id
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      totalVotes,
      totalSnacks: snacksWithVotes.length,
      snacksWithVotes,
      recentVotes,
      categoryStats: Object.values(categoryStats),
      voterStats: {
        anonymous: anonymousVotes,
        named: namedVotes,
      },
      votesByDay,
    })
  } catch (error) {
    console.error('투표 통계 조회 오류:', error)
    return NextResponse.json(
      { error: '투표 통계를 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
