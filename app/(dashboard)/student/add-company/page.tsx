'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddCompanyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    bin: '',
    position: '',
    bank: '',
    description: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)

    const res = await fetch('/api/student/add-company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center border">
          <p className="text-5xl mb-4">✅</p>
          <h2 className="text-xl font-bold mb-2">Заявка отправлена!</h2>
          <p className="text-gray-500 mb-6">Администратор проверит компанию и свяжется с вами</p>
          <button
            onClick={() => router.push('/student')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Вернуться на дашборд
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-4 flex items-center gap-4">
        <a href="/student/companies" className="text-gray-400 hover:text-gray-600">← Назад</a>
        <h1 className="text-xl font-bold text-blue-600">Добавить компанию</h1>
      </div>

      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-blue-700 text-sm">
            После отправки заявки администратор проверит существование компании.
            Если всё верно — компания будет добавлена в систему и получит доступ к платформе.
          </p>
        </div>

        <div className="bg-white rounded-2xl border p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium mb-1">
                Название компании <span className="text-red-500">*</span>
              </label>
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
              <label className="block text-sm font-medium mb-1">
                Адрес компании <span className="text-red-500">*</span>
              </label>
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
                <label className="block text-sm font-medium mb-1">
                  Телефон <span className="text-red-500">*</span>
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+7 727 123 45 67"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email компании <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="hr@kaspi.kz"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  БИН <span className="text-red-500">*</span>
                </label>
                <input
                  name="bin"
                  value={form.bin}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123456789012"
                  maxLength={12}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Должность студента <span className="text-red-500">*</span>
                </label>
                <input
                  name="position"
                  value={form.position}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Frontend разработчик"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Банк <span className="text-red-500">*</span>
              </label>
              <input
                name="bank"
                value={form.bank}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="АО Kaspi Bank"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Описание деятельности</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Краткое описание компании..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 text-lg"
            >
              {loading ? 'Отправляем...' : 'Отправить заявку'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}