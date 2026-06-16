'use client'

import { useState, useEffect } from 'react'
import LangSwitcher from '@/components/LangSwitcher'
import { useLang } from '@/lib/useLang'

const translations = {
  ru: {
    title: 'Моё резюме',
    back: '← Назад',
    view: '👁 Просмотр',
    loading: 'Загружаем...',
    hint: '📋 Резюме будет видно компаниям при просмотре твоей заявки',
    about: 'О себе',
    aboutPlaceholder: 'Краткое описание о себе, своих целях и интересах...',
    experience: 'Опыт работы / Проекты',
    experiencePlaceholder: 'Опиши свой опыт работы или учебные проекты...',
    education: 'Образование',
    educationPlaceholder: 'Алматинский политехнический колледж, специальность...',
    skillsAndLangs: 'Навыки и языки',
    skills: 'Технические навыки',
    skillsHint: '(через запятую)',
    skillsPlaceholder: 'JavaScript, React, Python, SQL',
    languages: 'Языки',
    languagesHint: '(через запятую)',
    languagesPlaceholder: 'Казахский (родной), Русский (свободно), Английский (B1)',
    certificates: 'Сертификаты',
    certificatesPlaceholder: 'Каждый сертификат с новой строки:\nJavaScript Certificate — Coursera, 2024',
    achievements: 'Достижения',
    achievementsPlaceholder: 'Каждое достижение с новой строки:\nПобедитель олимпиады по программированию 2024',
    success: '✅ Резюме успешно сохранено!',
    saving: 'Сохраняем...',
    save: 'Сохранить резюме',
  },
  kz: {
    title: 'Менің түйіндемем',
    back: '← Артқа',
    view: '👁 Қарау',
    loading: 'Жүктелуде...',
    hint: '📋 Түйіндеме өтінімді қараған кезде компанияларға көрінеді',
    about: 'Өзім туралы',
    aboutPlaceholder: 'Өзіңіз, мақсаттарыңыз және қызығушылықтарыңыз туралы қысқаша...',
    experience: 'Жұмыс тәжірибесі / Жобалар',
    experiencePlaceholder: 'Жұмыс тәжірибесін немесе оқу жобаларын сипаттаңыз...',
    education: 'Білім',
    educationPlaceholder: 'Алматы политехникалық колледжі, мамандық...',
    skillsAndLangs: 'Дағдылар мен тілдер',
    skills: 'Техникалық дағдылар',
    skillsHint: '(үтірмен бөліп)',
    skillsPlaceholder: 'JavaScript, React, Python, SQL',
    languages: 'Тілдер',
    languagesHint: '(үтірмен бөліп)',
    languagesPlaceholder: 'Қазақша (туған), Орысша (еркін), Ағылшынша (B1)',
    certificates: 'Сертификаттар',
    certificatesPlaceholder: 'Әр сертификатты жаңа жолдан:\nJavaScript Certificate — Coursera, 2024',
    achievements: 'Жетістіктер',
    achievementsPlaceholder: 'Әр жетістікті жаңа жолдан:\n2024 бағдарламалау олимпиадасының жеңімпазы',
    success: '✅ Түйіндеме сәтті сақталды!',
    saving: 'Сақталуда...',
    save: 'Түйіндемені сақтау',
  }
}

export default function ResumePage() {
  const { lang } = useLang()
  const t = translations[lang as 'ru' | 'kz'] ?? translations.ru

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    summary: '',
    experience: '',
    education: '',
    skills: '',
    languages: '',
    certificates: '',
    achievements: '',
  })

  useEffect(() => {
    fetchResume()
  }, [])

  async function fetchResume() {
    const res = await fetch('/api/resume')
    const data = await res.json()
    if (data) {
      setForm({
        summary: data.summary ?? '',
        experience: data.experience ?? '',
        education: data.education ?? '',
        skills: data.skills?.join(', ') ?? '',
        languages: data.languages?.join(', ') ?? '',
        certificates: data.certificates?.join('\n') ?? '',
        achievements: data.achievements?.join('\n') ?? '',
      })
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    await fetch('/api/resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary: form.summary,
        experience: form.experience,
        education: form.education,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        languages: form.languages.split(',').map(s => s.trim()).filter(Boolean),
        certificates: form.certificates.split('\n').map(s => s.trim()).filter(Boolean),
        achievements: form.achievements.split('\n').map(s => s.trim()).filter(Boolean),
      }),
    })

    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">{t.loading}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/student" className="text-gray-400 hover:text-gray-600">{t.back}</a>
          <h1 className="text-xl font-bold text-blue-600">{t.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <LangSwitcher />
          <a href="/student/resume/view" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            {t.view}
          </a>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-blue-700 text-sm">{t.hint}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* О себе */}
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="text-lg font-semibold mb-4">{t.about}</h2>
            <textarea
              value={form.summary}
              onChange={e => setForm(prev => ({ ...prev, summary: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t.aboutPlaceholder}
            />
          </div>

          {/* Опыт */}
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="text-lg font-semibold mb-4">{t.experience}</h2>
            <textarea
              value={form.experience}
              onChange={e => setForm(prev => ({ ...prev, experience: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t.experiencePlaceholder}
            />
          </div>

          {/* Образование */}
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="text-lg font-semibold mb-4">{t.education}</h2>
            <textarea
              value={form.education}
              onChange={e => setForm(prev => ({ ...prev, education: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t.educationPlaceholder}
            />
          </div>

          {/* Навыки и языки */}
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="text-lg font-semibold mb-4">{t.skillsAndLangs}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t.skills}
                  <span className="text-gray-400 font-normal ml-1">{t.skillsHint}</span>
                </label>
                <input
                  type="text"
                  value={form.skills}
                  onChange={e => setForm(prev => ({ ...prev, skills: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t.skillsPlaceholder}
                />
                {form.skills && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.skills.split(',').map((s, i) => s.trim() && (
                      <span key={i} className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t.languages}
                  <span className="text-gray-400 font-normal ml-1">{t.languagesHint}</span>
                </label>
                <input
                  type="text"
                  value={form.languages}
                  onChange={e => setForm(prev => ({ ...prev, languages: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t.languagesPlaceholder}
                />
              </div>
            </div>
          </div>

          {/* Сертификаты */}
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="text-lg font-semibold mb-4">{t.certificates}</h2>
            <textarea
              value={form.certificates}
              onChange={e => setForm(prev => ({ ...prev, certificates: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t.certificatesPlaceholder}
            />
          </div>

          {/* Достижения */}
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="text-lg font-semibold mb-4">{t.achievements}</h2>
            <textarea
              value={form.achievements}
              onChange={e => setForm(prev => ({ ...prev, achievements: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t.achievementsPlaceholder}
            />
          </div>

          {success && (
            <p className="text-green-600 text-sm bg-green-50 px-4 py-3 rounded-xl border border-green-200">
              {t.success}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 text-lg"
          >
            {saving ? t.saving : t.save}
          </button>
        </form>
      </div>
    </div>
  )
}