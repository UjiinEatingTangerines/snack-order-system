import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // 1. 제안자별 간식 통계
    const snacksByProposer = await prisma.snack.groupBy({
      by: ['proposedBy'],
      where: {
        proposedBy: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    })

    // 각 제안자의 간식 목록 조회
    const proposerStats = await Promise.all(
      snacksByProposer.map(async (stat) => {
        const snacks = await prisma.snack.findMany({
          where: {
            proposedBy: stat.proposedBy,
          },
          select: {
            id: true,
            name: true,
            imageUrl: true,
            category: true,
            _count: {
              select: {
                votes: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        })

        // 제안한 간식들의 총 투표 수
        const totalVotes = snacks.reduce((sum, snack) => sum + snack._count.votes, 0)

        return {
          proposedBy: stat.proposedBy,
          snackCount: stat._count.id,
          snacks,
          totalVotes,
        }
      })
    )

    // 2. 투표자별 투표 통계
    const votesByVoter = await prisma.vote.groupBy({
      by: ['voterName'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    })

    // 각 투표자의 투표 상세 정보
    const voterStats = await Promise.all(
      votesByVoter.map(async (stat) => {
        const votes = await prisma.vote.findMany({
          where: {
            voterName: stat.voterName,
          },
          include: {
            snack: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                category: true,
                proposedBy: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        })

        return {
          voterName: stat.voterName || '익명',
          voteCount: stat._count.id,
          votes,
        }
      })
    )

    // 3. 간식별 투표자 목록
    const snacksWithVoters = await prisma.snack.findMany({
      select: {
        id: true,
        name: true,
        imageUrl: true,
        category: true,
        proposedBy: true,
        votes: {
          select: {
            id: true,
            voterName: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
      where: {
        votes: {
          some: {},
        },
      },
      orderBy: {
        votes: {
          _count: 'desc',
        },
      },
    })

    // 4. 전체 통계
    const totalSnacks = await prisma.snack.count()
    const totalVotes = await prisma.vote.count()
    const totalProposers = snacksByProposer.length
    const totalVoters = votesByVoter.length
    const namedVoters = votesByVoter.filter(v => v.voterName !== null).length

    return NextResponse.json({
      proposerStats,
      voterStats,
      snacksWithVoters,
      summary: {
        totalSnacks,
        totalVotes,
        totalProposers,
        totalVoters,
        namedVoters,
        anonymousVoters: totalVoters - namedVoters,
      },
    })
  } catch (error) {
    console.error('사용자 활동 통계 조회 오류:', error)
    return NextResponse.json(
      { error: '사용자 활동 통계를 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
