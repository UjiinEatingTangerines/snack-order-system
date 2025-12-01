import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiError } from '@/lib/api-errors'

// GET: 모든 간식 조회 (soft delete된 항목 제외)
export async function GET() {
  try {
    const snacks = await prisma.snack.findMany({
      where: {
        deletedAt: null
      },
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
    return apiError(500, '간식 목록 조회 실패')
  }
}

// POST: 새 간식 제안
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, url, imageUrl, category, price, proposedBy } = body

    // 필수 필드 검증
    if (!name || !url) {
      return apiError(400, '간식 이름과 구매 링크는 필수입니다')
    }

    // 가격 파싱
    const parsedPrice = price ? parseFloat(price) : null

    // 간식 생성
    const snack = await prisma.snack.create({
      data: {
        name,
        url,
        imageUrl: imageUrl || null,
        category: category || null,
        price: parsedPrice,
        proposedBy: proposedBy || null,
      }
    })

    return NextResponse.json(snack, { status: 201 })
  } catch (error) {
    console.error('간식 생성 오류:', error)
    return apiError(500, '간식 제안 실패')
  }
}
