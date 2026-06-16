'use client'

import { useLang } from '@/lib/useLang'
import LangSwitcher from '@/components/LangSwitcher'

type Props = {
  name: string
  attendance: number
  diaryCount: number
  applicationsCount: number
  applications: any[]
}

export default function StudentClient({
  name,
  attendance,
  diaryCount,
  applicationsCount,
  applications,
}: Props) {
  const { t } = useLang()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">Qadam</h1>
        <div className="flex items-center gap-4">
          <LangSwitcher />
          <span className="text-sm text-gray-600">{name}</span>
          <a href="/signout" className="text-sm text-red-500 hover:underline">
            {t.logout}
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-8">
        <h2 className="text-2xl font-bold mb-2">
          {t.greeting}, {name}! 👋
        </h2>
        <p className="text-gray-500 mb-8">{t.progress}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border">
            <p className="text-sm text-gray-500 mb-1">{t.attendance}</p>
            <p className="text-3xl font-bold text-blue-600">{attendance}%</p>
          </div>
          <div className="bg-white rounded-xl p-6 border">
            <p className="text-sm text-gray-500 mb-1">{t.diaryCount}</p>
            <p className="text-3xl font-bold text-green-600">{diaryCount}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border">
            <p className="text-sm text-gray-500 mb-1">{t.applications}</p>
            <p className="text-3xl font-bold text-purple-600">{applicationsCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{t.myApplications}</h3>
          {applications.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>{t.noApplications}</p>
              <a href="/student/companies" className="mt-3 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                {t.findInternship}
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app: any) => (
                <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{app.company.name}</p>
                    <p className="text-sm text-gray-500">{app.internship.title}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    app.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                    app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {app.status === 'ACCEPTED' ? t.accepted :
                     app.status === 'REJECTED' ? t.rejected : t.pending}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: '/student/diary', icon: '📔', label: t.diary },
            { href: '/student/companies', icon: '🏢', label: t.companies },
            { href: '/student/profile', icon: '👤', label: t.profile },
            { href: '/student/ai-chat', icon: '🤖', label: t.aiAssistant },
            { href: '/student/documents', icon: '📄', label: t.documents },
            { href: '/student/resume', icon: '📝', label: t.resume },
            { href: '/student/checklist', icon: '✅', label: t.checklist },
          ].map((item) => (
            <a key={item.href} href={item.href} className="bg-white border rounded-xl p-4 text-center hover:shadow-md transition">
              <p className="text-2xl mb-2">{item.icon}</p>
              <p className="text-sm font-medium">{item.label}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}