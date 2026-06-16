import { pbkdf2Sync, createDecipheriv } from 'crypto'
import * as ed25519 from '@noble/ed25519'

type KriptoContainer = Record<string, unknown>

type ParsedKriptoContainer = {
  keyId: string
  userId: string
  signature: string
}

function bytesToHex(bytes: Uint8Array) {
  return Buffer.from(bytes).toString('hex')
}

function hexToBytes(value: string) {
  return Uint8Array.from(Buffer.from(value, 'hex'))
}

function normalizeHex(value: string) {
  return value.trim().toLowerCase().replace(/^0x/, '')
}

function getString(container: KriptoContainer, keys: string[]) {
  for (const key of keys) {
    const value = container[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }

  return ''
}

function readJsonContainer(buffer: Buffer) {
  try {
    return JSON.parse(buffer.toString('utf8')) as KriptoContainer
  } catch {
    throw new Error('.kripto файл должен быть JSON контейнером ключа')
  }
}

function decodeMaybeHexOrBase64(value: string) {
  const normalized = normalizeHex(value)
  if (/^[a-f0-9]+$/.test(normalized) && normalized.length % 2 === 0) {
    return Buffer.from(normalized, 'hex')
  }

  return Buffer.from(value, 'base64')
}

function decryptPrivateKey(container: KriptoContainer, password: string) {
  const encrypted = getString(container, ['encrypted_private_key', 'encryptedPrivateKey', 'ciphertext', 'encrypted'])
  if (!encrypted) return ''

  if (!password) {
    throw new Error('Для этого .kripto файла нужен пароль')
  }

  const salt = decodeMaybeHexOrBase64(getString(container, ['salt']))
  const iv = decodeMaybeHexOrBase64(getString(container, ['iv', 'nonce']))
  const authTag = decodeMaybeHexOrBase64(getString(container, ['tag', 'authTag', 'auth_tag']))
  const iterations = Number(container.iterations ?? container.pbkdf2Iterations ?? 100000)

  if (!salt.length || !iv.length || !authTag.length) {
    throw new Error('Зашифрованный .kripto файл должен содержать salt, iv/nonce и tag/authTag')
  }

  const key = pbkdf2Sync(password, salt, iterations, 32, 'sha256')
  const decipher = createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([
    decipher.update(decodeMaybeHexOrBase64(encrypted)),
    decipher.final(),
  ])

  return decrypted.toString('utf8').trim()
}

function getPrivateKey(container: KriptoContainer, password: string) {
  const plain = getString(container, [
    'private_key',
    'privateKey',
    'secret_key',
    'secretKey',
    'seed',
    'private_key_hex',
    'privateKeyHex',
  ])

  return plain || decryptPrivateKey(container, password)
}

export async function signHashWithKriptoContainer({
  file,
  password,
  documentHash,
}: {
  file: File
  password: string
  documentHash: string
}): Promise<ParsedKriptoContainer> {
  if (!file.name.toLowerCase().endsWith('.kripto')) {
    throw new Error('Выберите файл с расширением .kripto')
  }

  const container = readJsonContainer(Buffer.from(await file.arrayBuffer()))
  const keyId = getString(container, ['key_id', 'keyId', 'public_key_id', 'publicKeyId'])
  const userId = getString(container, ['user_id', 'userId', 'owner_id', 'ownerId'])

  if (!keyId || !userId) {
    throw new Error('.kripto файл должен содержать key_id и user_id')
  }

  const existingSignature = normalizeHex(getString(container, ['signature']))
  if (/^[a-f0-9]{128}$/.test(existingSignature)) {
    return { keyId, userId, signature: existingSignature }
  }

  const privateKey = getPrivateKey(container, password)
  if (!privateKey) {
    throw new Error('.kripto файл должен содержать private_key или encrypted_private_key')
  }

  const documentHashBytes = hexToBytes(documentHash)
  const privateKeyBytes = decodeMaybeHexOrBase64(privateKey)
  const signature = await ed25519.signAsync(documentHashBytes, privateKeyBytes)

  return {
    keyId,
    userId,
    signature: bytesToHex(signature),
  }
}
