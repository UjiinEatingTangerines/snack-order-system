const apiErrorMessages = [
  '🍪 쿠키 항아리가 비었어요! 다시 채울 시간이 필요해요.',
  '🥨 프레첼이 너무 꼬여서 풀 수가 없어요!',
  '🍫 초콜릿이 녹아서 흘러내렸어요. 잠시 후 다시 시도해주세요.',
  '🍩 도넛 구멍으로 데이터가 빠져나갔어요!',
  '🥤 음료수를 쏟았어요! 청소하는 동안 기다려주세요.',
  '🍿 팝콘이 아직 덜 튀었어요. 조금만 기다려주세요.',
  '🧁 컵케이크가 오븐에서 타고 있어요!',
  '🍦 아이스크림이 너무 빨리 녹고 있어요!',
  '🥞 팬케이크를 뒤집다가 바닥에 떨어뜨렸어요.',
  '🍕 피자 배달이 길이 막혀서 지연되고 있어요.',
  '🧃 주스가 바닥났어요! 새로 짜는 중이에요.',
  '🍰 케이크를 자르다가 무너뜨렸어요.',
  '🍬 사탕이 서로 달라붙어서 분리하는 중이에요.',
  '🥗 샐러드 재료가 바닥에 흩어졌어요!',
  '🌮 타코 껍질이 부서졌어요. 새로 만들고 있어요.',
  '🍌 바나나 껍질에 미끄러졌어요!',
  '🥪 샌드위치가 와르르 무너졌어요.',
  '🍓 딸기가 데이터센터 밖으로 굴러갔어요!',
  '🥐 크루아상 부스러기를 청소하는 중이에요.',
  '🍡 경단이 꼬치에서 떨어졌어요!'
]

export function getRandomApiError(customMessage?: string): string {
  const randomMessage = apiErrorMessages[Math.floor(Math.random() * apiErrorMessages.length)]
  return customMessage ? `${randomMessage} (${customMessage})` : randomMessage
}

export function apiError(status: number, customMessage?: string) {
  return new Response(
    JSON.stringify({
      error: getRandomApiError(customMessage)
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
