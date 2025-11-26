'use client'

import { useEffect, useState } from 'react'

type Activity = {
  id: string
  type: 'snack_proposal' | 'order_created'
  message: string
  emoji: string
  timestamp: Date
}

export default function ActivityNotification() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [lastChecked, setLastChecked] = useState<Date>(new Date())

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch(`/api/recent-activities?since=${lastChecked.toISOString()}`)
      if (response.ok) {
        const data = await response.json()
        if (data.activities && data.activities.length > 0) {
          setActivities(prev => [...data.activities, ...prev].slice(0, 5)) // 최대 5개까지만 유지
          setLastChecked(new Date())
        }
      }
    } catch (error) {
      console.error('활동 조회 실패:', error)
    }
  }

  useEffect(() => {
    // 10초마다 새로운 활동 확인
    const interval = setInterval(fetchRecentActivities, 10000)
    return () => clearInterval(interval)
  }, [lastChecked])

  useEffect(() => {
    // 각 활동을 5초 후에 제거
    if (activities.length > 0) {
      const timer = setTimeout(() => {
        setActivities(prev => prev.slice(0, -1))
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [activities])

  if (activities.length === 0) return null

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      {activities.map((activity, index) => (
        <div
          key={activity.id}
          className="bg-white/90 backdrop-blur-md border-2 border-primary-300 rounded-xl shadow-2xl px-6 py-4 animate-slideDown"
          style={{
            animationDelay: `${index * 100}ms`,
            opacity: 1 - (index * 0.15)
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">{activity.emoji}</span>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {activity.message}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(activity.timestamp).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
