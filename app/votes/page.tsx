'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Snack {
  id: string
  name: string
  imageUrl: string | null
  category: string | null
  proposedBy: string | null
}

interface SnackWithVotes {
  snack: Snack | null
  voteCount: number
}

interface RecentVote {
  id: string
  voterName: string | null
  createdAt: string
  snack: {
    name: string
    imageUrl: string | null
  }
}

interface CategoryStat {
  category: string
  totalVotes: number
  snackCount: number
}

interface VoteStats {
  totalVotes: number
  totalSnacks: number
  snacksWithVotes: SnackWithVotes[]
  recentVotes: RecentVote[]
  categoryStats: CategoryStat[]
  voterStats: {
    anonymous: number
    named: number
  }
  votesByDay: Record<string, number>
}

export default function VotesDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<VoteStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/votes/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        console.error('투표 통계를 불러올 수 없습니다')
      }
    } catch (error) {
      console.error('투표 통계 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">투표 통계를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">투표 통계를 불러올 수 없습니다</p>
      </div>
    )
  }

  const topSnacks = stats.snacksWithVotes.slice(0, 10)
  const anonymousPercentage = stats.totalVotes > 0
    ? Math.round((stats.voterStats.anonymous / stats.totalVotes) * 100)
    : 0
  const namedPercentage = 100 - anonymousPercentage

  return (
    <div className="max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 투표 대시보드</h1>
            <p className="text-gray-600">실시간 간식 투표 현황과 통계를 확인하세요</p>
          </div>
          <button
            onClick={() => router.push('/snacks')}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            간식 투표하러 가기
          </button>
        </div>
      </div>

      {/* 주요 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* 총 투표 수 */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-100 text-sm font-medium">총 투표 수</p>
            <span className="text-3xl">📊</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalVotes.toLocaleString()}</p>
          <p className="text-blue-100 text-sm mt-1">누적 투표</p>
        </div>

        {/* 투표된 간식 수 */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-100 text-sm font-medium">투표된 간식</p>
            <span className="text-3xl">🍿</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalSnacks}</p>
          <p className="text-green-100 text-sm mt-1">개의 간식</p>
        </div>

        {/* 평균 투표 수 */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-purple-100 text-sm font-medium">평균 투표</p>
            <span className="text-3xl">📈</span>
          </div>
          <p className="text-3xl font-bold">
            {stats.totalSnacks > 0
              ? Math.round(stats.totalVotes / stats.totalSnacks)
              : 0}
          </p>
          <p className="text-purple-100 text-sm mt-1">간식당 평균</p>
        </div>

        {/* 1위 간식 */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-orange-100 text-sm font-medium">1위 간식</p>
            <span className="text-3xl">🏆</span>
          </div>
          <p className="text-xl font-bold truncate">
            {topSnacks[0]?.snack?.name || 'N/A'}
          </p>
          <p className="text-orange-100 text-sm mt-1">
            {topSnacks[0]?.voteCount || 0}표
          </p>
        </div>
      </div>

      {/* 투표자 통계 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">투표자 유형</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 실명 투표 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-medium">실명 투표</span>
              <span className="text-2xl font-bold text-primary-600">{namedPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div
                className="bg-primary-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${namedPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {stats.voterStats.named.toLocaleString()}명이 이름을 남겼습니다
            </p>
          </div>

          {/* 익명 투표 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-medium">익명 투표</span>
              <span className="text-2xl font-bold text-gray-600">{anonymousPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div
                className="bg-gray-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${anonymousPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {stats.voterStats.anonymous.toLocaleString()}명이 익명으로 투표했습니다
            </p>
          </div>
        </div>
      </div>

      {/* 카테고리별 통계 */}
      {stats.categoryStats.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">카테고리별 인기도</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.categoryStats
              .sort((a, b) => b.totalVotes - a.totalVotes)
              .map((cat) => (
                <div key={cat.category} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{cat.category}</h3>
                    <span className="text-xl">📦</span>
                  </div>
                  <p className="text-2xl font-bold text-primary-600 mb-1">
                    {cat.totalVotes}표
                  </p>
                  <p className="text-sm text-gray-600">
                    {cat.snackCount}개 간식
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 인기 간식 TOP 10 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">인기 간식 TOP 10</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded ${
                viewMode === 'grid'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              그리드
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded ${
                viewMode === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              리스트
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {topSnacks.map((item, index) => (
              <div
                key={item.snack?.id}
                className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 hover:border-primary-500 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-primary-600">#{index + 1}</span>
                  <span className="text-lg font-semibold">👍 {item.voteCount}</span>
                </div>
                {item.snack?.imageUrl && (
                  <div className="w-full h-24 mb-2 rounded overflow-hidden">
                    <img
                      src={item.snack.imageUrl}
                      alt={item.snack.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <p className="text-sm font-medium text-gray-900 truncate mb-1">
                  {item.snack?.name}
                </p>
                {item.snack?.category && (
                  <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                    {item.snack.category}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {topSnacks.map((item, index) => (
              <div
                key={item.snack?.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-2xl font-bold text-primary-600 w-12">#{index + 1}</span>
                {item.snack?.imageUrl && (
                  <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={item.snack.imageUrl}
                      alt={item.snack.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.snack?.name}</p>
                  {item.snack?.category && (
                    <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full mt-1">
                      {item.snack.category}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600">{item.voteCount}</p>
                  <p className="text-sm text-gray-600">투표</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 최근 투표 활동 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">최근 투표 활동</h2>
        <div className="space-y-3">
          {stats.recentVotes.slice(0, 10).map((vote) => (
            <div
              key={vote.id}
              className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
            >
              {vote.snack.imageUrl && (
                <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                  <img
                    src={vote.snack.imageUrl}
                    alt={vote.snack.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  <span className="text-primary-600">{vote.voterName || '익명'}</span>님이{' '}
                  <span className="font-semibold">{vote.snack.name}</span>에 투표했습니다
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(vote.createdAt).toLocaleString('ko-KR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
