import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import YandexProvider from 'next-auth/providers/yandex'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    YandexProvider({
      clientId: process.env.YANDEX_CLIENT_ID!,
      clientSecret: process.env.YANDEX_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' || account?.provider === 'github' || account?.provider === 'yandex') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { student: true }
        })

        if (!existingUser) {
          // Новый пользователь — создаём с номером договора
          const newUser = await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
              role: 'STUDENT',
            },
          })

          const contractNumber = await prisma.student.count() + 1
          await prisma.student.create({
            data: {
              userId: newUser.id,
              contractNumber,
            }
          })
        } else if (!existingUser.student) {
          // Пользователь есть но студента нет — создаём
          const contractNumber = await prisma.student.count() + 1
          await prisma.student.create({
            data: {
              userId: existingUser.id,
              contractNumber,
            }
          })
        } else if (!existingUser.student.contractNumber) {
          // Студент есть но номера нет — присваиваем
          const contractNumber = await prisma.student.count() + 1
          await prisma.student.update({
            where: { userId: existingUser.id },
            data: { contractNumber }
          })
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        
        // Проверяем существует ли пользователь в базе
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { name: true, image: true, role: true, mustChangePassword: true }
        })

        // Если пользователь удалён — возвращаем пустую сессию
        if (!dbUser) {
          return { ...session, user: undefined, expires: '0' }
        }

        session.user.id = token.sub
        session.user.role = dbUser.role as string

        if (dbUser.name) {
          session.user.name = dbUser.name
        }
        if (dbUser.image) {
          session.user.image = dbUser.image
        }
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role
        token.mustChangePassword = (user as any).mustChangePassword
      }
      if (account?.provider === 'google' || account?.provider === 'github' || account?.provider === 'yandex') {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
        })
        if (dbUser) {
          token.sub = dbUser.id
          token.role = dbUser.role
          token.mustChangePassword = dbUser.mustChangePassword
        }
      }
      return token
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
}