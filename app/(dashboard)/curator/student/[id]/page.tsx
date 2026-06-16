import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function CuratorStudentPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)

  if (session?.user?.role !== 'CURATOR' && session?.user?.role !== 'ADMIN') {
    redirect('/student')
  }

  const { id } = await params

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: true,
      resume: true,
      applications: {
        include: { company: true, internship: true }
      },
      diaryEntries: {
        orderBy: { date: 'desc' },
        take: 5,
      }
    }
  })

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Студент не найден</p>
      </div>
    )
  }

  const total = student.diaryEntries.length
  const present = student.diaryEntries.filter(d => d.status === 'PRESENT').length
  const attendance = total > 0 ? Math.round((present / total) * 100) : 0
  const activeApp = student.applications.find(a => a.status === 'ACCEPTED')
  const resume = student.resume

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-4 flex items-center gap-4">
        <a href="/curator" className="text-gray-400 hover:text-gray-600">← Назад</a>
        <h1 className="text-xl font-bold text-blue-600">Профиль студента</h1>
      </div>

      <div className="max-w-3xl mx-auto p-8 space-y-6">

        {/* Основная информация */}
        <div className="bg-white rounded-2xl border p-6">
          <div className="flex items-center gap-4 mb-4">
            {student.user.image ? (
              <img src={student.user.image} alt="Фото" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
                {student.user.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold">{student.user.name}</h2>
              <p className="text-gray-500 text-sm">{student.user.email}</p>
              <p className="text-gray-400 text-sm">{student.group} • Договор №{student.contractNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${attendance >= 80 ? 'text-green-600' : 'text-red-500'}`}>
                {attendance}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Посещаемость</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{total}</p>
              <p className="text-xs text-gray-500 mt-1">Записей</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <p className="text-lg font-bold text-purple-600">
                {activeApp ? activeApp.company.name : 'Нет'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Компания</p>
            </div>
          </div>
        </div>

        {/* Навыки */}
        {student.skills?.length > 0 && (
          <div className="bg-white rounded-2xl border p-6">
            <h3 className="font-semibold mb-3">💻 Навыки</h3>
            <div className="flex flex-wrap gap-2">
              {student.skills.map((skill: string, i: number) => (
                <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Резюме */}
        {resume ? (
          <div className="bg-white rounded-2xl border p-6 space-y-4">
            <h3 className="font-semibold text-lg">📝 Резюме</h3>

            {resume.summary && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">О себе</p>
                <p className="text-gray-700">{resume.summary}</p>
              </div>
            )}

            {resume.experience && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Опыт / Проекты</p>
                <p className="text-gray-700 whitespace-pre-line">{resume.experience}</p>
              </div>
            )}

            {resume.education && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Образование</p>
                <p className="text-gray-700">{resume.education}</p>
              </div>
            )}

            {resume.certificates?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Сертификаты</p>
                <ul className="space-y-1">
                  {resume.certificates.map((cert: string, i: number) => (
                    <li key={i} className="text-gray-700 flex gap-2">
                      <span className="text-blue-500">✓</span> {cert}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {resume.achievements?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Достижения</p>
                <ul className="space-y-1">
                  {resume.achievements.map((ach: string, i: number) => (
                    <li key={i} className="text-gray-700 flex gap-2">
                      <span className="text-yellow-500">★</span> {ach}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border p-6 text-center text-gray-400">
            <p className="text-3xl mb-2">📝</p>
            <p>Резюме ещё не заполнено</p>
          </div>
        )}

        {/* Последние записи дневника */}
        <div className="bg-white rounded-2xl border p-6">
          <h3 className="font-semibold mb-4">📔 Последние записи дневника</h3>
          {student.diaryEntries.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Записей нет</p>
          ) : (
            <div className="space-y-3">
              {student.diaryEntries.map((entry: any) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(entry.date).toLocaleDateString('ru-RU', {
                        day: 'numeric', month: 'long'
                      })}
                    </p>
                    {entry.report && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{entry.report}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      entry.status === 'PRESENT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {entry.status === 'PRESENT' ? 'Присутствовал' : 'Отсутствовал'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      entry.supervisorStatus === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {entry.supervisorStatus === 'CONFIRMED' ? '✓' : '⏳'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}