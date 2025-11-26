'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Snack = {
  id: string
  name: string
  url: string
  imageUrl: string | null
  category: string | null
  price: number | null
  _count: {
    votes: number
  }
}

type OrderItem = {
  snack: Snack
  quantity: number
  price: number | null  // 수기 입력 가능한 가격
}

export default function NewOrderPage() {
  const router = useRouter()
  const [snacks, setSnacks] = useState<Snack[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    // URL에서 reorder 파라미터 확인
    const params = new URLSearchParams(window.location.search)
    const reorderId = params.get('reorder')

    if (reorderId) {
      loadPreviousOrder(reorderId)
    } else {
      fetchSnacks()
    }
  }, [])

  const loadPreviousOrder = async (orderId: string) => {
    try {
      // 이전 주문 정보 가져오기
      const orderResponse = await fetch(`/api/orders/${orderId}`)
      const order = await orderResponse.json()

      // 모든 간식 목록 가져오기
      const snacksResponse = await fetch('/api/snacks')
      const allSnacks = await snacksResponse.json()

      setSnacks(allSnacks)

      // 이전 주문 항목을 현재 주문에 추가
      const previousItems = order.items.map((item: any) => ({
        snack: item.snack,
        quantity: item.quantity,
        price: item.snack.price
      }))

      setOrderItems(previousItems)
      setNotes(order.notes || '')
    } catch (error) {
      alert('이전 주문을 불러오는데 실패했습니다.')
      fetchSnacks()
    } finally {
      setLoading(false)
    }
  }

  const fetchSnacks = async () => {
    try {
      const response = await fetch('/api/snacks')
      const data = await response.json()

      // 투표 순으로 정렬
      const sorted = data.sort((a: Snack, b: Snack) =>
        b._count.votes - a._count.votes
      )

      setSnacks(sorted)

      // 투표가 있는 상위 간식들을 자동으로 추가
      const topVoted = sorted
        .filter((s: Snack) => s._count.votes > 0)
        .slice(0, 5)
        .map((s: Snack) => ({ snack: s, quantity: 1, price: s.price }))

      setOrderItems(topVoted)
    } catch (error) {
      alert('간식 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const addItem = (snack: Snack) => {
    const existing = orderItems.find(item => item.snack.id === snack.id)
    if (existing) {
      setOrderItems(orderItems.map(item =>
        item.snack.id === snack.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setOrderItems([...orderItems, { snack, quantity: 1, price: snack.price }])
    }
  }

  const updatePrice = (snackId: string, price: number | null) => {
    setOrderItems(orderItems.map(item =>
      item.snack.id === snackId
        ? { ...item, price }
        : item
    ))
  }

  const removeItem = (snackId: string) => {
    setOrderItems(orderItems.filter(item => item.snack.id !== snackId))
  }

  const updateQuantity = (snackId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(snackId)
      return
    }
    setOrderItems(orderItems.map(item =>
      item.snack.id === snackId
        ? { ...item, quantity }
        : item
    ))
  }

  const handleSubmit = async () => {
    if (orderItems.length === 0) {
      alert('주문할 간식을 선택해주세요.')
      return
    }

    setSubmitting(true)

    try {
      // 총 금액 계산 (가격이 있는 항목만)
      const totalCost = orderItems.reduce((sum, item) => {
        if (item.price) {
          return sum + (item.price * item.quantity)
        }
        return sum
      }, 0)

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderItems.map(item => ({
            snackId: item.snack.id,
            quantity: item.quantity
          })),
          totalCost: totalCost > 0 ? totalCost : null,
          notes
        })
      })

      if (response.ok) {
        alert('주문이 생성되었습니다!')
        router.push('/orders')
      } else {
        const error = await response.json()
        alert(`오류: ${error.message}`)
      }
    } catch (error) {
      alert('주문 생성 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    )
  }

  const availableSnacks = snacks.filter(s =>
    !orderItems.some(item => item.snack.id === s.id)
  )

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        주문 생성하기
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 주문 목록 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              주문할 간식 ({orderItems.length}개)
            </h2>

            {orderItems.length === 0 ? (
              <p className="text-gray-500 text-sm">
                주문할 간식을 추가해주세요.
              </p>
            ) : (
              <div className="space-y-3">
                {orderItems.map(item => (
                  <div
                    key={item.snack.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    {item.snack.imageUrl ? (
                      <img
                        src={item.snack.imageUrl}
                        alt={item.snack.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-orange-200 rounded flex items-center justify-center">
                        <span className="text-2xl">🍪</span>
                      </div>
                    )}

                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.snack.name}</h3>
                      <p className="text-sm text-gray-500">
                        {item.snack._count.votes}표
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          value={item.price || ''}
                          onChange={(e) => updatePrice(item.snack.id, e.target.value ? parseFloat(e.target.value) : null)}
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                          placeholder="가격"
                          min="0"
                          step="100"
                        />
                        <span className="text-xs text-gray-500">원</span>
                      </div>
                      <a
                        href={item.snack.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-orange-600 hover:text-orange-700"
                      >
                        구매 링크 →
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.snack.id, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.snack.id, item.quantity + 1)}
                        className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.snack.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 간식 추가 */}
          {availableSnacks.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                간식 추가하기
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableSnacks.slice(0, 6).map(snack => (
                  <button
                    key={snack.id}
                    onClick={() => addItem(snack)}
                    className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-orange-50 rounded-lg transition-colors text-left"
                  >
                    <span className="text-2xl">🍪</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{snack.name}</p>
                      <p className="text-xs text-gray-500">{snack._count.votes}표</p>
                    </div>
                    <span className="text-orange-600 text-xl">+</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 주문 요약 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              주문 요약
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">총 간식 종류</span>
                <span className="font-medium">{orderItems.length}개</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">총 수량</span>
                <span className="font-medium">
                  {orderItems.reduce((sum, item) => sum + item.quantity, 0)}개
                </span>
              </div>
              <div className="flex justify-between text-sm pt-3 border-t border-gray-200">
                <span className="text-gray-600 font-medium">총 금액</span>
                <span className="font-bold text-orange-600">
                  {orderItems.reduce((sum, item) => {
                    if (item.price) {
                      return sum + (item.price * item.quantity)
                    }
                    return sum
                  }, 0).toLocaleString()}원
                </span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                메모 (선택)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="주문 관련 메모를 입력하세요"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || orderItems.length === 0}
              className="w-full bg-primary-600 text-white py-3 rounded-md hover:bg-primary-700 disabled:bg-gray-400 transition-colors font-medium"
            >
              {submitting ? '주문 생성 중...' : '주문 완료'}
            </button>

            <button
              onClick={() => router.back()}
              className="w-full mt-3 border border-gray-300 py-3 rounded-md hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
