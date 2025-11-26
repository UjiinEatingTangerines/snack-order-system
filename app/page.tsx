import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function Home() {
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

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        대시보드
      </h1>

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

      {/* 빠른 액션 */}
      <div className="mt-8 bg-orange-50 border border-orange-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-orange-900 mb-2">
          시작하기
        </h3>
        <p className="text-orange-700 mb-4">
          간식을 제안하고 투표해보세요!
        </p>
        <div className="flex gap-4">
          <a
            href="/propose"
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
          >
            간식 제안하기
          </a>
          <a
            href="/snacks"
            className="bg-white text-orange-600 px-4 py-2 rounded-md border border-orange-600 hover:bg-orange-50 transition-colors"
          >
            간식 목록 보기
          </a>
        </div>
      </div>
    </div>
  )
}
