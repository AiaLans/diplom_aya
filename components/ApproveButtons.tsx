'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Props = {
  id: string
  approveUrl: string
  rejectUrl: string
}

export default function ApproveButtons({ id, approveUrl, rejectUrl }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleAction(url: string) {
    setLoading(true)
    await fetch(url, { method: 'POST' })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleAction(approveUrl)}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
      >
        Одобрить
      </button>
      <button
        onClick={() => handleAction(rejectUrl)}
        disabled={loading}
        className="bg-red-100 text-red-600 px-4 py-1 rounded-lg text-sm hover:bg-red-200 disabled:opacity-50"
      >
        Отклонить
      </button>
    </div>
  )
}