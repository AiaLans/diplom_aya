'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/useLang'

const translations = {
  ru: {
    docType: 'Тип документа',
    types: [
      { value: 'CONTRACT', label: '📄 Договор о практике' },
      { value: 'ATTENDANCE', label: '📅 Лист учёта посещаемости' },
      { value: 'PRESENTATION', label: '📊 Презентация' },
      { value: 'CHARACTERISTIC', label: '📋 Характеристика' },
    ],
    uploadTitle: 'Выберите PDF документ',
    uploadDesc: 'Файл будет отправлен администратору для проверки и подписи через Kripto',
    submit: 'Загрузить',
    loading: 'Загружаем...',
    success: 'Документ загружен и отправлен на проверку и подпись!',
    uploadMore: 'Загрузить ещё',
    errorFile: 'Выберите файл',
    errorPdf: 'Только PDF файлы',
  },
  kz: {
    docType: 'Құжат түрі',
    types: [
      { value: 'CONTRACT', label: '📄 Тәжірибе шарты' },
      { value: 'ATTENDANCE', label: '📅 Қатысу есеп парағы' },
      { value: 'PRESENTATION', label: '📊 Презентация' },
      { value: 'CHARACTERISTIC', label: '📋 Мінездеме' },
    ],
    uploadTitle: 'PDF құжатты таңдаңыз',
    uploadDesc: 'Файл әкімшіге Kripto арқылы тексеру және қол қою үшін жіберіледі',
    submit: 'Жүктеу',
    loading: 'Жүктелуде...',
    success: 'Құжат жүктелді және тексеру мен қол қоюға жіберілді!',
    uploadMore: 'Тағы жүктеу',
    errorFile: 'Файлды таңдаңыз',
    errorPdf: 'Тек PDF файлдар',
  }
}

export default function UploadDocument() {
  const router = useRouter()
  const { lang } = useLang()
  const t = translations[lang as 'ru' | 'kz'] ?? translations.ru

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [docType, setDocType] = useState('CONTRACT')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = e.currentTarget
    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement
    const file = fileInput.files?.[0]

    if (!file) {
      setError(t.errorFile)
      setLoading(false)
      return
    }

    if (!file.name.endsWith('.pdf')) {
      setError(t.errorPdf)
      setLoading(false)
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('docType', docType)

    const res = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()

    if (res.ok) {
      setSuccess(true)
      router.refresh()
    } else {
      setError(data.error || 'Ошибка загрузки')
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="text-center py-6 bg-green-50 rounded-xl border border-green-200">
        <p className="text-2xl mb-2">✅</p>
        <p className="text-green-700 font-medium">{t.success}</p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-3 text-sm text-blue-600 hover:underline"
        >
          {t.uploadMore}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">{t.docType}</label>
        <select
          value={docType}
          onChange={e => setDocType(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {t.types.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition">
        <p className="text-3xl mb-2">📤</p>
        <p className="text-gray-600 font-medium mb-1">{t.uploadTitle}</p>
        <p className="text-gray-400 text-sm mb-4">{t.uploadDesc}</p>
        <input
          type="file"
          accept=".pdf"
          className="block mx-auto text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? t.loading : t.submit}
        </button>
      </div>
    </form>
  )
}
