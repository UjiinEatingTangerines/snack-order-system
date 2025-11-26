import { prisma } from '@/lib/prisma'

export default async function WeeklyOrderBanner() {
  // 이번 주 시작일 계산 (월요일 기준)
  const getThisWeekMonday = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // 일요일이면 -6, 아니면 월요일까지의 차이
    const monday = new Date(today)
    monday.setDate(today.getDate() + diff)
    monday.setHours(0, 0, 0, 0)
    return monday
  }

  const thisWeekMonday = getThisWeekMonday()

  // 이번 주에 생성된 주문 조회
  const weeklyOrders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: thisWeekMonday
      }
    }
  })

  // 총 금액 계산
  const totalCost = weeklyOrders.reduce((sum, order) => {
    return sum + (order.totalCost || 0)
  }, 0)

  // 주문 개수
  const orderCount = weeklyOrders.length

  // 금액이 0이면 표시하지 않음
  if (totalCost === 0 && orderCount === 0) {
    return null
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
