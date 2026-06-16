import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function SuperAdminDocumentsPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'SUPER_ADMIN') redirect('/student')

  const documents = await prisma.document.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 px-8 py-4 flex items-center gap-4">
        <a href="/superadmin" className="text-gray-400 hover:text-gray-300">← Назад</a>
        <h1 className="text-xl font-bold">Документы</h1>
        <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">{documents.length}</span>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 font-medium text-gray-400">Пользователь</th>
                <th className="text-left p-4 font-medium text-gray-400">Документ</th>
                <th className="text-left p-4 font-medium text-gray-400">Статус</th>
                <th className="text-left p-4 font-medium text-gray-400">Дата</th>
                <th className="text-left p-4 font-medium text-gray-400">Действия</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc: any) => (
                <tr key={doc.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="p-4">
                    <p className="text-white font-medium">{doc.user?.name ?? '—'}</p>
                    <p className="text-gray-500 text-xs">{doc.user?.email}</p>
                  </td>
                  <td className="p-4 text-gray-400">{doc.name}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      doc.signed
                        ? 'bg-green-900 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {doc.signed ? 'Подписан' : 'Не подписан'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 text-xs">
                    {new Date(doc.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="p-4">
                    <a
                      href={doc.url}
                      target="_blank"
                      className="text-blue-400 text-xs hover:text-blue-300 hover:underline"
                    >
                      Открыть
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {documents.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-3">📄</p>
              <p>Документов нет</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}