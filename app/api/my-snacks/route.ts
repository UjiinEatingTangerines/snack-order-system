import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const proposer = searchParams.get('proposer')

    if (!proposer) {
      return NextResponse.json(
        { error: '제안자 이름이 필요합니다.' },
        { status: 400 }
      )
    }

    const snacks = await prisma.snack.findMany({
      where: {
        proposer: proposer
      },
      include: {
        _count: {
          select: { votes: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(snacks)
  } catch (error) {
    console.error('내 간식 조회 오류:', error)
    return NextResponse.json(
      { error: '간식 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
