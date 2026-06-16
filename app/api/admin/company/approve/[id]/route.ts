import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 })
    }

    const { id } = await params
    const { email, name } = await req.json()

    // Одобряем компанию
    await prisma.company.update({
      where: { id },
      data: {
        approved: true,
        approvedAt: new Date(),
        approvedById: session.user.id,
      }
    })

    // Генерируем пароль
    const password = Math.random().toString(36).slice(-8) + 'A1!'
    const hashedPassword = await bcrypt.hash(password, 10)

    // Создаём аккаунт компании
    const companyUser = await prisma.user.upsert({
      where: { email },
      update: { password: hashedPassword, role: 'COMPANY' },
      create: {
        email,
        name,
        password: hashedPassword,
        role: 'COMPANY',
        mustChangePassword: true,
      }
    })

    await prisma.user.update({
      where: { email },
      data: { companyId: id }
    })

    // Создаём супервизора привязанного к компании
    const supervisorPassword = Math.random().toString(36).slice(-8) + 'S1!'
    const hashedSupervisor = await bcrypt.hash(supervisorPassword, 10)
    const supervisorEmail = `supervisor.${email}`

    await prisma.user.upsert({
      where: { email: supervisorEmail },
      update: {},
      create: {
        email: supervisorEmail,
        name: `Супервизор — ${name}`,
        password: hashedSupervisor,
        role: 'SUPERVISOR',
        companyId: id,
      }
    })

    // Отправляем данные на email компании
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: `"Qadam Platform" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Добро пожаловать на платформу Qadam!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Ваша компания подтверждена!</h2>
          <p>Здравствуйте, <b>${name}</b>!</p>
          <p>Ваша компания была проверена и одобрена администратором платформы Qadam.</p>

          <h3>Данные для входа — Компания:</h3>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <p><b>Сайт:</b> <a href="http://localhost:3000">localhost:3000</a></p>
            <p><b>Email:</b> ${email}</p>
            <p><b>Пароль:</b> ${password}</p>
            <p><b>Роль:</b> Компания</p>
          </div>

          <h3>Данные для входа — Супервизор:</h3>
          <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <p><b>Сайт:</b> <a href="http://localhost:3000">localhost:3000</a></p>
            <p><b>Email:</b> ${supervisorEmail}</p>
            <p><b>Пароль:</b> ${supervisorPassword}</p>
            <p><b>Роль:</b> Супервизор (подтверждение дневника студентов)</p>
          </div>

          <p style="color: #ef4444;">Пожалуйста, смените пароли после первого входа.</p>
          <p style="color: #6b7280; font-size: 12px;">
            Супервизор — это сотрудник вашей компании который будет подтверждать
            ежедневные записи студентов в дневнике практики.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}