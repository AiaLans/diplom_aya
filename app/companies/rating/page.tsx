import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { connection } from 'next/server'

export default async function CompanyRatingPage() {
  await connection()

  const companies = await prisma.company.findMany({
    where: { approved: true },
    include: {
      internships: true,
      applications: {
        where: { status: 'ACCEPTED' }
      }
    },
  })

  const totalAccepted = companies.reduce((sum, c) => sum + c.applications.length, 0)
  const sorted = [...companies].sort((a, b) => b.applications.length - a.applications.length)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-gray-600">← Главная</Link>
          <h1 className="text-xl font-bold text-blue-600">Рейтинг компаний</h1>
        </div>
        <Link href="/companies" className="text-sm text-gray-500 hover:text-blue-600">
          Все компании →
        </Link>
      </div>

      <div className="max-w-5xl mx-auto p-8">

        {/* Статистика */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border text-center">
            <p className="text-3xl font-bold text-blue-600">{companies.length}</p>
            <p className="text-sm text-gray-500 mt-1">Компаний</p>
          </div>
          <div className="bg-white rounded-xl p-6 border text-center">
            <p className="text-3xl font-bold text-purple-600">
              {companies.reduce((sum, c) => sum + c.internships.length, 0)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Вакансий</p>
          </div>
          <div className="bg-white rounded-xl p-6 border text-center">
            <p className="text-3xl font-bold text-green-600">{totalAccepted}</p>
            <p className="text-sm text-gray-500 mt-1">Студентов на стажировке</p>
          </div>
        </div>

        {/* Таблица */}
        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Рейтинг по популярности среди студентов</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-4 font-medium text-gray-600">Место</th>
                  <th className="text-left p-4 font-medium text-gray-600">Компания</th>
                  <th className="text-center p-4 font-medium text-gray-600">Вакансий</th>
                  <th className="text-center p-4 font-medium text-gray-600">Стажёров</th>
                  <th className="text-left p-4 font-medium text-gray-600">Популярность</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((company, index) => {
                  const percent = totalAccepted > 0
                    ? Math.round((company.applications.length / totalAccepted) * 100)
                    : 0

                  return (
                    <tr key={company.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <span className="font-bold text-lg">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-xs">
                            {company.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{company.name}</p>
                            {company.description && (
                              <p className="text-xs text-gray-400 truncate max-w-xs">{company.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                          {company.internships.length}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          {company.applications.length}
                        </span>
                      </td>
                      <td className="p-4 w-48">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8">{percent}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
