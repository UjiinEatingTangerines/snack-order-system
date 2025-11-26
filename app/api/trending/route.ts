import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiError } from '@/lib/api-errors'

// GET: 트렌딩 간식 조회
export async function GET() {
  try {
    // 최근 24시간 이내 데이터 조회
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const trending = await prisma.trendingSnack.findMany({
      where: {
        fetchedAt: {
          gte: yesterday
        }
      },
      orderBy: {
        rank: 'asc'
      },
      take: 10
    })

    return NextResponse.json(trending)
  } catch (error) {
    console.error('트렌딩 데이터 조회 오류:', error)
    return apiError(500, '트렌딩 데이터 조회 실패')
  }
}

// POST: 네이버 쇼핑 API로 트렌딩 데이터 업데이트
export async function POST() {
  try {
    const clientId = process.env.NAVER_CLIENT_ID
    const clientSecret = process.env.NAVER_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return apiError(500, '네이버 API 키 미설정')
    }

    // 검색 키워드
    const keywords = ['인기 과자', '화제 간식', '신제품 스낵']
    const allProducts: any[] = []

    // 각 키워드로 검색
    for (const keyword of keywords) {
      const response = await fetch(
        `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(keyword)}&display=10&sort=sim`,
        {
          headers: {
            'X-Naver-Client-Id': clientId,
            'X-Naver-Client-Secret': clientSecret,
          }
        }
      )

      if (!response.ok) {
        console.error(`네이버 API 오류 (${keyword}):`, response.status)
        continue
      }

      const data = await response.json()
      allProducts.push(...data.items)
    }

    // 중복 제거 (링크 기준)
    const uniqueProducts = Array.from(
      new Map(allProducts.map(item => [item.link, item])).values()
    )

    // 기존 트렌딩 데이터 삭제
    await prisma.trendingSnack.deleteMany({})

    // 새 트렌딩 데이터 저장
    const trendingSnacks = await Promise.all(
      uniqueProducts.slice(0, 20).map((product, index) =>
        prisma.trendingSnack.create({
          data: {
            name: product.title.replace(/<\/?b>/g, ''), // HTML 태그 제거
            url: product.link,
            imageUrl: product.image || null,
            source: 'naver',
            rank: index + 1,
          }
        })
      )
    )

    return NextResponse.json({
      message: `${trendingSnacks.length}개의 트렌딩 간식을 업데이트했습니다.`,
      count: trendingSnacks.length
    })
  } catch (error) {
    console.error('트렌딩 업데이트 오류:', error)
    return apiError(500, '트렌딩 데이터 업데이트 실패')
  }
}
