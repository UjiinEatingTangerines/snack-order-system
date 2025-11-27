'use client'

import { useEffect, useState } from 'react'

type RecommendedSnack = {
  id: string
  name: string
  url: string
  imageUrl: string
  price: number
  mallName: string
}

export default function RecommendedSnacks() {
  const [snacks, setSnacks] = useState<RecommendedSnack[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecommendations()

    // 10분(600,000ms)마다 자동 새로고침
    const interval = setInterval(() => {
      fetchRecommendations()
    }, 600000)

    return () => clearInterval(interval)
  }, [])

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/recommendations')
      if (response.ok) {
        const data = await response.json()
        setSnacks(data)
      }
    } catch (error) {
      console.error('추천 간식 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span>🎁</span>
          오늘의 추천 간식
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (snacks.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <span>🎁</span>
          오늘의 추천 간식
        </h2>
        <button
          onClick={fetchRecommendations}
          className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          🔄 새로고침
        </button>
      </div>

      {/* 가로 스크롤 컨테이너 */}
      <div className="relative overflow-hidden">
        <div className="flex gap-4 pb-4 animate-scroll-slow">
          {/* 간식 아이템을 4번 반복해서 끊김 없는 무한 스크롤 효과 */}
          {[...Array(4)].map((_, setIndex) => (
            snacks.map((snack) => (
              <a
                key={`set-${setIndex}-${snack.id}`}
                href={snack.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-40 bg-gradient-to-br from-cream-50 to-orange-50 rounded-lg overflow-hidden hover:shadow-lg transition-all hover:scale-105 border border-cream-200"
              >
                <div className="h-32 bg-gray-100 relative">
                  <img
                    src={snack.imageUrl}
                    alt={snack.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                    {snack.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary-600">
                      {snack.price.toLocaleString()}원
                    </span>
                    <span className="text-xs text-gray-500 truncate max-w-[60px]">
                      {snack.mallName}
                    </span>
                  </div>
                </div>
              </a>
            ))
          ))}
        </div>

        {/* 그라데이션 오버레이 (양쪽 끝) */}
        <div className="absolute top-0 left-0 h-full w-8 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
        <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
      </div>

      <style jsx>{`
        .animate-scroll-slow {
          animation: scroll-slow 40s linear infinite;
        }
        .animate-scroll-slow:hover {
          animation-play-state: paused;
        }
        @keyframes scroll-slow {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-25%);
          }
        }
      `}</style>
    </div>
  )
}
