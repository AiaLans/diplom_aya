'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  companyId: string
  companyName: string
  approved: boolean
}

export default function AdminCompanyActions({ companyId, companyName, approved }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(`Удалить компанию ${companyName}?`)) return
    setLoading(true)
    await fetch(`/api/superadmin/companies/${companyId}`, { method: 'DELETE' })
    router.refresh()
    setLoading(false)
  }

  async function handleToggleApprove() {
    setLoading(true)
    await fetch(`/api/superadmin/companies/${companyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: !approved }),
    })
    router.refresh()
    setLoading(false)
  }
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggleApprove}
        disabled={loading}
        className={`text-xs px-2 py-1 rounded disabled:opacity-50 ${
          approved
            ? 'bg-yellow-900 text-yellow-400 hover:bg-yellow-800'
            : 'bg-green-900 text-green-400 hover:bg-green-800'
        }`}
      >
        {approved ? 'Скрыть' : 'Одобрить'}
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-red-400 text-xs hover:text-red-300 px-2 py-1 rounded hover:bg-red-900 disabled:opacity-50"
      >
        Удалить
      </button>
    </div>
  )
}