'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function FloatingVoteButton() {
  const [bottomPosition, setBottomPosition] = useState(120)

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer')
      if (!footer) return

      const footerRect = footer.getBoundingClientRect()
      const windowHeight = window.innerHeight

      if (footerRect.top < windowHeight) {
        const overlap = windowHeight - footerRect.top
        setBottomPosition(120 + overlap)
      } else {
        setBottomPosition(120)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <Link
      href="/snacks"
      className="fixed right-6 z-50 bg-gradient-to-br from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white rounded-full p-4 shadow-2xl transition-all hover:scale-110 flex items-center justify-center group animate-float"
      style={{ bottom: `${bottomPosition}px` }}
    >
      <span className="text-3xl">👍</span>
      <span className="absolute right-full mr-3 whitespace-nowrap bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
        투표하기
      </span>
    </Link>
  )
}
