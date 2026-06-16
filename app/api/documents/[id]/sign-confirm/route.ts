import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  fetchDocumentBuffer,
  sha256Hex,
  verifyDetachedSignature,
} from '@/lib/document-signing'

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
    const {
      signature,
      keyId,
      userId,
      signerName,
      signerRole,
      documentVersion,
    } = await req.json()

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

    const verification = await verifyDetachedSignature({
      documentHash: currentHash,
      expectedDocumentHash: document.documentHash,
      signature: String(signature ?? ''),
      keyId: String(keyId ?? ''),
      userId: String(userId ?? ''),
      documentId: document.id,
      documentVersion: documentVersion ? String(documentVersion) : document.docType ?? 'v1',
      signerName: signerName ? String(signerName) : session.user.name ?? session.user.email ?? undefined,
      signerRole: signerRole ? String(signerRole) : session.user.role ?? undefined,
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
        { error: verification.error ?? 'Подпись не прошла проверку' },
        { status: 400 }
      )
    }

    const signedAt = new Date()
    await prisma.document.update({
      where: { id },
      data: {
        signed: true,
        signedAt,
        signedById: session.user.id,
        certThumbprint: String(keyId),
        certSubject: signerName ? String(signerName) : session.user.name ?? null,
        signature: String(signature),
        documentHash: currentHash,
        signatureStatus: 'SIGNED',
        signatureError: null,
        status: 'APPROVED',
      },
    })

    await prisma.$executeRaw`
      UPDATE "Document"
      SET
        "kriptoUserId" = ${String(userId)},
        "kriptoKeyId" = ${String(keyId)},
        "kriptoSignatureId" = ${verification.signatureId ?? null},
        "kriptoVerificationUrl" = ${verification.verificationUrl ?? null},
        "kriptoQrSvg" = ${verification.qrSvg ?? null}
      WHERE "id" = ${id}
    `

    return NextResponse.json({
      success: true,
      signed_at: signedAt.toISOString(),
      document_hash: currentHash,
      verification_provider: verification.provider,
      verification_url: verification.verificationUrl,
      signature_id: verification.signatureId,
      correlation_id: verification.correlationId,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Ошибка подтверждения подписи' }, { status: 500 })
  }
}
