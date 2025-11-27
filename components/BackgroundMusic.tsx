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
  const [isFullyLoaded, setIsFullyLoaded] = useState(false) // 완전히 로드되어 재생 중인지
  const [volume, setVolume] = useState(30) // 기본 볼륨 30%
  const [userInteracted, setUserInteracted] = useState(false)
  const [bottomPosition, setBottomPosition] = useState(24) // 기본 bottom 위치 (6 * 4 = 24px)
  const userPausedRef = useRef(false) // 사용자가 수동으로 일시정지했는지 추적

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
          start: 1, // 시작 시간 (1초)
          loop: 1,
          playlist: 'r2ko422xW0w', // 루프를 위해 필요
          mute: 1, // 음소거 상태로 시작 (브라우저 정책 준수)
        },
        events: {
          onReady: (event: any) => {
            setIsReady(true)
            console.log('YouTube Player Ready - playing muted')

            // 음소거 상태로 재생 시작 (브라우저가 허용)
            event.target.playVideo()
          },
          onStateChange: (event: any) => {
            const state = event.data
            console.log('Player state changed:', state, 'PLAYING=1, PAUSED=2')
            setIsPlaying(state === window.YT.PlayerState.PLAYING)

            // 처음 재생이 시작되면 완전히 로드되었다고 표시
            if (state === window.YT.PlayerState.PLAYING) {
              setIsFullyLoaded(true)
            }

            // 재생이 멈췄을 때 (사용자가 수동으로 멈춘 게 아니면 자동 재생)
            if (state === window.YT.PlayerState.PAUSED && !userPausedRef.current) {
              console.log('Auto-restarting paused video')
              setTimeout(() => {
                event.target.playVideo()
              }, 100)
            }
          },
        },
      })
    }

    // 사용자 인터랙션 후 음소거 해제
    const handleUserInteraction = () => {
      if (!userInteracted && playerRef.current && isReady) {
        console.log('User interaction detected - unmuting')
        setUserInteracted(true)

        try {
          // 플레이어가 완전히 로드되었는지 확인
          const iframe = playerRef.current.getIframe?.()
          if (!iframe || !iframe.src) {
            console.log('Player iframe not ready during interaction')
            return
          }

          // 음소거 해제 (안전하게 체크)
          const muted = playerRef.current.isMuted?.()
          if (muted) {
            playerRef.current.unMute()
            playerRef.current.setVolume(30)

            // 재생 보장
            setTimeout(() => {
              try {
                if (playerRef.current && playerRef.current.getPlayerState) {
                  const state = playerRef.current.getPlayerState()
                  if (state !== window.YT.PlayerState.PLAYING) {
                    console.log('Restarting after unmute')
                    playerRef.current.playVideo()
                  }
                  console.log('Unmute complete, state:', state)
                }
              } catch (err) {
                console.log('Error checking player state:', err)
              }
            }, 100)
          }
        } catch (err) {
          console.log('Error during unmute:', err)
        }
      }
    }

    // 여러 이벤트에 리스너 등록
    const events = ['click', 'keydown', 'touchstart', 'scroll']
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true })
    })

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction)
      })
    }
  }, [isReady, userInteracted])

  // Footer와 겹치지 않도록 스크롤 시 위치 조정
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

  const togglePlay = () => {
    if (!playerRef.current || !isReady || !isFullyLoaded) return

    try {
      // 플레이어가 완전히 로드되었는지 확인
      const iframe = playerRef.current.getIframe?.()
      if (!iframe || !iframe.src) {
        console.log('Player iframe not ready')
        return
      }

      // 플레이어 상태 확인
      const playerState = playerRef.current.getPlayerState?.()
      if (playerState === undefined) return

      if (isPlaying) {
        // 사용자가 수동으로 일시정지
        userPausedRef.current = true
        playerRef.current.pauseVideo()
      } else {
        // 사용자가 재생 버튼 클릭
        userPausedRef.current = false

        // 음소거 상태이면 해제 (안전하게 체크)
        try {
          const muted = playerRef.current.isMuted?.()
          if (muted) {
            playerRef.current.unMute()
            playerRef.current.setVolume(30)
          }
        } catch (e) {
          console.log('unmute error:', e)
        }

        playerRef.current.playVideo()
      }
    } catch (err) {
      console.log('Error toggling play:', err)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value)
    setVolume(newVolume)
    if (playerRef.current && isReady && isFullyLoaded) {
      try {
        // 플레이어가 완전히 로드되었는지 확인
        const iframe = playerRef.current.getIframe?.()
        if (!iframe || !iframe.src) {
          console.log('Player iframe not ready')
          return
        }

        // 플레이어 상태 확인
        const playerState = playerRef.current.getPlayerState?.()
        if (playerState === undefined) return

        // 음소거 상태이면 해제 (안전하게 체크)
        try {
          const muted = playerRef.current.isMuted?.()
          if (muted) {
            playerRef.current.unMute()
          }
        } catch (e) {
          console.log('unmute error:', e)
        }

        playerRef.current.setVolume(newVolume)
      } catch (err) {
        console.log('Error changing volume:', err)
      }
    }
  }

  return (
    <>
      {/* 숨겨진 YouTube 플레이어 */}
      <div id="youtube-player" style={{ display: 'none' }}></div>

      {/* 음악 컨트롤 UI (좌측 하단 고정) */}
      <div
        className="fixed left-6 bg-white rounded-lg shadow-lg p-4 z-[60] border border-gray-200"
        style={{ bottom: `${bottomPosition}px` }}
      >
        <div className="flex flex-col gap-3 w-48">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">🎵 배경음악</span>
            <button
              onClick={togglePlay}
              disabled={!isFullyLoaded}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${isPlaying
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {!isFullyLoaded ? '로딩 중...' : isPlaying ? '⏸ 일시정지' : '▶ 재생'}
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
              disabled={!isFullyLoaded}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="text-xs text-gray-600 w-8">{volume}%</span>
          </div>
        </div>
      </div>
    </>
  )
}
