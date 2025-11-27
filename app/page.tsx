'use client'

import { useEffect, useState } from 'react'
import TrendingSnacks from '@/components/TrendingSnacks'
import OrderStatusBlock from '@/components/OrderStatusBlock'
import RecommendedSnacks from '@/components/RecommendedSnacks'

type DashboardData = {
  totalSnacks: number
  totalVotes: number
  totalOrders: number
  weeklySnacks: number
  weeklyVotes: number
  weeklyProposedSnacks: Array<{
    id: string
    name: string
    category: string | null
    proposedBy: string | null
    createdAt: Date
    _count: { votes: number }
  }>
  weeklyProposedSnacksCount: number
  topCategory: string
  topSnacks: Array<{
    id: string
    name: string
    category: string | null
    _count: { votes: number }
  }>
  allTimeTopSnacks: Array<{
    id: string
    name: string
    _count: { orderItems: number; votes: number }
  }>
  categoryData: Array<{
    name: string
    count: number
    percentage: number
  }>
  recentVotes: Array<{
    id: string
    voterName: string | null
    createdAt: Date
    snack: { name: string }
  }>
  recentProposals: Array<{
    id: string
    name: string
    createdAt: Date
  }>
  monthlyMVP: {
    name: string
    _count: { votes: number }
  } | null
  nextOrderDate: Date
  trendingSnacks: Array<{
    id: string
    name: string
    url: string
    imageUrl: string | null
    rank: number
  }>
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [weeklySnacksPage, setWeeklySnacksPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const dashboardData = await response.json()
        setData(dashboardData)
      }
    } catch (error) {
      console.error('대시보드 데이터 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    // 30초마다 자동 새로고침
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    })
  }

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return '방금 전'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}분 전`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}시간 전`
    const days = Math.floor(hours / 24)
    return `${days}일 전`
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
        <span className="text-3xl sm:text-4xl">🛒</span>
        <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
          간식 허브
        </span>
      </h1>

      {/* 전체 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-100 font-medium">총 간식 수</p>
              <p className="text-4xl font-bold text-white mt-2">{data.totalSnacks}개</p>
            </div>
            <div className="text-5xl opacity-80">🍪</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-accent-100 font-medium">총 투표 수</p>
              <p className="text-4xl font-bold text-white mt-2">{data.totalVotes}표</p>
            </div>
            <div className="text-5xl opacity-80">👍</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cream-500 to-cream-600 rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-cream-100 font-medium">총 주문 횟수</p>
              <p className="text-4xl font-bold text-white mt-2">{data.totalOrders}회</p>
            </div>
            <div className="text-5xl opacity-80">📦</div>
          </div>
        </div>
      </div>

      {/* 현재 주문 현황 */}
      <div className="mb-6">
        <OrderStatusBlock />
      </div>

      {/* 이번 주 조르기 목록 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>📝</span>
            이번 주 조르기 목록
          </div>
          {data.weeklyProposedSnacksCount > 0 && (
            <span className="text-sm text-gray-500">
              총 {data.weeklyProposedSnacksCount}개
            </span>
          )}
        </h2>
        {data.weeklyProposedSnacks.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">이번 주에 조른 간식이 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {data.weeklyProposedSnacks
                .slice((weeklySnacksPage - 1) * ITEMS_PER_PAGE, weeklySnacksPage * ITEMS_PER_PAGE)
                .map((snack) => (
                  <div
                    key={snack.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{snack.name}</p>
                        {snack.category && (
                          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                            {snack.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        {snack.proposedBy && (
                          <span className="text-xs text-gray-500">
                            by {snack.proposedBy}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {getTimeAgo(snack.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">👍</span>
                      <span className="font-semibold text-primary-600">
                        {snack._count.votes}
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            {/* 페이징 버튼 */}
            {data.weeklyProposedSnacksCount > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => setWeeklySnacksPage(prev => Math.max(1, prev - 1))}
                  disabled={weeklySnacksPage === 1}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  이전
                </button>
                <span className="text-sm text-gray-600">
                  {weeklySnacksPage} / {Math.ceil(data.weeklyProposedSnacksCount / ITEMS_PER_PAGE)}
                </span>
                <button
                  onClick={() => setWeeklySnacksPage(prev => Math.min(Math.ceil(data.weeklyProposedSnacksCount / ITEMS_PER_PAGE), prev + 1))}
                  disabled={weeklySnacksPage >= Math.ceil(data.weeklyProposedSnacksCount / ITEMS_PER_PAGE)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 오늘의 추천 간식 */}
      <div className="mb-6">
        <RecommendedSnacks />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 이번 주 인기 간식 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            인기 간식 Top 5
          </h2>
          {data.topSnacks.length === 0 ? (
            <p className="text-gray-500 text-sm">
              아직 투표된 간식이 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {data.topSnacks.map((snack, index) => (
                <div
                  key={snack.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-400">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{snack.name}</p>
                      {snack.category && (
                        <span className="text-xs text-gray-500">{snack.category}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-lg">👍</span>
                    <span className="font-semibold text-primary-600">
                      {snack._count.votes}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 트렌딩 간식 */}
        <TrendingSnacks initialSnacks={data.trendingSnacks} />
      </div>

      {/* 추가 정보 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* 역대 인기 간식 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>🏆</span>
            역대 인기 간식
          </h2>
          {data.allTimeTopSnacks.length === 0 ? (
            <p className="text-gray-500 text-sm">주문 이력이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {data.allTimeTopSnacks.map((snack, index) => (
                <div key={snack.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-cream-100 to-primary-50 rounded-lg border border-cream-300">
                  <span className="text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{snack.name}</p>
                    <p className="text-xs text-gray-600">
                      {snack._count.orderItems}번 주문됨
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 카테고리별 분포 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>📊</span>
            카테고리 분포
          </h2>
          {data.categoryData.length === 0 ? (
            <p className="text-gray-500 text-sm">카테고리가 등록된 간식이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {data.categoryData.slice(0, 5).map((category, index) => (
                <div key={category.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    <span className="text-sm text-gray-500">{category.count}개</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all"
                      style={{
                        width: `${category.percentage}%`,
                        backgroundColor: [
                          '#f59e0b',
                          '#ec4899',
                          '#8b5cf6',
                          '#3b82f6',
                          '#10b981'
                        ][index % 5]
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {category.percentage}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 다가오는 이벤트 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>📅</span>
            다가오는 일정
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 font-medium mb-1">다음 주문일</p>
              <p className="text-lg font-bold text-blue-900">{formatDate(data.nextOrderDate)}</p>
              <p className="text-xs text-blue-600 mt-1">매주 월요일 오전 9시</p>
            </div>

            {data.monthlyMVP && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-700 font-medium mb-2">🌟 이달의 MVP</p>
                <p className="font-bold text-purple-900">{data.monthlyMVP.name}</p>
                <p className="text-xs text-purple-600 mt-1">
                  {data.monthlyMVP._count.votes}표 획득
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 최근 활동 피드 */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span>📰</span>
          최근 활동
        </h2>
        <div className="space-y-2">
          {data.recentVotes.slice(0, 5).map((vote) => (
            <div key={vote.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <span className="text-xl">👍</span>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  {vote.voterName || '익명'}님이 <span className="font-medium">{vote.snack.name}</span>에 투표했습니다
                </p>
                <p className="text-xs text-gray-500">{getTimeAgo(vote.createdAt)}</p>
              </div>
            </div>
          ))}
          {data.recentProposals.slice(0, 3).map((snack) => (
            <div key={snack.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <span className="text-xl">📝</span>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{snack.name}</span>이(가) 제안되었습니다
                </p>
                <p className="text-xs text-gray-500">{getTimeAgo(snack.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
