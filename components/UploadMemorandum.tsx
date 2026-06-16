'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UploadMemorandum() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = e.currentTarget
    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement
    const file = fileInput.files?.[0]

    if (!file) {
      setError('Выберите файл')
      setLoading(false)
      return
    }

    if (!file.name.endsWith('.pdf')) {
      setError('Только PDF файлы')
      setLoading(false)
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/memorandum/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()

    if (res.ok) {
      setSuccess(true)
      router.refresh()
    } else {
      setError(data.error || 'Ошибка загрузки')
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="text-center py-6 bg-green-50 rounded-xl border border-green-200">
        <p className="text-2xl mb-2">✅</p>
        <p className="text-green-700 font-medium">Меморандум успешно загружен!</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition">
        <p className="text-3xl mb-2">📤</p>
        <p className="text-gray-600 font-medium mb-1">Загрузить PDF файл</p>
        <p className="text-gray-400 text-sm mb-4">Только файлы в формате PDF</p>
        <input
          type="file"
          accept=".pdf"
          className="block mx-auto text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Загружаем...' : 'Загрузить'}
        </button>
      </div>
    </form>
  )
}