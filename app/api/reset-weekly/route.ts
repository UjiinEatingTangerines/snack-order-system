import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiError } from '@/lib/api-errors'
import { isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST: 주간 리셋 (어드민 전용)
export async function POST() {
  try {
    // 어드민 권한 확인
    const admin = await isAdmin()
    if (!admin) {
      return apiError(403, '권한이 없습니다')
    }

    // 이번 주 월요일 0시 계산
    const getThisWeekMonday = () => {
      const today = new Date()
      const dayOfWeek = today.getDay()
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const monday = new Date(today)
      monday.setDate(today.getDate() - daysToSubtract)
      monday.setHours(0, 0, 0, 0)
      return monday
    }

    const thisWeekMonday = getThisWeekMonday()

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 1. 이번 주 생성된 PENDING 주문을 COMPLETED로 변경
      const completedOrders = await tx.order.updateMany({
        where: {
          orderDate: {
            gte: thisWeekMonday
          },
          status: 'PENDING'
        },
        data: {
          status: 'COMPLETED'
        }
      })

      // 2. 이번 주 생성된 투표 삭제
      const deletedVotes = await tx.vote.deleteMany({
        where: {
          createdAt: {
            gte: thisWeekMonday
          }
        }
      })

      // 3. 이번 주 생성된 간식들 soft delete
      const deletedSnacks = await tx.snack.updateMany({
        where: {
          createdAt: {
            gte: thisWeekMonday
          },
          deletedAt: null
        },
        data: {
          deletedAt: new Date()
        }
      })

      return {
        completedOrdersCount: completedOrders.count,
        deletedVotesCount: deletedVotes.count,
        deletedSnacksCount: deletedSnacks.count
      }
    })

    return NextResponse.json({
      message: '주간 데이터가 리셋되었습니다',
      ...result
    })
  } catch (error) {
    console.error('주간 리셋 오류:', error)
    return apiError(500, '주간 리셋 실패')
  }
}
