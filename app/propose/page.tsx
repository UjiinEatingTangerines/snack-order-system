'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProposePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    imageUrl: '',
    category: '',
    proposedBy: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/snacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert('간식이 제안되었습니다!')
        router.push('/snacks')
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
        간식 제안하기
      </h1>

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
              className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? '제안 중...' : '간식 제안하기'}
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
    </div>
  )
}
