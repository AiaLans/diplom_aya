import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Заполняем базу данными...')

  // Компании
  await prisma.company.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      name: 'Kaspi Bank',
      description: 'Крупнейший финтех Казахстана',
      founded: 2008,
      requirements: 'JavaScript, Python',
      salary: '150,000тг',
      approved: true,
    },
  })

  await prisma.company.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      name: 'Halyk Bank',
      description: 'Қазақстандағы ең ірі банктердің бірі',
      founded: 1923,
      requirements: 'Java, SQL, Backend development',
      salary: '180,000тг',
      approved: true,
    },
  })

  await prisma.company.upsert({
    where: { id: '3' },
    update: {},
    create: {
      id: '3',
      name: 'EPAM Systems',
      description: 'Global IT outsourcing and software engineering company',
      founded: 1993,
      requirements: 'JavaScript, React, Node.js',
      salary: '1200 USD',
      approved: true,
    },
  })

  await prisma.company.upsert({
    where: { id: '4' },
    update: {},
    create: {
      id: '4',
      name: 'Yandex',
      description: 'Крупная технологическая компания, разрабатывающая поисковые и AI-сервисы',
      founded: 1997,
      requirements: 'Python, C++, Machine Learning',
      salary: '250,000тг',
      approved: true,
    },
  })

  await prisma.company.upsert({
    where: { id: '5' },
    update: {},
    create: {
      id: '5',
      name: 'Kolesa Group',
      description: 'Қазақстандағы танымал IT-компания (Kolesa.kz, Krisha.kz)',
      founded: 2006,
      requirements: 'PHP, Laravel, JavaScript',
      salary: '200,000тг',
      approved: true,
    },
  })

  await prisma.company.upsert({
    where: { id: '6' },
    update: {},
    create: {
      id: '6',
      name: 'Amazon',
      description: 'One of the world\'s largest tech companies focused on e-commerce and cloud computing',
      founded: 1994,
      requirements: 'Java, AWS, Distributed Systems',
      salary: '3000 USD',
      approved: true,
    },
  })

  console.log('Компании созданы ✅')

  // Вакансии
  await prisma.internship.createMany({
    skipDuplicates: true,
    data: [
      { id: 'kaspi-1', companyId: '1', title: 'Backend разработчик', description: 'Разработка и поддержка серверной части финтех-приложений, работа с API и базами данных.' },
      { id: 'kaspi-2', companyId: '1', title: 'Frontend разработчик', description: 'Создание пользовательских интерфейсов, работа с React и интеграция с backend.' },
      { id: 'halyk-1', companyId: '2', title: 'Java әзірлеуші', description: 'Банк жүйелерін әзірлеу, жоғары жүктемелі сервистермен жұмыс істеу.' },
      { id: 'halyk-2', companyId: '2', title: 'Деректер базасының маманы', description: 'SQL сұраныстарын жазу, деректерді өңдеу және оңтайландыру.' },
      { id: 'epam-1', companyId: '3', title: 'Full Stack Developer', description: 'Developing modern web applications using frontend and backend technologies.' },
      { id: 'epam-2', companyId: '3', title: 'React Developer', description: 'Building dynamic user interfaces and integrating with APIs.' },
      { id: 'kolesa-1', companyId: '5', title: 'PHP әзірлеуші', description: 'Kolesa.kz және Krisha.kz платформалары үшін серверлік логиканы дамыту.' },
      { id: 'kolesa-2', companyId: '5', title: 'Frontend әзірлеуші', description: 'Пайдаланушы интерфейстерін жасау және UX/UI жақсарту.' },
      { id: 'yandex-1', companyId: '4', title: 'Machine Learning Engineer', description: 'Developing machine learning models and working with large-scale data.' },
      { id: 'yandex-2', companyId: '4', title: 'Python Developer', description: 'Building backend services and automating processes.' },
      { id: 'amazon-1', companyId: '6', title: 'Software Engineer', description: 'Designing scalable systems and working with distributed architectures.' },
      { id: 'amazon-2', companyId: '6', title: 'Cloud Engineer', description: 'Managing cloud infrastructure and deploying services on AWS.' },
    ],
  })

  console.log('Вакансии созданы ✅')

  // Тестовые пользователи
  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@qadam.kz' },
    update: {},
    create: {
      email: 'admin@qadam.kz',
      name: 'Администратор',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  const curatorPassword = await bcrypt.hash('curator123', 10)
  await prisma.user.upsert({
    where: { email: 'curator@qadam.kz' },
    update: {},
    create: {
      email: 'curator@qadam.kz',
      name: 'Куратор Группы',
      password: curatorPassword,
      role: 'CURATOR',
    },
  })
  
  const companyPassword = await bcrypt.hash('company123', 10)
  await prisma.user.upsert({
    where: { email: 'company@qadam.kz' },
    update: {},
    create: {
      email: 'company@qadam.kz',
      name: 'Kaspi Bank',
      password: companyPassword,
      role: 'COMPANY',
    },
  })

  const supervisorPassword = await bcrypt.hash('supervisor123', 10)
  await prisma.user.upsert({
    where: { email: 'supervisor@qadam.kz' },
    update: {},
    create: {
      email: 'supervisor@qadam.kz',
      name: 'Супервизор',
      password: supervisorPassword,
      role: 'SUPERVISOR',
    },
  })

  console.log('Пользователи созданы ✅')
  console.log('База данных заполнена! 🎉')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })