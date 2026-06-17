import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from '@/components/SessionProvider'
import ThemeInit from '@/components/ThemeInit'

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
      <body>
        <SessionProvider>
          <ThemeInit />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
