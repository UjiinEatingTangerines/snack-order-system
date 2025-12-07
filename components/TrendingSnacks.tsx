'use client'

import { useState, useEffect } from 'react'

type TrendingSnack = {
  id: string
  name: string
  url: string
  imageUrl: string | null
  rank: number
}

const COOLDOWN_TIME = 5000 // 5초

export default function TrendingSnacks({ initialSnacks }: { initialSnacks: TrendingSnack[] }) {
  const [snacks, setSnacks] = useState<TrendingSnack[]>(initialSnacks)
  const [loading, setLoading] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)

  // 남은 시간 계산 및 업데이트
  useEffect(() => {
    const updateRemainingTime = () => {
      const saved = localStorage.getItem('trendingSnacksLastRefresh')
      if (saved) {
        const savedTime = parseInt(saved, 10)
        const elapsed = Date.now() - savedTime
        const remaining = Math.max(0, Math.ceil((COOLDOWN_TIME - elapsed) / 1000))
        setRemainingTime(remaining)
      } else {
        setRemainingTime(0)
      }
    }

    // 초기 로드 시 실행
    updateRemainingTime()

    // 1초마다 남은 시간 업데이트
    const interval = setInterval(updateRemainingTime, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    if (remainingTime > 0) return

    setLoading(true)

    try {
      const response = await fetch('/api/trending', {
        method: 'POST',
      })

      if (response.ok) {
        // 업데이트된 데이터 가져오기
        const fetchResponse = await fetch('/api/trending')
        const data = await fetchResponse.json()
        setSnacks(data)

        // 새로고침 시간 저장 및 쿨다운 시작
        const now = Date.now()
        localStorage.setItem('trendingSnacksLastRefresh', now.toString())
        setRemainingTime(5) // 5초 쿨다운
      } else {
        const error = await response.json()
        alert(`오류: ${error.message}`)
      }
    } catch (error) {
      alert('트렌딩 데이터 업데이트 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
            🔥 지금 핫한 간식
          </h2>
          <p className="text-xs text-gray-500 mt-1">최신 트렌드 · 다양한 카테고리</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading || remainingTime > 0}
          className="text-xs bg-primary-100 text-primary-700 px-3 py-1.5 rounded-md hover:bg-primary-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? '업데이트 중...' : remainingTime > 0 ? `${remainingTime}초 후 가능` : '🔄 새로고침'}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600 text-sm text-center">다양한 카테고리의 최신 간식을<br />불러오는 중...</p>
        </div>
      ) : snacks.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-sm mb-2">트렌딩 데이터가 없습니다.</p>
          <p className="text-gray-400 text-xs">새로고침 버튼을 눌러주세요.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {snacks.map((snack) => (
            <div
              key={snack.id}
              className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 rounded-lg transition-all border border-transparent hover:border-orange-200"
            >
              <span className="text-xs sm:text-sm font-bold text-orange-600 w-5 sm:w-6 flex-shrink-0">
                #{snack.rank}
              </span>
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                {snack.imageUrl ? (
                  <img
                    src={snack.imageUrl}
                    alt={snack.name}
                    className="w-full h-full object-cover rounded border border-gray-200"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-100 to-yellow-100 rounded flex items-center justify-center text-xl sm:text-2xl">
                    🍪
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-xs sm:text-sm truncate" title={snack.name}>
                  {snack.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">최신 트렌드</p>
              </div>
              <a
                href={snack.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-primary-600 text-white px-2 sm:px-3 py-1 rounded-md hover:bg-primary-700 transition-colors whitespace-nowrap flex-shrink-0"
              >
                보기
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
