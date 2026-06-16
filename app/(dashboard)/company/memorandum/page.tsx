import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import UploadMemorandum from '@/components/UploadMemorandum'
import DeleteMemorandumButton from '@/components/DeleteMemorandumButton'

export default async function MemorandumPage() {
  const session = await getServerSession(authOptions)

  const allowedRoles = ['COMPANY', 'SUPERVISOR', 'ADMIN', 'SUPER_ADMIN']
  if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
    redirect('/student')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  const memorandums = user?.companyId ? await prisma.memorandum.findMany({
    where: { companyId: user.companyId },
    orderBy: { createdAt: 'desc' },
    include: { uploadedBy: true }
  }) : []

  const company = user?.companyId ? await prisma.company.findUnique({
    where: { id: user.companyId }
  }) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-4 flex items-center gap-4">
        <a href="/company" className="text-gray-400 hover:text-gray-600">← Назад</a>
        <h1 className="text-xl font-bold text-blue-600">Меморандум</h1>
        {company && <span className="text-gray-500 text-sm">— {company.name}</span>}
      </div>

      <div className="max-w-4xl mx-auto p-8 space-y-6">

        {/* Инфо */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-blue-700 text-sm">
            📋 Меморандум о сотрудничестве между колледжем и вашей компанией.
            Скачайте бланк, заполните данные компании, подпишите и загрузите PDF.
          </p>
        </div>

        {/* Скачать шаблоны */}
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Шаблоны меморандума</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg">📄</div>
                <div>
                  <p className="font-medium text-sm">Бланк меморандума</p>
                  <p className="text-xs text-gray-500">Пустой бланк для заполнения</p>
                </div>
              </div>
              <a
                href="/Меморандум_-_бланк.doc"
                download
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Скачать
              </a>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-lg">📋</div>
                <div>
                  <p className="font-medium text-sm">Пример заполнения</p>
                  <p className="text-xs text-gray-500">Образец правильного заполнения</p>
                </div>
              </div>
              <a
                href="/Меморандум_-_пример.doc"
                download
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
              >
                Скачать
              </a>
            </div>
          </div>
        </div>

        {/* Загрузить подписанный */}
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-lg font-semibold mb-2">Загрузить подписанный меморандум</h2>
          <p className="text-gray-500 text-sm mb-4">
            После подписания загрузите меморандум в формате PDF
          </p>
          <UploadMemorandum />
        </div>

        {/* Загруженные меморандумы */}
        {memorandums.length > 0 && (
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Загруженные меморандумы</h2>
            <div className="space-y-3">
              {memorandums.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-lg">📎</div>
                    <div>
                      <p className="font-medium text-sm">Меморандум</p>
                      <p className="text-xs text-gray-400">
                        Загрузил: {doc.uploadedBy.name} • {new Date(doc.createdAt).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={doc.url}
                      target="_blank"
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Открыть
                    </a>
                    <DeleteMemorandumButton id={doc.id} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}