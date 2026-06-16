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

    const { name, address, phone, email, bin, position, bank, description } = await req.json()

    if (!name || !address || !phone || !email || !bin || !position || !bank) {
      return NextResponse.json({ error: 'Заполните все обязательные поля' }, { status: 400 })
    }

    // Проверка дубликата по БИН
    const existing = await prisma.company.findFirst({
      where: { bin }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Компания с таким БИН уже существует в системе' },
        { status: 400 }
      )
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id }
    })

    const company = await prisma.company.create({
      data: {
        name,
        address,
        phone,
        email,
        bin,
        position,
        bank,
        description,
        approved: false,
        addedByStudentId: student?.id ?? null,
      }
    })

    // Автоматически создаём вакансию из должности студента
    await prisma.internship.create({
      data: {
        companyId: company.id,
        title: position,
        description: `Стажировка на позицию: ${position}`,
      }
    })

    // Уведомляем админа по email
    if (process.env.GMAIL_USER) {
      const nodemailer = require('nodemailer')
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      })

      await transporter.sendMail({
        from: `"Qadam" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER,
        subject: `Новая компания на проверку: ${name}`,
        html: `
          <h2>Студент добавил новую компанию</h2>
          <p><b>Название:</b> ${name}</p>
          <p><b>БИН:</b> ${bin}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Адрес:</b> ${address}</p>
          <p><b>Телефон:</b> ${phone}</p>
          <p>Проверьте и подтвердите в панели администратора.</p>
        `,
      })
    }

    return NextResponse.json({ success: true, companyId: company.id })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}