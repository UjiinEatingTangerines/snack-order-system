'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Comment = {
  id: string
  content: string
  authorName: string
  createdAt: Date
  replies?: Comment[]
}

type Suggestion = {
  id: string
  title: string
  content: string
  authorName: string
  createdAt: Date
  comments: Comment[]
}

export default function SuggestionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null)
  const [loading, setLoading] = useState(true)
  const [commentContent, setCommentContent] = useState('')
  const [commentAuthor, setCommentAuthor] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)
  const [deletingSuggestion, setDeletingSuggestion] = useState(false)

  useEffect(() => {
    fetchSuggestion()
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/auth/check')
      const data = await response.json()
      setIsAdmin(data.isAdmin)
    } catch (error) {
      console.error('권한 확인 오류:', error)
    }
  }

  const fetchSuggestion = async () => {
    try {
      const resolvedParams = await Promise.resolve(params)
      const response = await fetch(`/api/suggestions/${resolvedParams.id}`)
      const data = await response.json()
      setSuggestion(data)
    } catch (error) {
      console.error('제안 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent, parentCommentId: string | null = null) => {
    e.preventDefault()

    if (!commentContent || !commentAuthor) {
      alert('내용과 이름을 입력해주세요.')
      return
    }

    setSubmitting(true)

    try {
      const resolvedParams = await Promise.resolve(params)
      const response = await fetch(`/api/suggestions/${resolvedParams.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: commentContent,
          authorName: commentAuthor,
          parentCommentId
        })
      })

      if (response.ok) {
        setCommentContent('')
        setCommentAuthor('')
        setReplyingTo(null)
        fetchSuggestion()
      } else {
        const error = await response.json()
        alert(`오류: ${error.message}`)
      }
    } catch (error) {
      alert('댓글 작성 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSuggestion = async () => {
    if (!confirm('이 상소문을 정말 삭제하시겠습니까?')) {
      return
    }

    setDeletingSuggestion(true)

    try {
      const resolvedParams = await Promise.resolve(params)
      const response = await fetch(`/api/suggestions/${resolvedParams.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('상소문이 삭제되었습니다.')
        router.push('/suggestions')
      } else {
        const error = await response.json()
        alert(`오류: ${error.message}`)
      }
    } catch (error) {
      alert('상소문 삭제 중 오류가 발생했습니다.')
    } finally {
      setDeletingSuggestion(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('이 댓글을 정말 삭제하시겠습니까?')) {
      return
    }

    setDeletingCommentId(commentId)

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('댓글이 삭제되었습니다.')
        fetchSuggestion()
      } else {
        const error = await response.json()
        alert(`오류: ${error.message}`)
      }
    } catch (error) {
      alert('댓글 삭제 중 오류가 발생했습니다.')
    } finally {
      setDeletingCommentId(null)
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

  const renderComment = (comment: Comment, depth: number = 0) => {
    const marginLeft = depth > 0 ? `${depth * 2}rem` : '0'

    return (
      <div key={comment.id} style={{ marginLeft }} className="mb-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-900">{comment.authorName}</span>
            <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
          </div>
          <p className="text-gray-700 mb-2">{comment.content}</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setReplyingTo(comment.id)
                setCommentContent('')
                setCommentAuthor('')
              }}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              💬 답글 달기
            </button>
            {isAdmin && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                disabled={deletingCommentId === comment.id}
                className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                {deletingCommentId === comment.id ? '삭제 중...' : '🗑️ 삭제'}
              </button>
            )}
          </div>

          {replyingTo === comment.id && (
            <form onSubmit={(e) => handleCommentSubmit(e, comment.id)} className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
              <input
                type="text"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="이름"
                required
              />
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="답글을 입력하세요"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 transition-colors text-sm"
                >
                  {submitting ? '작성 중...' : '답글 달기'}
                </button>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
                >
                  취소
                </button>
              </div>
            </form>
          )}
        </div>

        {comment.replies && comment.replies.map(reply => renderComment(reply, depth + 1))}
      </div>
    )
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

  if (!suggestion) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">제안을 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => router.push('/suggestions')}
        className="mb-6 text-primary-600 hover:text-primary-700 flex items-center gap-2"
      >
        ← 목록으로
      </button>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex-1">
            {suggestion.title}
          </h1>
          {isAdmin && (
            <button
              onClick={handleDeleteSuggestion}
              disabled={deletingSuggestion}
              className="ml-4 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
            >
              {deletingSuggestion ? '삭제 중...' : '🗑️ 삭제'}
            </button>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
          <span>✍️ {suggestion.authorName}</span>
          <span>{formatDate(suggestion.createdAt)}</span>
        </div>
        <p className="text-gray-700 whitespace-pre-wrap">{suggestion.content}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          💬 댓글 {suggestion.comments.length}개
        </h2>

        {/* 댓글 작성 폼 */}
        {replyingTo === null && (
          <form onSubmit={(e) => handleCommentSubmit(e)} className="mb-6 bg-gray-50 p-4 rounded-lg">
            <input
              type="text"
              value={commentAuthor}
              onChange={(e) => setCommentAuthor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="이름"
              required
            />
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="댓글을 입력하세요"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 transition-colors"
            >
              {submitting ? '작성 중...' : '댓글 달기'}
            </button>
          </form>
        )}

        {/* 댓글 목록 */}
        <div>
          {suggestion.comments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">아직 댓글이 없습니다.</p>
          ) : (
            suggestion.comments.map(comment => renderComment(comment))
          )}
        </div>
      </div>
    </div>
  )
}
