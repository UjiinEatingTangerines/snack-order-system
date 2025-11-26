'use client'

import { useState, useEffect } from 'react'

type OrderedSnack = {
  name: string
  quantity: number
  orderDate: Date
}

export default function WeeklyOrderBanner() {
  const [orderCount, setOrderCount] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const [orderedSnacks, setOrderedSnacks] = useState<OrderedSnack[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

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

  // 초기 로드
  useEffect(() => {
    fetchWeeklyTotal()
  }, [])

  // 30초마다 자동 새로고침
  useEffect(() => {
    const interval = setInterval(() => {
      fetchWeeklyTotal()
    }, 30000) // 30초

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white py-3 px-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <span className="text-sm">불러오는 중...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-md">
      {/* 메인 배너 */}
      <div
        className="py-4 px-4 cursor-pointer hover:bg-white/10 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-6 text-sm sm:text-base">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📦</span>
            <div className="flex flex-col items-start">
              <span className="text-xs opacity-80">이번 주</span>
              <span className="font-bold text-lg">{orderCount}건</span>
            </div>
          </div>

          <div className="h-10 w-px bg-white/30"></div>

          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <div className="flex flex-col items-start">
              <span className="text-xs opacity-80">총 금액</span>
              <span className="font-bold text-xl">{totalCost.toLocaleString()}원</span>
            </div>
          </div>

          {orderedSnacks.length > 0 && (
            <>
              <div className="h-10 w-px bg-white/30"></div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🍪</span>
                <div className="flex flex-col items-start">
                  <span className="text-xs opacity-80">간식 종류</span>
                  <span className="font-bold text-lg">{orderedSnacks.length}개</span>
                </div>
              </div>
            </>
          )}

          {orderedSnacks.length > 0 && (
            <span className="text-xs opacity-70 ml-2">
              {expanded ? '▲' : '▼'}
            </span>
          )}
        </div>
      </div>

      {/* 펼침 영역 - 주문된 간식 목록 */}
      {expanded && orderedSnacks.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {orderedSnacks.map((snack, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center justify-between"
                >
                  <span className="text-sm font-medium truncate flex-1">
                    {snack.name}
                  </span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full ml-2">
                    {snack.quantity}개
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 주문이 없을 때 */}
      {expanded && orderedSnacks.length === 0 && (
        <div className="bg-white/10 backdrop-blur-sm border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4 py-4 text-center">
            <p className="text-sm opacity-80">이번 주 주문된 간식이 없습니다.</p>
          </div>
        </div>
      )}
    </div>
  )
}
