'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ApproveDocButton({
  id,
  action
}: {
  id: string
  action: 'APPROVED' | 'REJECTED'
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handle() {
    setLoading(true)
    await fetch(`/api/admin/documents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: action }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className={`text-xs px-3 py-1 rounded-lg font-medium disabled:opacity-50 ${
        action === 'APPROVED'
          ? 'bg-green-600 text-white hover:bg-green-700'
          : 'bg-red-100 text-red-600 hover:bg-red-200'
      }`}
    >
      {loading ? '...' : action === 'APPROVED' ? '✓ Одобрить' : '✗ Отклонить'}
    </button>
  )
}