'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

type Snack = {
  id: string
  name: string
  url: string
  imageUrl: string | null
  category: string | null
  price: number | null
  proposedBy: string | null
  createdAt: Date
  _count: {
    votes: number
  }
}

export default function SnackList({ initialSnacks }: { initialSnacks: Snack[] }) {
  const [snacks, setSnacks] = useState(initialSnacks)
  const [filter, setFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'popular'>('latest')
  const [votingSnackId, setVotingSnackId] = useState<string | null>(null)
  const [votedSnacks, setVotedSnacks] = useState<Set<string>>(new Set())
  const [isAdmin, setIsAdmin] = useState(false)
  const [deletingSnackId, setDeletingSnackId] = useState<string | null>(null)
  const [editingSnack, setEditingSnack] = useState<Snack | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    url: '',
    imageUrl: '',
    category: '',
    price: '',
    proposedBy: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 쿠키에서 투표 이력 불러오기
  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift()
      }
      return null
    }

    const votedSnacksCookie = getCookie('voted_snacks')
    if (votedSnacksCookie) {
      try {
        const voted = JSON.parse(decodeURIComponent(votedSnacksCookie))
        setVotedSnacks(new Set(voted))
      } catch (error) {
        console.error('쿠키 파싱 오류:', error)
      }
    }
  }, [])

  // 어드민 권한 확인
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/auth/check')
        const data = await response.json()
        setIsAdmin(data.isAdmin)
      } catch (error) {
        console.error('권한 확인 오류:', error)
      }
    }
    checkAdmin()
  }, [])

  const handleVote = async (snackId: string) => {
    // 이미 투표한 간식인지 확인 (클라이언트 측 빠른 체크)
    if (votedSnacks.has(snackId)) {
      alert('이미 투표한 간식입니다.')
      return
    }

    // 투표자 이름 입력 받기
    const voterName = prompt('투표자 이름을 입력해주세요 (선택사항, 취소하면 익명으로 투표됩니다):')

    // 사용자가 취소를 누르면 투표를 진행하지 않음
    if (voterName === null) {
      return
    }

    setVotingSnackId(snackId)

    try {
      const response = await fetch(`/api/snacks/${snackId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterName: voterName.trim() || null })
      })

      if (response.ok) {
        const { voteCount } = await response.json()

        // 로컬 상태 업데이트
        setSnacks(snacks.map(s =>
          s.id === snackId
            ? { ...s, _count: { votes: voteCount } }
            : s
        ))

        // 투표한 간식 기록 (쿠키에서 다시 읽어오기)
        const newVotedSnacks = new Set(votedSnacks)
        newVotedSnacks.add(snackId)
        setVotedSnacks(newVotedSnacks)

        // 투표 완료 메시지
        const voterNameDisplay = voterName.trim() || '익명'
        alert(`✅ ${voterNameDisplay}님의 투표가 완료되었습니다!`)
      } else {
        const data = await response.json()
        alert(data.error || '투표 중 오류가 발생했습니다.')

        // 서버에서 이미 투표했다고 하면 로컬 상태도 업데이트
        if (response.status === 403) {
          const newVotedSnacks = new Set(votedSnacks)
          newVotedSnacks.add(snackId)
          setVotedSnacks(newVotedSnacks)
        }
      }
    } catch (error) {
      alert('투표 중 오류가 발생했습니다.')
    } finally {
      setVotingSnackId(null)
    }
  }

  const handleEdit = (snack: Snack) => {
    setEditingSnack(snack)
    setEditForm({
      name: snack.name,
      url: snack.url,
      imageUrl: snack.imageUrl || '',
      category: snack.category || '',
      price: snack.price?.toString() || '',
      proposedBy: snack.proposedBy || ''
    })
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSnack) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/snacks/${editingSnack.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        const updatedSnack = await response.json()
        // 로컬 상태 업데이트
        setSnacks(snacks.map(s =>
          s.id === updatedSnack.id ? updatedSnack : s
        ))
        setEditingSnack(null)
        alert('간식 정보가 수정되었습니다.')
      } else {
        const data = await response.json()
        alert(data.error || '수정 중 오류가 발생했습니다.')
      }
    } catch (error) {
      alert('수정 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (snackId: string, snackName: string) => {
    if (!confirm(`"${snackName}" 간식을 정말 삭제하시겠습니까?`)) {
      return
    }

    setDeletingSnackId(snackId)

    try {
      const response = await fetch(`/api/snacks/${snackId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // 로컬 상태에서 삭제
        setSnacks(snacks.filter(s => s.id !== snackId))
        alert('간식이 삭제되었습니다.')
      } else {
        const data = await response.json()
        alert(data.error || '삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setDeletingSnackId(null)
    }
  }

  // 필터링
  const filteredSnacks = filter === 'all'
    ? snacks
    : snacks.filter(s => s.category === filter)

  // 정렬
  const sortedSnacks = [...filteredSnacks].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'popular':
        return b._count.votes - a._count.votes
      default:
        return 0
    }
  })

  const categories = Array.from(new Set(snacks.map(s => s.category).filter(Boolean)))

  return (
    <div>
      {/* 필터 및 정렬 */}
      <div className="mb-6 space-y-4">
        {/* 카테고리 필터 */}
        <div className="flex gap-2 flex-wrap">
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

        {/* 정렬 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">정렬:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'latest' | 'oldest' | 'popular')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="popular">인기순</option>
          </select>
        </div>
      </div>

      {/* 간식 카드 */}
      {sortedSnacks.length === 0 ? (
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
          {sortedSnacks.map((snack) => (
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

                {/* 어드민 전용 수정/삭제 버튼 */}
                {isAdmin && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                    <button
                      onClick={() => handleEdit(snack)}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors"
                    >
                      ✏️ 수정
                    </button>
                    <button
                      onClick={() => handleDelete(snack.id, snack.name)}
                      disabled={deletingSnackId === snack.id}
                      className="flex-1 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingSnackId === snack.id ? '삭제 중...' : '🗑️ 삭제'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 수정 모달 */}
      {editingSnack && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">간식 정보 수정</h2>
                <button
                  onClick={() => setEditingSnack(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    간식 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    구매 링크 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={editForm.url}
                    onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이미지 URL
                  </label>
                  <input
                    type="url"
                    value={editForm.imageUrl}
                    onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    카테고리
                  </label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="예: 과자, 초콜릿, 음료 등"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    가격 (원)
                  </label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="예: 5000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    제안자
                  </label>
                  <input
                    type="text"
                    value={editForm.proposedBy}
                    onChange={(e) => setEditForm({ ...editForm, proposedBy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingSnack(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '저장 중...' : '저장'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
