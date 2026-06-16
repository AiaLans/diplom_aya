'use client'

import { useState, useEffect } from 'react'

export default function LangSwitcher() {
  const [lang, setLang] = useState('ru')

  useEffect(() => {
    const saved = localStorage.getItem('lang') ?? 'ru'
    setLang(saved)
  }, [])

  function switchLang(l: string) {
    localStorage.setItem('lang', l)
    setLang(l)
    window.location.reload()
  }

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => switchLang('ru')}
        className={`px-3 py-1 rounded-md text-xs font-medium transition ${
          lang === 'ru' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        РУС
      </button>
      <button
        onClick={() => switchLang('kz')}
        className={`px-3 py-1 rounded-md text-xs font-medium transition ${
          lang === 'kz' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        ҚАЗ
      </button>
    </div>
  )
}