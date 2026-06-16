'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  userId: string
  userName: string | null
  userRole: string
}

const ROLES = ['STUDENT', 'CURATOR', 'SUPERVISOR', 'COMPANY', 'ADMIN', 'SUPER_ADMIN']

export default function AdminUserActions({ userId, userName, userRole }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [newRole, setNewRole] = useState(userRole)
  const [newName, setNewName] = useState(userName ?? '')

  async function handleDelete() {
    if (!confirm(`Удалить пользователя ${userName}?`)) return
    setLoading(true)
    await fetch(`/api/superadmin/users/${userId}`, { method: 'DELETE' })
    router.refresh()
    setLoading(false)
  }

  async function handleSave() {
    setLoading(true)
    await fetch(`/api/superadmin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, role: newRole }),
    })
    setShowEdit(false)
    router.refresh()
    setLoading(false)
  }

  if (showEdit) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          className="border rounded px-2 py-1 text-xs w-32 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-transparent text-white border-gray-600"
        />
        <select
          value={newRole}
          onChange={e => setNewRole(e.target.value)}
          className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-700 text-white border-gray-600"
        >
          {ROLES.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
        >
          ✓
        </button>
        <button
          onClick={() => setShowEdit(false)}
          className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-500"
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setShowEdit(true)}
        className="text-blue-400 text-xs hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-900"
      >
        Изменить
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