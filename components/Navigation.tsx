'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: '대시보드' },
    { href: '/snacks', label: '간식 목록' },
    { href: '/propose', label: '간식 제안' },
    { href: '/orders', label: '주문 이력' },
    { href: '/orders/new', label: '주문하기' },
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-orange-600">🍪</span>
              <span className="ml-2 text-xl font-semibold text-gray-900">
                간식 주문 시스템
              </span>
            </Link>
          </div>
          <div className="flex space-x-4 items-center">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
