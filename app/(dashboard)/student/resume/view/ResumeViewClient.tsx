'use client'

import { useLang } from '@/lib/useLang'
import LangSwitcher from '@/components/LangSwitcher'

const translations = {
  ru: {
    title: 'Моё резюме',
    back: '← Назад',
    edit: '✏️ Редактировать',
    download: '📥 Скачать PDF',
    noResume: 'Резюме ещё не заполнено',
    fillResume: 'Заполнить резюме',
    github: 'GitHub профиль',
    about: '👤 О себе',
    skills: '💻 Навыки',
    languages: '🌐 Языки',
    experience: '💼 Опыт / Проекты',
    education: '🎓 Образование',
    certificates: '📜 Сертификаты',
    achievements: '🏆 Достижения',
    footer: 'Сформировано на платформе Qadam — qadam.kz',
  },
  kz: {
    title: 'Менің түйіндемем',
    back: '← Артқа',
    edit: '✏️ Өңдеу',
    download: '📥 PDF жүктеу',
    noResume: 'Түйіндеме әлі толтырылмаған',
    fillResume: 'Түйіндемені толтыру',
    github: 'GitHub профилі',
    about: '👤 Өзім туралы',
    skills: '💻 Дағдылар',
    languages: '🌐 Тілдер',
    experience: '💼 Тәжірибе / Жобалар',
    education: '🎓 Білім',
    certificates: '📜 Сертификаттар',
    achievements: '🏆 Жетістіктер',
    footer: 'Qadam платформасында жасалды — qadam.kz',
  }
}

export default function ResumeViewClient({ student, resume }: { student: any, resume: any }) {
  const { lang } = useLang()
  const t = translations[lang as 'ru' | 'kz'] ?? translations.ru

  if (!resume) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-gray-500 mb-4">{t.noResume}</p>
          <a href="/student/resume" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            {t.fillResume}
          </a>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Кнопки — не печатаются */}
      <div className="print:hidden bg-white border-b px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/student" className="text-gray-400 hover:text-gray-600">{t.back}</a>
          <h1 className="text-xl font-bold text-blue-600">{t.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <LangSwitcher />
          <a href="/student/resume" className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
            {t.edit}
          </a>
          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"
          >
            {t.download}
          </button>
        </div>
      </div>

      {/* Резюме */}
      <div className="max-w-3xl mx-auto p-8 print:p-0 print:max-w-full">

        {/* Шапка */}
        <div className="bg-white rounded-2xl border p-8 mb-6 print:rounded-none print:border-0 print:border-b print:mb-4">
          <div className="flex items-center gap-5 mb-4">
            {student?.user?.image ? (
              <img
                src={student.user.image}
                alt="Фото"
                className="w-20 h-20 rounded-full object-cover border-2 border-blue-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600">
                {student?.user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold">{student?.user?.name}</h2>
              <p className="text-gray-500">{student?.user?.email}</p>
            </div>
          </div>

          {student?.githubUrl && (
            <a
              href={student.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 print:hidden"
            >
              {t.github}
            </a>
          )}
          {student?.githubUrl && (
            <p className="hidden print:block text-sm text-gray-500">
              GitHub: {student.githubUrl}
            </p>
          )}
        </div>

        {/* О себе */}
        {resume.summary && (
          <div className="bg-white rounded-2xl border p-6 mb-4 print:rounded-none print:border-0 print:border-b print:mb-3">
            <h3 className="font-semibold text-lg mb-3 text-blue-600">{t.about}</h3>
            <p className="text-gray-600 leading-relaxed">{resume.summary}</p>
          </div>
        )}

        {/* Навыки */}
        {resume.skills?.length > 0 && (
          <div className="bg-white rounded-2xl border p-6 mb-4 print:rounded-none print:border-0 print:border-b print:mb-3">
            <h3 className="font-semibold text-lg mb-3 text-blue-600">{t.skills}</h3>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill: string, i: number) => (
                <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium print:border print:border-blue-300 print:rounded">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Языки */}
        {resume.languages?.length > 0 && (
          <div className="bg-white rounded-2xl border p-6 mb-4 print:rounded-none print:border-0 print:border-b print:mb-3">
            <h3 className="font-semibold text-lg mb-3 text-blue-600">{t.languages}</h3>
            <div className="flex flex-wrap gap-2">
              {resume.languages.map((l: string, i: number) => (
                <span key={i} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm print:border print:border-green-300 print:rounded">
                  {l}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Опыт */}
        {resume.experience && (
          <div className="bg-white rounded-2xl border p-6 mb-4 print:rounded-none print:border-0 print:border-b print:mb-3">
            <h3 className="font-semibold text-lg mb-3 text-blue-600">{t.experience}</h3>
            <p className="text-gray-600 whitespace-pre-line leading-relaxed">{resume.experience}</p>
          </div>
        )}

        {/* Образование */}
        {resume.education && (
          <div className="bg-white rounded-2xl border p-6 mb-4 print:rounded-none print:border-0 print:border-b print:mb-3">
            <h3 className="font-semibold text-lg mb-3 text-blue-600">{t.education}</h3>
            <p className="text-gray-600 whitespace-pre-line leading-relaxed">{resume.education}</p>
          </div>
        )}

        {/* Сертификаты */}
        {resume.certificates?.length > 0 && (
          <div className="bg-white rounded-2xl border p-6 mb-4 print:rounded-none print:border-0 print:border-b print:mb-3">
            <h3 className="font-semibold text-lg mb-3 text-blue-600">{t.certificates}</h3>
            <ul className="space-y-2">
              {resume.certificates.map((cert: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-gray-600">
                  <span className="text-blue-500">✓</span> {cert}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Достижения */}
        {resume.achievements?.length > 0 && (
          <div className="bg-white rounded-2xl border p-6 print:rounded-none print:border-0 print:mb-3">
            <h3 className="font-semibold text-lg mb-3 text-blue-600">{t.achievements}</h3>
            <ul className="space-y-2">
              {resume.achievements.map((ach: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-gray-600">
                  <span className="text-yellow-500">★</span> {ach}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Подпись для печати */}
        <div className="hidden print:block mt-8 pt-4 border-t text-xs text-gray-400 text-center">
          {t.footer}
        </div>

      </div>
    </>
  )
}