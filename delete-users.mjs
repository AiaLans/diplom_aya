import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Укажи email пользователей которых хочешь удалить
  const emailsToDelete = [
    'aiaulimfaizullaeva@gmail.com'
  ]

  for (const email of emailsToDelete) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { student: true }
    })

    if (!user) {
      console.log(`Не найден: ${email}`)
      continue
    }

    // Удаляем связанные записи студента
    if (user.student) {
      await prisma.diaryEntry.deleteMany({ where: { studentId: user.student.id } })
      await prisma.application.deleteMany({ where: { studentId: user.student.id } })
      await prisma.review.deleteMany({ where: { studentId: user.student.id } })
      await prisma.student.delete({ where: { id: user.student.id } })
    }

    await prisma.account.deleteMany({ where: { userId: user.id } })
    await prisma.document.deleteMany({ where: { userId: user.id } })
    await prisma.chatHistory.deleteMany({ where: { userId: user.id } })
    await prisma.user.delete({ where: { id: user.id } })

    console.log(`Удалён: ${email}`)
  }

  await prisma.$disconnect()
}

main()