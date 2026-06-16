'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteMemorandumButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Удалить меморандум?')) return
    setLoading(true)

    await fetch(`/api/memorandum/delete/${id}`, {
      method: 'DELETE',
    })

    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 text-sm hover:underline disabled:opacity-50"
    >
      {loading ? '...' : 'Удалить'}
    </button>
  )
}