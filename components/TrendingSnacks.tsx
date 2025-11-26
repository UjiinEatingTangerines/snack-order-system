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
  const [cooldown, setCooldown] = useState(0)
  const [lastRefreshTime, setLastRefreshTime] = useState<number | null>(null)

  // 컴포넌트 마운트 시 localStorage에서 마지막 새로고침 시간 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('trendingSnacksLastRefresh')
    if (saved) {
      const savedTime = parseInt(saved, 10)
      const elapsed = Date.now() - savedTime
      if (elapsed < COOLDOWN_TIME) {
        setCooldown(Math.ceil((COOLDOWN_TIME - elapsed) / 1000))
        setLastRefreshTime(savedTime)
      }
    }
  }, [])

  // 쿨다운 타이머
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown(cooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleRefresh = async () => {
    if (cooldown > 0) return

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
        setLastRefreshTime(now)
        setCooldown(5) // 5초 쿨다운
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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          🔥 지금 핫한 간식
        </h2>
        <button
          onClick={handleRefresh}
          disabled={loading || cooldown > 0}
          className="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded hover:bg-primary-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '업데이트 중...' : cooldown > 0 ? `${cooldown}초 후 가능` : '새로고침'}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600 text-sm">네이버 쇼핑에서 인기 간식을 불러오는 중...</p>
        </div>
      ) : snacks.length === 0 ? (
        <p className="text-gray-500 text-sm">
          트렌딩 데이터가 없습니다. 새로고침 버튼을 눌러주세요.
        </p>
      ) : (
        <div className="space-y-2">
          {snacks.map((snack) => (
            <div
              key={snack.id}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="text-sm font-bold text-orange-600 w-6 flex-shrink-0">
                #{snack.rank}
              </span>
              <div className="w-12 h-12 flex-shrink-0">
                {snack.imageUrl ? (
                  <img
                    src={snack.imageUrl}
                    alt={snack.name}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center text-2xl">
                    🍪
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 max-w-[200px]">
                <p className="font-medium text-gray-900 text-sm truncate" title={snack.name}>
                  {snack.name.length > 10 ? `${snack.name.substring(0, 10)}...` : snack.name}
                </p>
              </div>
              <a
                href={snack.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary-600 hover:text-primary-700 whitespace-nowrap"
              >
                보기 →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
