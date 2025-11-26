'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Snack = {
  id: string
  name: string
  category: string | null
  proposer: string | null
  createdAt: string
  _count: {
    votes: number
  }
}

export default function MySnacksPage() {
  const [mySnacks, setMySnacks] = useState<Snack[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const router = useRouter()

  useEffect(() => {
    // localStorage에서 사용자 이름 가져오기
    const savedName = localStorage.getItem('userName')
    if (!savedName) {
      // 이름이 없으면 입력 받기
      const name = prompt('이름을 입력해주세요:')
      if (name) {
        localStorage.setItem('userName', name.trim())
        setUserName(name.trim())
      } else {
        router.push('/')
        return
      }
    } else {
      setUserName(savedName)
    }
  }, [router])

  useEffect(() => {
    if (userName) {
      fetchMySnacks()
    }
  }, [userName])

  const fetchMySnacks = async () => {
    try {
      const response = await fetch(`/api/my-snacks?proposer=${encodeURIComponent(userName)}`)
      if (response.ok) {
        const data = await response.json()
        setMySnacks(data)
      }
    } catch (error) {
      console.error('내 간식 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return '방금 전'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}분 전`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}시간 전`
    const days = Math.floor(hours / 24)
    return `${days}일 전`
  }

  const handleChangeName = () => {
    const newName = prompt('새 이름을 입력해주세요:', userName)
    if (newName && newName.trim()) {
      localStorage.setItem('userName', newName.trim())
      setUserName(newName.trim())
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-3xl sm:text-4xl">📝</span>
            내가 제안한 간식
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            {userName}님이 제안한 간식 목록입니다
          </p>
        </div>
        <button
          onClick={handleChangeName}
          className="text-sm text-primary-600 hover:text-primary-700 underline"
        >
          이름 변경
        </button>
      </div>

      {mySnacks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <span className="text-6xl mb-4 block">🍪</span>
          <p className="text-gray-600 mb-4">아직 제안한 간식이 없습니다.</p>
          <a
            href="/propose"
            className="inline-block bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-2 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all"
          >
            간식 제안하기
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mySnacks.map((snack) => (
            <div
              key={snack.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800 flex-1">
                  {snack.name}
                </h3>
                <span className="text-2xl">🍪</span>
              </div>

              {snack.category && (
                <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs rounded-full mb-3">
                  {snack.category}
                </span>
              )}

              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <span>👍</span>
                  <span className="font-semibold">{snack._count.votes}표</span>
                </div>
                <span className="text-xs">{getTimeAgo(snack.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
