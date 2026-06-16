import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import SuperAdminAppActions from '@/components/SuperAdminAppActions'

export default async function SuperAdminApplicationsPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'SUPER_ADMIN') redirect('/student')

  const applications = await prisma.application.findMany({
    include: {
      student: { include: { user: true } },
      company: true,
      internship: true,
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 px-8 py-4 flex items-center gap-4">
        <a href="/superadmin" className="text-gray-400 hover:text-gray-300">← Назад</a>
        <h1 className="text-xl font-bold">Заявки</h1>
        <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">{applications.length}</span>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 font-medium text-gray-400">Студент</th>
                <th className="text-left p-4 font-medium text-gray-400">Компания</th>
                <th className="text-left p-4 font-medium text-gray-400">Вакансия</th>
                <th className="text-left p-4 font-medium text-gray-400">Статус</th>
                <th className="text-left p-4 font-medium text-gray-400">Дата</th>
                <th className="text-left p-4 font-medium text-gray-400">Действия</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app: any) => (
                <tr key={app.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="p-4 text-white">{app.student.user.name}</td>
                  <td className="p-4 text-gray-400">{app.company.name}</td>
                  <td className="p-4 text-gray-400">{app.internship.title}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      app.status === 'ACCEPTED' ? 'bg-green-900 text-green-400' :
                      app.status === 'REJECTED' ? 'bg-red-900 text-red-400' :
                      'bg-yellow-900 text-yellow-400'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 text-xs">
                    {new Date(app.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="p-4">
                    <SuperAdminAppActions appId={app.id} currentStatus={app.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}