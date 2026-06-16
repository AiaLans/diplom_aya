'use client'

import { useLang } from '@/lib/useLang'
import LangSwitcher from '@/components/LangSwitcher'

const translations = {
  ru: {
    title: 'Чек-лист практики',
    back: '← Назад',
    progress: 'Прогресс выполнения',
    allDone: '✅ Все документы готовы!',
    remaining: 'Осталось выполнить',
    remainingEnd: 'пункта',
    required: 'Обязательные документы',
    notUploaded: 'Не загружен',
    approved: '✅ Одобрен',
    rejected: '❌ Отклонён — загрузите заново',
    pending: '⏳ На проверке у администратора',
    diaryDesc: 'Заполнено',
    diaryDescEnd: 'записей',
    items: {
      contract: 'Договор о практике',
      diary: 'Дневник практики',
      attendance: 'Лист учёта посещаемости',
      presentation: 'Презентация',
      characteristic: 'Характеристика',
    }
  },
  kz: {
    title: 'Тәжірибе тізімдемесі',
    back: '← Артқа',
    progress: 'Орындалу барысы',
    allDone: '✅ Барлық құжаттар дайын!',
    remaining: 'Орындалуы қалды',
    remainingEnd: 'тармақ',
    required: 'Міндетті құжаттар',
    notUploaded: 'Жүктелмеген',
    approved: '✅ Мақұлданды',
    rejected: '❌ Қабылданбады — қайта жүктеңіз',
    pending: '⏳ Әкімшіде тексерілуде',
    diaryDesc: 'Толтырылды',
    diaryDescEnd: 'жазба',
    items: {
      contract: 'Тәжірибе шарты',
      diary: 'Тәжірибе күнделігі',
      attendance: 'Қатысу есебі парағы',
      presentation: 'Презентация',
      characteristic: 'Мінездеме',
    }
  }
}

export default function ChecklistClient({
  diaryCount,
  documents,
}: {
  diaryCount: number
  documents: any[]
}) {
  const { lang } = useLang()
  const t = translations[lang as 'ru' | 'kz'] ?? translations.ru

  const isDiaryFilled = diaryCount >= 20

  const hasContract = documents.some(d => d.docType === 'CONTRACT' && d.status === 'APPROVED')
  const hasAttendance = documents.some(d => d.docType === 'ATTENDANCE' && d.status === 'APPROVED')
  const hasPresentation = documents.some(d => d.docType === 'PRESENTATION' && d.status === 'APPROVED')
  const hasCharacteristic = documents.some(d => d.docType === 'CHARACTERISTIC' && d.status === 'APPROVED')

  const contractDoc = documents.find(d => d.docType === 'CONTRACT')
  const attendanceDoc = documents.find(d => d.docType === 'ATTENDANCE')
  const presentationDoc = documents.find(d => d.docType === 'PRESENTATION')
  const characteristicDoc = documents.find(d => d.docType === 'CHARACTERISTIC')

  const getDocDesc = (doc: any) => {
    if (!doc) return t.notUploaded
    if (doc.status === 'APPROVED') return t.approved
    if (doc.status === 'REJECTED') return t.rejected
    return t.pending
  }

  const checklist = [
    {
      id: 'contract',
      title: t.items.contract,
      desc: getDocDesc(contractDoc),
      done: hasContract,
      icon: '📄',
      link: '/student/documents',
    },
    {
      id: 'diary',
      title: t.items.diary,
      desc: `${t.diaryDesc} ${diaryCount} ${t.diaryDescEnd}`,
      done: isDiaryFilled,
      icon: '📔',
      link: '/student/diary',
    },
    {
      id: 'attendance',
      title: t.items.attendance,
      desc: getDocDesc(attendanceDoc),
      done: hasAttendance,
      icon: '📅',
      link: '/student/documents',
    },
    {
      id: 'presentation',
      title: t.items.presentation,
      desc: getDocDesc(presentationDoc),
      done: hasPresentation,
      icon: '📊',
      link: '/student/documents',
    },
    {
      id: 'characteristic',
      title: t.items.characteristic,
      desc: getDocDesc(characteristicDoc),
      done: hasCharacteristic,
      icon: '📋',
      link: '/student/documents',
    },
  ]

  const doneCount = checklist.filter(c => c.done).length
  const progress = Math.round((doneCount / checklist.length) * 100)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/student" className="text-gray-400 hover:text-gray-600">{t.back}</a>
          <h1 className="text-xl font-bold text-blue-600">{t.title}</h1>
        </div>
        <LangSwitcher />
      </div>

      <div className="max-w-2xl mx-auto p-8">

        {/* Прогресс */}
        <div className="bg-white rounded-2xl border p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">{t.progress}</h2>
            <span className="text-2xl font-bold text-blue-600">{doneCount}/{checklist.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                progress === 100 ? 'bg-green-500' :
                progress >= 60 ? 'bg-blue-500' :
                'bg-yellow-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {progress === 100 ? t.allDone :
             `${t.remaining} ${checklist.length - doneCount} ${t.remainingEnd}`}
          </p>
        </div>

        {/* Чек-лист */}
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="font-semibold mb-4">{t.required}</h2>
          <div className="space-y-3">
            {checklist.map((item) => (
              <a
                key={item.id}
                href={item.link}
                className="flex items-center justify-between p-4 rounded-xl border hover:shadow-sm transition"
                style={{
                  backgroundColor: item.done ? '#f0fdf4' : '#fafafa',
                  borderColor: item.done ? '#bbf7d0' : '#e5e7eb',
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className={`font-medium text-sm ${item.done ? 'text-green-700' : 'text-gray-700'}`}>
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.done ? (
                    <span className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                  ) : (
                    <span className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-sm">○</span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}