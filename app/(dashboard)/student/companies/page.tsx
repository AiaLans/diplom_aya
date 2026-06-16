'use client'

import { useState, useEffect } from 'react'
import LangSwitcher from '@/components/LangSwitcher'
import { useLang } from '@/lib/useLang'

const translations = {
  ru: {
    title: 'Компании',
    back: '← Назад',
    subtitle: 'Выбери компанию для стажировки',
    rating: '📊 Рейтинг компаний →',
    noCompanies: 'Компаний пока нет',
    founded: 'с',
    requirements: 'Требования:',
    vacancies: 'вакансий',
    vacancy: 'вакансия',
    byAgreement: 'По договорённости',
    apply: 'Подать заявку',
    loading: 'Загружаем...',
  },
  kz: {
    title: 'Компаниялар',
    back: '← Артқа',
    subtitle: 'Тағылымдама үшін компанияны таңдаңыз',
    rating: '📊 Компаниялар рейтингі →',
    noCompanies: 'Әзірше компаниялар жоқ',
    founded: 'с',
    requirements: 'Талаптар:',
    vacancies: 'бос орын',
    vacancy: 'бос орын',
    byAgreement: 'Келісім бойынша',
    apply: 'Өтінім беру',
    loading: 'Жүктелуде...',
  }
}

export default function CompaniesPage() {
  const { lang } = useLang()
  const t = translations[lang as 'ru' | 'kz'] ?? translations.ru
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/companies')
      .then(r => r.json())
      .then(data => {
        setCompanies(Array.isArray(data) ? data : [])
        setLoading(false)
      })
  }, [])

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

      <div className="max-w-5xl mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500">{t.subtitle}</p>
          <a href="/companies/rating" className="text-sm text-blue-600 hover:underline">
            {t.rating}
          </a>
        </div>

        {companies.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🏢</p>
            <p>{t.noCompanies}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {companies.map((company: any) => (
              <div key={company.id} className="bg-white rounded-xl border p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold">{company.name}</h3>
                  {company.founded && (
                    <span className="text-xs text-gray-400">{t.founded} {company.founded}</span>
                  )}
                </div>

                {company.description && (
                  <p className="text-gray-600 text-sm mb-4">{company.description}</p>
                )}

                {company.requirements && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 mb-1">{t.requirements}</p>
                    <p className="text-sm text-gray-600">{company.requirements}</p>
                  </div>
                )}

                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-400">
                    {company.internships.length} {t.vacancies}
                  </span>
                </div>

                {company.internships.length > 0 && (
                  <div className="space-y-2">
                    {company.internships.map((internship: any) => (
                      <div key={internship.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
                        <div>
                          <span className="text-sm">{internship.title}</span>
                          {internship.salary && (
                            <p className="text-xs text-green-600 font-medium">{internship.salary}</p>
                          )}
                        </div>
                        <a
                          href={`/student/apply/${internship.id}`}
                          className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                        >
                          {t.apply}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}