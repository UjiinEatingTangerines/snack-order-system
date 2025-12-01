import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  지난 달 주문된 간식 정리 시작...')

  // 현재 날짜에서 한 달의 첫날을 구함
  const now = new Date()
  const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  console.log(`📅 기준 날짜: ${firstDayOfCurrentMonth.toISOString()}`)
  console.log(`   (이 날짜 이전에 삭제된 간식들을 완전히 제거합니다)`)

  // deletedAt이 현재 달 이전인 간식들을 찾기
  const snacksToDelete = await prisma.snack.findMany({
    where: {
      deletedAt: {
        not: null,
        lt: firstDayOfCurrentMonth
      }
    },
    select: {
      id: true,
      name: true,
      deletedAt: true
    }
  })

  if (snacksToDelete.length === 0) {
    console.log('✅ 삭제할 간식이 없습니다.')
    return
  }

  console.log(`🍪 삭제 대상 간식 ${snacksToDelete.length}개:`)
  snacksToDelete.forEach(snack => {
    console.log(`   - ${snack.name} (삭제일: ${snack.deletedAt?.toISOString()})`)
  })

  // 간식과 관련된 데이터를 순서대로 삭제
  const snackIds = snacksToDelete.map(s => s.id)

  console.log('📝 투표 기록 삭제 중...')
  const deletedVotes = await prisma.vote.deleteMany({
    where: {
      snackId: { in: snackIds }
    }
  })
  console.log(`   ✓ ${deletedVotes.count}개 삭제됨`)

  // OrderItem은 외래 키 제약 조건 때문에 삭제하지 않음 (주문 이력 보존)
  console.log('📦 주문 항목은 이력 보존을 위해 유지됩니다.')

  console.log('🍪 간식 삭제 중...')
  const deletedSnacks = await prisma.snack.deleteMany({
    where: {
      id: { in: snackIds }
    }
  })
  console.log(`   ✓ ${deletedSnacks.count}개 삭제됨`)

  console.log('✅ 정리 완료!')
}

main()
  .catch((e) => {
    console.error('❌ 에러 발생:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
