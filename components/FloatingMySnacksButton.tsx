'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function FloatingMySnacksButton() {
  const [bottomPosition, setBottomPosition] = useState(24) // 6 * 4 = 24px (bottom-6)

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer')
      if (!footer) return

      const footerRect = footer.getBoundingClientRect()
      const windowHeight = window.innerHeight

      // footer가 화면에 보이는지 확인
      if (footerRect.top < windowHeight) {
        // footer와 겹치지 않도록 위치 조정
        const overlap = windowHeight - footerRect.top
        setBottomPosition(24 + overlap)
      } else {
        setBottomPosition(24)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // 초기 위치 설정

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <Link
      href="/my-snacks"
      className="fixed right-6 z-50 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white rounded-full p-4 shadow-2xl transition-all hover:scale-110 flex items-center justify-center group animate-float"
      style={{ bottom: `${bottomPosition}px` }}
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
