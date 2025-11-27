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
  const [userInteracted, setUserInteracted] = useState(false)
  const autoPlayAttemptRef = useRef<NodeJS.Timeout | null>(null)

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
          autoplay: 1,
          controls: 0,
          start: 1381, // 시작 시간 (초)
          loop: 1,
          playlist: 'r2ko422xW0w', // 루프를 위해 필요
          mute: 0,
        },
        events: {
          onReady: (event: any) => {
            setIsReady(true)
            event.target.setVolume(30) // 초기 볼륨 설정

            // 자동 재생 시도
            setTimeout(() => {
              event.target.playVideo()
            }, 100)

            // 재생이 안 되면 1초마다 재시도 (최대 10번)
            let attempts = 0
            autoPlayAttemptRef.current = setInterval(() => {
              if (attempts < 10 && event.target.getPlayerState() !== window.YT.PlayerState.PLAYING) {
                event.target.playVideo()
                attempts++
              } else if (attempts >= 10 || event.target.getPlayerState() === window.YT.PlayerState.PLAYING) {
                if (autoPlayAttemptRef.current) {
                  clearInterval(autoPlayAttemptRef.current)
                }
              }
            }, 1000)
          },
          onStateChange: (event: any) => {
            // 재생 상태 업데이트
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING)
          },
        },
      })
    }

    // 사용자 인터랙션 후 자동 재생 시도 (다양한 이벤트 감지)
    const handleUserInteraction = () => {
      if (!userInteracted && playerRef.current) {
        playerRef.current.playVideo()
        setUserInteracted(true)
      }
    }

    // 여러 이벤트에 리스너 등록
    const events = ['click', 'keydown', 'touchstart', 'mousemove', 'scroll']
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true })
    })

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
      if (autoPlayAttemptRef.current) {
        clearInterval(autoPlayAttemptRef.current)
      }
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction)
      })
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

  return (
    <>
      {/* 숨겨진 YouTube 플레이어 */}
      <div id="youtube-player" style={{ display: 'none' }}></div>

      {/* 음악 컨트롤 UI (우측 하단 고정) */}
      <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg p-4 z-[9999] border border-gray-200">
        <div className="flex flex-col gap-3 w-48">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">🎵 배경음악</span>
            <button
              onClick={togglePlay}
              disabled={!isReady}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                isPlaying
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {!isReady ? '로딩 중...' : isPlaying ? '⏸ 일시정지' : '▶ 재생'}
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
              disabled={!isReady}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="text-xs text-gray-600 w-8">{volume}%</span>
          </div>
        </div>
      </div>
    </>
  )
}
