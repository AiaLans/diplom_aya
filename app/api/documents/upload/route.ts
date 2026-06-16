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
    const docType = (formData.get('docType') as string) ?? 'CONTRACT'

    if (!file) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 })
    }

    if (!file.name.endsWith('.pdf')) {
      return NextResponse.json({ error: 'Только PDF файлы' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `${session.user.id}/${docType}_${Date.now()}.pdf`

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

    const docTypeLabels: Record<string, string> = {
      CONTRACT: 'Договор практики',
      ATTENDANCE: 'Лист учёта посещаемости',
      PRESENTATION: 'Презентация',
      CHARACTERISTIC: 'Характеристика',
    }

    await prisma.document.create({
      data: {
        userId: session.user.id,
        name: docTypeLabels[docType] ?? file.name,
        url: urlData.publicUrl,
        signed: true,
        docType: docType,
        status: 'PENDING',
      }
    })

    return NextResponse.json({ success: true, url: urlData.publicUrl })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Ошибка загрузки' }, { status: 500 })
  }
}