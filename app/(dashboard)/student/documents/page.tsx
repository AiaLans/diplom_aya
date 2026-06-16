import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DocumentsClient from './DocumentsClient'

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions)

  const student = await prisma.student.findUnique({
    where: { userId: session?.user?.id },
    include: {
      user: true,
      applications: {
        where: { status: 'ACCEPTED' },
        include: { company: true, internship: true }
      }
    }
  })

  const documents = await prisma.document.findMany({
    where: { userId: session?.user?.id ?? '' },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <DocumentsClient
      student={student}
      documents={documents}
    />
  )
}