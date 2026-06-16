import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/SessionProvider'
import ThemeInit from '@/components/ThemeInit'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Qadam — Платформа стажировок',
  description: 'Управление стажировками для студентов Алматинского политехникалық колледжі',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={geist.className}>
        <SessionProvider>
          <ThemeInit />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}