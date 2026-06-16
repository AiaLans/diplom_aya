import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'SUPER_ADMIN' && session?.user?.role !== 'ADMIN') {
      return NextResponse.json([], { status: 403 })
    }

    const companies = await prisma.company.findMany({
      where: { approved: true },
      select: { id: true, name: true }
    })

    return NextResponse.json(companies)
  } catch (error) {
    return NextResponse.json([], { status: 500 })
  }
}