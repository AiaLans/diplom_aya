import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function SuperAdminDiaryPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'SUPER_ADMIN') redirect('/student')

  const entries = await prisma.diaryEntry.findMany({
    include: {
      student: { include: { user: true } }
    },
    orderBy: { date: 'desc' }
  })

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 px-8 py-4 flex items-center gap-4">
        <a href="/superadmin" className="text-gray-400 hover:text-gray-300">← Назад</a>
        <h1 className="text-xl font-bold">Дневники</h1>
        <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">{entries.length} записей</span>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 font-medium text-gray-400">Студент</th>
                <th className="text-left p-4 font-medium text-gray-400">Дата</th>
                <th className="text-left p-4 font-medium text-gray-400">Статус</th>
                <th className="text-left p-4 font-medium text-gray-400">Отчёт</th>
                <th className="text-left p-4 font-medium text-gray-400">Подтверждение</th>
                <th className="text-left p-4 font-medium text-gray-400">Комментарий</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry: any) => (
                <tr key={entry.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="p-4">
                    <p className="text-white font-medium">{entry.student.user.name}</p>
                    <p className="text-gray-500 text-xs">{entry.student.group ?? '—'}</p>
                  </td>
                  <td className="p-4 text-gray-400">
                    {new Date(entry.date).toLocaleDateString('ru-RU', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      entry.status === 'PRESENT'
                        ? 'bg-green-900 text-green-400'
                        : 'bg-red-900 text-red-400'
                    }`}>
                      {entry.status === 'PRESENT' ? 'Присутствовал' : 'Отсутствовал'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-xs max-w-xs truncate">
                    {entry.report ?? entry.absenceReason ?? '—'}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      entry.supervisorStatus === 'CONFIRMED' ? 'bg-blue-900 text-blue-400' :
                      entry.supervisorStatus === 'REJECTED' ? 'bg-red-900 text-red-400' :
                      'bg-yellow-900 text-yellow-400'
                    }`}>
                      {entry.supervisorStatus === 'CONFIRMED' ? '✓ Подтверждено' :
                       entry.supervisorStatus === 'REJECTED' ? '✗ Отклонено' : '⏳ Ожидает'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-xs">
                    {entry.supervisorComment ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {entries.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-3">📔</p>
              <p>Записей дневника нет</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}