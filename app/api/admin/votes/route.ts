import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  // 관리자 권한 확인
  const admin = await isAdmin()
  if (!admin) {
    return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const snackId = searchParams.get('snackId')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const limit = parseInt(searchParams.get('limit') || '100')

    // 투표 조회 쿼리 구성
    const whereClause = snackId ? { snackId } : {}
    const orderByClause = { [sortBy]: sortOrder }

    // 투표 내역 조회
    const votes = await prisma.vote.findMany({
      where: whereClause,
      include: {
        snack: {
          select: {
            name: true,
            imageUrl: true,
            url: true,
          },
        },
      },
      orderBy: orderByClause,
      take: limit,
    })

    // 총 투표 수
    const totalVotes = await prisma.vote.count({
      where: whereClause,
    })

    // 간식별 투표 통계
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
      take: 10,
    })

    // 간식 정보 추가
    const topSnacks = await Promise.all(
      votesBySnack.map(async (vote) => {
        const snack = await prisma.snack.findUnique({
          where: { id: vote.snackId },
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        })
        return {
          snack,
          voteCount: vote._count.id,
        }
      })
    )

    return NextResponse.json({
      votes,
      totalVotes,
      topSnacks,
    })
  } catch (error) {
    console.error('투표 내역 조회 오류:', error)
    return NextResponse.json(
      { error: '투표 내역을 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
