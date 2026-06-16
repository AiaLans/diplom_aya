import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 })
    }

    const { id } = await params

    const student = await prisma.student.findUnique({ where: { userId: id } })
    if (student) {
      await prisma.resume.deleteMany({ where: { studentId: student.id } })
      await prisma.diaryEntry.deleteMany({ where: { studentId: student.id } })
      await prisma.application.deleteMany({ where: { studentId: student.id } })
      await prisma.review.deleteMany({ where: { studentId: student.id } })
      await prisma.student.delete({ where: { id: student.id } })
    }

    await prisma.account.deleteMany({ where: { userId: id } })
    await prisma.chatHistory.deleteMany({ where: { userId: id } })
    await prisma.document.deleteMany({ where: { userId: id } })

    // Удаляем сессии пользователя
    await prisma.session.deleteMany({ where: { userId: id } }).catch(() => {})

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}