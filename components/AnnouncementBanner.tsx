'use client'

import { useEffect, useState } from 'react'

type Announcement = {
  id: string
  message: string
  createdAt: string
}

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const response = await fetch('/api/announcements')
        const data = await response.json()
        if (data && data.message) {
          setAnnouncement(data)
        }
      } catch (error) {
        console.error('공지사항 불러오기 오류:', error)
      }
    }

    fetchAnnouncement()
  }, [])

  if (!announcement || !isVisible) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-orange-500 to-primary-600 text-white py-4 px-4 relative animate-fade-in">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-2xl animate-bounce">📢</span>
          <p className="text-lg font-medium">{announcement.message}</p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-gray-200 transition-colors flex-shrink-0"
          aria-label="공지사항 닫기"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
