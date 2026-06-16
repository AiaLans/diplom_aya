import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const internship = await prisma.internship.findUnique({
      where: { id },
      include: { company: true },
    })

    if (!internship) {
      return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
    }

    return NextResponse.json(internship)
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
