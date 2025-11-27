'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminAnnouncePage() {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [currentAnnouncement, setCurrentAnnouncement] = useState<any>(null)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/auth/check')
        const data = await response.json()
        if (!data.isAdmin) {
          router.push('/')
        } else {
          setIsAdmin(true)
          // 현재 공지사항 불러오기
          fetchCurrentAnnouncement()
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

  const fetchCurrentAnnouncement = async () => {
    try {
      const response = await fetch('/api/announcements')
      const data = await response.json()
      if (data && data.message) {
        setCurrentAnnouncement(data)
      }
    } catch (error) {
      console.error('공지사항 불러오기 오류:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) {
      alert('메시지를 입력해주세요')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() })
      })

      if (response.ok) {
        alert('외치기가 성공적으로 등록되었습니다!')
        setMessage('')
        fetchCurrentAnnouncement()
      } else {
        const data = await response.json()
        alert(data.error || '외치기 등록에 실패했습니다')
      }
    } catch (error) {
      alert('외치기 등록 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('현재 공지사항을 삭제하시겠습니까?')) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/announcements', {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('공지사항이 삭제되었습니다')
        setCurrentAnnouncement(null)
      } else {
        const data = await response.json()
        alert(data.error || '삭제에 실패했습니다')
      }
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

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
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📢 외치기</h1>
        <p className="text-gray-600">메인 페이지 상단에 공지사항을 띄울 수 있습니다</p>
      </div>

      {/* 현재 공지사항 */}
      {currentAnnouncement && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-orange-600 font-medium mb-1">현재 공지사항</p>
              <p className="text-gray-900">{currentAnnouncement.message}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(currentAnnouncement.createdAt).toLocaleString('ko-KR')}
              </p>
            </div>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded text-sm font-medium transition-colors disabled:opacity-50"
            >
              삭제
            </button>
          </div>
        </div>
      )}

      {/* 외치기 작성 폼 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              공지 메시지
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="모두에게 전달할 메시지를 입력하세요..."
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500 mt-1">
              {message.length}자 (권장: 50자 이내)
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading || !message.trim()}
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? '등록 중...' : '외치기 등록'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
            >
              취소
            </button>
          </div>
        </form>
      </div>

      {/* 안내 */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>안내:</strong> 새로운 외치기를 등록하면 기존 공지사항은 자동으로 사라집니다.
          한 번에 하나의 공지사항만 표시됩니다.
        </p>
      </div>
    </div>
  )
}
