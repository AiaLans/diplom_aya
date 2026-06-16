'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  id: string
  email: string
  name: string
}

export default function CompanyApproveButtons({ id, email, name }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleAction(action: 'approve' | 'reject') {
    setLoading(true)
    await fetch(`/api/admin/company/${action}/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleAction('approve')}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
      >
        ✓ Одобрить и создать аккаунт
      </button>
      <button
        onClick={() => handleAction('reject')}
        disabled={loading}
        className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50"
      >
        ✗ Отклонить
      </button>
    </div>
  )
}