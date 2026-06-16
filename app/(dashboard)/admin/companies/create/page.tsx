'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminCreateCompanyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    founded: '',
    requirements: '',
    address: '',
    phone: '',
    email: '',
    bin: '',
    bank: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/superadmin/create/company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        founded: form.founded ? parseInt(form.founded) : null,
      }),
    })

    if (res.ok) setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center border max-w-md w-full">
          <p className="text-5xl mb-4">✅</p>
          <h2 className="text-xl font-bold mb-2">Компания добавлена!</h2>
          <p className="text-gray-500 mb-6">Компания успешно создана и одобрена</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setSuccess(false); setForm({ name: '', description: '', founded: '', requirements: '', address: '', phone: '', email: '', bin: '', bank: '' }) }}
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
        <h1 className="text-xl font-bold text-blue-600">Добавить компанию</h1>
      </div>

      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-blue-700 text-sm">
            🏢 Компания будет автоматически одобрена и появится в каталоге для студентов
          </p>
        </div>

        <div className="bg-white rounded-2xl border p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium mb-1">Название компании *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ТОО Kaspi Bank"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Описание</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Краткое описание компании..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Год основания</label>
                <input
                  name="founded"
                  value={form.founded}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2008"
                  type="number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">БИН</label>
                <input
                  name="bin"
                  value={form.bin}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123456789012"
                  maxLength={12}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Требования к кандидатам</label>
              <input
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="JavaScript, Python, SQL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Адрес *</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="г. Алматы, ул. Нурмакова 55"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Телефон</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+7 727 123 45 67"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email компании</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="hr@company.kz"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Банк</label>
              <input
                name="bank"
                value={form.bank}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="АО Kaspi Bank"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white py-3 rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50 text-lg"
            >
              {loading ? 'Создаём...' : 'Добавить компанию'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}