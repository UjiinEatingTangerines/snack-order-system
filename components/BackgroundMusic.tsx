'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void
    YT: any
  }
}

export default function BackgroundMusic() {
  const playerRef = useRef<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [volume, setVolume] = useState(30) // 기본 볼륨 30%

  useEffect(() => {
    // YouTube IFrame API 스크립트 로드
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    // API 준비 완료 콜백
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: 'r2ko422xW0w', // YouTube 비디오 ID
        playerVars: {
          autoplay: 0,
          controls: 0,
          start: 1381, // 시작 시간 (초)
          loop: 1,
          playlist: 'r2ko422xW0w', // 루프를 위해 필요
        },
        events: {
          onReady: (event: any) => {
            setIsReady(true)
            event.target.setVolume(30) // 초기 볼륨 설정
          },
          onStateChange: (event: any) => {
            // 재생 상태 업데이트
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING)
          },
        },
      })
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
    }
  }, [])

  const togglePlay = () => {
    if (!playerRef.current) return

    if (isPlaying) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value)
    setVolume(newVolume)
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume)
    }
  }

  if (!isReady) {
    return null // API가 준비될 때까지 숨김
  }

  return (
    <>
      {/* 숨겨진 YouTube 플레이어 */}
      <div id="youtube-player" style={{ display: 'none' }}></div>

      {/* 음악 컨트롤 UI (우측 하단 고정) */}
      <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg p-4 z-50 border border-gray-200">
        <div className="flex flex-col gap-3 w-48">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">🎵 배경음악</span>
            <button
              onClick={togglePlay}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                isPlaying
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isPlaying ? '⏸ 일시정지' : '▶ 재생'}
            </button>
          </div>

          {/* 볼륨 조절 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">🔊</span>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
            <span className="text-xs text-gray-600 w-8">{volume}%</span>
          </div>
        </div>
      </div>
    </>
  )
}
