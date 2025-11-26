'use client'

type LoadingOverlayProps = {
  message?: string
}

export default function LoadingOverlay({ message = '처리 중...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 shadow-2xl flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
        <p className="text-gray-800 font-semibold text-lg">{message}</p>
      </div>
    </div>
  )
}
