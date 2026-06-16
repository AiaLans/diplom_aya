import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ApproveButtons from '@/components/ApproveButtons'

export default async function CuratorDashboard() {
  const session = await getServerSession(authOptions)

  if (session?.user?.role !== 'CURATOR' && session?.user?.role !== 'ADMIN') {
    redirect('/student')
  }

  const students = await prisma.student.findMany({
    where: { group: 'ИС22-4А' },
    include: {
      user: true,
      applications: {
        include: { company: true, internship: true }
      },
      diaryEntries: true,
    }
  })

  const pendingApplications = await prisma.application.findMany({
    where: { status: 'PENDING_CURATOR' },
    include: {
      student: { include: { user: true } },
      company: true,
      internship: true,
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">Qadam — Куратор</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{session?.user?.name}</span>
          <a href="/signout" className="text-sm text-red-500 hover:underline">
            Выйти
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        <h2 className="text-2xl font-bold mb-8">Панель куратора</h2>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border">
            <p className="text-sm text-gray-500 mb-1">Всего студентов</p>
            <p className="text-3xl font-bold text-blue-600">{students.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border">
            <p className="text-sm text-gray-500 mb-1">Ожидают проверки</p>
            <p className="text-3xl font-bold text-yellow-500">{pendingApplications.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border">
            <p className="text-sm text-gray-500 mb-1">На стажировке</p>
            <p className="text-3xl font-bold text-green-600">
              {students.filter((s: any) =>
                s.applications.some((a: any) => a.status === 'ACCEPTED')
              ).length}
            </p>
          </div>
        </div>

        {/* Заявки на проверку */}
        <div className="bg-white rounded-xl border p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">
            Заявки на рассмотрении
            {pendingApplications.length > 0 && (
              <span className="ml-2 bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                {pendingApplications.length}
              </span>
            )}
          </h3>

          {pendingApplications.length === 0 ? (
            <p className="text-gray-400 text-center py-6">Нет заявок на рассмотрении</p>
          ) : (
            <div className="space-y-3">
              {pendingApplications.map((app: any) => (
                <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{app.student.user.name}</p>
                    <p className="text-sm text-gray-500">
                      {app.internship.title} — {app.company.name}
                    </p>
                  </div>
                  <ApproveButtons
                    id={app.id}
                    approveUrl={`/api/curator/approve/${app.id}`}
                    rejectUrl={`/api/curator/reject/${app.id}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Список студентов */}
        <div className="bg-white rounded-xl border p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Студенты группы ИС22-4А</h3>

          {students.length === 0 ? (
            <p className="text-gray-400 text-center py-6">Студентов пока нет</p>
          ) : (
            <div className="space-y-3">
              {students.map((student: any) => {
                const total = student.diaryEntries.length
                const present = student.diaryEntries.filter(
                  (d: any) => d.status === 'PRESENT'
                ).length
                const attendance = total > 0 ? Math.round((present / total) * 100) : 0
                const activeApp = student.applications.find(
                  (a: any) => a.status === 'ACCEPTED'
                )

                return (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">
                        {student.user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{student.user.name}</p>
                        <p className="text-sm text-gray-500">{student.group}</p>
                        <a
                          href={`/curator/student/${student.id}`}
                          className="text-xs text-blue-600 hover:underline mt-0.5 inline-block"
                        >
                          👤 Профиль и резюме
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-gray-400 text-xs">Посещаемость</p>
                        <p className={`font-medium ${attendance >= 80 ? 'text-green-600' : 'text-red-500'}`}>
                          {attendance}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs">Стажировка</p>
                        <p className="font-medium">
                          {activeApp ? activeApp.company.name : 'Нет'}
                        </p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        activeApp
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {activeApp ? 'Активна' : 'Не назначена'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Меморандумы */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold mb-4">📋 Меморандумы компаний</h3>
          <a href="/curator/memorandums" className="text-blue-600 hover:underline text-sm">
            Просмотреть все меморандумы →
          </a>
        </div>

      </div>
    </div>
  )
}