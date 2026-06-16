'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Tab = 'student' | 'company' | 'internship'

export default function SuperAdminCreatePage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('student')

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 px-8 py-4 flex items-center gap-4">
        <a href="/superadmin" className="text-gray-400 hover:text-gray-300">← Назад</a>
        <h1 className="text-xl font-bold">Создать</h1>
      </div>

      <div className="max-w-3xl mx-auto p-8">
        {/* Табы */}
        <div className="flex gap-2 mb-8">
          {([
            { id: 'student', label: '👤 Студент' },
            { id: 'company', label: '🏢 Компания' },
            { id: 'internship', label: '💼 Вакансия' },
          ] as { id: Tab, label: string }[]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === t.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 border border-gray-600 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'student' && <CreateStudentForm />}
        {tab === 'company' && <CreateCompanyForm />}
        {tab === 'internship' && <CreateInternshipForm />}
      </div>
    </div>
  )
}

function CreateStudentForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<any>(null)
  const [form, setForm] = useState({
    name: '', email: '', group: '', skills: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/superadmin/create/student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      }),
    })

    const data = await res.json()
    if (res.ok) setSuccess(data)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
        <p className="text-green-400 text-lg font-bold mb-4">✅ Студент создан!</p>
        
        {/* Данные студента */}
        <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm space-y-2 mb-6">
          <p><span className="text-gray-400">Имя:</span> <span className="text-white">{success.name}</span></p>
          <p><span className="text-gray-400">Email:</span> <span className="text-white">{success.email}</span></p>
          <p><span className="text-gray-400">Пароль:</span> <span className="text-green-400">{success.password}</span></p>
          <p><span className="text-gray-400">№ договора:</span> <span className="text-blue-400">№{success.contractNumber}</span></p>
        </div>

        {/* Демо письмо */}
        <div className="bg-gray-900 rounded-xl border border-gray-600 overflow-hidden mb-4">
          <div className="bg-gray-700 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-300">📧 Демо — письмо студенту</span>
            </div>
            <span className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded-full">Демо режим</span>
          </div>
          <div className="p-4 text-sm space-y-2">
            <p className="text-gray-400 text-xs">Кому: <span className="text-white">{success.email}</span></p>
            <p className="text-gray-400 text-xs">Тема: <span className="text-white">Добро пожаловать на платформу Qadam!</span></p>
            <div className="border-t border-gray-700 pt-3 mt-2 text-gray-300 space-y-2">
              <p>Здравствуйте, <span className="text-white font-medium">{success.name}</span>!</p>
              <p>Для вас был создан аккаунт на платформе <span className="text-blue-400">Qadam</span>.</p>
              <div className="bg-gray-800 rounded-lg p-3 space-y-1">
                <p>🌐 <span className="text-gray-400">Сайт:</span> <span className="text-blue-400">qadam.kz</span></p>
                <p>📧 <span className="text-gray-400">Email:</span> <span className="text-white">{success.email}</span></p>
                <p>🔑 <span className="text-gray-400">Пароль:</span> <span className="text-green-400">{success.password}</span></p>
                <p>📄 <span className="text-gray-400">№ договора:</span> <span className="text-white">№{success.contractNumber}</span></p>
              </div>
              <p className="text-yellow-400 text-xs">⚠️ Пожалуйста, смените пароль после первого входа.</p>
              <p className="text-gray-500 text-xs">С уважением, команда Qadam</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-yellow-500 mb-4">
          ⚠️ Это демо-режим. Реальная отправка email отключена.
        </p>

        <button
          onClick={() => setSuccess(null)}
          className="border border-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-700"
        >
          Создать ещё
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl border border-gray-700 p-6 space-y-4">
      <h2 className="text-lg font-semibold mb-2">Новый студент</h2>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Полное имя *</label>
        <input
          required
          value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Иванов Иван Иванович"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Email *</label>
        <input
          required
          type="email"
          value={form.email}
          onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="student@email.com"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Группа</label>
        <input
          value={form.group}
          onChange={e => setForm(p => ({ ...p, group: e.target.value }))}
          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="ИС22-4А"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Навыки (через запятую)</label>
        <input
          value={form.skills}
          onChange={e => setForm(p => ({ ...p, skills: e.target.value }))}
          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="JavaScript, Python, SQL"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Создаём...' : 'Создать студента'}
      </button>
    </form>
  )
}

function CreateCompanyForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', founded: '',
    requirements: '', salary: '', address: '',
    phone: '', email: '', bin: '', position: '',
    bank: '',
  })

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
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 text-center">
        <p className="text-green-400 text-lg font-bold mb-4">✅ Компания создана!</p>
        <button
          onClick={() => { setSuccess(false); setForm({ name: '', description: '', founded: '', requirements: '', salary: '', address: '', phone: '', email: '', bin: '', position: '', bank: '' }) }}
          className="border border-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-700"
        >
          Создать ещё
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl border border-gray-700 p-6 space-y-4">
      <h2 className="text-lg font-semibold mb-2">Новая компания</h2>

      {[
        { key: 'name', label: 'Название', placeholder: 'ТОО Kaspi Bank', required: true },
        { key: 'description', label: 'Описание', placeholder: 'Крупнейший финтех Казахстана', required: false },
        { key: 'founded', label: 'Год основания', placeholder: '2008', required: false },
        { key: 'requirements', label: 'Требования', placeholder: 'JavaScript, Python', required: false },
        { key: 'address', label: 'Адрес', placeholder: 'г. Алматы, ул. Нурмакова 55', required: false },
        { key: 'phone', label: 'Телефон', placeholder: '+7 727 123 45 67', required: false },
        { key: 'email', label: 'Email компании', placeholder: 'hr@kaspi.kz', required: false },
        { key: 'bin', label: 'БИН', placeholder: '123456789012', required: false },
        { key: 'bank', label: 'Банк', placeholder: 'АО Kaspi Bank', required: false },
      ].map(field => (
        <div key={field.key}>
          <label className="block text-sm text-gray-400 mb-1">{field.label}</label>
          <input
            required={field.required}
            value={(form as any)[field.key]}
            onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={field.placeholder}
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50"
      >
        {loading ? 'Создаём...' : 'Создать компанию'}
      </button>
    </form>
  )
}

function CreateInternshipForm() {
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
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 text-center">
        <p className="text-green-400 text-lg font-bold mb-4">✅ Вакансии созданы!</p>
        <button
          onClick={() => {
            setSuccess(false)
            setCompanyId('')
            setInternships([{ title: '', description: '', salary: '' }])
          }}
          className="border border-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-700"
        >
          Создать ещё
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl border border-gray-700 p-6 space-y-5">
      <h2 className="text-lg font-semibold">Новые вакансии</h2>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Компания *</label>
        <select
          required
          value={companyId}
          onChange={e => setCompanyId(e.target.value)}
          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Выбери компанию</option>
          {companies.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-300">Вакансии</p>
          <button
            type="button"
            onClick={addInternship}
            className="text-xs bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700"
          >
            + Добавить вакансию
          </button>
        </div>

        {internships.map((item, i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-4 border border-gray-700 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Вакансия #{i + 1}</p>
              {internships.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeInternship(i)}
                  className="text-red-400 text-xs hover:text-red-300"
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
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Frontend разработчик"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Зарплата</label>
              <input
                value={item.salary}
                onChange={e => updateInternship(i, 'salary', e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="150,000тг / По договорённости"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Описание</label>
              <textarea
                value={item.description}
                onChange={e => updateInternship(i, 'description', e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white h-20 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Описание вакансии..."
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? 'Создаём...' : `Создать ${internships.length} вакансий`}
      </button>
    </form>
  )
}