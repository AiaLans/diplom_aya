'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type SignRequest = {
  document_id: string
  sign_request_id: string
  document_hash: string
  verification_url: string
}

export default function SignDocumentButton({
  id,
  signed,
  verificationToken,
  signerName: defaultSignerName,
  signerRole,
}: {
  id: string
  signed: boolean
  verificationToken?: string | null
  signerName?: string | null
  signerRole: 'ADMIN' | 'SUPER_ADMIN'
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [request, setRequest] = useState<SignRequest | null>(null)
  const [signature, setSignature] = useState('')
  const [keyId, setKeyId] = useState('')
  const [userId, setUserId] = useState('')
  const [signerName, setSignerName] = useState(defaultSignerName ?? '')
  const [error, setError] = useState('')

  async function createRequest() {
    setError('')
    setLoading(true)

    const res = await fetch(`/api/documents/${id}/sign-request`, { method: 'POST' })
    const data = await res.json()

    if (res.ok) {
      setRequest(data)
    } else {
      setError(data.error ?? 'Не удалось создать запрос на подпись')
    }

    setLoading(false)
  }

  async function confirmSignature() {
    setError('')
    setLoading(true)

    const res = await fetch(`/api/documents/${id}/sign-confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        signature,
        keyId,
        userId,
        signerName,
      }),
    })
    const data = await res.json()

    if (res.ok) {
      setRequest(null)
      setSignature('')
      setKeyId('')
      setUserId('')
      setSignerName(defaultSignerName ?? '')
      router.refresh()
    } else {
      setError(data.error ?? 'Подпись не прошла проверку')
    }

    setLoading(false)
  }

  if (signed) {
    return verificationToken ? (
      <a
        href={`/verify/${verificationToken}`}
        target="_blank"
        className="text-green-700 text-xs px-3 py-1 rounded-lg font-medium bg-green-100 hover:bg-green-200"
      >
        Проверить
      </a>
    ) : (
      <span className="text-green-700 text-xs px-3 py-1 rounded-lg font-medium bg-green-100">
        Подписан
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-2 items-end">
      {!request ? (
        <button
          onClick={createRequest}
          disabled={loading}
          className="text-xs px-3 py-1 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '...' : 'Подписать'}
        </button>
      ) : (
        <div className="w-80 bg-white border rounded-xl p-3 shadow-sm space-y-2">
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">SHA-256</label>
            <input
              value={request.document_hash}
              readOnly
              className="w-full border rounded-lg px-2 py-1 text-[11px] font-mono bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Подпись</label>
            <textarea
              value={signature}
              onChange={e => setSignature(e.target.value)}
              rows={3}
              className="w-full border rounded-lg px-2 py-1 text-xs"
              placeholder="128 lowercase hex Ed25519 signature"
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">key_id из Kripto</label>
            <input
              value={keyId}
              onChange={e => setKeyId(e.target.value)}
              className="w-full border rounded-lg px-2 py-1 text-xs"
              placeholder="UUID публичного ключа"
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">user_id из Kripto</label>
            <input
              value={userId}
              onChange={e => setUserId(e.target.value)}
              className="w-full border rounded-lg px-2 py-1 text-xs"
              placeholder="UUID пользователя"
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Имя подписанта</label>
            <input
              value={signerName}
              onChange={e => setSignerName(e.target.value)}
              className="w-full border rounded-lg px-2 py-1 text-xs"
              placeholder="ФИО для публичной проверки"
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Роль подписанта</label>
            <div className="w-full border rounded-lg px-2 py-1 text-xs bg-gray-50 text-gray-700">
              {signerRole}
            </div>
          </div>
          <div className="flex justify-between gap-2">
            <a
              href={request.verification_url}
              target="_blank"
              className="text-xs text-blue-600 hover:underline"
            >
              Страница проверки
            </a>
            <div className="flex gap-2">
              <button
                onClick={() => setRequest(null)}
                disabled={loading}
                className="text-xs px-3 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={confirmSignature}
                disabled={loading}
                className="text-xs px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? '...' : 'Готово'}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600 max-w-80 text-right">{error}</p>}
    </div>
  )
}
