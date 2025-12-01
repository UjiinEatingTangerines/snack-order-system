'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Suggestion = {
  id: string
  title: string
  content: string
  authorName: string
  createdAt: Date
  _count: {
    comments: number
  }
}

export default function SuggestionsPage() {
  const router = useRouter()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSuggestions()
  }, [])

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/api/suggestions')
      const data = await response.json()
      setSuggestions(data)
    } catch (error) {
      console.error('제안 목록 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          📜 상소문
        </h1>
        <button
          onClick={() => router.push('/suggestions/new')}
          className="w-full sm:w-auto text-center bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors whitespace-nowrap"
        >
          + 상소 올리기
        </button>
      </div>

      {suggestions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">
            아직 상소문이 없습니다.
          </p>
          <button
            onClick={() => router.push('/suggestions/new')}
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors"
          >
            첫 상소 올리기
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              onClick={() => router.push(`/suggestions/${suggestion.id}`)}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {suggestion.title}
              </h2>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {suggestion.content}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span>✍️ {suggestion.authorName}</span>
                  <span>💬 {suggestion._count.comments}개의 댓글</span>
                </div>
                <span>{formatDate(suggestion.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
