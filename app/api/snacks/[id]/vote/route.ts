import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { apiError } from '@/lib/api-errors'

export const dynamic = 'force-dynamic'

const VOTED_SNACKS_COOKIE = 'voted_snacks'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1년

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { voterName } = await request.json()
    const { id } = await params

    // 쿠키에서 이미 투표한 간식 목록 가져오기
    const cookieStore = await cookies()
    const votedSnacksCookie = cookieStore.get(VOTED_SNACKS_COOKIE)
    const votedSnacks: string[] = votedSnacksCookie
      ? JSON.parse(votedSnacksCookie.value)
      : []

    // 중복 투표 체크
    if (votedSnacks.includes(id)) {
      return apiError(403, '이미 투표한 간식입니다')
    }

    // 투표 생성
    const vote = await prisma.vote.create({
      data: {
        snackId: id,
        voterName: voterName || null,
      }
    })

    // 투표한 간식 목록에 추가
    votedSnacks.push(id)

    // 쿠키 업데이트
    cookieStore.set(VOTED_SNACKS_COOKIE, JSON.stringify(votedSnacks), {
      httpOnly: false, // 클라이언트에서도 읽을 수 있도록
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    })

    // 업데이트된 투표 수 조회
    const voteCount = await prisma.vote.count({
      where: { snackId: id }
    })

    return NextResponse.json({ vote, voteCount })
  } catch (error) {
    console.error('투표 오류:', error)
    return apiError(500, '투표 실패')
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
      return apiError(404, '투표를 찾을 수 없습니다')
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
    return apiError(500, '투표 취소 실패')
  }
}
