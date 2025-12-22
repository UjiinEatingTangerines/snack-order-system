'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Vote {
  id: string
  snackId: string
  voterName: string | null
  createdAt: string
  snack: {
    name: string
    imageUrl: string | null
    url: string
  }
}

interface TopSnack {
  snack: {
    id: string
    name: string
    imageUrl: string | null
  } | null
  voteCount: number
}

interface VotesData {
  votes: Vote[]
  totalVotes: number
  topSnacks: TopSnack[]
}

export default function AdminVotesPage() {
  const router = useRouter()
  const [votesData, setVotesData] = useState<VotesData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [selectedSnack, setSelectedSnack] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<string>('desc')

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/auth/check')
        const data = await response.json()
        if (!data.isAdmin) {
          router.push('/')
        } else {
          setIsAdmin(true)
          fetchVotes()
        }
      } catch (error) {
        console.error('권한 확인 오류:', error)
        router.push('/')
      } finally {
        setCheckingAuth(false)
      }
    }
    checkAdmin()
  }, [router])

  const fetchVotes = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        sortBy,
        sortOrder,
        ...(selectedSnack && { snackId: selectedSnack }),
      })

      const response = await fetch(`/api/admin/votes?${params}`)
      if (response.ok) {
        const data = await response.json()
        setVotesData(data)
      } else {
        console.error('투표 내역을 불러올 수 없습니다')
      }
    } catch (error) {
      console.error('투표 내역 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchVotes()
    }
  }, [selectedSnack, sortBy, sortOrder, isAdmin])

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">권한 확인 중...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">투표 내역 관리</h1>
            <p className="text-gray-600">간식 투표 현황과 통계를 확인할 수 있습니다</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            홈으로
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      {votesData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 총 투표 수 */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">총 투표 수</p>
                <p className="text-3xl font-bold">{votesData.totalVotes.toLocaleString()}</p>
              </div>
              <div className="text-5xl opacity-20">📊</div>
            </div>
          </div>

          {/* 참여 간식 수 */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">투표된 간식 수</p>
                <p className="text-3xl font-bold">{votesData.topSnacks.length}</p>
              </div>
              <div className="text-5xl opacity-20">🍿</div>
            </div>
          </div>

          {/* 인기 간식 */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium mb-1">1위 간식</p>
                <p className="text-xl font-bold truncate">
                  {votesData.topSnacks[0]?.snack?.name || 'N/A'}
                </p>
                <p className="text-sm text-orange-100">
                  {votesData.topSnacks[0]?.voteCount || 0}표
                </p>
              </div>
              <div className="text-5xl opacity-20">🏆</div>
            </div>
          </div>
        </div>
      )}

      {/* 인기 간식 TOP 10 */}
      {votesData && votesData.topSnacks.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">인기 간식 TOP 10</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {votesData.topSnacks.map((item, index) => (
              <div
                key={item.snack?.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-primary-500 transition-colors cursor-pointer"
                onClick={() => setSelectedSnack(item.snack?.id || '')}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-primary-600">#{index + 1}</span>
                  <span className="text-lg">👍 {item.voteCount}</span>
                </div>
                {item.snack?.imageUrl && (
                  <div className="w-full h-20 mb-2 rounded overflow-hidden">
                    <img
                      src={item.snack.imageUrl}
                      alt={item.snack.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.snack?.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 필터 및 정렬 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 간식 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              간식 필터
            </label>
            <select
              value={selectedSnack}
              onChange={(e) => setSelectedSnack(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">전체 간식</option>
              {votesData?.topSnacks.map((item) => (
                <option key={item.snack?.id} value={item.snack?.id || ''}>
                  {item.snack?.name} ({item.voteCount}표)
                </option>
              ))}
            </select>
          </div>

          {/* 정렬 기준 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              정렬 기준
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="createdAt">투표 시각</option>
              <option value="snackId">간식별</option>
            </select>
          </div>

          {/* 정렬 순서 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              정렬 순서
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="desc">최신순</option>
              <option value="asc">오래된순</option>
            </select>
          </div>
        </div>

        {selectedSnack && (
          <button
            onClick={() => setSelectedSnack('')}
            className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            필터 초기화
          </button>
        )}
      </div>

      {/* 투표 내역 테이블 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            투표 내역 {votesData && `(${votesData.votes.length}개)`}
          </h2>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">투표 내역을 불러오는 중...</p>
          </div>
        ) : votesData && votesData.votes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    투표 ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    간식
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    투표자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    투표 시각
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {votesData.votes.map((vote) => (
                  <tr key={vote.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {vote.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {vote.snack.imageUrl && (
                          <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={vote.snack.imageUrl}
                              alt={vote.snack.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {vote.snack.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vote.voterName || '익명'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(vote.createdAt).toLocaleString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <a
                        href={vote.snack.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        상품 보기
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500">투표 내역이 없습니다</p>
          </div>
        )}
      </div>

      {/* 안내 */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>안내:</strong> 투표 내역은 최대 100개까지 표시됩니다.
          데이터베이스에서 전체 내역을 확인하려면 Prisma Studio를 사용하세요.
        </p>
      </div>
    </div>
  )
}
