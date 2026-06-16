import { createHash, randomBytes, randomUUID } from 'crypto'

export type SignatureVerificationInput = {
  documentHash: string
  expectedDocumentHash: string
  signature: string
  keyId: string
  userId: string
  documentId: string
  documentVersion?: string
  signerName?: string
  signerRole?: string
}

export type SignatureVerificationResult = {
  ok: boolean
  error?: string
  provider: 'demo' | 'kripto'
  signatureId?: string
  verificationUrl?: string
  qrSvg?: string
  correlationId?: string
}

type KriptoErrorResponse = {
  error?: {
    code?: string
    message?: string
    details?: unknown
  }
}

type KriptoRegisterResponse = {
  signature_id?: string
  id?: string
  verification_url?: string
  qr_svg?: string
}

export function sha256Hex(buffer: Buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

export function createVerificationToken() {
  return randomBytes(24).toString('base64url')
}

export function getRequestOrigin(req: Request) {
  return process.env.NEXTAUTH_URL ?? new URL(req.url).origin
}

export async function fetchDocumentBuffer(url: string) {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`Не удалось скачать документ для проверки: ${res.status}`)
  }

  return Buffer.from(await res.arrayBuffer())
}

function getKriptoConfig() {
  return {
    baseUrl: process.env.KRIPTO_BASE_URL ?? 'https://kripto.aspc.kz/back',
    token: process.env.KRIPTO_API_TOKEN,
    serviceClient: process.env.KRIPTO_SERVICE_CLIENT ?? 'qadam',
    serviceAudience: process.env.KRIPTO_SERVICE_AUDIENCE ?? 'kripto',
  }
}

function kriptoHeaders(correlationId: string) {
  const config = getKriptoConfig()

  if (!config.token) {
    throw new Error('KRIPTO_API_TOKEN не настроен')
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.token}`,
    'X-Service-Client': config.serviceClient,
    'X-Service-Audience': config.serviceAudience,
    'X-Correlation-ID': correlationId,
  }
}

function normalizeKriptoError(status: number, body: KriptoErrorResponse | string) {
  if (typeof body === 'string') return `Kripto API вернул ${status}: ${body}`
  return body.error?.message ?? body.error?.code ?? `Kripto API вернул ${status}`
}

async function readKriptoBody(res: Response) {
  const text = await res.text()
  if (!text) return {}

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function isSha256Hex(value: string) {
  return /^[a-f0-9]{64}$/.test(value)
}

function isEd25519SignatureHex(value: string) {
  return /^[a-f0-9]{128}$/.test(value)
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export async function verifyDetachedSignature({
  documentHash,
  expectedDocumentHash,
  signature,
  keyId,
  userId,
  documentId,
  documentVersion = 'v1',
  signerName,
  signerRole,
}: SignatureVerificationInput): Promise<SignatureVerificationResult> {
  if (documentHash !== expectedDocumentHash) {
    return {
      ok: false,
      error: 'Хеш текущего файла не совпадает с хешем из запроса на подпись',
      provider: 'demo',
    }
  }

  if (!isSha256Hex(documentHash)) {
    return {
      ok: false,
      error: 'Хеш документа должен быть 64-символьным lowercase hex SHA-256',
      provider: 'demo',
    }
  }

  if (!isEd25519SignatureHex(signature)) {
    return {
      ok: false,
      error: 'Подпись должна быть 128-символьным lowercase hex Ed25519',
      provider: 'demo',
    }
  }

  if (!isUuid(keyId) || !isUuid(userId)) {
    return {
      ok: false,
      error: 'key_id и user_id должны быть UUID из Kripto',
      provider: 'demo',
    }
  }

  if (process.env.SIGNATURE_VERIFICATION_MODE === 'demo') {
    return { ok: true, provider: 'demo' }
  }

  const correlationId = randomUUID()
  const config = getKriptoConfig()

  try {
    const validateRes = await fetch(`${config.baseUrl}/integration/keys/validate`, {
      method: 'POST',
      headers: kriptoHeaders(correlationId),
      body: JSON.stringify({
        key_id: keyId,
        user_id: userId,
      }),
    })
    const validateBody = await readKriptoBody(validateRes)

    if (!validateRes.ok) {
      return {
        ok: false,
        error: normalizeKriptoError(validateRes.status, validateBody),
        provider: 'kripto',
        correlationId,
      }
    }

    const registerRes = await fetch(`${config.baseUrl}/integration/signatures/register`, {
      method: 'POST',
      headers: kriptoHeaders(correlationId),
      body: JSON.stringify({
        document_id: documentId,
        document_version: documentVersion,
        document_hash: documentHash,
        key_id: keyId,
        user_id: userId,
        signature,
        signer_name: signerName,
        signer_role: signerRole,
      }),
    })
    const registerBody = await readKriptoBody(registerRes) as KriptoRegisterResponse | KriptoErrorResponse | string

    if (!registerRes.ok) {
      return {
        ok: false,
        error: normalizeKriptoError(registerRes.status, registerBody as KriptoErrorResponse | string),
        provider: 'kripto',
        correlationId,
      }
    }

    if (typeof registerBody === 'string') {
      return {
        ok: false,
        error: 'Kripto API вернул неожиданный текстовый ответ',
        provider: 'kripto',
        correlationId,
      }
    }

    const signatureId = (registerBody as KriptoRegisterResponse).signature_id ?? (registerBody as KriptoRegisterResponse).id
    return {
      ok: true,
      provider: 'kripto',
      signatureId,
      verificationUrl: (registerBody as KriptoRegisterResponse).verification_url,
      qrSvg: (registerBody as KriptoRegisterResponse).qr_svg,
      correlationId,
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Ошибка соединения с Kripto API',
      provider: 'kripto',
      correlationId,
    }
  }
}
