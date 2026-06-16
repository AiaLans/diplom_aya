import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function AdminMonitoringPage() {
  const session = await getServerSession(authOptions)

  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN') {
    redirect('/student')
  }

  const students = await prisma.student.findMany({
    where: { group: 'ИС22-4А' },
    include: {
      user: true,
      applications: {
        where: { status: 'ACCEPTED' },
        include: {
          company: true,
          internship: true,
        }
      },
      diaryEntries: {
        orderBy: { date: 'asc' },
        take: 1,
      }
    },
    orderBy: { contractNumber: 'asc' }
  })

  const totalStudents = students.length
  const studentsWithInternship = students.filter(s => s.applications.length > 0).length
  const studentsWithoutInternship = totalStudents - studentsWithInternship

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-4 flex items-center gap-4">
        <a href="/admin" className="text-gray-400 hover:text-gray-600">← Назад</a>
        <h1 className="text-xl font-bold text-blue-600">Мониторинг</h1>
      </div>

      <div className="max-w-6xl mx-auto p-8">

        {/* Статистика */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border text-center">
            <p className="text-3xl font-bold text-blue-600">{totalStudents}</p>
            <p className="text-sm text-gray-500 mt-1">Всего студентов</p>
          </div>
          <div className="bg-white rounded-xl p-6 border text-center">
            <p className="text-3xl font-bold text-green-600">{studentsWithInternship}</p>
            <p className="text-sm text-gray-500 mt-1">На стажировке</p>
          </div>
          <div className="bg-white rounded-xl p-6 border text-center">
            <p className="text-3xl font-bold text-red-500">{studentsWithoutInternship}</p>
            <p className="text-sm text-gray-500 mt-1">Без стажировки</p>
          </div>
        </div>

        {/* Таблица мониторинга */}
        <div className="bg-white rounded-2xl border overflow-hidden mb-8">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Группа ИС22-4А — Мониторинг стажировок</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-4 font-medium text-gray-600">№</th>
                  <th className="text-left p-4 font-medium text-gray-600">Студент</th>
                  <th className="text-left p-4 font-medium text-gray-600">Email</th>
                  <th className="text-left p-4 font-medium text-gray-600">Компания</th>
                  <th className="text-left p-4 font-medium text-gray-600">Вакансия</th>
                  <th className="text-left p-4 font-medium text-gray-600">Дата начала</th>
                  <th className="text-left p-4 font-medium text-gray-600">Посещаемость</th>
                  <th className="text-left p-4 font-medium text-gray-600">Статус</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student: any, index: number) => {
                  const app = student.applications[0]
                  const firstEntry = student.diaryEntries[0]

                  return (
                    <tr key={student.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 text-gray-400">{student.contractNumber ?? index + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-xs">
                            {student.user.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{student.user.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-500 text-xs">{student.user.email}</td>
                      <td className="p-4">
                        {app ? (
                          <span className="font-medium text-blue-600">{app.company.name}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-4 text-gray-500">
                        {app ? app.internship.title : '—'}
                      </td>
                      <td className="p-4 text-gray-500">
                        {firstEntry ? (
                          new Date(firstEntry.date).toLocaleDateString('ru-RU', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })
                        ) : '—'}
                      </td>
                      <td className="p-4">
                        <AttendanceCell studentId={student.id} />
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          app
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {app ? 'Активна' : 'Не назначена'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Рейтинг компаний */}
        <div className="bg-white rounded-2xl border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">📊 Рейтинг компаний</h2>
              <p className="text-sm text-gray-500 mt-1">Популярность компаний среди студентов</p>
            </div>
            <a
              href="/admin/monitoring/companies"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
            >
              Открыть рейтинг →
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}

async function AttendanceCell({ studentId }: { studentId: string }) {
  const total = await prisma.diaryEntry.count({ where: { studentId } })
  const present = await prisma.diaryEntry.count({ where: { studentId, status: 'PRESENT' } })
  const attendance = total > 0 ? Math.round((present / total) * 100) : 0

  return (
    <span className={`font-medium ${
      attendance >= 80 ? 'text-green-600' :
      attendance >= 50 ? 'text-yellow-500' :
      'text-red-500'
    }`}>
      {attendance}%
    </span>
  )
}