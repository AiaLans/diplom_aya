import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  fetchDocumentBuffer,
  sha256Hex,
  verifyDetachedSignature,
} from '@/lib/document-signing'
import { addKriptoQrToPdf } from '@/lib/pdf-qr-stamp'
import { signHashWithKriptoContainer } from '@/lib/kripto-container'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 })
    }

    const { id } = await params
    const formData = await req.formData()
    const kriptoFile = formData.get('kriptoFile')
    const password = String(formData.get('password') ?? '')
    const signerName = String(formData.get('signerName') ?? '')
    const documentVersion = String(formData.get('documentVersion') ?? '')

    if (!(kriptoFile instanceof File)) {
      return NextResponse.json({ error: 'Выберите .kripto файл' }, { status: 400 })
    }

    const document = await prisma.document.findUnique({
      where: { id },
      include: { user: true },
    })
    if (!document) {
      return NextResponse.json({ error: 'Документ не найден' }, { status: 404 })
    }

    if (!document.documentHash) {
      return NextResponse.json({ error: 'Сначала создайте запрос на подпись' }, { status: 400 })
    }

    const buffer = await fetchDocumentBuffer(document.url)
    const currentHash = sha256Hex(buffer)
    const containerSignature = await signHashWithKriptoContainer({
      file: kriptoFile,
      password,
      documentHash: currentHash,
    })

    const verification = await verifyDetachedSignature({
      documentHash: currentHash,
      expectedDocumentHash: document.documentHash,
      signature: containerSignature.signature,
      keyId: containerSignature.keyId,
      userId: containerSignature.userId,
      documentId: document.id,
      documentVersion: documentVersion || 'v1',
      signerName: signerName || session.user.name || session.user.email || undefined,
      signerRole: session.user.role,
    })

    if (!verification.ok) {
      await prisma.document.update({
        where: { id },
        data: {
          signed: false,
          signatureStatus: 'SIGN_FAILED',
          signatureError: verification.correlationId
            ? `${verification.error ?? 'Подпись не прошла проверку'} (X-Correlation-ID: ${verification.correlationId})`
            : verification.error ?? 'Подпись не прошла проверку',
        },
      })

      return NextResponse.json(
        {
          error: verification.error ?? 'Подпись не прошла проверку',
          correlation_id: verification.correlationId,
          provider: verification.provider,
        },
        { status: 400 }
      )
    }

    const signedAt = new Date()
    const kriptoVerificationUrl = verification.signatureId
      ? `https://kripto.aspc.kz/verify-signature/${verification.signatureId}`
      : verification.verificationUrl
    let stampedPdfUrl: string | null = null
    let stampError: string | null = null

    if (kriptoVerificationUrl) {
      try {
        stampedPdfUrl = await addKriptoQrToPdf({
          sourceUrl: document.url,
          documentId: document.id,
          verificationUrl: kriptoVerificationUrl,
        })
      } catch (error) {
        stampError = error instanceof Error ? error.message : 'Не удалось добавить QR в PDF'
      }
    }

    await prisma.document.update({
      where: { id },
      data: {
        url: stampedPdfUrl ?? document.url,
        signed: true,
        signedAt,
        signedById: session.user.id,
        certThumbprint: containerSignature.keyId,
        certSubject: signerName || session.user.name || null,
        signature: containerSignature.signature,
        documentHash: currentHash,
        signatureStatus: 'SIGNED',
        signatureError: stampError,
        status: 'APPROVED',
      },
    })

    await prisma.$executeRaw`
      UPDATE "Document"
      SET
        "kriptoUserId" = ${containerSignature.userId},
        "kriptoKeyId" = ${containerSignature.keyId},
        "kriptoSignatureId" = ${verification.signatureId ?? null},
        "kriptoVerificationUrl" = ${kriptoVerificationUrl ?? null},
        "kriptoQrSvg" = ${verification.qrSvg ?? null}
      WHERE "id" = ${id}
    `

    return NextResponse.json({
      success: true,
      signed_at: signedAt.toISOString(),
      document_hash: currentHash,
      verification_provider: verification.provider,
      verification_url: kriptoVerificationUrl,
      signature_id: verification.signatureId,
      stamped_pdf_url: stampedPdfUrl,
      stamp_error: stampError,
      correlation_id: verification.correlationId,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Ошибка подтверждения подписи' }, { status: 500 })
  }
}
