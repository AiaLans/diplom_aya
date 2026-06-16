'use client'

import { useState, useEffect } from 'react'
import { useLang } from '@/lib/useLang'

const translations = {
  ru: {
    currentPassword: 'Текущий пароль',
    currentPlaceholder: 'Введите текущий пароль',
    newPassword: 'Новый пароль',
    newPlaceholder: 'Минимум 8 символов',
    confirmPassword: 'Подтвердите пароль',
    confirmPlaceholder: 'Повторите новый пароль',
    submit: 'Сменить пароль',
    submitting: 'Сохраняем...',
    success: '✅ Пароль успешно изменён!',
    oauthMessage: '🔐 Вы вошли через Google/GitHub/Yandex — у вашего аккаунта нет пароля.',
    loading: 'Загружаем...',
    errorMin: 'Новый пароль должен быть не менее 8 символов',
    errorMatch: 'Пароли не совпадают',
    errorServer: 'Ошибка сервера',
  },
  kz: {
    currentPassword: 'Ағымдағы құпиясөз',
    currentPlaceholder: 'Ағымдағы құпиясөзді енгізіңіз',
    newPassword: 'Жаңа құпиясөз',
    newPlaceholder: 'Кемінде 8 таңба',
    confirmPassword: 'Құпиясөзді растаңыз',
    confirmPlaceholder: 'Жаңа құпиясөзді қайталаңыз',
    submit: 'Құпиясөзді өзгерту',
    submitting: 'Сақталуда...',
    success: '✅ Құпиясөз сәтті өзгертілді!',
    oauthMessage: '🔐 Сіз Google/GitHub/Yandex арқылы кірдіңіз — аккаунтыңызда құпиясөз жоқ.',
    loading: 'Жүктелуде...',
    errorMin: 'Жаңа құпиясөз кемінде 8 таңбадан тұруы керек',
    errorMatch: 'Құпиясөздер сәйкес келмейді',
    errorServer: 'Сервер қатесі',
  }
}

export default function ChangePasswordForm() {
  const { lang } = useLang()
  const t = translations[lang as 'ru' | 'kz'] ?? translations.ru

  const [hasPassword, setHasPassword] = useState<boolean | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/profile/has-password')
      .then(r => r.json())
      .then(data => setHasPassword(data.hasPassword))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError(t.errorMin)
      return
    }

    if (newPassword !== confirm) {
      setError(t.errorMatch)
      return
    }

    setLoading(true)

    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword, currentPassword }),
    })

    const data = await res.json()

    if (res.ok) {
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirm('')
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(data.error || t.errorServer)
    }

    setLoading(false)
  }

  if (hasPassword === null) {
    return <p className="text-gray-400 text-sm">{t.loading}</p>
  }

  if (!hasPassword) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-700 text-sm">{t.oauthMessage}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">{t.currentPassword}</label>
        <input
          type="password"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t.currentPlaceholder}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t.newPassword}</label>
        <input
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t.newPlaceholder}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t.confirmPassword}</label>
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t.confirmPlaceholder}
          required
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</p>
      )}

      {success && (
        <p className="text-green-600 text-sm bg-green-50 px-4 py-2 rounded-lg">{t.success}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gray-800 text-white py-2 rounded-lg font-medium hover:bg-gray-900 disabled:opacity-50"
      >
        {loading ? t.submitting : t.submit}
      </button>
    </form>
  )
}