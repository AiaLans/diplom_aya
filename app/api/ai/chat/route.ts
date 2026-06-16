import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const { message, history } = await req.json()

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    })

    // Получаем все компании из базы
    const companies = await prisma.company.findMany({
      where: { approved: true },
      include: { internships: true }
    })

    const companiesList = companies.map(c =>
      `- ${c.name}${c.description ? ': ' + c.description : ''}${c.requirements ? ' | Требования: ' + c.requirements : ''}${c.salary ? ' | Зарплата: ' + c.salary : ''}`
    ).join('\n')

    const systemPrompt = `Ты AI помощник платформы Qadam — системы управления стажировками для студентов Алматинского политехнического колледжа (Казахстан).

Информация о студенте:
- Имя: ${session.user.name ?? 'Не указано'}
- Группа: ${student?.group ?? 'Не указана'}
- Навыки: ${student?.skills?.join(', ') ?? 'Не указаны'}

Компании доступные на платформе Qadam:
${companiesList}

Ты помогаешь студентам с:
- Карьерными советами и выбором стажировки
- Составлением рейтинга компаний из списка выше
- Улучшением резюме
- Написанием отчётов для дневника
- Советами по профессиональному развитию

Когда тебя просят составить рейтинг компаний — используй ТОЛЬКО компании из списка выше.
Отвечай на том языке на котором пишет студент (казахский, русский или английский).
Будь дружелюбным, конкретным и полезным.`

    const messages = [
      ...history,
      { role: 'user' as const, content: message }
    ]

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 1000,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    })

    const reply = response.choices[0]?.message?.content ?? 'Произошла ошибка'

    await prisma.chatHistory.create({
      data: {
        userId: session.user.id,
        role: 'user',
        content: message,
      },
    })

    await prisma.chatHistory.create({
      data: {
        userId: session.user.id,
        role: 'assistant',
        content: reply,
      },
    })

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}