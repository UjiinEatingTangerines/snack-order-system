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
        setShowSuccessOverlay(true)
        setTimeout(() => {
          router.push('/my-snacks')
        }, 800)
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
          <div className="bg-white/95 rounded-2xl shadow-2xl p-8 text-center animate-scaleIn">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-2xl font-bold text-gray-800">완료됨</p>
          </div>
        </div>
      )}
    </div>
  )
}
