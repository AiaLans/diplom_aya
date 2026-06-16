import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: { resume: true }
    })

    return NextResponse.json(student?.resume ?? null)
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

    const data = await req.json()

    let student = await prisma.student.findUnique({
      where: { userId: session.user.id }
    })

    if (!student) {
      const contractNumber = await prisma.student.count() + 1
      student = await prisma.student.create({
        data: { userId: session.user.id, contractNumber }
      })
    }

    const resume = await prisma.resume.upsert({
      where: { studentId: student.id },
      update: data,
      create: { studentId: student.id, ...data }
    })

    return NextResponse.json(resume)
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}