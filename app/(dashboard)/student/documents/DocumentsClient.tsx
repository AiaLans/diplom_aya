'use client'

import { PRACTICE_PERIODS } from '@/lib/practice'
import UploadDocument from '@/components/UploadDocument'
import DocumentsList from '@/components/DocumentsList'
import LangSwitcher from '@/components/LangSwitcher'
import { useLang } from '@/lib/useLang'

const MONTHS_KZ_LOWER = ['қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым', 'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан']

function formatDate(dateStr: string, lang: string) {
  const date = new Date(dateStr + 'T00:00:00')
  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()
  if (lang === 'kz') return `${day} ${MONTHS_KZ_LOWER[month]} ${year}`
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

const translations = {
  ru: {
    title: 'Документы',
    back: '← Назад',
    contractInfo: 'Информация о договоре',
    contractNumber: 'Номер договора',
    student: 'Студент',
    noGroup: 'Группа не указана',
    company: 'Компания',
    position: 'Должность',
    practiceTypes: 'Виды практики',
    active: '● Активна',
    completed: 'Завершена',
    upcoming: 'Предстоит',
    templatesTitle: 'Шаблоны договоров',
    templatesDesc: 'Скачайте шаблон, заполните вручную, распечатайте и подпишите',
    contractBlank: 'Шаблон договора (бланк)',
    contractBlankDesc: 'Пустой бланк для заполнения',
    contractExample: 'Пример заполнения',
    contractExampleDesc: 'Образец правильного заполнения',
    download: 'Скачать',
    uploadTitle: 'Загрузить документ',
    uploadDesc: 'Загрузите PDF, после проверки администратор подпишет его через Kripto',
  },
  kz: {
    title: 'Құжаттар',
    back: '← Артқа',
    contractInfo: 'Шарт туралы ақпарат',
    contractNumber: 'Шарт нөмірі',
    student: 'Студент',
    noGroup: 'Топ көрсетілмеген',
    company: 'Компания',
    position: 'Лауазым',
    practiceTypes: 'Тәжірибе түрлері',
    active: '● Белсенді',
    completed: 'Аяқталды',
    upcoming: 'Алдағы',
    templatesTitle: 'Шарт үлгілері',
    templatesDesc: 'Үлгіні жүктеп алып, қолмен толтырыңыз, басып шығарып, қол қойыңыз',
    contractBlank: 'Шарт үлгісі (бланк)',
    contractBlankDesc: 'Толтыруға арналған бос бланк',
    contractExample: 'Толтыру үлгісі',
    contractExampleDesc: 'Дұрыс толтыру үлгісі',
    download: 'Жүктеу',
    uploadTitle: 'Құжатты жүктеу',
    uploadDesc: 'PDF жүктеңіз, тексеруден кейін әкімші оны Kripto арқылы қол қояды',
  }
}

export default function DocumentsClient({ student, documents }: { student: any, documents: any[] }) {
  const { lang } = useLang()
  const t = translations[lang as 'ru' | 'kz'] ?? translations.ru

  const contractNumber = student?.contractNumber ?? '—'
  const acceptedApp = student?.applications[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/student" className="text-gray-400 hover:text-gray-600">{t.back}</a>
          <h1 className="text-xl font-bold text-blue-600">{t.title}</h1>
        </div>
        <LangSwitcher />
      </div>

      <div className="max-w-4xl mx-auto p-8">

        {/* Номер договора */}
        <div className="bg-white rounded-2xl border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{t.contractInfo}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">{t.contractNumber}</p>
              <p className="text-3xl font-bold text-blue-600">№{contractNumber}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">{t.student}</p>
              <p className="text-lg font-semibold">{student?.user?.name}</p>
              <p className="text-sm text-gray-500">{student?.group ?? t.noGroup}</p>
            </div>
            {acceptedApp && (
              <>
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">{t.company}</p>
                  <p className="text-lg font-semibold">{acceptedApp.company.name}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">{t.position}</p>
                  <p className="text-lg font-semibold">{acceptedApp.internship.title}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Периоды практики */}
        <div className="bg-white rounded-2xl border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{t.practiceTypes}</h2>
          <div className="space-y-3">
            {PRACTICE_PERIODS.map(p => {
              const now = new Date()
              const start = new Date(p.start)
              const end = new Date(p.end)
              const isActive = now >= start && now <= end
              const isPast = now > end

              return (
                <div key={p.id} className={`rounded-xl border p-5 ${
                  isActive ? 'bg-blue-50 border-blue-200' :
                  isPast ? 'bg-gray-50 border-gray-200' :
                  'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{lang === 'kz' ? p.nameKk : p.name}</h3>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      isActive ? 'bg-blue-100 text-blue-700' :
                      isPast ? 'bg-gray-100 text-gray-500' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {isActive ? t.active : isPast ? t.completed : t.upcoming}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatDate(p.start, lang)} — {formatDate(p.end, lang)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Шаблоны договоров */}
        <div className="bg-white rounded-2xl border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">{t.templatesTitle}</h2>
          <p className="text-gray-500 text-sm mb-4">{t.templatesDesc}</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg shrink-0">📄</div>
                <div className="min-w-0">
                  <p className="font-medium text-sm">{t.contractBlank}</p>
                  <p className="text-xs text-gray-500">{t.contractBlankDesc}</p>
                </div>
              </div>
              <a
                href="/Договор_-_бланк.docx"
                download
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shrink-0"
              >
                {t.download}
              </a>
            </div>

            <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-lg shrink-0">📋</div>
                <div className="min-w-0">
                  <p className="font-medium text-sm">{t.contractExample}</p>
                  <p className="text-xs text-gray-500">{t.contractExampleDesc}</p>
                </div>
              </div>
              <a
                href="/Договор_-_пример.docx"
                download
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 shrink-0"
              >
                {t.download}
              </a>
            </div>
          </div>
        </div>

        {/* Загрузить документ */}
        <div className="bg-white rounded-2xl border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">{t.uploadTitle}</h2>
          <p className="text-gray-500 text-sm mb-4">{t.uploadDesc}</p>
          <UploadDocument />
        </div>

        {/* Загруженные документы */}
        <DocumentsList documents={documents} />

      </div>
    </div>
  )
}
