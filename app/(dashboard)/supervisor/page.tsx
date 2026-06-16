'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

type DiaryEntry = {
  id: string
  date: string
  status: 'PRESENT' | 'ABSENT'
  report: string | null
  absenceReason: string | null
  supervisorStatus: 'PENDING' | 'CONFIRMED' | 'REJECTED'
  supervisorComment: string | null
  student: {
    id: string
    user: { name: string | null; email: string | null }
    group: string | null
  }
}

export default function SupervisorDashboard() {
  const { data: session } = useSession()
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState<string | null>(null)
  const [tab, setTab] = useState<'PENDING' | 'CONFIRMED' | 'REJECTED'>('PENDING')

  useEffect(() => {
    fetchEntries()
  }, [])

  async function fetchEntries() {
    const res = await fetch('/api/supervisor/diary')
    const data = await res.json()
    setEntries(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function handleAction(id: string, action: 'approve' | 'reject') {
    setProcessing(id)
    await fetch(`/api/supervisor/diary/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, comment: comment[id] || null }),
    })
    setProcessing(null)
    fetchEntries()
  }

  const filtered = entries.filter(e => e.supervisorStatus === tab)
  const pendingCount = entries.filter(e => e.supervisorStatus === 'PENDING').length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">Qadam — Супервизор</h1>
        <div className="flex items-center gap-4">
          <a href="/company/memorandum" className="text-sm text-gray-600 hover:text-blue-600">
            📋 Меморандум
          </a>
          <span className="text-sm text-gray-600">{session?.user?.name}</span>
          <a href="/signout" className="text-sm text-red-500 hover:underline">Выйти</a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        <h2 className="text-2xl font-bold mb-2">Дневники студентов</h2>
        <p className="text-gray-500 mb-6">Только студенты вашей компании</p>

        {/* Статистика */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border text-center">
            <p className="text-3xl font-bold text-yellow-500">{entries.filter(e => e.supervisorStatus === 'PENDING').length}</p>
            <p className="text-sm text-gray-500 mt-1">Ожидают проверки</p>
          </div>
          <div className="bg-white rounded-xl p-5 border text-center">
            <p className="text-3xl font-bold text-green-600">{entries.filter(e => e.supervisorStatus === 'CONFIRMED').length}</p>
            <p className="text-sm text-gray-500 mt-1">Подтверждено</p>
          </div>
          <div className="bg-white rounded-xl p-5 border text-center">
            <p className="text-3xl font-bold text-red-500">{entries.filter(e => e.supervisorStatus === 'REJECTED').length}</p>
            <p className="text-sm text-gray-500 mt-1">Отклонено</p>
          </div>
        </div>

        {/* Табы */}
        <div className="flex gap-2 mb-6">
          {(['PENDING', 'CONFIRMED', 'REJECTED'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === t ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t === 'PENDING' ? `Ожидают ${pendingCount > 0 ? `(${pendingCount})` : ''}` :
               t === 'CONFIRMED' ? 'Подтверждённые' : 'Отклонённые'}
            </button>
          ))}
        </div>

        {/* Записи */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-gray-400 py-12">Загружаем...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border">
              <p className="text-4xl mb-3">{tab === 'PENDING' ? '✅' : tab === 'CONFIRMED' ? '📋' : '❌'}</p>
              <p>{tab === 'PENDING' ? 'Все записи проверены!' : tab === 'CONFIRMED' ? 'Нет подтверждённых записей' : 'Нет отклонённых записей'}</p>
            </div>
          ) : (
            filtered.map((entry) => (
              <div key={entry.id} className="bg-white rounded-2xl border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                      {entry.student.user.name?.charAt(0).toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <p className="font-semibold">{entry.student.user.name}</p>
                      <p className="text-xs text-gray-400">{entry.student.group ?? 'Группа не указана'}</p>
                      <a
                        href={`/company/student/${entry.student.id}`}
                        className="text-xs text-blue-600 hover:underline mt-0.5 inline-block"
                      >
                        📝 Посмотреть резюме
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {new Date(entry.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      entry.status === 'PRESENT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {entry.status === 'PRESENT' ? 'Присутствовал' : 'Отсутствовал'}
                    </span>
                  </div>
                </div>

                {entry.report && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <p className="text-xs text-gray-400 mb-1 font-medium">Отчёт студента:</p>
                    <p className="text-sm text-gray-700">{entry.report}</p>
                  </div>
                )}

                {entry.absenceReason && (
                  <div className="bg-red-50 rounded-xl p-4 mb-4">
                    <p className="text-xs text-red-400 mb-1 font-medium">Причина отсутствия:</p>
                    <p className="text-sm text-red-700">{entry.absenceReason}</p>
                  </div>
                )}

                {entry.supervisorStatus === 'PENDING' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Комментарий (необязательно)"
                      value={comment[entry.id] || ''}
                      onChange={e => setComment(prev => ({ ...prev, [entry.id]: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAction(entry.id, 'approve')}
                        disabled={processing === entry.id}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        {processing === entry.id ? 'Сохраняем...' : '✓ Подтвердить'}
                      </button>
                      <button
                        onClick={() => handleAction(entry.id, 'reject')}
                        disabled={processing === entry.id}
                        className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50"
                      >
                        ✗ Отклонить
                      </button>
                    </div>
                  </div>
                )}

                {entry.supervisorStatus !== 'PENDING' && (
                  <div className={`rounded-xl p-3 flex items-center gap-2 ${
                    entry.supervisorStatus === 'CONFIRMED' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    <span className="font-medium text-sm">
                      {entry.supervisorStatus === 'CONFIRMED' ? '✓ Подтверждено' : '✗ Отклонено'}
                    </span>
                    {entry.supervisorComment && (
                      <span className="text-sm">— {entry.supervisorComment}</span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}