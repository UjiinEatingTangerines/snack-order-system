'use client'

import { useState, useEffect } from 'react'
import Modal from './Modal'

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
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [resultMessage, setResultMessage] = useState('')
  const [resultTitle, setResultTitle] = useState('')

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
    setShowConfirmModal(false)
    setResetting(true)

    try {
      const response = await fetch('/api/reset-weekly', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setResultTitle('✅ 주문 완료')
        setResultMessage(`주문이 성공적으로 완료되었습니다!\n\n완료된 주문: ${data.completedOrdersCount}개`)
        setShowResultModal(true)

        // 완료된 주문은 표시되지 않도록 데이터 갱신
        setTimeout(() => {
          fetchWeeklyTotal()
          // 페이지 전체 데이터 갱신
          window.location.reload()
        }, 2000)
      } else {
        const error = await response.json()
        setResultTitle('❌ 오류 발생')
        setResultMessage(`주문 완료 중 오류가 발생했습니다:\n${error.message}`)
        setShowResultModal(true)
      }
    } catch (error) {
      setResultTitle('❌ 오류 발생')
      setResultMessage('주문 완료 처리 중 네트워크 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.')
      setShowResultModal(true)
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
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-gray-800">
          <span>📊</span>
          <span>현재 주문 현황</span>
        </h2>
        {isAdmin && orderCount > 0 && (
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={resetting}
            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors text-sm font-medium whitespace-nowrap"
          >
            {resetting ? '처리 중...' : '✅ 주문 완료'}
          </button>
        )}
      </div>

      {/* 주문된 간식 목록 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        {orderedSnacks.map((snack, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between border border-gray-200 hover:shadow-md transition-shadow"
          >
            <span className="text-xs sm:text-sm font-medium text-gray-800 truncate flex-1">
              {snack.name}
            </span>
            <span className="text-xs bg-primary-100 text-primary-700 px-2 sm:px-3 py-1 rounded-full ml-2 font-semibold whitespace-nowrap">
              {snack.quantity}개
            </span>
          </div>
        ))}
      </div>

      {/* 주문 완료 확인 모달 */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleWeeklyReset}
        title="🛒 주문 완료 확인"
        message={`현재 주문을 완료 처리하시겠습니까?\n\n✅ 완료 처리 내용:\n• PENDING 상태의 주문 → COMPLETED로 변경\n• 완료된 주문은 현재 주문 현황에서 숨겨집니다\n• 주문 이력 페이지에서 확인할 수 있습니다\n\n📝 간식 및 투표 데이터는 그대로 유지됩니다.`}
        type="confirm"
        confirmText="✅ 주문 완료"
        cancelText="취소"
      />

      {/* 주문 완료 결과 모달 */}
      <Modal
        isOpen={showResultModal}
        onClose={() => {
          setShowResultModal(false)
          // 성공한 경우에만 페이지 새로고침
          if (resultTitle.includes('✅')) {
            window.location.reload()
          }
        }}
        title={resultTitle}
        message={resultMessage}
        type="alert"
      />
    </div>
  )
}
