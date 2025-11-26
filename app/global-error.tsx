'use client'

import ErrorDisplay from '@/components/ErrorDisplay'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ko">
      <body>
        <ErrorDisplay error={error} reset={reset} />
      </body>
    </html>
  )
}
