import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  createVerificationToken,
  fetchDocumentBuffer,
  getRequestOrigin,
  sha256Hex,
} from '@/lib/document-signing'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 })
    }

    const { id } = await params
    const document = await prisma.document.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!document) {
      return NextResponse.json({ error: 'Документ не найден' }, { status: 404 })
    }

    if (document.status === 'REJECTED') {
      return NextResponse.json({ error: 'Отклонённый документ нельзя подписать' }, { status: 400 })
    }

    const buffer = await fetchDocumentBuffer(document.url)
    const documentHash = sha256Hex(buffer)
    const verificationToken = document.verificationToken ?? createVerificationToken()
    const origin = getRequestOrigin(req)
    const verificationUrl = `${origin}/verify/${verificationToken}`

    await prisma.document.update({
      where: { id },
      data: {
        documentHash,
        verificationToken,
        signatureStatus: 'SIGN_REQUESTED',
        signRequestedAt: new Date(),
        signatureError: null,
      },
    })

    return NextResponse.json({
      document_id: document.id,
      sign_request_id: document.id,
      document_hash: documentHash,
      verification_url: verificationUrl,
      student: {
        name: document.user.name,
        email: document.user.email,
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Ошибка создания запроса на подпись' }, { status: 500 })
  }
}
