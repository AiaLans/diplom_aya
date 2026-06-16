import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function StudentProfilePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'COMPANY' && session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN') {
    redirect('/student')
  }

  const { id } = await params

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: true,
      resume: true,
    }
  })

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Студент не найден</p>
      </div>
    )
  }

  const resume = student.resume

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-4 flex items-center gap-4">
        <a href="/company" className="text-gray-400 hover:text-gray-600">← Назад</a>
        <h1 className="text-xl font-bold text-blue-600">Профиль студента</h1>
      </div>

      <div className="max-w-3xl mx-auto p-8">

        {/* Шапка */}
        <div className="bg-white rounded-2xl border p-8 mb-6">
          <div className="flex items-center gap-5 mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
              {student.user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{student.user.name}</h2>
              <p className="text-gray-500">{student.user.email}</p>
              <p className="text-gray-400 text-sm">{student.group ?? 'Группа не указана'}</p>
            </div>
          </div>

          {/* Навыки */}
          {student.skills?.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 mb-2">Навыки:</p>
              <div className="flex flex-wrap gap-2">
                {student.skills.map((skill: string, i: number) => (
                  <span key={i} className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {student.githubUrl && (
            <a
              href={student.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub профиль
            </a>
          )}
        </div>

        {!resume ? (
          <div className="bg-white rounded-2xl border p-8 text-center text-gray-400">
            <p className="text-3xl mb-2">📝</p>
            <p>Студент ещё не заполнил резюме</p>
          </div>
        ) : (
          <>
            {resume.summary && (
              <div className="bg-white rounded-2xl border p-6 mb-4">
                <h3 className="font-semibold text-lg mb-3">👤 О себе</h3>
                <p className="text-gray-600 leading-relaxed">{resume.summary}</p>
              </div>
            )}

            {resume.skills?.length > 0 && (
              <div className="bg-white rounded-2xl border p-6 mb-4">
                <h3 className="font-semibold text-lg mb-3">💻 Навыки</h3>
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map((skill: string, i: number) => (
                    <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {resume.languages?.length > 0 && (
              <div className="bg-white rounded-2xl border p-6 mb-4">
                <h3 className="font-semibold text-lg mb-3">🌐 Языки</h3>
                <div className="flex flex-wrap gap-2">
                  {resume.languages.map((lang: string, i: number) => (
                    <span key={i} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {resume.experience && (
              <div className="bg-white rounded-2xl border p-6 mb-4">
                <h3 className="font-semibold text-lg mb-3">💼 Опыт / Проекты</h3>
                <p className="text-gray-600 whitespace-pre-line">{resume.experience}</p>
              </div>
            )}

            {resume.education && (
              <div className="bg-white rounded-2xl border p-6 mb-4">
                <h3 className="font-semibold text-lg mb-3">🎓 Образование</h3>
                <p className="text-gray-600 whitespace-pre-line">{resume.education}</p>
              </div>
            )}

            {resume.certificates?.length > 0 && (
              <div className="bg-white rounded-2xl border p-6 mb-4">
                <h3 className="font-semibold text-lg mb-3">📜 Сертификаты</h3>
                <ul className="space-y-2">
                  {resume.certificates.map((cert: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-gray-600">
                      <span className="text-blue-500">✓</span> {cert}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {resume.achievements?.length > 0 && (
              <div className="bg-white rounded-2xl border p-6 mb-4">
                <h3 className="font-semibold text-lg mb-3">🏆 Достижения</h3>
                <ul className="space-y-2">
                  {resume.achievements.map((ach: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-gray-600">
                      <span className="text-yellow-500">★</span> {ach}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}