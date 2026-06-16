'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  appId: string
  currentStatus: string
}

const STATUSES = ['PENDING_CURATOR', 'PENDING_COMPANY', 'PENDING_ADMIN', 'ACCEPTED', 'REJECTED']

export default function SuperAdminAppActions({ appId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(currentStatus)

  async function handleChange(newStatus: string) {
    setLoading(true)
    await fetch(`/api/superadmin/applications/${appId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setStatus(newStatus)
    router.refresh()
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Удалить заявку?')) return
    setLoading(true)
    await fetch(`/api/superadmin/applications/${appId}`, { method: 'DELETE' })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={e => handleChange(e.target.value)}
        disabled={loading}
        className="bg-gray-700 border border-gray-600 text-white text-xs rounded px-2 py-1 focus:outline-none"
      >
        {STATUSES.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-red-400 text-xs hover:text-red-300 disabled:opacity-50"
      >
        Удалить
      </button>
    </div>
  )
}