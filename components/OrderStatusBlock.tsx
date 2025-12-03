'use client'

import { useState, useEffect } from 'react'

type OrderedSnack = {
  name: string
  quantity: number
  orderDate: Date
}

export default function OrderStatusBlock() {
  const [orderCount, setOrderCount] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const [orderedSnacks, setOrderedSnacks] = useState<OrderedSnack[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [resetting, setResetting] = useState(false)

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/auth/check')
      const data = await response.json()
      setIsAdmin(data.isAdmin)
    } catch (error) {
      console.error('권한 확인 오류:', error)
    }
  }

  const fetchWeeklyTotal = async () => {
    try {
      const response = await fetch('/api/weekly-total')
      if (response.ok) {
        const data = await response.json()
        setOrderCount(data.orderCount)
        setTotalCost(data.totalCost)
        setOrderedSnacks(data.orderedSnacks || [])
      }
    } catch (error) {
      console.error('주간 주문 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWeeklyReset = async () => {
    if (!confirm('이번 주 데이터를 모두 리셋하시겠습니까?\n\n리셋 내용:\n- 이번 주 생성된 간식 삭제\n- 이번 주 생성된 투표 삭제\n\n주문 이력은 유지됩니다.')) {
      return
    }

    setResetting(true)

    try {
      const response = await fetch('/api/reset-weekly', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        alert(`주간 리셋 완료!\n\n완료된 주문: ${data.completedOrdersCount}개\n삭제된 간식: ${data.deletedSnacksCount}개\n삭제된 투표: ${data.deletedVotesCount}개`)
        fetchWeeklyTotal()
        // 페이지 새로고침으로 대시보드 전체 데이터 갱신
        window.location.reload()
      } else {
        const error = await response.json()
        alert(`오류: ${error.message}`)
      }
    } catch (error) {
      alert('주간 리셋 중 오류가 발생했습니다.')
    } finally {
      setResetting(false)
    }
  }

  useEffect(() => {
    checkAdminStatus()
    fetchWeeklyTotal()
    const interval = setInterval(fetchWeeklyTotal, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span>📊</span>
          <span>현재 주문 현황</span>
        </h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  // 주문된 간식이 없으면 컴포넌트를 렌더링하지 않음
  if (orderedSnacks.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
          <span>📊</span>
          <span>현재 주문 현황</span>
        </h2>
        {isAdmin && (
          <button
            onClick={handleWeeklyReset}
            disabled={resetting}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors text-sm font-medium"
          >
            {resetting ? '처리 중...' : '✅ 주문 완료'}
          </button>
        )}
      </div>

      {/* 주문된 간식 목록 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {orderedSnacks.map((snack, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-lg px-4 py-3 flex items-center justify-between border border-gray-200 hover:shadow-md transition-shadow"
          >
            <span className="text-sm font-medium text-gray-800 truncate flex-1">
              {snack.name}
            </span>
            <span className="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-full ml-2 font-semibold">
              {snack.quantity}개
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
