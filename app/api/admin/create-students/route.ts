import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

function generatePassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let password = ''
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 })
    }

    const { students } = await req.json()
    const results = []

    for (const student of students) {
      try {
        const existing = await prisma.user.findUnique({
          where: { email: student.email }
        })

        if (existing) {
          results.push({
            name: student.name,
            email: student.email,
            password: '',
            contractNumber: 0,
            status: 'error',
            error: 'Уже существует'
          })
          continue
        }

        const password = generatePassword()
        const hashed = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
          data: {
            name: student.name,
            email: student.email,
            password: hashed,
            role: 'STUDENT',
          }
        })

        const contractNumber = await prisma.student.count() + 1
        await prisma.student.create({
          data: {
            userId: user.id,
            contractNumber,
            group: student.group ?? null,
          }
        })

        results.push({
          name: student.name,
          email: student.email,
          password,
          contractNumber,
          status: 'success',
        })

      } catch (err) {
        results.push({
          name: student.name,
          email: student.email,
          password: '',
          contractNumber: 0,
          status: 'error',
          error: 'Ошибка создания'
        })
      }
    }

    return NextResponse.json({ results })
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}