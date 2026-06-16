import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import StudentClient from './StudentClient'

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: {
      applications: {
        include: { company: true, internship: true }
      }
    }
  })

  const diaryCount = await prisma.diaryEntry.count({
    where: { studentId: student?.id }
  })

  const presentCount = await prisma.diaryEntry.count({
    where: { studentId: student?.id, status: 'PRESENT' }
  })

  const attendance = diaryCount > 0
    ? Math.round((presentCount / diaryCount) * 100)
    : 0

  return (
    <StudentClient
      name={session.user.name ?? ''}
      attendance={attendance}
      diaryCount={diaryCount}
      applicationsCount={student?.applications?.length ?? 0}
      applications={student?.applications ?? []}
    />
  )
}