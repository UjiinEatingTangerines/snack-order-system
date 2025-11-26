import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query) {
      return NextResponse.json(
        { error: '검색어를 입력해주세요.' },
        { status: 400 }
      )
    }

    const clientId = process.env.NAVER_CLIENT_ID
    const clientSecret = process.env.NAVER_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: '네이버 API 설정이 필요합니다.' },
        { status: 500 }
      )
    }

    const response = await fetch(
      `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(query + ' 과자')}&display=20&sort=sim`,
      {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
      }
    )

    if (!response.ok) {
      throw new Error('네이버 API 요청 실패')
    }

    const data = await response.json()

    // HTML 태그 제거 함수
    const removeHtmlTags = (str: string) => {
      return str.replace(/<\/?[^>]+(>|$)/g, '')
    }

    // 결과 정리
    const items = data.items.map((item: any) => ({
      title: removeHtmlTags(item.title),
      link: item.link,
      image: item.image,
      lprice: item.lprice,
      category: item.category1,
      brand: item.brand,
      maker: item.maker,
    }))

    return NextResponse.json({ items })
  } catch (error) {
    console.error('네이버 쇼핑 검색 오류:', error)
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
