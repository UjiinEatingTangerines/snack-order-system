import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

type NaverProduct = {
  title: string
  link: string
  image: string
  lprice: string
  mallName: string
}

const SEARCH_KEYWORDS = [
  '인기 과자',
  '추천 간식',
  '베스트 스낵',
  '인기 초콜릿',
  '추천 사탕',
  '인기 쿠키'
]

export async function GET() {
  try {
    const clientId = process.env.NAVER_CLIENT_ID
    const clientSecret = process.env.NAVER_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: '네이버 API 키가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    // 랜덤하게 2개의 키워드 선택
    const shuffled = [...SEARCH_KEYWORDS].sort(() => Math.random() - 0.5)
    const selectedKeywords = shuffled.slice(0, 2)

    const allProducts: NaverProduct[] = []

    // 각 키워드로 검색
    for (const keyword of selectedKeywords) {
      const url = `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(
        keyword
      )}&display=10&sort=sim`

      const response = await fetch(url, {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
      })

      if (response.ok) {
        const data = await response.json()
        allProducts.push(...data.items)
      }
    }

    // 중복 제거 및 정리
    const uniqueProducts = Array.from(
      new Map(
        allProducts.map((item) => [
          item.link,
          {
            id: item.link,
            name: item.title.replace(/<\/?b>/g, ''),
            url: item.link,
            imageUrl: item.image,
            price: parseInt(item.lprice),
            mallName: item.mallName,
          },
        ])
      ).values()
    ).slice(0, 20)

    return NextResponse.json(uniqueProducts)
  } catch (error) {
    console.error('추천 간식 조회 오류:', error)
    return NextResponse.json(
      { error: '추천 간식을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
