import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ApproveDocButton from '@/components/ApproveDocButton'

const DOC_TYPE_LABELS: Record<string, string> = {
  CONTRACT: '📄 Договор',
  ATTENDANCE: '📅 Посещаемость',
  PRESENTATION: '📊 Презентация',
  CHARACTERISTIC: '📋 Характеристика',
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'На проверке', color: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { label: 'Одобрен', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Отклонён', color: 'bg-red-100 text-red-700' },
}

export default async function AdminDocumentsPage() {
  const session = await getServerSession(authOptions)

  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN') {
    redirect('/student')
  }

  const documents = await prisma.document.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  })

  const pending = documents.filter(d => d.status === 'PENDING')
  const approved = documents.filter(d => d.status === 'APPROVED')
  const rejected = documents.filter(d => d.status === 'REJECTED')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-4 flex items-center gap-4">
        <a href="/admin" className="text-gray-400 hover:text-gray-600">← Назад</a>
        <h1 className="text-xl font-bold text-blue-600">Документы студентов</h1>
        <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
          {pending.length} на проверке
        </span>
      </div>

      <div className="max-w-5xl mx-auto p-8">

        {/* Статистика */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border text-center">
            <p className="text-3xl font-bold text-yellow-500">{pending.length}</p>
            <p className="text-sm text-gray-500 mt-1">На проверке</p>
          </div>
          <div className="bg-white rounded-xl p-6 border text-center">
            <p className="text-3xl font-bold text-green-600">{approved.length}</p>
            <p className="text-sm text-gray-500 mt-1">Одобрено</p>
          </div>
          <div className="bg-white rounded-xl p-6 border text-center">
            <p className="text-3xl font-bold text-red-500">{rejected.length}</p>
            <p className="text-sm text-gray-500 mt-1">Отклонено</p>
          </div>
        </div>

        {/* На проверке */}
        {pending.length > 0 && (
          <div className="bg-white rounded-2xl border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-yellow-600">⏳ На проверке</h2>
            <div className="space-y-3">
              {pending.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center text-lg">
                      {DOC_TYPE_LABELS[doc.docType ?? '']?.split(' ')[0] ?? '📎'}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{DOC_TYPE_LABELS[doc.docType ?? ''] ?? doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.user.name} • {doc.user.email}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(doc.createdAt).toLocaleDateString('ru-RU', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={doc.url}
                      target="_blank"
                      className="text-blue-600 text-sm hover:underline px-3 py-1"
                    >
                      Открыть
                    </a>
                    <ApproveDocButton id={doc.id} action="APPROVED" />
                    <ApproveDocButton id={doc.id} action="REJECTED" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Все документы */}
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Все документы ({documents.length})</h2>
          {documents.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Документов пока нет</p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc: any) => {
                const status = STATUS_LABELS[doc.status] ?? STATUS_LABELS.PENDING
                return (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                        {DOC_TYPE_LABELS[doc.docType ?? '']?.split(' ')[0] ?? '📎'}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{DOC_TYPE_LABELS[doc.docType ?? ''] ?? doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.user.name}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(doc.createdAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.color}`}>
                        {status.label}
                      </span>
                      <a
                        href={doc.url}
                        target="_blank"
                        className="text-blue-600 text-sm hover:underline"
                      >
                        Открыть
                      </a>
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