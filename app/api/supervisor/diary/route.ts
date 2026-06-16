import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'SUPERVISOR' && session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 })
    }

    // Получаем companyId супервизора
    const supervisorUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    let entries

    if (session.user.role === 'ADMIN' || !supervisorUser?.companyId) {
      // Админ или супервизор без компании — видит всех
      entries = await prisma.diaryEntry.findMany({
        include: {
          student: {
            select: {
              id: true,
              group: true,
              user: { select: { name: true, email: true } }
            }
          }
        },
        orderBy: { date: 'desc' },
      })
    } else {
      // Супервизор видит только студентов своей компании
      const companyStudents = await prisma.application.findMany({
        where: {
          companyId: supervisorUser.companyId,
          status: 'ACCEPTED',
        },
        select: { studentId: true }
      })

      const studentIds = companyStudents.map(a => a.studentId)

      entries = await prisma.diaryEntry.findMany({
        where: {
          studentId: { in: studentIds }
        },
        include: {
          student: { include: { user: true } }
        },
        orderBy: { date: 'desc' },
      })
    }

    return NextResponse.json(entries)
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}