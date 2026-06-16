import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const allowedRoles = ['COMPANY', 'SUPERVISOR', 'ADMIN', 'SUPER_ADMIN']
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 })
    }

    if (!file.name.endsWith('.pdf')) {
      return NextResponse.json({ error: 'Только PDF файлы' }, { status: 400 })
    }

    // Получаем companyId
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user?.companyId) {
      return NextResponse.json({ error: 'Компания не найдена' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `memorandums/${user.companyId}_${Date.now()}.pdf`

    const { error } = await supabase.storage
      .from('documents')
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName)

    await prisma.memorandum.create({
      data: {
        companyId: user.companyId,
        url: urlData.publicUrl,
        uploadedById: session.user.id,
      }
    })

    return NextResponse.json({ success: true, url: urlData.publicUrl })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Ошибка загрузки' }, { status: 500 })
  }
}