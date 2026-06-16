import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const { id } = await params

    const doc = await prisma.document.findUnique({
      where: { id },
    })

    if (!doc || doc.userId !== session.user.id) {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 })
    }

    // Удаляем из Supabase Storage
    const fileName = doc.url.split('/documents/')[1]
    if (fileName) {
      await supabase.storage.from('documents').remove([fileName])
    }

    // Удаляем из базы данных
    await prisma.document.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}