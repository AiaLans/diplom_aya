import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function CompanyRatingPage() {
  const session = await getServerSession(authOptions)

  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN') {
    redirect('/student')
  }

  const companies = await prisma.company.findMany({
    where: { approved: true },
    include: {
      internships: true,
      applications: {
        where: { status: 'ACCEPTED' }
      }
    },
    orderBy: { id: 'asc' }
  })

  const totalAccepted = companies.reduce((sum, c) => sum + c.applications.length, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-4 flex items-center gap-4">
        <a href="/admin/monitoring" className="text-gray-400 hover:text-gray-600">← Назад</a>
        <h1 className="text-xl font-bold text-blue-600">Рейтинг компаний</h1>
      </div>

      <div className="max-w-5xl mx-auto p-8">

        {/* Статистика */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border text-center">
            <p className="text-3xl font-bold text-blue-600">{companies.length}</p>
            <p className="text-sm text-gray-500 mt-1">Всего компаний</p>
          </div>
          <div className="bg-white rounded-xl p-6 border text-center">
            <p className="text-3xl font-bold text-purple-600">
              {companies.reduce((sum, c) => sum + c.internships.length, 0)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Всего вакансий</p>
          </div>
          <div className="bg-white rounded-xl p-6 border text-center">
            <p className="text-3xl font-bold text-green-600">{totalAccepted}</p>
            <p className="text-sm text-gray-500 mt-1">Студентов на стажировке</p>
          </div>
        </div>

        {/* Таблица рейтинга */}
        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold">Рейтинг компаний по популярности</h2>
            <span className="text-xs text-gray-400">Сортировка по количеству стажёров</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-4 font-medium text-gray-600">Место</th>
                  <th className="text-left p-4 font-medium text-gray-600">Компания</th>
                  <th className="text-left p-4 font-medium text-gray-600">Вакансий</th>
                  <th className="text-left p-4 font-medium text-gray-600">Стажёров</th>
                  <th className="text-left p-4 font-medium text-gray-600">% от всех</th>
                  <th className="text-left p-4 font-medium text-gray-600">Популярность</th>
                </tr>
              </thead>
              <tbody>
                {companies
                  .sort((a, b) => b.applications.length - a.applications.length)
                  .map((company, index) => {
                    const percent = totalAccepted > 0
                      ? Math.round((company.applications.length / totalAccepted) * 100)
                      : 0

                    return (
                      <tr key={company.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <span className={`font-bold text-lg ${
                            index === 0 ? 'text-yellow-500' :
                            index === 1 ? 'text-gray-400' :
                            index === 2 ? 'text-orange-400' :
                            'text-gray-300'
                          }`}>
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
                        <td className="p-4 text-center font-medium">
                          {percent}%
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
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