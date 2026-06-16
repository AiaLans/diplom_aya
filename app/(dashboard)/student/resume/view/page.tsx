import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ResumeViewClient from './ResumeViewClient'

export default async function ResumeViewPage() {
  const session = await getServerSession(authOptions)

  const student = await prisma.student.findUnique({
    where: { userId: session?.user?.id },
    include: {
      user: true,
      resume: true,
    }
  })

  return <ResumeViewClient student={student} resume={student?.resume ?? null} />
}