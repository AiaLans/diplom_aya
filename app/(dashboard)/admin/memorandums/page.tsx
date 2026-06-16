import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function AdminMemorandumsPage() {
  const session = await getServerSession(authOptions)

  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN' && session?.user?.role !== 'CURATOR') {
    redirect('/student')
  }

  const memorandums = await prisma.memorandum.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      company: true,
      uploadedBy: true,
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-4 flex items-center gap-4">
        <a href="/admin" className="text-gray-400 hover:text-gray-600">← Назад</a>
        <h1 className="text-xl font-bold text-blue-600">Меморандумы компаний</h1>
        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{memorandums.length}</span>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        {memorandums.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border">
            <p className="text-4xl mb-3">📋</p>
            <p>Меморандумов пока нет</p>
          </div>
        ) : (
          <div className="space-y-4">
            {memorandums.map((doc: any) => (
              <div key={doc.id} className="bg-white rounded-2xl border p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">📋</div>
                  <div>
                    <p className="font-semibold">{doc.company.name}</p>
                    <p className="text-sm text-gray-500">
                      Загрузил: {doc.uploadedBy.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(doc.createdAt).toLocaleDateString('ru-RU', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                >
                  Открыть
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}