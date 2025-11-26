import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { voterName } = await request.json()
    const { id } = params

    // 투표 생성
    const vote = await prisma.vote.create({
      data: {
        snackId: id,
        voterName: voterName || null,
      }
    })

    // 업데이트된 투표 수 조회
    const voteCount = await prisma.vote.count({
      where: { snackId: id }
    })

    return NextResponse.json({ vote, voteCount })
  } catch (error) {
    console.error('투표 오류:', error)
    return NextResponse.json(
      { message: '투표 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE: 투표 취소
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { voterName } = await request.json()
    const { id } = params

    // 가장 최근 투표 찾아서 삭제
    const vote = await prisma.vote.findFirst({
      where: {
        snackId: id,
        voterName: voterName || null,
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!vote) {
      return NextResponse.json(
        { message: '투표를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    await prisma.vote.delete({
      where: { id: vote.id }
    })

    // 업데이트된 투표 수 조회
    const voteCount = await prisma.vote.count({
      where: { snackId: id }
    })

    return NextResponse.json({ voteCount })
  } catch (error) {
    console.error('투표 취소 오류:', error)
    return NextResponse.json(
      { message: '투표 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
