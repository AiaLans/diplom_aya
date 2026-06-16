import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ChecklistClient from './ChecklistClient'

export default async function ChecklistPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: { diaryEntries: true }
  })

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  })

  const diaryCount = student?.diaryEntries.length ?? 0

  return (
    <ChecklistClient
      diaryCount={diaryCount}
      documents={documents}
    />
  )
}