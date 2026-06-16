import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDateAllowed } from '@/lib/practice'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    })

    if (!student) return NextResponse.json([])

    const entries = await prisma.diaryEntry.findMany({
      where: { studentId: student.id },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(entries)
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const { date, status, report, absenceReason } = await req.json()

    // Проверка периода практики
    if (!isDateAllowed(date)) {
      return NextResponse.json(
        { error: 'Эта дата не входит в период практики' },
        { status: 400 }
      )
    }

    let student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    })

    if (!student) {
      // Генерируем номер договора
      const count = await prisma.student.count()
      student = await prisma.student.create({
        data: {
          userId: session.user.id,
          contractNumber: count + 1,
        },
      })
    }

    const existing = await prisma.diaryEntry.findFirst({
      where: {
        studentId: student.id,
        date: {
          gte: new Date(date + 'T00:00:00.000Z'),
          lte: new Date(date + 'T23:59:59.999Z'),
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Запись за этот день уже существует' },
        { status: 400 }
      )
    }

    const entry = await prisma.diaryEntry.create({
      data: {
        studentId: student.id,
        date: new Date(date),
        status,
        report,
        absenceReason,
      },
    })

    return NextResponse.json(entry)
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}