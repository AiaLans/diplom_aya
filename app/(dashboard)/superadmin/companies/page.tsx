import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AdminCompanyActions from '@/components/AdminCompanyActions'

export default async function SuperAdminCompaniesPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'SUPER_ADMIN') redirect('/student')

  const companies = await prisma.company.findMany({
    include: { internships: true, applications: true },
    orderBy: { id: 'asc' }
  })

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 px-8 py-4 flex items-center gap-4">
        <a href="/superadmin" className="text-gray-400 hover:text-gray-300">← Назад</a>
        <h1 className="text-xl font-bold">Компании</h1>
        <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">{companies.length}</span>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 font-medium text-gray-400">Компания</th>
                <th className="text-left p-4 font-medium text-gray-400">Email</th>
                <th className="text-left p-4 font-medium text-gray-400">БИН</th>
                <th className="text-left p-4 font-medium text-gray-400">Адрес</th>
                <th className="text-left p-4 font-medium text-gray-400">Вакансий</th>
                <th className="text-left p-4 font-medium text-gray-400">Заявок</th>
                <th className="text-left p-4 font-medium text-gray-400">Статус</th>
                <th className="text-left p-4 font-medium text-gray-400">Действия</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company: any) => (
                <tr key={company.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="p-4 font-medium text-white">{company.name}</td>
                  <td className="p-4 text-gray-400">{company.email ?? '—'}</td>
                  <td className="p-4 text-gray-400">{company.bin ?? '—'}</td>
                  <td className="p-4 text-gray-400 text-xs">{company.address ?? '—'}</td>
                  <td className="p-4 text-gray-400">{company.internships.length}</td>
                  <td className="p-4 text-gray-400">{company.applications.length}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      company.approved
                        ? 'bg-green-900 text-green-400'
                        : 'bg-yellow-900 text-yellow-400'
                    }`}>
                      {company.approved ? 'Одобрена' : 'На проверке'}
                    </span>
                  </td>
                  <td className="p-4">
                    <AdminCompanyActions
                      companyId={company.id}
                      companyName={company.name}
                      approved={company.approved}
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