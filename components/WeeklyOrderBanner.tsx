'use client'

import { useState, useEffect } from 'react'

export default function WeeklyOrderBanner() {
  const [orderCount, setOrderCount] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchWeeklyTotal = async () => {
    try {
      const response = await fetch('/api/weekly-total')
      if (response.ok) {
        const data = await response.json()
        setOrderCount(data.orderCount)
        setTotalCost(data.totalCost)
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
    <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white py-3 px-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 text-sm sm:text-base">
        <span className="font-semibold">📊 이번 주 주문 현황</span>
        <div className="flex items-center gap-4">
          <span className="bg-white/20 px-3 py-1 rounded-full">
            주문 <span className="font-bold">{orderCount}</span>건
          </span>
          <span className="bg-white/20 px-3 py-1 rounded-full">
            총 <span className="font-bold text-lg">{totalCost.toLocaleString()}</span>원
          </span>
        </div>
      </div>
    </div>
  )
}
