import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AdminUserActions from '@/components/AdminUserActions'

export default async function SuperAdminUsersPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'SUPER_ADMIN') redirect('/student')

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { student: true }
  })

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 px-8 py-4 flex items-center gap-4">
        <a href="/superadmin" className="text-gray-400 hover:text-gray-300">← Назад</a>
        <h1 className="text-xl font-bold">Пользователи</h1>
        <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">{users.length}</span>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-750 border-b border-gray-700">
                <th className="text-left p-4 font-medium text-gray-400">Пользователь</th>
                <th className="text-left p-4 font-medium text-gray-400">Email</th>
                <th className="text-left p-4 font-medium text-gray-400">Роль</th>
                <th className="text-left p-4 font-medium text-gray-400">№ договора</th>
                <th className="text-left p-4 font-medium text-gray-400">Группа</th>
                <th className="text-left p-4 font-medium text-gray-400">Дата</th>
                <th className="text-left p-4 font-medium text-gray-400">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => (
                <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center font-bold text-blue-400 text-xs">
                        {user.name?.charAt(0).toUpperCase() ?? '?'}
                      </div>
                      <span className="font-medium text-white">{user.name ?? '—'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-400">{user.email}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      user.role === 'SUPER_ADMIN' ? 'bg-red-900 text-red-400' :
                      user.role === 'ADMIN' ? 'bg-red-900 text-red-300' :
                      user.role === 'CURATOR' ? 'bg-purple-900 text-purple-400' :
                      user.role === 'COMPANY' ? 'bg-blue-900 text-blue-400' :
                      user.role === 'SUPERVISOR' ? 'bg-orange-900 text-orange-400' :
                      'bg-gray-700 text-gray-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400">
                    {user.student?.contractNumber ? `№${user.student.contractNumber}` : '—'}
                  </td>
                  <td className="p-4 text-gray-400">
                    {user.student?.group ?? '—'}
                  </td>
                  <td className="p-4 text-gray-500 text-xs">
                    {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="p-4">
                    <AdminUserActions
                      userId={user.id}
                      userName={user.name}
                      userRole={user.role}
                    />
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