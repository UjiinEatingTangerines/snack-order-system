import { prisma } from '@/lib/prisma'
import SnackList from './SnackList'

export const dynamic = 'force-dynamic'

export default async function SnacksPage() {
  const snacks = await prisma.snack.findMany({
    include: {
      _count: {
        select: { votes: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          간식 목록
        </h1>
        <a
          href="/propose"
          className="w-full sm:w-auto text-center bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors whitespace-nowrap"
        >
          + 간식 제안하기
        </a>
      </div>

      <SnackList initialSnacks={snacks} />
    </div>
  )
}
