import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'SUPER_ADMIN' && session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 })
    }

    const { name, description, founded, requirements, salary, address, phone, email, bin, position, bank } = await req.json()

    const company = await prisma.company.create({
      data: {
        name,
        description,
        founded,
        requirements,
        salary,
        address,
        phone,
        email,
        bin,
        position,
        bank,
        approved: true,
      }
    })

    return NextResponse.json({ success: true, companyId: company.id })
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}