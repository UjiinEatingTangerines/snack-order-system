import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  데이터베이스 초기화 시작...')

  // 순서대로 삭제 (외래 키 제약 조건 고려)
  console.log('📝 OrderItem 삭제 중...')
  await prisma.orderItem.deleteMany({})

  console.log('📦 Order 삭제 중...')
  await prisma.order.deleteMany({})

  console.log('👍 Vote 삭제 중...')
  await prisma.vote.deleteMany({})

  console.log('🔥 TrendingSnack 삭제 중...')
  await prisma.trendingSnack.deleteMany({})

  console.log('🍪 Snack 삭제 중...')
  await prisma.snack.deleteMany({})

  console.log('✅ 데이터베이스 초기화 완료!')
}

main()
  .catch((e) => {
    console.error('❌ 에러 발생:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
