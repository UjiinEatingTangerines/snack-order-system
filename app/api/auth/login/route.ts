import { NextRequest, NextResponse } from 'next/server'
import { setAdminSession } from '@/lib/auth'

const funnyErrorMessages = [
  '🍪 비밀번호가 쿠키처럼 부서졌어요! 다시 시도해보세요.',
  '🥨 비밀번호가 프레첼처럼 꼬였네요. 다시 입력해주세요!',
  '🍩 도넛 구멍만큼 빈 비밀번호네요. 제대로 입력해주세요!',
  '🍫 비밀번호가 초콜릿처럼 녹아버렸어요. 다시 시도해주세요.',
  '🍿 팝콘처럼 터진 비밀번호! 올바른 비밀번호를 입력하세요.',
  '🧁 비밀번호가 아직 덜 구워졌나봐요. 다시 확인해주세요!',
  '🍦 비밀번호가 아이스크림처럼 녹는 중! 정확히 입력해주세요.',
  '🥞 비밀번호가 팬케이크처럼 뒤집혔어요. 다시 시도해보세요!',
  '🍕 피자 토핑이 잘못됐듯 비밀번호도 틀렸어요. 다시 입력하세요!',
  '🧃 비밀번호 주스가 다 떨어졌어요. 새로 채워주세요!',
  '🍰 케이크를 자르듯 비밀번호를 잘못 잘랐네요. 다시 시도!',
  '🍬 비밀번호가 사탕처럼 달라붙었어요. 제대로 입력해주세요!',
  '🌮 타코가 무너지듯 비밀번호도 무너졌어요. 다시 쌓아보세요!',
  '🍌 바나나 껍질처럼 미끄러운 비밀번호네요. 다시 입력!',
  '🥪 샌드위치처럼 층이 안 맞는 비밀번호예요. 재정비하세요!',
  '🍓 딸기처럼 빨간 불! 비밀번호가 틀렸어요.',
  '🥐 크루아상처럼 부서진 비밀번호! 다시 시도하세요.',
  '🍡 경단처럼 떨어진 비밀번호! 다시 꽂아보세요.',
  '🧇 와플처럼 탄 비밀번호네요. 새걸로 다시 구워주세요!',
  '🥗 샐러드처럼 섞인 비밀번호! 제대로 조합해주세요.'
]

function getRandomErrorMessage() {
  return funnyErrorMessages[Math.floor(Math.random() * funnyErrorMessages.length)]
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: '비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      return NextResponse.json(
        { error: '서버 설정 오류입니다.' },
        { status: 500 }
      )
    }

    if (password === adminPassword) {
      await setAdminSession()
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: getRandomErrorMessage() },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('로그인 오류:', error)
    return NextResponse.json(
      { error: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
