'use client'

import { useState, useEffect } from 'react'

type ErrorTemplate = {
  emoji: string
  title: string
  message: string
  color: string
}

const errorTemplates: ErrorTemplate[] = [
  {
    emoji: '🍪',
    title: '쿠키가 부서졌어요!',
    message: '서버가 쿠키를 너무 세게 구워서 부서졌어요. 잠시 후 다시 시도해주세요.',
    color: 'bg-amber-50 border-amber-200'
  },
  {
    emoji: '🥨',
    title: '프레첼이 꼬였어요!',
    message: '데이터가 프레첼처럼 복잡하게 얽혔어요. 조금만 기다려주세요.',
    color: 'bg-orange-50 border-orange-200'
  },
  {
    emoji: '🍫',
    title: '초콜릿이 녹았어요!',
    message: '서버가 너무 뜨거워서 초콜릿이 녹아버렸어요. 식힐 시간이 필요해요.',
    color: 'bg-yellow-50 border-yellow-200'
  },
  {
    emoji: '🍩',
    title: '도넛 구멍에 빠졌어요!',
    message: '요청이 도넛 구멍 속으로 사라졌어요. 다시 한번 시도해볼까요?',
    color: 'bg-pink-50 border-pink-200'
  },
  {
    emoji: '🥤',
    title: '음료가 쏟아졌어요!',
    message: '데이터베이스가 음료처럼 쏟아져서 청소 중이에요. 잠시만 기다려주세요.',
    color: 'bg-blue-50 border-blue-200'
  },
  {
    emoji: '🍿',
    title: '팝콘이 터지는 중!',
    message: '서버가 팝콘처럼 튀고 있어요. 조금만 기다리면 준비될 거예요.',
    color: 'bg-red-50 border-red-200'
  },
  {
    emoji: '🧁',
    title: '컵케이크가 오븐에!',
    message: '데이터가 아직 오븐에서 굽고 있어요. 조금만 더 기다려주세요.',
    color: 'bg-purple-50 border-purple-200'
  },
  {
    emoji: '🍦',
    title: '아이스크림이 녹는 중!',
    message: '빨리 가져와야 하는데 서버가 느려요. 곧 도착할 거예요!',
    color: 'bg-cyan-50 border-cyan-200'
  },
  {
    emoji: '🥞',
    title: '팬케이크가 뒤집어졌어요!',
    message: '데이터가 팬케이크처럼 뒤집어져서 다시 정리하고 있어요.',
    color: 'bg-amber-50 border-amber-200'
  },
  {
    emoji: '🍕',
    title: '피자 배달이 지연돼요!',
    message: '주문하신 데이터가 배달 중인데 길이 막혀요. 조금만 기다려주세요.',
    color: 'bg-orange-50 border-orange-200'
  },
  {
    emoji: '🧃',
    title: '주스가 다 떨어졌어요!',
    message: '서버의 에너지가 바닥났어요. 충전 중이니 잠시만 기다려주세요.',
    color: 'bg-green-50 border-green-200'
  },
  {
    emoji: '🍰',
    title: '케이크를 자르는 중!',
    message: '데이터 케이크를 예쁘게 자르고 있어요. 조금만 기다려주세요.',
    color: 'bg-pink-50 border-pink-200'
  },
  {
    emoji: '🥨',
    title: '베이글이 구워지는 중!',
    message: '신선한 데이터를 준비하고 있어요. 금방 완성될 거예요.',
    color: 'bg-yellow-50 border-yellow-200'
  },
  {
    emoji: '🍬',
    title: '사탕이 끈적해요!',
    message: '데이터가 사탕처럼 달라붙어서 분리하는 중이에요.',
    color: 'bg-purple-50 border-purple-200'
  },
  {
    emoji: '🥗',
    title: '샐러드를 섞는 중!',
    message: '데이터 재료들을 잘 섞고 있어요. 맛있게 준비될 거예요.',
    color: 'bg-green-50 border-green-200'
  },
  {
    emoji: '🌮',
    title: '타코가 무너졌어요!',
    message: '데이터 타코가 와르르 무너졌어요. 다시 쌓고 있어요.',
    color: 'bg-yellow-50 border-yellow-200'
  },
  {
    emoji: '🍌',
    title: '바나나 껍질에 미끄러졌어요!',
    message: '서버가 바나나 껍질을 밟고 넘어졌어요. 일어나는 중이에요.',
    color: 'bg-yellow-50 border-yellow-200'
  },
  {
    emoji: '🥪',
    title: '샌드위치가 흐트러졌어요!',
    message: '데이터 층이 샌드위치처럼 흐트러졌어요. 다시 쌓고 있어요.',
    color: 'bg-orange-50 border-orange-200'
  },
  {
    emoji: '🍓',
    title: '딸기가 굴러갔어요!',
    message: '데이터가 딸기처럼 여기저기 굴러갔어요. 모으는 중이에요.',
    color: 'bg-red-50 border-red-200'
  },
  {
    emoji: '🥐',
    title: '크루아상이 부스러졌어요!',
    message: '데이터가 크루아상처럼 부스러져서 조각을 찾고 있어요.',
    color: 'bg-amber-50 border-amber-200'
  },
  {
    emoji: '🍡',
    title: '경단이 떨어졌어요!',
    message: '데이터 경단이 꼬치에서 떨어졌어요. 다시 꽂고 있어요.',
    color: 'bg-pink-50 border-pink-200'
  },
  {
    emoji: '🧇',
    title: '와플이 타고 있어요!',
    message: '서버가 너무 뜨거워서 와플이 타고 있어요. 온도를 낮추는 중!',
    color: 'bg-yellow-50 border-yellow-200'
  }
]

export default function ErrorDisplay({
  error,
  reset
}: {
  error?: Error & { digest?: string }
  reset?: () => void
}) {
  // 랜덤 템플릿 선택 (최초 1회)
  const [template, setTemplate] = useState(() =>
    errorTemplates[Math.floor(Math.random() * errorTemplates.length)]
  )

  // 5초마다 템플릿 변경
  useEffect(() => {
    const interval = setInterval(() => {
      setTemplate(errorTemplates[Math.floor(Math.random() * errorTemplates.length)])
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className={`max-w-md w-full ${template.color} border-2 rounded-2xl p-8 text-center shadow-lg`}>
        <div className="text-8xl mb-4">{template.emoji}</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          {template.title}
        </h2>
        <p className="text-gray-600 mb-6">
          {template.message}
        </p>

        {error && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              기술적인 정보 (개발자용)
            </summary>
            <div className="mt-2 p-3 bg-white rounded border text-xs text-gray-700 overflow-auto">
              <p className="font-mono break-all">{error.message}</p>
              {error.digest && (
                <p className="mt-2 text-gray-500">Digest: {error.digest}</p>
              )}
            </div>
          </details>
        )}

        <div className="flex flex-col gap-2">
          {reset && (
            <button
              onClick={reset}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              다시 시도하기
            </button>
          )}
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  )
}
