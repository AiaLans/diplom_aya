import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ApproveButtons from '@/components/ApproveButtons'
import CompanyApproveButtons from '@/components/CompanyApproveButtons'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (session?.user?.role !== 'ADMIN') {
    redirect('/student')
  }

  const totalUsers = await prisma.user.count()
  const totalStudents = await prisma.student.count()
  const totalCompanies = await prisma.company.count()
  const totalApplications = await prisma.application.count()
  const pendingApplications = await prisma.application.count({
    where: { status: 'PENDING_ADMIN' }
  })

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  const applications = await prisma.application.findMany({
    where: { status: 'PENDING_ADMIN' },
    include: {
      student: { include: { user: true } },
      company: true,
      internship: true,
    }
  })

  const pendingCompanies = await prisma.company.findMany({
    where: { approved: false },
    orderBy: { id: 'desc' },
  })

  const companies = await prisma.company.findMany({
    where: { approved: true },
    include: { internships: true }
  })

  const students = await prisma.student.findMany({
    where: { group: 'ИС22-4А' },
    include: {
      user: true,
      applications: {
        where: { status: 'ACCEPTED' },
        include: { company: true }
      }
    },
    orderBy: { contractNumber: 'asc' }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">Qadam — Админ</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{session?.user?.name}</span>
          <a href="/signout" className="text-sm text-red-500 hover:underline">
            Выйти
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Панель администратора</h2>
          <div className="flex gap-3">
            <a href="/admin/documents" className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600">
              📄 Документы
            </a>
            <a href="/admin/monitoring" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
              📊 Мониторинг
            </a>
            <a href="/admin/companies/create" className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700">
              + Добавить компанию
            </a>
            <a href="/admin/students" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              + Создать студентов
            </a>
            <a href="/admin/companies/create/internship" className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700">
              + Добавить вакансию
            </a>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border">
            <p className="text-sm text-gray-500 mb-1">Пользователей</p>
            <p className="text-3xl font-bold text-blue-600">{totalUsers}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border">
            <p className="text-sm text-gray-500 mb-1">Студентов</p>
            <p className="text-3xl font-bold text-purple-600">{totalStudents}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border">
            <p className="text-sm text-gray-500 mb-1">Компаний</p>
            <p className="text-3xl font-bold text-teal-600">{totalCompanies}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border">
            <p className="text-sm text-gray-500 mb-1">Заявок</p>
            <p className="text-3xl font-bold text-green-600">{totalApplications}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border">
            <p className="text-sm text-gray-500 mb-1">Ожидают</p>
            <p className="text-3xl font-bold text-yellow-500">{pendingApplications}</p>
          </div>
        </div>

        {/* Новые компании на проверке */}
        <div className="bg-white rounded-xl border p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">
            Новые компании на проверке
            {pendingCompanies.length > 0 && (
              <span className="ml-2 bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
                {pendingCompanies.length}
              </span>
            )}
          </h3>

          {pendingCompanies.length === 0 ? (
            <p className="text-gray-400 text-center py-6">Нет компаний на проверке</p>
          ) : (
            <div className="space-y-4">
              {pendingCompanies.map((company: any) => (
                <div key={company.id} className="border rounded-xl p-5 bg-orange-50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-lg">{company.name}</p>
                      <p className="text-sm text-gray-500">{company.address}</p>
                    </div>
                    <span className="bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full">
                      На проверке
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Email</p>
                      <p className="font-medium">{company.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Телефон</p>
                      <p className="font-medium">{company.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">БИН</p>
                      <p className="font-medium">{company.bin}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Должность студента</p>
                      <p className="font-medium">{company.position}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Банк</p>
                      <p className="font-medium">{company.bank}</p>
                    </div>
                    {company.description && (
                      <div>
                        <p className="text-gray-400 text-xs">Описание</p>
                        <p className="font-medium">{company.description}</p>
                      </div>
                    )}
                  </div>

                  <CompanyApproveButtons
                    id={company.id}
                    email={company.email}
                    name={company.name}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Заявки на финальное одобрение */}
        <div className="bg-white rounded-xl border p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">
            Финальное одобрение заявок
            {applications.length > 0 && (
              <span className="ml-2 bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                {applications.length}
              </span>
            )}
          </h3>

          {applications.length === 0 ? (
            <p className="text-gray-400 text-center py-6">Нет заявок на рассмотрении</p>
          ) : (
            <div className="space-y-3">
              {applications.map((app: any) => (
                <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{app.student.user.name}</p>
                    <p className="text-sm text-gray-500">
                      {app.internship.title} — {app.company.name}
                    </p>
                  </div>
                  <ApproveButtons
                    id={app.id}
                    approveUrl={`/api/admin/approve/${app.id}`}
                    rejectUrl={`/api/admin/reject/${app.id}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Студенты группы */}
        <div className="bg-white rounded-xl border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Студенты группы ИС22-4А ({students.length})</h3>
            <a href="/admin/students" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              + Создать студентов
            </a>
          </div>
          <div className="space-y-2">
            {students.map((student: any) => {
              const activeApp = student.applications[0]
              return (
                <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-xs">
                      {student.user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{student.user.name}</p>
                      <p className="text-xs text-gray-400">{student.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-400 text-xs">№{student.contractNumber}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activeApp
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {activeApp ? activeApp.company.name : 'Не назначена'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Последние пользователи */}
        <div className="bg-white rounded-xl border p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Последние пользователи</h3>
          <div className="space-y-3">
            {users.map((user: any) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">
                    {user.name?.charAt(0).toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                  user.role === 'CURATOR' ? 'bg-purple-100 text-purple-700' :
                  user.role === 'COMPANY' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {user.role === 'ADMIN' ? 'Админ' :
                   user.role === 'CURATOR' ? 'Куратор' :
                   user.role === 'COMPANY' ? 'Компания' :
                   user.role === 'SUPERVISOR' ? 'Супервизор' : 'Студент'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Меморандумы */}
        <div className="bg-white rounded-xl border p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">📋 Меморандумы компаний</h3>
          <a href="/admin/memorandums" className="text-blue-600 hover:underline text-sm">
            Просмотреть все меморандумы →
          </a>
        </div>

        {/* Одобренные компании */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold mb-4">Одобренные компании</h3>
          <div className="space-y-3">
            {companies.map((company: any) => (
              <div key={company.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{company.name}</p>
                  <p className="text-sm text-gray-500">{company.internships.length} вакансий</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
                  Одобрена
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}