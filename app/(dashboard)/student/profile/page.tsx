'use client'

import { useState, useEffect } from 'react'
import ChangePasswordForm from '@/components/ChangePasswordForm'
import LangSwitcher from '@/components/LangSwitcher'
import { useLang } from '@/lib/useLang'

const translations = {
  ru: {
    title: 'Мой профиль',
    back: '← Назад',
    loading: 'Загружаем...',
    uploadingPhoto: 'Загружаем фото...',
    fullName: 'Полное имя',
    namePlaceholder: 'Иванов Иван Иванович',
    group: 'Группа',
    groupPlaceholder: 'ИС-21',
    skills: 'Навыки',
    skillsHint: '(через запятую)',
    skillsPlaceholder: 'JavaScript, Python, SQL',
    github: 'GitHub профиль',
    githubHint: '(необязательно)',
    githubPlaceholder: 'https://github.com/username',
    openProfile: 'Открыть профиль →',
    saveSuccess: 'Профиль успешно сохранён!',
    saving: 'Сохраняем...',
    save: 'Сохранить профиль',
    changePassword: '🔐 Сменить пароль',
  },
  kz: {
    title: 'Менің профилім',
    back: '← Артқа',
    loading: 'Жүктелуде...',
    uploadingPhoto: 'Фото жүктелуде...',
    fullName: 'Толық аты-жөні',
    namePlaceholder: 'Иванов Иван Иванович',
    group: 'Топ',
    groupPlaceholder: 'ИС-21',
    skills: 'Дағдылар',
    skillsHint: '(үтірмен бөліп)',
    skillsPlaceholder: 'JavaScript, Python, SQL',
    github: 'GitHub профилі',
    githubHint: '(міндетті емес)',
    githubPlaceholder: 'https://github.com/username',
    openProfile: 'Профильді ашу →',
    saveSuccess: 'Профиль сәтті сақталды!',
    saving: 'Сақталуда...',
    save: 'Профильді сақтау',
    changePassword: '🔐 Құпиясөзді өзгерту',
  }
}

export default function ProfilePage() {
  const { lang } = useLang()
  const t = translations[lang as 'ru' | 'kz'] ?? translations.ru

  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [group, setGroup] = useState('')
  const [skills, setSkills] = useState('')
  const [success, setSuccess] = useState(false)
  const [githubUrl, setGithubUrl] = useState('')
  const [avatarUploading, setAvatarUploading] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    const res = await fetch('/api/profile')
    const data = await res.json()
    setProfile(data)
    setName(data.name ?? '')
    setGroup(data.student?.group ?? '')
    setSkills(data.student?.skills?.join(', ') ?? '')
    setGithubUrl(data.student?.githubUrl ?? '')
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        group,
        skills: skills.split(',').map((s: string) => s.trim()).filter(Boolean),
        githubUrl,
      }),
    })

    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/profile/avatar', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()

    if (res.ok) {
      setProfile((prev: any) => ({ ...prev, image: data.url }))
    }

    setAvatarUploading(false)
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
        <LangSwitcher />
      </div>

      <div className="max-w-2xl mx-auto p-8 space-y-6">

        {/* Основная информация */}
        <div className="bg-white rounded-xl border p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              {profile?.image ? (
                <img
                  src={profile.image}
                  alt="Аватар"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700">
                <span className="text-white text-xs">+</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{name}</h2>
              <p className="text-gray-500 text-sm">{profile?.email}</p>
              {avatarUploading && (
                <p className="text-xs text-blue-500 mt-1">{t.uploadingPhoto}</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">{t.fullName}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t.namePlaceholder}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t.group}</label>
              <input
                type="text"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t.groupPlaceholder}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t.skills}
                <span className="text-gray-400 font-normal ml-1">{t.skillsHint}</span>
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t.skillsPlaceholder}
              />
              {skills && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.split(',').map((skill, i) => (
                    skill.trim() && (
                      <span key={i} className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                        {skill.trim()}
                      </span>
                    )
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t.github}
                <span className="text-gray-400 font-normal ml-1">{t.githubHint}</span>
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t.githubPlaceholder}
              />
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm mt-1 inline-block hover:underline"
                >
                  {t.openProfile}
                </a>
              )}
            </div>

            {success && (
              <p className="text-green-600 text-sm bg-green-50 px-4 py-2 rounded-lg">
                {t.saveSuccess}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? t.saving : t.save}
            </button>
          </form>
        </div>

        {/* Смена пароля */}
        <div className="bg-white rounded-xl border p-8">
          <h2 className="text-lg font-semibold mb-4">{t.changePassword}</h2>
          <ChangePasswordForm />
        </div>

      </div>
    </div>
  )
}