'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function ApplyPage() {
  const params = useParams()
  const router = useRouter()
  const [internship, setInternship] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchInternship()
  }, [])

  async function fetchInternship() {
    const res = await fetch(`/api/internships/${params.id}`)
    const data = await res.json()
    setInternship(data)
    setLoading(false)
  }

  async function handleApply() {
    setSubmitting(true)
    setError('')

    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ internshipId: params.id }),
    })

    const data = await res.json()

    if (res.ok) {
      setSuccess(true)
      setTimeout(() => router.push('/student'), 2000)
    } else {
      setError(data.error ?? 'Ошибка при подаче заявки')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Загружаем...</p>
      </div>
    )
  }

  if (!internship) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Стажировка не найдена</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-4 flex items-center gap-4">
        <a href="/student/companies" className="text-gray-400 hover:text-gray-600">← Назад</a>
        <h1 className="text-xl font-bold text-blue-600">Подать заявку</h1>
      </div>

      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-white rounded-xl border p-8">
          <h2 className="text-2xl font-bold mb-2">{internship.title}</h2>
          <p className="text-blue-600 font-medium mb-6">{internship.company?.name}</p>

          {internship.description && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Описание</h3>
              <p className="text-gray-700">{internship.description}</p>
            </div>
          )}

          {internship.company?.requirements && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Требования</h3>
              <p className="text-gray-700">{internship.company.requirements}</p>
            </div>
          )}

          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              После подачи заявка будет рассмотрена куратором, затем компанией и администратором.
            </p>
          </div>

          {success ? (
            <div className="text-center py-4">
              <p className="text-2xl mb-2">✅</p>
              <p className="text-green-600 font-medium">Заявка успешно подана!</p>
              <p className="text-gray-400 text-sm mt-1">Перенаправляем на дашборд...</p>
            </div>
          ) : (
            <>
              {error && (
                <p className="text-red-500 text-sm mb-4 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
              )}
              <button
                onClick={handleApply}
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 text-lg"
              >
                {submitting ? 'Отправляем...' : 'Подать заявку'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}