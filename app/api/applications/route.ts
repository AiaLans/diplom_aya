import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const { internshipId } = await req.json()

    let student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    })

    if (!student) {
      student = await prisma.student.create({
        data: { userId: session.user.id },
      })
    }

    const internship = await prisma.internship.findUnique({
      where: { id: internshipId },
    })

    if (!internship) {
      return NextResponse.json({ error: 'Стажировка не найдена' }, { status: 404 })
    }

    const existing = await prisma.application.findFirst({
      where: {
        studentId: student.id,
        internshipId,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ты уже подал заявку на эту стажировку' },
        { status: 400 }
      )
    }

    const application = await prisma.application.create({
      data: {
        studentId: student.id,
        companyId: internship.companyId,
        internshipId,
        status: 'PENDING_CURATOR',
      },
    })

    return NextResponse.json(application)
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}