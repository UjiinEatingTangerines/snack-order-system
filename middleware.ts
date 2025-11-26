import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedPaths = ['/orders']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 보호된 경로인지 확인
  const isProtectedPath = protectedPaths.some(path =>
    pathname.startsWith(path)
  )

  if (isProtectedPath) {
    const session = request.cookies.get('admin_session')

    // 세션이 없으면 로그인 페이지로 리다이렉트
    if (!session || session.value !== 'authenticated') {
      const loginUrl = new URL('/facker', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/orders/:path*']
}
