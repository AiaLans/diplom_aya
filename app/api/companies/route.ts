import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const companies = await prisma.company.findMany({
    where: { approved: true },
    include: {
      internships: {
        select: { id: true, title: true, salary: true }
      }
    }
  })

  return NextResponse.json(companies)
}