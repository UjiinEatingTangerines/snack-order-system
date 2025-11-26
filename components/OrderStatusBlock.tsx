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

  useEffect(() => {
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

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-800">
        <span>📊</span>
        <span>현재 주문 현황</span>
      </h2>

      {/* 주문된 간식 목록 */}
      {orderedSnacks.length > 0 ? (
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
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">이번 주 주문된 간식이 없습니다.</p>
        </div>
      )}
    </div>
  )
}
