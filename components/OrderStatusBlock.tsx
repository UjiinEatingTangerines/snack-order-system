'use client'

import { useState, useEffect } from 'react'
import Modal from './Modal'

type OrderedSnack = {
  id: string
  name: string
  quantity: number
  orders: number
  imageUrl: string | null
  url: string
  proposedBy: string | null
  voteCount: number
}

type OrderDetail = {
  id: string
  orderDate: Date
  totalCost: number | null
  notes: string | null
  itemCount: number
  totalQuantity: number
}

export default function OrderStatusBlock() {
  const [orderCount, setOrderCount] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const [totalQuantity, setTotalQuantity] = useState(0)
  const [totalTypes, setTotalTypes] = useState(0)
  const [orderedSnacks, setOrderedSnacks] = useState<OrderedSnack[]>([])
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([])
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
        setTotalQuantity(data.totalQuantity || 0)
        setTotalTypes(data.totalTypes || 0)
        setOrderedSnacks(data.orderedSnacks || [])
        setOrderDetails(data.orderDetails || [])
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6">
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

      {/* 주문 통계 요약 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 sm:p-4 border border-blue-200">
          <p className="text-xs sm:text-sm text-blue-600 font-medium mb-1">총 주문 건수</p>
          <p className="text-2xl sm:text-3xl font-bold text-blue-700">{orderCount}</p>
          <p className="text-xs text-blue-500 mt-1">건</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 sm:p-4 border border-purple-200">
          <p className="text-xs sm:text-sm text-purple-600 font-medium mb-1">간식 종류</p>
          <p className="text-2xl sm:text-3xl font-bold text-purple-700">{totalTypes}</p>
          <p className="text-xs text-purple-500 mt-1">종류</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 sm:p-4 border border-orange-200">
          <p className="text-xs sm:text-sm text-orange-600 font-medium mb-1">총 주문 개수</p>
          <p className="text-2xl sm:text-3xl font-bold text-orange-700">{totalQuantity}</p>
          <p className="text-xs text-orange-500 mt-1">개</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 sm:p-4 border border-green-200">
          <p className="text-xs sm:text-sm text-green-600 font-medium mb-1">총 금액</p>
          <p className="text-xl sm:text-2xl font-bold text-green-700">{totalCost.toLocaleString()}</p>
          <p className="text-xs text-green-500 mt-1">원</p>
        </div>
      </div>

      {/* 주문 상세 내역 */}
      {orderDetails.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>📋</span>
            <span>주문 상세</span>
          </h3>
          <div className="space-y-2">
            {orderDetails.map((order) => (
              <div
                key={order.id}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                      {formatDate(order.orderDate)}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {order.itemCount}종류
                    </span>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                      {order.totalQuantity}개
                    </span>
                    {order.totalCost && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        {order.totalCost.toLocaleString()}원
                      </span>
                    )}
                  </div>
                  {order.notes && (
                    <span className="text-xs text-gray-500 truncate max-w-[200px]" title={order.notes}>
                      📝 {order.notes}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 주문된 간식 목록 */}
      <div>
        <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span>🍪</span>
          <span>간식 목록</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {orderedSnacks.map((snack) => (
            <a
              key={snack.id}
              href={snack.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-lg hover:border-primary-300 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                {/* 썸네일 */}
                {snack.imageUrl ? (
                  <img
                    src={snack.imageUrl}
                    alt={snack.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded border border-gray-300 flex-shrink-0 group-hover:border-primary-400 transition-colors"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded flex items-center justify-center flex-shrink-0 group-hover:from-orange-200 group-hover:to-orange-300 transition-colors">
                    <span className="text-2xl sm:text-3xl">🍪</span>
                  </div>
                )}

                {/* 간식 정보 */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-800 mb-1 line-clamp-2 group-hover:text-primary-700 transition-colors">
                    {snack.name}
                  </h4>

                  {/* 제안자 */}
                  {snack.proposedBy && (
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <span>👤</span>
                      <span className="truncate">{snack.proposedBy}</span>
                    </p>
                  )}

                  {/* 수량, 주문 건수, 투표 수 */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                      {snack.quantity}개
                    </span>
                    {snack.orders > 1 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {snack.orders}건
                      </span>
                    )}
                    <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-0.5">
                      <span>👍</span>
                      <span>{snack.voteCount}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 구매 링크 표시 */}
              <div className="mt-2 pt-2 border-t border-gray-200">
                <span className="text-xs text-primary-600 group-hover:text-primary-700 flex items-center gap-1">
                  <span>🛒</span>
                  <span>구매 페이지로 이동</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </div>
            </a>
          ))}
        </div>
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
