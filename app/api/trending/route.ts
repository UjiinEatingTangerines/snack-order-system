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

    // 다양한 카테고리의 최신 트렌딩 간식 키워드 (먹을 것만)
    const categories = [
      { keyword: '초콜릿 간식', display: 5 },
      { keyword: '과자 간식', display: 5 },
      { keyword: '젤리 간식', display: 4 },
      { keyword: '사탕', display: 3 },
      { keyword: '건강간식', display: 3 },
      { keyword: '견과류 간식', display: 3 },
      { keyword: '쿠키', display: 3 },
      { keyword: '스낵 간식', display: 4 }
    ]

    const allProducts: any[] = []

    // 먹을 수 없는 상품 필터링을 위한 키워드
    const excludeKeywords = [
      '케이스', '파우치', '가방', '인형', '쿠션', '베개',
      '스티커', '키링', '키홀더', '피규어', '봉제', '플러시',
      '담요', '이불', '매트', '쿠션', '슬리퍼', '양말',
      '머그컵', '컵', '텀블러', '보온병', '물병', '수저',
      '접시', '그릇', '도시락', '악세사리', '목걸이', '팔찌',
      '반지', '귀걸이', '헤어', '옷', '의류', '티셔츠',
      '후드', '모자', '장난감', '게임', 'DVD', 'CD',
      '책', '포스터', '엽서', '카드'
    ]

    // 각 카테고리별로 최신 인기 상품 검색 (날짜순 정렬 사용)
    for (const category of categories) {
      const response = await fetch(
        `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(category.keyword)}&display=${category.display}&sort=date`,
        {
          headers: {
            'X-Naver-Client-Id': clientId,
            'X-Naver-Client-Secret': clientSecret,
          }
        }
      )

      if (!response.ok) {
        console.error(`네이버 API 오류 (${category.keyword}):`, response.status)
        continue
      }

      const data = await response.json()

      // 먹을 수 없는 상품 필터링
      const filteredItems = data.items.filter((item: any) => {
        const title = item.title.toLowerCase().replace(/<\/?b>/g, '')
        // 제외 키워드가 포함되어 있으면 필터링
        return !excludeKeywords.some(keyword => title.includes(keyword.toLowerCase()))
      })

      // 카테고리 정보 추가
      const productsWithCategory = filteredItems.map((item: any) => ({
        ...item,
        category: category.keyword
      }))

      allProducts.push(...productsWithCategory)
    }

    // 중복 제거 (링크 기준)
    const uniqueProducts = Array.from(
      new Map(allProducts.map(item => [item.link, item])).values()
    )

    // 카테고리 다양성을 위한 균형 잡힌 선택
    const selectedProducts: any[] = []
    const categoryCounts = new Map<string, number>()

    // 각 카테고리에서 최대 3개씩만 선택하여 다양성 확보
    for (const product of uniqueProducts) {
      const categoryCount = categoryCounts.get(product.category) || 0
      if (categoryCount < 3) {
        selectedProducts.push(product)
        categoryCounts.set(product.category, categoryCount + 1)

        if (selectedProducts.length >= 20) break
      }
    }

    // 기존 트렌딩 데이터 삭제
    await prisma.trendingSnack.deleteMany({})

    // 새 트렌딩 데이터 저장
    const trendingSnacks = await Promise.all(
      selectedProducts.slice(0, 20).map((product, index) =>
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
      count: trendingSnacks.length,
      categories: Array.from(categoryCounts.entries()).map(([category, count]) => ({
        category,
        count
      }))
    })
  } catch (error) {
    console.error('트렌딩 업데이트 오류:', error)
    return apiError(500, '트렌딩 데이터 업데이트 실패')
  }
}
