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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          간식 목록
        </h1>
        <a
          href="/propose"
          className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
        >
          + 간식 제안하기
        </a>
      </div>

      <SnackList initialSnacks={snacks} />
    </div>
  )
}
