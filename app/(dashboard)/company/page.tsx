import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ApproveButtons from '@/components/ApproveButtons'

export default async function CompanyDashboard() {
  const session = await getServerSession(authOptions)

  if (session?.user?.role !== 'COMPANY' && session?.user?.role !== 'ADMIN') {
    redirect('/student')
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session?.user?.id },
  })

  const companyId = currentUser?.companyId

  const whereClause = session?.user?.role === 'ADMIN'
    ? { status: 'PENDING_COMPANY' as const }
    : { status: 'PENDING_COMPANY' as const, companyId: companyId ?? '' }

  const whereAccepted = session?.user?.role === 'ADMIN'
    ? { status: 'ACCEPTED' as const }
    : { status: 'ACCEPTED' as const, companyId: companyId ?? '' }

  const applications = await prisma.application.findMany({
    where: whereClause,
    include: {
      student: { include: { user: true } },
      internship: true,
      company: true,
    }
  })

  const accepted = await prisma.application.findMany({
    where: whereAccepted,
    include: {
      student: {
        include: {
          user: true,
          diaryEntries: {
            orderBy: { date: 'desc' },
            take: 1,
          }
        }
      },
      internship: true,
    }
  })

  const company = companyId ? await prisma.company.findUnique({
    where: { id: companyId }
  }) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-blue-600">Qadam — Компания</h1>
          {company && <p className="text-sm text-gray-500">{company.name}</p>}
        </div>
        <div className="flex items-center gap-4">
          <a href="/company/memorandum" className="text-sm text-gray-600 hover:text-blue-600">
            📋 Меморандум
          </a>
          <span className="text-sm text-gray-600">{session?.user?.name}</span>
          <a href="/signout" className="text-sm text-red-500 hover:underline">
            Выйти
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        <h2 className="text-2xl font-bold mb-8">Панель компании</h2>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border">
            <p className="text-sm text-gray-500 mb-1">Заявок на рассмотрении</p>
            <p className="text-3xl font-bold text-yellow-500">{applications.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border">
            <p className="text-sm text-gray-500 mb-1">Активных стажёров</p>
            <p className="text-3xl font-bold text-green-600">{accepted.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border">
            <p className="text-sm text-gray-500 mb-1">Всего заявок</p>
            <p className="text-3xl font-bold text-blue-600">
              {applications.length + accepted.length}
            </p>
          </div>
        </div>

        {/* Заявки на рассмотрении */}
        <div className="bg-white rounded-xl border p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">
            Заявки кандидатов
            {applications.length > 0 && (
              <span className="ml-2 bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                {applications.length}
              </span>
            )}
          </h3>

          {applications.length === 0 ? (
            <p className="text-gray-400 text-center py-6">Нет новых заявок</p>
          ) : (
            <div className="space-y-3">
              {applications.map((app: any) => (
                <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">
                      {app.student.user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{app.student.user.name}</p>
                      <p className="text-sm text-gray-500">{app.internship.title}</p>
                      <a
                        href={`/company/student/${app.student.id}`}
                        className="mt-1 inline-block text-xs text-blue-600 hover:underline"
                      >
                        📝 Посмотреть резюме
                      </a>
                      {app.student.skills?.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {app.student.skills.slice(0, 3).map((skill: string, i: number) => (
                            <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                      {app.student.githubUrl && (
                        <a
                          href={app.student.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 bg-gray-800 text-white text-xs px-3 py-1 rounded-lg hover:bg-gray-700"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                          </svg>
                          GitHub
                        </a>
                      )}
                    </div>
                  </div>
                  <ApproveButtons
                    id={app.id}
                    approveUrl={`/api/company/approve/${app.id}`}
                    rejectUrl={`/api/curator/reject/${app.id}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Активные стажёры */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold mb-4">Активные стажёры</h3>

          {accepted.length === 0 ? (
            <p className="text-gray-400 text-center py-6">Нет активных стажёров</p>
          ) : (
            <div className="space-y-3">
              {accepted.map((app: any) => {
                const lastEntry = app.student.diaryEntries[0]
                return (
                  <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-600 text-sm">
                        {app.student.user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{app.student.user.name}</p>
                        <p className="text-sm text-gray-500">{app.internship.title}</p>
                        <a
                          href={`/company/student/${app.student.id}`}
                          className="mt-1 inline-block text-xs text-blue-600 hover:underline"
                        >
                          📝 Посмотреть резюме
                        </a>
                        {app.student.githubUrl && (
                          <a
                            href={app.student.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 bg-gray-800 text-white text-xs px-3 py-1 rounded-lg hover:bg-gray-700"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                            </svg>
                            GitHub
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      {lastEntry && (
                        <div className="text-center">
                          <p className="text-gray-400 text-xs">Последняя запись</p>
                          <p className="font-medium">
                            {new Date(lastEntry.date).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      )}
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        lastEntry?.supervisorStatus === 'CONFIRMED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {lastEntry?.supervisorStatus === 'CONFIRMED' ? 'Подтверждено' : 'Ожидает'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}