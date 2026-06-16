import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Компании у которых ОСТАВЛЯЕМ зарплату
const keepSalary = ['Google', 'Microsoft', 'Samsung R&D Kazakhstan', 'Amazon', 'EPAM Systems']

// Убираем зарплату у всех остальных
const updated = await prisma.internship.updateMany({
  where: {
    company: {
      name: {
        notIn: keepSalary
      }
    },
  },
  data: {
    salary: null
  }
})

console.log(`✅ Зарплата убрана у ${updated.count} вакансий`)
await prisma.$disconnect()