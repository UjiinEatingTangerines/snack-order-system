'use client'

const notFoundMessages = [
  {
    emoji: '🔍',
    title: '간식을 찾을 수 없어요!',
    message: '이 페이지는 이미 누가 다 먹어버린 것 같아요.',
    color: 'bg-blue-50 border-blue-200'
  },
  {
    emoji: '🗺️',
    title: '길을 잃었어요!',
    message: '과자 부스러기를 따라왔는데 여기가 어디죠?',
    color: 'bg-green-50 border-green-200'
  },
  {
    emoji: '🎯',
    title: '과녁을 빗나갔어요!',
    message: '원하시는 간식이 이 진열대에 없는 것 같아요.',
    color: 'bg-red-50 border-red-200'
  },
  {
    emoji: '🧭',
    title: '나침반이 고장났어요!',
    message: '간식 창고에서 길을 잃었어요. 404번 통로를 찾을 수 없어요.',
    color: 'bg-purple-50 border-purple-200'
  },
  {
    emoji: '📦',
    title: '빈 상자예요!',
    message: '찾으시는 간식이 이 상자에 없어요. 다른 곳을 찾아볼까요?',
    color: 'bg-amber-50 border-amber-200'
  }
]

export default function NotFound() {
  const message = notFoundMessages[Math.floor(Math.random() * notFoundMessages.length)]

  return (
    <div className="min-h-[500px] flex items-center justify-center p-4">
      <div className={`max-w-md w-full ${message.color} border-2 rounded-2xl p-8 text-center shadow-lg`}>
        <div className="text-8xl mb-4">{message.emoji}</div>
        <div className="text-6xl font-bold text-gray-400 mb-2">404</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          {message.title}
        </h2>
        <p className="text-gray-600 mb-6">
          {message.message}
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            이전 페이지로
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  )
}
