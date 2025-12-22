'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Snack {
  id: string
  name: string
  imageUrl: string | null
  category: string | null
  proposedBy?: string | null
  _count?: {
    votes: number
  }
}

interface Vote {
  id: string
  voterName: string | null
  createdAt: string
  snack: Snack
}

interface ProposerStat {
  proposedBy: string | null
  snackCount: number
  snacks: Snack[]
  totalVotes: number
}

interface VoterStat {
  voterName: string
  voteCount: number
  votes: Vote[]
}

interface SnackWithVoters {
  id: string
  name: string
  imageUrl: string | null
  category: string | null
  proposedBy: string | null
  votes: {
    id: string
    voterName: string | null
    createdAt: string
  }[]
  _count: {
    votes: number
  }
}

interface ActivityData {
  proposerStats: ProposerStat[]
  voterStats: VoterStat[]
  snacksWithVoters: SnackWithVoters[]
  summary: {
    totalSnacks: number
    totalVotes: number
    totalProposers: number
    totalVoters: number
    namedVoters: number
    anonymousVoters: number
  }
}

export default function UserActivityPage() {
  const router = useRouter()
  const [data, setData] = useState<ActivityData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'proposers' | 'voters' | 'snacks'>('proposers')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  useEffect(() => {
    fetchActivity()
  }, [])

  const fetchActivity = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/users/activity')
      if (response.ok) {
        const activityData = await response.json()
        setData(activityData)
      } else {
        console.error('사용자 활동 통계를 불러올 수 없습니다')
      }
    } catch (error) {
      console.error('사용자 활동 통계 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">사용자 활동을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">사용자 활동 통계를 불러올 수 없습니다</p>
      </div>
    )
  }

  const selectedProposer = selectedUser && activeTab === 'proposers'
    ? data.proposerStats.find(p => p.proposedBy === selectedUser)
    : null

  const selectedVoter = selectedUser && activeTab === 'voters'
    ? data.voterStats.find(v => v.voterName === selectedUser)
    : null

  const selectedSnack = selectedUser && activeTab === 'snacks'
    ? data.snacksWithVoters.find(s => s.id === selectedUser)
    : null

  return (
    <div className="max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">👥 사용자 활동 분석</h1>
            <p className="text-gray-600">누가 간식을 제안하고 투표했는지 확인하세요</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            홈으로
          </button>
        </div>
      </div>

      {/* 전체 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-600 font-medium mb-1">총 간식</p>
          <p className="text-2xl font-bold text-blue-900">{data.summary.totalSnacks}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-600 font-medium mb-1">총 투표</p>
          <p className="text-2xl font-bold text-green-900">{data.summary.totalVotes}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-purple-600 font-medium mb-1">제안자</p>
          <p className="text-2xl font-bold text-purple-900">{data.summary.totalProposers}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <p className="text-sm text-orange-600 font-medium mb-1">투표자</p>
          <p className="text-2xl font-bold text-orange-900">{data.summary.totalVoters}</p>
        </div>
        <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
          <p className="text-sm text-pink-600 font-medium mb-1">실명 투표</p>
          <p className="text-2xl font-bold text-pink-900">{data.summary.namedVoters}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 font-medium mb-1">익명 투표</p>
          <p className="text-2xl font-bold text-gray-900">{data.summary.anonymousVoters}</p>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b">
          <button
            onClick={() => { setActiveTab('proposers'); setSelectedUser(null); }}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'proposers'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🍪 간식 제안 순위
          </button>
          <button
            onClick={() => { setActiveTab('voters'); setSelectedUser(null); }}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'voters'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            👍 투표 참여 순위
          </button>
          <button
            onClick={() => { setActiveTab('snacks'); setSelectedUser(null); }}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'snacks'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 간식별 투표자
          </button>
        </div>

        <div className="p-6">
          {/* 간식 제안 순위 */}
          {activeTab === 'proposers' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 순위 리스트 */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">간식 조르기 순위</h2>
                <div className="space-y-3">
                  {data.proposerStats.map((stat, index) => (
                    <div
                      key={stat.proposedBy}
                      onClick={() => setSelectedUser(stat.proposedBy)}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedUser === stat.proposedBy
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-primary-600">#{index + 1}</span>
                          <div>
                            <p className="font-semibold text-gray-900">{stat.proposedBy}</p>
                            <p className="text-sm text-gray-600">
                              간식 {stat.snackCount}개 • 총 투표 {stat.totalVotes}표
                            </p>
                          </div>
                        </div>
                        <span className="text-2xl">🍪</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 상세 정보 */}
              <div>
                {selectedProposer ? (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      {selectedProposer.proposedBy}님이 제안한 간식
                    </h2>
                    <div className="space-y-3">
                      {selectedProposer.snacks.map((snack) => (
                        <div key={snack.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          {snack.imageUrl && (
                            <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                              <img
                                src={snack.imageUrl}
                                alt={snack.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{snack.name}</p>
                            {snack.category && (
                              <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full mt-1">
                                {snack.category}
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary-600">
                              {snack._count?.votes || 0}
                            </p>
                            <p className="text-xs text-gray-600">투표</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <p>제안자를 선택하세요</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 투표 참여 순위 */}
          {activeTab === 'voters' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 순위 리스트 */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">투표 참여 순위</h2>
                <div className="space-y-3">
                  {data.voterStats.map((stat, index) => (
                    <div
                      key={stat.voterName}
                      onClick={() => setSelectedUser(stat.voterName)}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedUser === stat.voterName
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-primary-600">#{index + 1}</span>
                          <div>
                            <p className="font-semibold text-gray-900">{stat.voterName}</p>
                            <p className="text-sm text-gray-600">
                              투표 {stat.voteCount}개
                            </p>
                          </div>
                        </div>
                        <span className="text-2xl">👍</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 상세 정보 */}
              <div>
                {selectedVoter ? (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      {selectedVoter.voterName}님이 투표한 간식
                    </h2>
                    <div className="space-y-3">
                      {selectedVoter.votes.map((vote) => (
                        <div key={vote.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          {vote.snack.imageUrl && (
                            <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                              <img
                                src={vote.snack.imageUrl}
                                alt={vote.snack.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{vote.snack.name}</p>
                            <p className="text-xs text-gray-600">
                              제안: {vote.snack.proposedBy || '알 수 없음'}
                            </p>
                            {vote.snack.category && (
                              <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full mt-1">
                                {vote.snack.category}
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-600">
                              {new Date(vote.createdAt).toLocaleDateString('ko-KR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <p>투표자를 선택하세요</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 간식별 투표자 */}
          {activeTab === 'snacks' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 간식 리스트 */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">투표받은 간식 목록</h2>
                <div className="space-y-3">
                  {data.snacksWithVoters.map((snack, index) => (
                    <div
                      key={snack.id}
                      onClick={() => setSelectedUser(snack.id)}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedUser === snack.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {snack.imageUrl && (
                          <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={snack.imageUrl}
                              alt={snack.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{snack.name}</p>
                          <p className="text-sm text-gray-600">
                            제안: {snack.proposedBy || '알 수 없음'} • 투표 {snack._count.votes}개
                          </p>
                        </div>
                        <span className="text-2xl">📊</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 투표자 목록 */}
              <div>
                {selectedSnack ? (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      "{selectedSnack.name}"에 투표한 사람들
                    </h2>
                    <div className="space-y-2">
                      {selectedSnack.votes.map((vote) => (
                        <div key={vote.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{vote.voterName || '익명'}</p>
                            <p className="text-xs text-gray-600">
                              {new Date(vote.createdAt).toLocaleString('ko-KR')}
                            </p>
                          </div>
                          <span className="text-xl">👍</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <p>간식을 선택하세요</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
