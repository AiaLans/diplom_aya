'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/useLang'

const DOC_TYPES_RU: Record<string, string> = {
  CONTRACT: '📄 Договор о практике',
  ATTENDANCE: '📅 Лист учёта посещаемости',
  PRESENTATION: '📊 Презентация',
  CHARACTERISTIC: '📋 Характеристика',
}

const DOC_TYPES_KZ: Record<string, string> = {
  CONTRACT: '📄 Тәжірибе шарты',
  ATTENDANCE: '📅 Қатысу есебі парағы',
  PRESENTATION: '📊 Презентация',
  CHARACTERISTIC: '📋 Мінездеме',
}

const STATUS_RU: Record<string, { label: string; color: string }> = {
  PENDING: { label: '⏳ На проверке', color: 'text-yellow-600' },
  APPROVED: { label: '✅ Одобрен', color: 'text-green-600' },
  REJECTED: { label: '❌ Отклонён', color: 'text-red-600' },
}

const STATUS_KZ: Record<string, { label: string; color: string }> = {
  PENDING: { label: '⏳ Тексерілуде', color: 'text-yellow-600' },
  APPROVED: { label: '✅ Мақұлданды', color: 'text-green-600' },
  REJECTED: { label: '❌ Қабылданбады', color: 'text-red-600' },
}

const translations = {
  ru: {
    title: 'Мои документы',
    noDocuments: 'Нет загруженных документов',
    open: 'Открыть',
    delete: 'Удалить',
    confirmDelete: 'Удалить этот документ?',
  },
  kz: {
    title: 'Менің құжаттарым',
    noDocuments: 'Жүктелген құжаттар жоқ',
    open: 'Ашу',
    delete: 'Жою',
    confirmDelete: 'Бұл құжатты жою керек пе?',
  }
}

const MONTHS_KZ = ['қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым', 'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан']

function formatDate(dateStr: string, lang: string) {
  const date = new Date(dateStr)
  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()
  if (lang === 'kz') return `${day} ${MONTHS_KZ[month]} ${year}`
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function DocumentsList({ documents }: { documents: any[] }) {
  const router = useRouter()
  const { lang } = useLang()
  const t = translations[lang as 'ru' | 'kz'] ?? translations.ru
  const DOC_TYPES = lang === 'kz' ? DOC_TYPES_KZ : DOC_TYPES_RU
  const STATUS = lang === 'kz' ? STATUS_KZ : STATUS_RU

  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm(t.confirmDelete)) return
    setDeleting(id)
    await fetch(`/api/documents/delete/${id}`, { method: 'DELETE' })
    router.refresh()
    setDeleting(null)
  }

  return (
    <div className="bg-white rounded-2xl border p-6">
      <h2 className="text-lg font-semibold mb-4">{t.title}</h2>
      {documents.length === 0 ? (
        <p className="text-gray-400 text-center py-6">{t.noDocuments}</p>
      ) : (
        <div className="space-y-3">
          {documents.map((doc: any) => {
            const status = STATUS[doc.status] ?? STATUS.PENDING
            return (
              <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">📎</div>
                  <div>
                    <p className="font-medium text-sm">{DOC_TYPES[doc.docType ?? ''] ?? doc.name}</p>
                    <p className="text-xs text-gray-400">{formatDate(doc.createdAt, lang)}</p>
                    <p className={`text-xs font-medium ${status.color}`}>{status.label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <a href={doc.url} target="_blank" className="text-blue-600 text-sm hover:underline">
                    {t.open}
                  </a>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deleting === doc.id}
                    className="text-red-500 text-sm hover:underline disabled:opacity-50"
                  >
                    {deleting === doc.id ? '...' : t.delete}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}