'use client'

import { useState } from 'react'

type StudentRow = {
  name: string
  email: string
  group: string
}

type CreatedStudent = {
  name: string
  email: string
  password: string
  contractNumber: number
  status: 'success' | 'error'
  error?: string
}

export default function SuperAdminStudentsPage() {
  const [rows, setRows] = useState<StudentRow[]>([
    { name: '', email: '', group: 'ИС22-4А' }
  ])
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState<CreatedStudent[]>([])
  const [done, setDone] = useState(false)

  function addRow() {
    setRows(prev => [...prev, { name: '', email: '', group: 'ИС22-4А' }])
  }

  function removeRow(index: number) {
    setRows(prev => prev.filter((_, i) => i !== index))
  }

  function updateRow(index: number, field: keyof StudentRow, value: string) {
    setRows(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row))
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const text = e.clipboardData.getData('text')
    const lines = text.trim().split('\n')
    const newRows: StudentRow[] = lines.map(line => {
      const parts = line.split('\t')
      return {
        name: parts[0]?.trim() ?? '',
        email: parts[1]?.trim() ?? '',
        group: parts[2]?.trim() ?? 'ИС22-4А',
      }
    }).filter(r => r.name || r.email)

    if (newRows.length > 0) setRows(newRows)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const valid = rows.filter(r => r.name && r.email)
    if (valid.length === 0) return

    setLoading(true)

    const res = await fetch('/api/admin/create-students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students: valid }),
    })

    const data = await res.json()
    setCreated(data.results ?? [])
    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="bg-gray-800 border-b border-gray-700 px-8 py-4 flex items-center gap-4">
          <a href="/superadmin" className="text-gray-400 hover:text-gray-300">← Назад</a>
          <h1 className="text-xl font-bold">Результаты создания</h1>
        </div>

        <div className="max-w-5xl mx-auto p-8">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-green-400">
                ✅ Создано {created.filter(s => s.status === 'success').length} из {created.length} студентов
              </h2>
              <button
                onClick={() => {
                  const text = created
                    .filter(s => s.status === 'success')
                    .map(s => `${s.name}\t${s.email}\t${s.password}`)
                    .join('\n')
                  navigator.clipboard.writeText(text)
                  alert('Скопировано!')
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
              >
                Копировать всё
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-3 font-medium text-gray-400">№</th>
                    <th className="text-left p-3 font-medium text-gray-400">Имя</th>
                    <th className="text-left p-3 font-medium text-gray-400">Email</th>
                    <th className="text-left p-3 font-medium text-gray-400">Пароль</th>
                    <th className="text-left p-3 font-medium text-gray-400">№ договора</th>
                    <th className="text-left p-3 font-medium text-gray-400">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {created.map((s, i) => (
                    <tr key={i} className="border-b border-gray-700">
                      <td className="p-3 text-gray-500">{i + 1}</td>
                      <td className="p-3 text-white font-medium">{s.name}</td>
                      <td className="p-3 text-gray-400">{s.email}</td>
                      <td className="p-3">
                        {s.status === 'success' ? (
                          <code className="bg-gray-700 px-2 py-1 rounded text-xs text-green-400">
                            {s.password}
                          </code>
                        ) : '—'}
                      </td>
                      <td className="p-3">
                        {s.status === 'success' ? (
                          <span className="text-blue-400 font-medium">№{s.contractNumber}</span>
                        ) : '—'}
                      </td>
                      <td className="p-3">
                        {s.status === 'success' ? (
                          <span className="bg-green-900 text-green-400 text-xs px-2 py-1 rounded-full">✓ Создан</span>
                        ) : (
                          <span className="bg-red-900 text-red-400 text-xs px-2 py-1 rounded-full">{s.error}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Демо SMS */}
          <div className="bg-gray-800 border border-yellow-600 rounded-2xl p-6">
            <h3 className="font-semibold text-yellow-400 mb-2">📱 Демо — SMS уведомление</h3>
            <p className="text-gray-400 text-sm mb-3">Пример сообщения которое получит студент:</p>
            {created.filter(s => s.status === 'success').slice(0, 1).map((s, i) => (
              <div key={i} className="bg-gray-900 rounded-xl p-4 font-mono text-sm text-gray-300">
                <p>Добро пожаловать в Qadam!</p>
                <p>Ваши данные для входа:</p>
                <p>Email: {s.email}</p>
                <p>Пароль: {s.password}</p>
                <p>Сайт: qadam.kz</p>
              </div>
            ))}
            <p className="text-yellow-500 text-xs mt-2">* Реальная отправка SMS отключена (демо режим)</p>
          </div>

          <button
            onClick={() => { setDone(false); setRows([{ name: '', email: '', group: 'ИС22-4А' }]); setCreated([]) }}
            className="mt-6 border border-gray-600 px-6 py-2 rounded-lg text-sm hover:bg-gray-800"
          >
            Создать ещё
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 px-8 py-4 flex items-center gap-4">
        <a href="/superadmin" className="text-gray-400 hover:text-gray-300">← Назад</a>
        <h1 className="text-xl font-bold">Массовое создание студентов</h1>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-blue-900 border border-blue-700 rounded-xl p-4 mb-6">
          <p className="text-blue-300 text-sm">
            💡 Можно вставить данные из Excel — скопируй колонки (Имя, Email, Группа) и вставь в первую строку
          </p>
        </div>

        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-3 font-medium text-gray-400 w-8">№</th>
                    <th className="text-left p-3 font-medium text-gray-400">Полное имя</th>
                    <th className="text-left p-3 font-medium text-gray-400">Email</th>
                    <th className="text-left p-3 font-medium text-gray-400">Группа</th>
                    <th className="p-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-b border-gray-700">
                      <td className="p-2 text-gray-500 text-center">{i + 1}</td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.name}
                          onChange={e => updateRow(i, 'name', e.target.value)}
                          onPaste={i === 0 ? handlePaste : undefined}
                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Иванов Иван Иванович"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="email"
                          value={row.email}
                          onChange={e => updateRow(i, 'email', e.target.value)}
                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="student@email.com"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.group}
                          onChange={e => updateRow(i, 'group', e.target.value)}
                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="ИС22-4А"
                        />
                      </td>
                      <td className="p-2 text-center">
                        {rows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRow(i)}
                            className="text-red-400 hover:text-red-300 text-lg"
                          >
                            ×
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={addRow}
                className="border border-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-700 text-gray-300"
              >
                + Добавить строку
              </button>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {rows.filter(r => r.name && r.email).length} студентов
                </span>
                <button
                  type="submit"
                  disabled={loading || rows.filter(r => r.name && r.email).length === 0}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Создаём...' : 'Создать аккаунты'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}