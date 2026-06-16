import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ hasPassword: false })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true }
    })

    return NextResponse.json({ hasPassword: !!user?.password })
  } catch (error) {
    return NextResponse.json({ hasPassword: false })
  }
}