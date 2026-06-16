import QRCode from 'qrcode'
import { prisma } from '@/lib/prisma'

type VerifyPageProps = {
  params: Promise<{ token: string }>
}

type VerifyDocument = {
  id: string
  name: string
  url: string
  signed: boolean
  signatureStatus: string
  signedAt: Date | null
  certThumbprint: string | null
  certSubject: string | null
  documentHash: string | null
  signatureError: string | null
  kriptoKeyId: string | null
  kriptoSignatureId: string | null
  kriptoVerificationUrl: string | null
  kriptoQrSvg: string | null
  ownerName: string | null
  ownerEmail: string
  signedByName: string | null
  signedByEmail: string | null
}

function formatDate(date: Date | null) {
  if (!date) return '—'
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { token } = await params
  const documents = await prisma.$queryRaw<VerifyDocument[]>`
    SELECT
      d."id",
      d."name",
      d."url",
      d."signed",
      d."signatureStatus",
      d."signedAt",
      d."certThumbprint",
      d."certSubject",
      d."documentHash",
      d."signatureError",
      d."kriptoKeyId",
      d."kriptoSignatureId",
      d."kriptoVerificationUrl",
      d."kriptoQrSvg",
      owner."name" AS "ownerName",
      owner."email" AS "ownerEmail",
      signer."name" AS "signedByName",
      signer."email" AS "signedByEmail"
    FROM "Document" d
    JOIN "User" owner ON owner."id" = d."userId"
    LEFT JOIN "User" signer ON signer."id" = d."signedById"
    WHERE d."verificationToken" = ${token}
    LIMIT 1
  `
  const document = documents[0] ?? null

  const localVerificationUrl = `${process.env.NEXTAUTH_URL ?? ''}/verify/${token}`
  const qrTargetUrl = document?.kriptoVerificationUrl ?? localVerificationUrl
  const qrDataUrl = document?.kriptoQrSvg
    ? `data:image/svg+xml;base64,${Buffer.from(document.kriptoQrSvg).toString('base64')}`
    : await QRCode.toDataURL(qrTargetUrl, {
    width: 180,
    margin: 1,
    errorCorrectionLevel: 'M',
  })

  if (!document) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <section className="w-full max-w-lg bg-white border rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">!</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Документ не найден</h1>
          <p className="text-gray-500 text-sm">Ссылка проверки недействительна или документ был удалён.</p>
        </section>
      </main>
    )
  }

  const isSigned = document.signatureStatus === 'SIGNED' && document.signed

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-4">
        <h1 className="text-xl font-bold text-blue-600">Qadam — проверка документа</h1>
      </div>

      <section className="max-w-3xl mx-auto p-8">
        <div className="bg-white border rounded-2xl p-8">
          <div className="flex flex-col md:flex-row md:items-start gap-8">
            <div className="shrink-0">
              <img src={qrDataUrl} alt="QR проверки документа" className="w-[180px] h-[180px]" />
            </div>

            <div className="flex-1">
              <span className={`inline-flex text-xs px-3 py-1 rounded-full font-medium mb-4 ${
                isSigned
                  ? 'bg-green-100 text-green-700'
                  : document.signatureStatus === 'SIGN_FAILED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
              }`}>
                {isSigned ? 'Подпись подтверждена' : document.signatureStatus === 'SIGN_FAILED' ? 'Проверка не пройдена' : 'Ожидает подписи'}
              </span>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">{document.name}</h2>
              <p className="text-sm text-gray-500 mb-6">
                Владелец документа: {document.ownerName ?? document.ownerEmail}
              </p>

              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded-xl p-4">
                  <dt className="text-gray-400 mb-1">Дата подписи</dt>
                  <dd className="font-medium text-gray-900">{formatDate(document.signedAt)}</dd>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <dt className="text-gray-400 mb-1">Подписал</dt>
                  <dd className="font-medium text-gray-900">{document.signedByName ?? document.signedByEmail ?? '—'}</dd>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                  <dt className="text-gray-400 mb-1">Подписант</dt>
                  <dd className="font-medium text-gray-900 break-all">{document.certSubject ?? '—'}</dd>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                  <dt className="text-gray-400 mb-1">Kripto key_id</dt>
                  <dd className="font-mono text-xs text-gray-900 break-all">{document.kriptoKeyId ?? document.certThumbprint ?? '—'}</dd>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                  <dt className="text-gray-400 mb-1">Kripto signature_id</dt>
                  <dd className="font-mono text-xs text-gray-900 break-all">{document.kriptoSignatureId ?? '—'}</dd>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                  <dt className="text-gray-400 mb-1">SHA-256 документа</dt>
                  <dd className="font-mono text-xs text-gray-900 break-all">{document.documentHash ?? '—'}</dd>
                </div>
              </dl>

              {document.signatureError && (
                <p className="mt-4 text-sm text-red-600">{document.signatureError}</p>
              )}

              <div className="mt-6 flex gap-3">
                <a
                  href={document.url}
                  target="_blank"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Открыть PDF
                </a>
                {document.kriptoVerificationUrl && (
                  <a
                    href={document.kriptoVerificationUrl}
                    target="_blank"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    Проверка Kripto
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
