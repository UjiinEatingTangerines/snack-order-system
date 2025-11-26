'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

type Snack = {
  id: string
  name: string
  url: string
  imageUrl: string | null
  category: string | null
  proposedBy: string | null
  createdAt: Date
  _count: {
    votes: number
  }
}

export default function SnackList({ initialSnacks }: { initialSnacks: Snack[] }) {
  const [snacks, setSnacks] = useState(initialSnacks)
  const [filter, setFilter] = useState<string>('all')
  const [votingSnackId, setVotingSnackId] = useState<string | null>(null)
  const [votedSnacks, setVotedSnacks] = useState<Set<string>>(new Set())

  // 로컬스토리지에서 투표 이력 불러오기
  useEffect(() => {
    const voted = localStorage.getItem('votedSnacks')
    if (voted) {
      setVotedSnacks(new Set(JSON.parse(voted)))
    }
  }, [])

  const handleVote = async (snackId: string) => {
    // 이미 투표한 간식인지 확인
    if (votedSnacks.has(snackId)) {
      alert('이미 투표한 간식입니다.')
      return
    }

    setVotingSnackId(snackId)

    try {
      const response = await fetch(`/api/snacks/${snackId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterName: null }) // 익명 투표
      })

      if (response.ok) {
        const { voteCount } = await response.json()

        // 로컬 상태 업데이트
        setSnacks(snacks.map(s =>
          s.id === snackId
            ? { ...s, _count: { votes: voteCount } }
            : s
        ))

        // 투표한 간식 기록
        const newVotedSnacks = new Set(votedSnacks)
        newVotedSnacks.add(snackId)
        setVotedSnacks(newVotedSnacks)
        localStorage.setItem('votedSnacks', JSON.stringify(Array.from(newVotedSnacks)))
      } else {
        alert('투표 중 오류가 발생했습니다.')
      }
    } catch (error) {
      alert('투표 중 오류가 발생했습니다.')
    } finally {
      setVotingSnackId(null)
    }
  }

  const filteredSnacks = filter === 'all'
    ? snacks
    : snacks.filter(s => s.category === filter)

  const categories = Array.from(new Set(snacks.map(s => s.category).filter(Boolean)))

  return (
    <div>
      {/* 필터 */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          전체
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat!)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === cat
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 간식 카드 */}
      {filteredSnacks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">
            아직 제안된 간식이 없습니다.
          </p>
          <a
            href="/propose"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors"
          >
            첫 간식 제안하기
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSnacks.map((snack) => (
            <div
              key={snack.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
            >
              {/* 이미지 */}
              {snack.imageUrl ? (
                <div className="h-48 bg-gray-200 relative">
                  <img
                    src={snack.imageUrl}
                    alt={snack.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  <span className="text-6xl">🍪</span>
                </div>
              )}

              {/* 내용 */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">
                    {snack.name}
                  </h3>
                  {snack.category && (
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full whitespace-nowrap flex-shrink-0">
                      {snack.category}
                    </span>
                  )}
                </div>

                {snack.proposedBy && (
                  <p className="text-sm text-gray-600 mb-3">
                    제안: {snack.proposedBy}
                  </p>
                )}

                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleVote(snack.id)}
                    disabled={votingSnackId === snack.id || votedSnacks.has(snack.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      votedSnacks.has(snack.id)
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-orange-50 hover:bg-primary-100 text-primary-700'
                    } disabled:opacity-50`}
                  >
                    <span className="text-xl">{votedSnacks.has(snack.id) ? '✓' : '👍'}</span>
                    <span className="text-sm font-medium">
                      {snack._count.votes}
                    </span>
                  </button>

                  <a
                    href={snack.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-orange-700 font-medium flex-1 text-right"
                  >
                    구매 링크 →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
