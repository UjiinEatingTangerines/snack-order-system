'use client'

import Link from 'next/link'

export default function FloatingMySnacksButton() {
  return (
    <Link
      href="/my-snacks"
      className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white rounded-full p-4 shadow-2xl transition-all hover:scale-110 flex items-center justify-center group"
      aria-label="내 간식 주머니"
    >
      <span className="text-3xl">🎒</span>

      {/* Tooltip */}
      <span className="absolute right-full mr-3 whitespace-nowrap bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        내 간식 주머니
      </span>
    </Link>
  )
}
