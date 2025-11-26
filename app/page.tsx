import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function Home() {
  // 전체 통계
  const totalSnacks = await prisma.snack.count()
  const totalVotes = await prisma.vote.count()
  const totalOrders = await prisma.order.count()

  // 이번 주 데이터 (지난 7일)
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const weeklySnacks = await prisma.snack.count({
    where: { createdAt: { gte: oneWeekAgo } }
  })

  const weeklyVotes = await prisma.vote.count({
    where: { createdAt: { gte: oneWeekAgo } }
  })

  // 투표 수 기준 상위 5개 간식 조회
  const topSnacks = await prisma.snack.findMany({
    include: {
      _count: {
        select: { votes: true }
      }
    },
    orderBy: {
      votes: {
        _count: 'desc'
      }
    },
    take: 5
  })

  // 역대 인기 간식 (주문에서 가장 많이 나타난 간식)
  const allTimeTopSnacks = await prisma.snack.findMany({
    include: {
      _count: {
        select: { orderItems: true, votes: true }
      }
    },
    orderBy: {
      orderItems: {
        _count: 'desc'
      }
    },
    take: 3
  })

  // 최근 제안된 간식
  const recentSnacks = await prisma.snack.findMany({
    take: 3,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      _count: {
        select: { votes: true }
      }
    }
  })

  // 트렌딩 간식
  const trendingSnacks = await prisma.trendingSnack.findMany({
    orderBy: {
      rank: 'asc'
    },
    take: 5
  })

  // 카테고리별 분포
  const snacksByCategory = await prisma.snack.groupBy({
    by: ['category'],
    _count: true
  })

  const totalCategorized = snacksByCategory.reduce((sum, cat) => sum + cat._count, 0)
  const categoryData = snacksByCategory
    .filter(cat => cat.category)
    .map(cat => ({
      name: cat.category!,
      count: cat._count,
      percentage: Math.round((cat._count / totalCategorized) * 100)
    }))
    .sort((a, b) => b.count - a.count)

  // 최근 활동 (투표 + 간식 제안)
  const recentVotes = await prisma.vote.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { snack: true }
  })

  const recentProposals = await prisma.snack.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  })

  // 이달의 MVP (이번 달 가장 많은 투표)
  const firstDayOfMonth = new Date()
  firstDayOfMonth.setDate(1)
  firstDayOfMonth.setHours(0, 0, 0, 0)

  const monthlyMVP = await prisma.snack.findFirst({
    where: {
      votes: {
        some: {
          createdAt: { gte: firstDayOfMonth }
        }
      }
    },
    include: {
      _count: {
        select: {
          votes: {
            where: { createdAt: { gte: firstDayOfMonth } }
          }
        }
      }
    },
    orderBy: {
      votes: { _count: 'desc' }
    }
  })

  // 다음 월요일 계산
  const getNextMonday = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
    const nextMonday = new Date(today)
    nextMonday.setDate(today.getDate() + daysUntilMonday)
    return nextMonday
  }

  const nextOrderDate = getNextMonday()

  // 가장 인기있는 카테고리
  const topCategory = categoryData[0]?.name || '없음'

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    })
  }

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return '방금 전'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}분 전`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}시간 전`
    const days = Math.floor(hours / 24)
    return `${days}일 전`
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        대시보드
      </h1>

      {/* 전체 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700 font-medium">총 간식 수</p>
              <p className="text-3xl font-bold text-orange-900 mt-2">{totalSnacks}개</p>
            </div>
            <div className="text-4xl">🍪</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">총 투표 수</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{totalVotes}표</p>
            </div>
            <div className="text-4xl">👍</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">총 주문 횟수</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{totalOrders}회</p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </div>
      </div>

      {/* 이번 주 활동 요약 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          📊 이번 주 활동 요약
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">📝</span>
            <div>
              <p className="text-sm text-gray-600">새로 제안된 간식</p>
              <p className="text-xl font-bold text-gray-900">{weeklySnacks}개</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">👍</span>
            <div>
              <p className="text-sm text-gray-600">받은 투표 수</p>
              <p className="text-xl font-bold text-gray-900">{weeklyVotes}표</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-sm text-gray-600">가장 핫한 카테고리</p>
              <p className="text-xl font-bold text-gray-900">{topCategory}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 이번 주 인기 간식 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            인기 간식 Top 5
          </h2>
          {topSnacks.length === 0 ? (
            <p className="text-gray-500 text-sm">
              아직 투표된 간식이 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {topSnacks.map((snack, index) => (
                <div
                  key={snack.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-400">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{snack.name}</p>
                      {snack.category && (
                        <span className="text-xs text-gray-500">{snack.category}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-lg">👍</span>
                    <span className="font-semibold text-orange-600">
                      {snack._count.votes}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 트렌딩 간식 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              🔥 지금 핫한 간식
            </h2>
            <form action="/api/trending" method="POST">
              <button
                type="submit"
                className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded hover:bg-orange-200 transition-colors"
              >
                새로고침
              </button>
            </form>
          </div>
          {trendingSnacks.length === 0 ? (
            <p className="text-gray-500 text-sm">
              트렌딩 데이터가 없습니다. 새로고침 버튼을 눌러주세요.
            </p>
          ) : (
            <div className="space-y-2">
              {trendingSnacks.map((snack) => (
                <div
                  key={snack.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="text-sm font-bold text-orange-600 w-6">
                    #{snack.rank}
                  </span>
                  {snack.imageUrl && (
                    <img
                      src={snack.imageUrl}
                      alt={snack.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {snack.name}
                    </p>
                  </div>
                  <a
                    href={snack.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-orange-600 hover:text-orange-700 whitespace-nowrap"
                  >
                    보기 →
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 추가 정보 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* 역대 인기 간식 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>🏆</span>
            역대 인기 간식
          </h2>
          {allTimeTopSnacks.length === 0 ? (
            <p className="text-gray-500 text-sm">주문 이력이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {allTimeTopSnacks.map((snack, index) => (
                <div key={snack.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <span className="text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{snack.name}</p>
                    <p className="text-xs text-gray-600">
                      {snack._count.orderItems}번 주문됨
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 카테고리별 분포 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>📊</span>
            카테고리 분포
          </h2>
          {categoryData.length === 0 ? (
            <p className="text-gray-500 text-sm">카테고리 데이터가 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {categoryData.map((cat) => (
                <div key={cat.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{cat.name}</span>
                    <span className="text-gray-600">{cat.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 다가오는 이벤트 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>📅</span>
            다가오는 일정
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 font-medium mb-1">다음 주문일</p>
              <p className="text-lg font-bold text-blue-900">{formatDate(nextOrderDate)}</p>
              <p className="text-xs text-blue-600 mt-1">매주 월요일 오전 9시</p>
            </div>

            {monthlyMVP && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-700 font-medium mb-2">🌟 이달의 MVP</p>
                <p className="font-bold text-purple-900">{monthlyMVP.name}</p>
                <p className="text-xs text-purple-600 mt-1">
                  {monthlyMVP._count.votes}표 획득
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 최근 활동 피드 */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span>📰</span>
          최근 활동
        </h2>
        <div className="space-y-2">
          {recentVotes.slice(0, 5).map((vote) => (
            <div key={vote.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <span className="text-xl">👍</span>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  {vote.voterName || '익명'}님이 <span className="font-medium">{vote.snack.name}</span>에 투표했습니다
                </p>
                <p className="text-xs text-gray-500">{getTimeAgo(vote.createdAt)}</p>
              </div>
            </div>
          ))}
          {recentProposals.slice(0, 3).map((snack) => (
            <div key={snack.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <span className="text-xl">📝</span>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{snack.name}</span>이(가) 제안되었습니다
                </p>
                <p className="text-xs text-gray-500">{getTimeAgo(snack.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
          <span>⚡</span>
          빠른 작업
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/snacks"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-orange-300 hover:border-orange-500 hover:shadow-md transition-all"
          >
            <span className="text-3xl">🎯</span>
            <div>
              <p className="font-semibold text-gray-900">투표하러 가기</p>
              <p className="text-xs text-gray-600">원하는 간식에 투표하세요</p>
            </div>
          </a>

          <a
            href="/propose"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-orange-300 hover:border-orange-500 hover:shadow-md transition-all"
          >
            <span className="text-3xl">📝</span>
            <div>
              <p className="font-semibold text-gray-900">간식 제안하기</p>
              <p className="text-xs text-gray-600">새로운 간식을 추천하세요</p>
            </div>
          </a>

          <a
            href="/orders/new"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-orange-300 hover:border-orange-500 hover:shadow-md transition-all"
          >
            <span className="text-3xl">📦</span>
            <div>
              <p className="font-semibold text-gray-900">주문 생성</p>
              <p className="text-xs text-gray-600">주문 목록을 만드세요</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
