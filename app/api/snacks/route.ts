import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: 모든 간식 조회
export async function GET() {
  try {
    const snacks = await prisma.snack.findMany({
      include: {
        votes: true,
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
    return NextResponse.json(
      { message: '간식 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 새 간식 제안
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, url, imageUrl, category, proposedBy } = body

    // 필수 필드 검증
    if (!name || !url) {
      return NextResponse.json(
        { message: '간식 이름과 구매 링크는 필수입니다.' },
        { status: 400 }
      )
    }

    // 간식 생성
    const snack = await prisma.snack.create({
      data: {
        name,
        url,
        imageUrl: imageUrl || null,
        category: category || null,
        proposedBy: proposedBy || null,
      }
    })

    return NextResponse.json(snack, { status: 201 })
  } catch (error) {
    console.error('간식 생성 오류:', error)
    return NextResponse.json(
      { message: '간식 제안 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
