import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const admin = await isAdmin()
    return NextResponse.json({ isAdmin: admin })
  } catch (error) {
    console.error('세션 확인 오류:', error)
    return NextResponse.json({ isAdmin: false })
  }
}
