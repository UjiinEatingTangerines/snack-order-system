import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          snack: true
        }
      }
    },
    orderBy: {
      orderDate: 'desc'
    }
  })

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    })
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          주문 이력
        </h1>
        <Link
          href="/orders/new"
          className="w-full sm:w-auto text-center bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors whitespace-nowrap"
        >
          + 새 주문 만들기
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">
            아직 주문 이력이 없습니다.
          </p>
          <Link
            href="/orders/new"
            className="inline-block bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 transition-colors"
          >
            첫 주문 만들기
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0)

            return (
              <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
                {/* 주문 헤더 */}
                <div className="bg-orange-50 px-6 py-4 border-b border-orange-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {formatDate(order.orderDate)}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {order.items.length}개 품목 · 총 {totalQuantity}개
                      </p>
                    </div>
                    {order.totalCost && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">총 비용</p>
                        <p className="text-xl font-bold text-orange-600">
                          {order.totalCost.toLocaleString()}원
                        </p>
                      </div>
                    )}
                  </div>
                  {order.notes && (
                    <p className="mt-3 text-sm text-gray-700 bg-white px-3 py-2 rounded">
                      📝 {order.notes}
                    </p>
                  )}
                </div>

                {/* 주문 항목 */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
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
                          <p className="text-sm text-gray-500">수량: {item.quantity}개</p>
                          <a
                            href={item.snack.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-orange-600 hover:text-orange-700"
                          >
                            구매 링크 →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 재주문 버튼 */}
                <div className="px-6 pb-4">
                  <Link
                    href={`/orders/new?reorder=${order.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                  >
                    <span>🔄</span>
                    이 주문 다시하기
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 통계 요약 */}
      {orders.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            주문 통계
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{orders.length}</p>
              <p className="text-sm text-gray-600 mt-1">총 주문 횟수</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">
                {orders.reduce((sum, o) => sum + o.items.length, 0)}
              </p>
              <p className="text-sm text-gray-600 mt-1">총 간식 종류</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">
                {orders.reduce((sum, o) =>
                  sum + o.items.reduce((s, i) => s + i.quantity, 0), 0
                )}
              </p>
              <p className="text-sm text-gray-600 mt-1">총 주문 개수</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
