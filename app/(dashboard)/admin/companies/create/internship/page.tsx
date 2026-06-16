'use client'

import { useState, useEffect } from 'react'

export default function AdminCreateInternshipPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [companies, setCompanies] = useState<any[]>([])
  const [companyId, setCompanyId] = useState('')
  const [internships, setInternships] = useState([
    { title: '', description: '', salary: '' }
  ])

  useEffect(() => {
    fetch('/api/superadmin/companies-list')
      .then(r => r.json())
      .then(setCompanies)
  }, [])

  function addInternship() {
    setInternships(prev => [...prev, { title: '', description: '', salary: '' }])
  }

  function removeInternship(index: number) {
    setInternships(prev => prev.filter((_, i) => i !== index))
  }

  function updateInternship(index: number, field: string, value: string) {
    setInternships(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/superadmin/create/internship', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, internships }),
    })

    if (res.ok) setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center border max-w-md w-full">
          <p className="text-5xl mb-4">✅</p>
          <h2 className="text-xl font-bold mb-2">Вакансии добавлены!</h2>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setSuccess(false); setCompanyId(''); setInternships([{ title: '', description: '', salary: '' }]) }}
              className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
            >
              Добавить ещё
            </button>
            <a href="/admin" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              На главную
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-4 flex items-center gap-4">
        <a href="/admin" className="text-gray-400 hover:text-gray-600">← Назад</a>
        <h1 className="text-xl font-bold text-blue-600">Добавить вакансии</h1>
      </div>

      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-white rounded-2xl border p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium mb-1">Компания *</label>
              <select
                required
                value={companyId}
                onChange={e => setCompanyId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Выбери компанию</option>
                {companies.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Вакансии</p>
                <button
                  type="button"
                  onClick={addInternship}
                  className="text-xs bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700"
                >
                  + Добавить вакансию
                </button>
              </div>

              {internships.map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 border space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Вакансия #{i + 1}</p>
                    {internships.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInternship(i)}
                        className="text-red-500 text-xs hover:text-red-700"
                      >
                        Удалить
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Название *</label>
                    <input
                      required
                      value={item.title}
                      onChange={e => updateInternship(i, 'title', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Frontend разработчик"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Зарплата</label>
                    <input
                      value={item.salary}
                      onChange={e => updateInternship(i, 'salary', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="150,000тг / По договорённости"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Описание</label>
                    <textarea
                      value={item.description}
                      onChange={e => updateInternship(i, 'description', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Описание вакансии..."
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Создаём...' : `Создать ${internships.length} вакансий`}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}