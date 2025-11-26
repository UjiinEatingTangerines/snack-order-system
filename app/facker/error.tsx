'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ErrorDisplay from '@/components/ErrorDisplay'

export default function FackerError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // 에러 발생 시 로그인 페이지 대신 에러 페이지만 표시
    console.error('Facker page error:', error)
  }, [error])

  // 홈으로 돌아가는 함수로 reset 대체
  const goHome = () => {
    router.push('/')
  }

  return <ErrorDisplay error={error} reset={goHome} />
}
