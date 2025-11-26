'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type SearchResult = {
  title: string
  link: string
  image: string
  lprice: string
  category: string
  brand: string
  maker: string
}

export default function ProposePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userName, setUserName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showSearch, setShowSearch] = useState(true)
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const successMessages = [
    "조르기 성공! 이제 회사가 사줄 차례 🎉",
    "완벽한 선택이에요! 다들 좋아할 거예요 ✨",
    "오늘의 히어로는 바로 당신! 🦸",
    "이 간식, 대박 예감이에요! 🚀",
    "조르기 마스터 등극! 👑",
    "간식 센스가 빛나는군요! ⭐",
    "회사 복지 향상에 기여하셨습니다! 📈",
    "이 간식은 반드시 주문될 것! 🎯",
    "당신의 간식 안목, 인정합니다! 👏",
    "완벽한 조르기였어요! 💯",
    "전설의 간식 제안자 등장! 🌟",
    "이게 바로 프로의 간식 선택! 😎",
    "간식 큐레이터의 탄생! 🎨",
    "회사 분위기 메이커 인정! 🎪",
    "이 간식, 투표 1위 예약! 🥇",
    "당신은 간식의 신! ⚡",
    "완벽한 타이밍, 완벽한 선택! ⏰",
    "간식 센스 만렙 달성! 🎮",
    "오늘의 MVP는 당신! 🏆",
    "이런 간식을 기다렸어요! 🎁",
    "당신의 선택, 모두가 좋아할 거예요! 💝",
    "간식 고르기의 달인! 🥋",
    "회사 사람들이 감사할 거예요! 🙏",
    "이 간식, 대세 될 상! 📊",
    "완벽한 간식 저격! 🎯",
    "당신의 취향, 최고예요! 👍",
    "간식 제안 성공률 100%! 💪",
    "이건 꼭 사야 해요! 🛒",
    "당신의 안목을 믿어요! 👀",
    "간식왕에 등극하셨습니다! 👑",
    "이 정도면 간식 소믈리에! 🍷",
    "회사 복지의 수호자! 🛡️",
    "완벽한 간식 큐레이팅! 📚",
    "당신의 선택은 언제나 옳아요! ✅",
    "간식 센스 폭발! 💥",
    "이 간식, 반드시 통과! 🚦",
    "당신은 간식의 예언자! 🔮",
    "완벽한 저격이었어요! 🎪",
    "간식 제안의 교과서! 📖",
    "당신의 추천, 믿고 먹어요! 🍽️",
    "이건 무조건 히트작! 🎵",
    "간식 센스 인정! 🎖️",
    "회사의 간식 큐레이터! 🎭",
    "완벽한 밸런스의 선택! ⚖️",
    "이 간식, 전설이 될 거예요! 📜",
    "당신은 간식의 마에스트로! 🎼",
    "완벽한 조합이에요! 🧩",
    "간식 제안의 신! 🌈",
    "이건 꼭 사야 하는 간식! 💎",
    "당신의 센스가 빛나네요! 💫",
    "완벽한 타이밍에 완벽한 제안! 🎯",
    "간식 큐레이터 자격증 드립니다! 📜",
    "이 간식, 대박 날 거예요! 🎰",
    "당신은 간식의 구루! 🧙",
    "완벽한 선택의 연속! 🎲",
    "간식 센스 만점! 💯",
    "회사 복지를 책임집니다! 🏢",
    "이건 무조건 투표 받아요! 🗳️",
    "당신의 안목, 타의 추종 불허! 🎯",
    "간식 제안 레전드! 📈",
    "완벽한 간식 포트폴리오! 📊",
    "당신은 간식의 왕! 👑",
    "이 간식, 모두가 원해요! 🎁",
    "완벽한 큐레이션! 🎨",
    "간식 센스 끝판왕! 🔥",
    "당신의 추천은 늘 옳아요! ✨",
    "이건 명작 간식! 🎬",
    "완벽한 저격 성공! 🎯",
    "간식 안목 S급! 🏅",
    "회사의 간식 리더! 👔",
    "이 간식, 필수템! 🎒",
    "당신은 간식 인플루언서! 📱",
    "완벽한 선택의 귀재! 🧠",
    "간식 센스 우주 최강! 🌌",
    "이건 무조건 승리! 🏆",
    "당신의 취향, 존경합니다! 🙇",
    "완벽한 간식 라인업! 📋",
    "간식 제안의 달인! 🥷",
    "이 간식, 대세 확정! 📢",
    "당신은 간식의 현인! 📚",
    "완벽한 밸런스 패치! ⚡",
    "간식 센스 올림픽 금메달! 🥇",
    "회사 간식 문화를 선도합니다! 🚀",
    "이건 역대급 선택! 🌟",
    "당신의 안목, 믿고 갑니다! 💪",
    "완벽한 간식 조합! 🎪",
    "간식 큐레이션 만렙! 🎮",
    "이 간식, 투표 독식 예정! 📊",
    "당신은 간식의 전문가! 🎓",
    "완벽한 타이밍 저격! ⏱️",
    "간식 센스 국보급! 🏛️",
    "회사 복지 향상 기여자! 🌈",
    "이건 무조건 통과! ✅",
    "당신의 선택, 완벽해요! 💎",
    "완벽한 간식 네이밍 센스! 📝",
    "간식 제안의 교수님! 👨‍🏫",
    "이 간식, 필수 아이템! 🎁",
    "당신은 간식 컨설턴트! 💼",
    "완벽한 저격 능력! 🎯",
    "간식 센스 대박! 💥",
    "회사의 간식 큐레이터 장인! 🔨"
  ]
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    imageUrl: '',
    category: '',
    price: '',
    proposedBy: '',
  })

  useEffect(() => {
    // localStorage에서 사용자 이름 가져오기
    const savedName = localStorage.getItem('userName')
    if (savedName) {
      setUserName(savedName)
      setFormData(prev => ({ ...prev, proposedBy: savedName }))
    }
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const response = await fetch(`/api/search-snacks?query=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.items)
      } else {
        alert('검색 중 오류가 발생했습니다.')
      }
    } catch (error) {
      alert('검색 중 오류가 발생했습니다.')
    } finally {
      setSearching(false)
    }
  }

  const selectSearchResult = (item: SearchResult) => {
    setFormData({
      ...formData,
      name: item.title,
      url: item.link,
      imageUrl: item.image,
      category: item.category || item.brand || '기타',
      price: item.lprice || '',
    })
    setShowSearch(false)
    setSearchResults([])
    setSearchQuery('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 제안자 이름 확인
    let proposer = formData.proposedBy
    if (!proposer) {
      const name = prompt('이름을 입력해주세요:')
      if (!name || !name.trim()) {
        alert('이름을 입력해야 간식을 제안할 수 있습니다.')
        return
      }
      proposer = name.trim()
      localStorage.setItem('userName', proposer)
      setUserName(proposer)
      setFormData(prev => ({ ...prev, proposedBy: proposer }))
    }

    setLoading(true)

    try {
      const response = await fetch('/api/snacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, proposedBy: proposer }),
      })

      if (response.ok) {
        const randomMessage = successMessages[Math.floor(Math.random() * successMessages.length)]
        setSuccessMessage(randomMessage)
        setShowSuccessOverlay(true)
        setTimeout(() => {
          router.push('/my-snacks')
        }, 1500)
      } else {
        const error = await response.json()
        alert(`오류: ${error.message}`)
      }
    } catch (error) {
      alert('간식 제안 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
        간식 조르기
      </h1>

      {/* 네이버 검색 */}
      {showSearch && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg shadow p-4 sm:p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🔍</span>
            네이버 쇼핑에서 검색
          </h2>
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="간식 이름을 검색하세요 (예: 허니버터칩)"
            />
            <button
              type="submit"
              disabled={searching}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {searching ? '검색 중...' : '검색'}
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {searchResults.map((item, index) => (
                <div
                  key={index}
                  onClick={() => selectSearchResult(item)}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-green-500 hover:shadow-md cursor-pointer transition-all"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.title}</p>
                    {item.lprice && (
                      <p className="text-sm text-green-600 font-semibold">
                        {parseInt(item.lprice).toLocaleString()}원
                      </p>
                    )}
                    {item.brand && (
                      <p className="text-xs text-gray-500">{item.brand}</p>
                    )}
                  </div>
                  <button className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200">
                    선택
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowSearch(false)}
            className="mt-4 text-sm text-gray-600 hover:text-gray-800"
          >
            직접 입력하기 →
          </button>
        </div>
      )}

      {!showSearch && (
        <button
          type="button"
          onClick={() => setShowSearch(true)}
          className="mb-4 text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
        >
          <span>🔍</span>
          네이버 쇼핑에서 검색하기
        </button>
      )}

      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 간식 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              간식 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="예: 허니버터칩"
            />
          </div>

          {/* 구매 링크 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              구매 링크 <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              required
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://..."
            />
            <p className="mt-1 text-sm text-gray-500">
              네이버 쇼핑, 쿠팡 등 구매 가능한 링크를 입력하세요
            </p>
          </div>

          {/* 이미지 URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이미지 URL (선택)
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://..."
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 (선택)
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">선택하세요</option>
              <option value="과자">과자</option>
              <option value="초콜릿">초콜릿</option>
              <option value="사탕">사탕</option>
              <option value="젤리">젤리</option>
              <option value="건강간식">건강간식</option>
              <option value="음료">음료</option>
              <option value="기타">기타</option>
            </select>
          </div>

          {/* 가격 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              가격 (선택)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="예: 3500"
              min="0"
              step="1"
            />
            <p className="mt-1 text-sm text-gray-500">
              네이버 검색으로 선택한 경우 자동 입력됩니다
            </p>
          </div>

          {/* 제안자 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제안자 이름 (선택)
            </label>
            <input
              type="text"
              value={formData.proposedBy}
              onChange={(e) => setFormData({ ...formData, proposedBy: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="익명으로 제안하려면 비워두세요"
            />
          </div>

          {/* 버튼 */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? '조르는 중...' : '간식 조르기'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="sm:px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
          </div>
        </form>
      </div>

      {/* 성공 오버레이 */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white/95 rounded-2xl shadow-2xl p-8 text-center animate-scaleIn max-w-md mx-4">
            <div className="text-6xl mb-4">✨</div>
            <p className="text-xl font-bold text-gray-800 leading-relaxed">{successMessage}</p>
          </div>
        </div>
      )}
    </div>
  )
}
