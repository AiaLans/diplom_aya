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
}: {
  id: string
  signed: boolean
  verificationToken?: string | null
  signerName?: string | null
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [request, setRequest] = useState<SignRequest | null>(null)
  const [kriptoFile, setKriptoFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
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

    if (!kriptoFile) {
      setError('Выберите .kripto файл')
      return
    }

    if (!kriptoFile.name.toLowerCase().endsWith('.kripto')) {
      setError('Файл должен иметь расширение .kripto')
      return
    }

    setLoading(true)

    const formData = new FormData()
    formData.append('kriptoFile', kriptoFile)
    formData.append('password', password)
    formData.append('signerName', defaultSignerName ?? '')

    const res = await fetch(`/api/documents/${id}/sign-confirm`, {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()

    if (res.ok) {
      setRequest(null)
      setKriptoFile(null)
      setPassword('')
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
            <label className="block text-[11px] text-gray-500 mb-1">Файл ключа .kripto</label>
            <input
              type="file"
              accept=".kripto"
              onChange={e => setKriptoFile(e.target.files?.[0] ?? null)}
              className="w-full border rounded-lg px-2 py-1 text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Пароль, если задан</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border rounded-lg px-2 py-1 text-xs"
              placeholder="Можно оставить пустым"
            />
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
