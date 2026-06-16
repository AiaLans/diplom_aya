'use client'

import { useState, useEffect } from 'react'
import { PRACTICE_PERIODS, isDateInPractice } from '@/lib/practice'
import LangSwitcher from '@/components/LangSwitcher'
import { useLang } from '@/lib/useLang'

type DiaryEntry = {
  id: string
  date: string
  status: 'PRESENT' | 'ABSENT'
  report: string | null
  absenceReason: string | null
  supervisorStatus: 'PENDING' | 'CONFIRMED' | 'REJECTED'
  supervisorComment: string | null
}

const DAYS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const DAYS_KZ = ['Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб', 'Жс']

const MONTHS_RU = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
const MONTHS_KZ = ['Қаңтар', 'Ақпан', 'Наурыз', 'Сәуір', 'Мамыр', 'Маусым', 'Шілде', 'Тамыз', 'Қыркүйек', 'Қазан', 'Қараша', 'Желтоқсан']

const MONTHS_KZ_LOWER = ['қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым', 'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан']

function formatDate(dateStr: string, lang: string) {
  const date = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'))
  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()

  if (lang === 'kz') {
    return `${day} ${MONTHS_KZ_LOWER[month]} ${year}`
  }

  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

const diaryTranslations = {
  ru: {
    title: 'Дневник стажировки',
    back: '← Назад',
    attendance: 'Посещаемость',
    records: 'записей',
    active: 'Активна',
    completed: 'Завершена',
    upcoming: 'Предстоит',
    present: 'Присутствовал',
    absent: 'Отсутствовал',
    closed: 'Закрыто',
    confirmed: '✓ Подтверждено',
    pending: '⏳ Ожидает',
    rejected: '✗ Отклонено',
    history: 'История записей',
    noEntries: 'Нажми на дату в календаре чтобы добавить запись',
    loading: 'Загружаем...',
    status: 'Статус',
    absenceReason: 'Причина отсутствия',
    absencePlaceholder: 'Укажи причину...',
    report: 'Отчёт о работе',
    reportPlaceholder: 'Что делал сегодня на стажировке...',
    save: 'Сохранить',
    saving: 'Сохраняем...',
    cancel: 'Отмена',
    comment: 'Комментарий',
    reason: 'Причина',
    logout: 'Выйти',
  },
  kz: {
    title: 'Тағылымдама күнделігі',
    back: '← Артқа',
    attendance: 'Қатысу',
    records: 'жазба',
    active: 'Белсенді',
    completed: 'Аяқталды',
    upcoming: 'Алдағы',
    present: 'Қатысты',
    absent: 'Қатыспады',
    closed: 'Жабық',
    confirmed: '✓ Расталды',
    pending: '⏳ Күтуде',
    rejected: '✗ Қабылданбады',
    history: 'Жазбалар тарихы',
    noEntries: 'Жазба қосу үшін күнтізбедегі күнді басыңыз',
    loading: 'Жүктелуде...',
    status: 'Күй',
    absenceReason: 'Болмау себебі',
    absencePlaceholder: 'Себебін көрсетіңіз...',
    report: 'Жұмыс туралы есеп',
    reportPlaceholder: 'Бүгін тағылымдамада не жасадыңыз...',
    save: 'Сақтау',
    saving: 'Сақталуда...',
    cancel: 'Бас тарту',
    comment: 'Пікір',
    reason: 'Себеп',
    logout: 'Шығу',
  }
}

export default function DiaryPage() {
  const { lang } = useLang()
  const t = diaryTranslations[lang as 'ru' | 'kz'] ?? diaryTranslations.ru
  const DAYS = lang === 'kz' ? DAYS_KZ : DAYS_RU
  const MONTHS = lang === 'kz' ? MONTHS_KZ : MONTHS_RU

  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [status, setStatus] = useState<'PRESENT' | 'ABSENT'>('PRESENT')
  const [report, setReport] = useState('')
  const [absenceReason, setAbsenceReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    fetchEntries()
  }, [])

  async function fetchEntries() {
    const res = await fetch('/api/diary')
    const data = await res.json()
    setEntries(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  function getDaysInMonth(month: number, year: number) {
    return new Date(year, month + 1, 0).getDate()
  }

  function getFirstDayOfMonth(month: number, year: number) {
    const day = new Date(year, month, 1).getDay()
    return day === 0 ? 6 : day - 1
  }

  function getEntryForDate(dateStr: string) {
    return entries.find(e => e.date.startsWith(dateStr))
  }

  function isFutureDate(day: number) {
    const date = new Date(currentYear, currentMonth, day)
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return date > todayStart
  }

  function isToday(day: number) {
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
  }

  function isAllowedDate(day: number): boolean {
    const month = String(currentMonth + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    const dateStr = `${currentYear}-${month}-${dayStr}`
    return isDateInPractice(dateStr)
  }

  function handleDayClick(day: number) {
    const future = isFutureDate(day)
    const allowed = isAllowedDate(day)
    if (future || !allowed) return

    const month = String(currentMonth + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    const dateStr = `${currentYear}-${month}-${dayStr}`

    const existing = getEntryForDate(dateStr)
    if (existing) return

    setSelectedDate(dateStr)
    setStatus('PRESENT')
    setReport('')
    setAbsenceReason('')
    setFormError('')
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedDate || saving) return
    setSaving(true)
    setFormError('')

    const res = await fetch('/api/diary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: selectedDate, status, report, absenceReason }),
    })

    const data = await res.json()

    if (!res.ok) {
      setFormError(data.error || 'Ошибка сохранения')
      setSaving(false)
      return
    }

    setShowForm(false)
    setSaving(false)
    fetchEntries()
  }

  const daysInMonth = getDaysInMonth(currentMonth, currentYear)
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear)

  const attendance = entries.length > 0
    ? Math.round((entries.filter(e => e.status === 'PRESENT').length / entries.length) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/student" className="text-gray-400 hover:text-gray-600">{t.back}</a>
          <h1 className="text-xl font-bold text-blue-600">{t.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <LangSwitcher />
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium text-sm">
            {t.attendance}: {attendance}%
          </span>
          <span className="text-gray-500 text-sm">{entries.length} {t.records}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8">

        {/* Периоды практики */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {PRACTICE_PERIODS.map(p => {
            const now = new Date()
            const start = new Date(p.start)
            const end = new Date(p.end)
            const isActive = now >= start && now <= end
            const isPast = now > end

            return (
              <div key={p.id} className={`rounded-xl border p-4 ${
                isActive ? 'bg-blue-50 border-blue-200' :
                isPast ? 'bg-gray-50 border-gray-200' :
                'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm">{lang === 'kz' ? p.nameKk : p.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-blue-100 text-blue-700' :
                    isPast ? 'bg-gray-100 text-gray-500' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {isActive ? t.active : isPast ? t.completed : t.upcoming}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {formatDate(p.start, lang)} — {formatDate(p.end, lang)}
                </p>
              </div>
            )
          })}
        </div>

        {/* Навигация по месяцу */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
              else setCurrentMonth(m => m - 1)
            }}
            className="p-2 rounded-lg hover:bg-gray-200 text-gray-600"
          >←</button>
          <h2 className="text-2xl font-bold">{MONTHS[currentMonth]} {currentYear}</h2>
          <button
            onClick={() => {
              const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1
              const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear
              if (nextYear > today.getFullYear() || (nextYear === today.getFullYear() && nextMonth > today.getMonth())) return
              setCurrentMonth(nextMonth)
              if (currentMonth === 11) setCurrentYear(y => y + 1)
            }}
            className="p-2 rounded-lg hover:bg-gray-200 text-gray-600"
          >→</button>
        </div>

        {/* Календарь */}
        <div className="bg-white rounded-2xl border p-6 mb-6">
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const month = String(currentMonth + 1).padStart(2, '0')
              const dayStr = String(day).padStart(2, '0')
              const dateStr = `${currentYear}-${month}-${dayStr}`
              const entry = getEntryForDate(dateStr)
              const future = isFutureDate(day)
              const todayDay = isToday(day)
              const allowed = isAllowedDate(day)
              const blocked = future || !allowed

              let bgColor = 'bg-gray-50 hover:bg-gray-100 cursor-pointer'
              let textColor = 'text-gray-700'
              let border = 'border border-gray-200'

              if (blocked) {
                bgColor = 'bg-gray-50 cursor-not-allowed opacity-40'
                textColor = 'text-gray-400'
                border = 'border border-gray-100'
              } else if (entry) {
                if (entry.status === 'PRESENT') {
                  bgColor = 'bg-green-100 cursor-default'
                  textColor = 'text-green-700'
                  border = 'border border-green-200'
                } else {
                  bgColor = 'bg-red-100 cursor-default'
                  textColor = 'text-red-700'
                  border = 'border border-red-200'
                }
              }

              if (todayDay && allowed) border = 'border-2 border-blue-500'

              return (
                <div
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`${bgColor} ${textColor} ${border} rounded-xl p-2 min-h-14 flex flex-col items-center justify-start transition-all`}
                >
                  <span className={`text-sm font-medium ${todayDay && allowed ? 'text-blue-600' : ''}`}>{day}</span>
                  {entry && (
                    <span className="text-xs mt-1">
                      {entry.supervisorStatus === 'CONFIRMED' ? '✓' :
                       entry.supervisorStatus === 'REJECTED' ? '✗' : '⏳'}
                    </span>
                  )}
                  {!entry && !blocked && (
                    <span className="text-xs text-gray-300 mt-1">+</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Легенда */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
            <span>{t.present}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 border border-red-200"></div>
            <span>{t.absent}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-50 border border-gray-200 opacity-40"></div>
            <span>{t.closed}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span>{t.confirmed}</span>
            <span>{t.pending}</span>
            <span>{t.rejected}</span>
          </div>
        </div>

        {/* Форма */}
        {showForm && selectedDate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-bold mb-4">
                {formatDate(selectedDate, lang)}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.status}</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStatus('PRESENT')}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition ${status === 'PRESENT' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                      ✓ {t.present}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('ABSENT')}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition ${status === 'ABSENT' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                      ✗ {t.absent}
                    </button>
                  </div>
                </div>

                {status === 'ABSENT' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">{t.absenceReason}</label>
                    <input
                      type="text"
                      value={absenceReason}
                      onChange={e => setAbsenceReason(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t.absencePlaceholder}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">{t.report}</label>
                  <textarea
                    value={report}
                    onChange={e => setReport(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm h-28 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t.reportPlaceholder}
                  />
                </div>

                {formError && (
                  <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? t.saving : t.save}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-50"
                  >
                    {t.cancel}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* История */}
        <div className="bg-white rounded-2xl border p-6">
          <h3 className="text-lg font-semibold mb-4">{t.history}</h3>
          {loading ? (
            <p className="text-gray-400 text-center py-6">{t.loading}</p>
          ) : entries.length === 0 ? (
            <p className="text-gray-400 text-center py-6">{t.noEntries}</p>
          ) : (
            <div className="space-y-3">
              {[...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
                <div key={entry.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="text-sm font-medium">
                        {formatDate(entry.date, lang)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${entry.status === 'PRESENT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {entry.status === 'PRESENT' ? t.present : t.absent}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        entry.supervisorStatus === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                        entry.supervisorStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {entry.supervisorStatus === 'CONFIRMED' ? t.confirmed :
                         entry.supervisorStatus === 'REJECTED' ? t.rejected : t.pending}
                      </span>
                    </div>
                    {entry.report && <p className="text-sm text-gray-600">{entry.report}</p>}
                    {entry.absenceReason && <p className="text-sm text-gray-500">{t.reason}: {entry.absenceReason}</p>}
                    {entry.supervisorComment && (
                      <p className="text-sm text-blue-600 mt-1 border-l-2 border-blue-200 pl-2">
                        {t.comment}: {entry.supervisorComment}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}