'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Toast from './Toast'
import LoadingOverlay from './LoadingOverlay'

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showToast, setShowToast] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    checkAdminStatus()
  }, [pathname]) // pathname이 변경될 때마다 권한 재확인

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/auth/check')
      const data = await response.json()
      setIsAdmin(data.isAdmin)
    } catch (error) {
      console.error('권한 확인 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setIsAdmin(false)
      setShowToast(true)
      setLoggingOut(true)
      // 1초 후 페이지 새로고침
      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
    } catch (error) {
      console.error('로그아웃 오류:', error)
      setLoggingOut(false)
    }
  }

  const allLinks = [
    { href: '/', label: '간식 허브', adminOnly: false },
    { href: '/snacks', label: '간식 목록', adminOnly: true },
    { href: '/propose', label: '간식 제안', adminOnly: true },
    { href: '/orders', label: '주문 이력', adminOnly: true },
    { href: '/orders/new', label: '주문하기', adminOnly: true },
  ]

  const links = allLinks.filter(link => !link.adminOnly || isAdmin)

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold">🍪</span>
              <span className="ml-2 text-lg sm:text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                YUM.GG
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-2 lg:space-x-4 items-center">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  pathname === link.href
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-cream-100 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {!loading && (
              isAdmin ? (
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                >
                  로그아웃
                </button>
              ) : (
                <Link
                  href="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-green-100 hover:text-green-700 transition-colors"
                >
                  관리자
                </Link>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <span className="sr-only">메뉴 열기</span>
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-cream-100 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {!loading && (
                isAdmin ? (
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-red-100 hover:text-red-700 transition-colors text-left"
                  >
                    로그아웃
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-green-100 hover:text-green-700 transition-colors"
                  >
                    관리자
                  </Link>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {showToast && (
        <Toast
          message="로그아웃되었습니다 👋"
          type="info"
          onClose={() => setShowToast(false)}
        />
      )}

      {loggingOut && <LoadingOverlay message="로그아웃 중..." />}
    </nav>
  )
}
