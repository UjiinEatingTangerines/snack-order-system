'use client'

import { useState } from 'react'

type TrendingSnack = {
  id: string
  name: string
  url: string
  imageUrl: string | null
  rank: number
}

export default function TrendingSnacks({ initialSnacks }: { initialSnacks: TrendingSnack[] }) {
  const [snacks, setSnacks] = useState<TrendingSnack[]>(initialSnacks)
  const [loading, setLoading] = useState(false)

  const handleRefresh = async () => {
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
          disabled={loading}
          className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded hover:bg-orange-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '업데이트 중...' : '새로고침'}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
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
              <span className="text-sm font-bold text-orange-600 w-6">
                #{snack.rank}
              </span>
              {snack.imageUrl && (
                <img
                  src={snack.imageUrl}
                  alt={snack.name}
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {snack.name}
                </p>
              </div>
              <a
                href={snack.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-orange-600 hover:text-orange-700 whitespace-nowrap"
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
