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
      {/* 상단 배너 - 금액만 표시 */}
      <div className="py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <div className="flex flex-col items-start">
              <span className="text-xs opacity-80">이번 주 총 금액</span>
              <span className="font-bold text-2xl">{totalCost.toLocaleString()}원</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
