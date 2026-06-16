import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function SuperAdminPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'SUPER_ADMIN') redirect('/student')

  const totalUsers = await prisma.user.count()
  const totalStudents = await prisma.student.count()
  const totalCompanies = await prisma.company.count()
  const totalApplications = await prisma.application.count()
  const totalDiary = await prisma.diaryEntry.count()
  const totalDocuments = await prisma.document.count()

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-sm font-bold">S</div>
          <div>
            <h1 className="text-lg font-bold">Super Admin Panel</h1>
            <p className="text-xs text-gray-400">Qadam — Полный доступ</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{session?.user?.name}</span>
          <a href="/signout" className="text-sm text-red-400 hover:text-red-300">Выйти</a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">

        {/* Статистика */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Пользователей', value: totalUsers, color: 'text-blue-400' },
            { label: 'Студентов', value: totalStudents, color: 'text-green-400' },
            { label: 'Компаний', value: totalCompanies, color: 'text-teal-400' },
            { label: 'Заявок', value: totalApplications, color: 'text-yellow-400' },
            { label: 'Записей дневника', value: totalDiary, color: 'text-purple-400' },
            { label: 'Документов', value: totalDocuments, color: 'text-red-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Разделы управления */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { href: '/superadmin/users', icon: '👥', title: 'Пользователи', desc: 'Просмотр, редактирование, удаление, смена роли', color: 'border-blue-500' },
            { href: '/superadmin/companies', icon: '🏢', title: 'Компании', desc: 'Управление компаниями и их данными', color: 'border-teal-500' },
            { href: '/superadmin/applications', icon: '📋', title: 'Заявки', desc: 'Все заявки с возможностью изменения статуса', color: 'border-yellow-500' },
            { href: '/superadmin/diary', icon: '📔', title: 'Дневники', desc: 'Все записи дневников студентов', color: 'border-purple-500' },
            { href: '/superadmin/documents', icon: '📄', title: 'Документы', desc: 'Все загруженные документы', color: 'border-red-500' },
            { href: '/superadmin/create', icon: '➕', title: 'Создать', desc: 'Добавить студента, компанию или вакансию', color: 'border-green-500' },
            { href: '/superadmin/students', icon: '👥', title: 'Массовое создание', desc: 'Создать целую группу студентов', color: 'border-blue-500' },
          ].map((item, i) => (
            <a key={i} href={item.href} className={`bg-gray-800 border ${item.color} rounded-2xl p-6 hover:bg-gray-750 transition block`}>
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-lg mb-1">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}