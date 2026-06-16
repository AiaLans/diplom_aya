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

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Только JPG, PNG или WebP' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = file.type.split('/')[1]
    const fileName = `${session.user.id}/avatar.${ext}`

    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: urlData.publicUrl },
    })

    return NextResponse.json({ success: true, url: urlData.publicUrl })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Ошибка загрузки' }, { status: 500 })
  }
}