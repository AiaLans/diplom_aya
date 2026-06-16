'use client'

import { useEffect } from 'react'
import { translations } from './LangThemeToggle'

export default function ThemeInit() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('qadam-theme') || 'dark'
    const savedLang = localStorage.getItem('qadam-lang') || 'ru'

    const root = document.documentElement
    if (savedTheme === 'dark') {
      root.style.setProperty('--bg', '#0d0d0d')
      root.style.setProperty('--text', '#ffffff')
      root.style.setProperty('--text-muted', 'rgba(255,255,255,0.45)')
      root.style.setProperty('--qadam-border', 'rgba(255,255,255,0.08)')
      root.style.setProperty('--card-bg', 'rgba(255,255,255,0.04)')
      root.style.setProperty('--nav-bg', 'rgba(13,13,13,0.95)')
    } else {
      root.style.setProperty('--bg', '#f8f9fa')
      root.style.setProperty('--text', '#0d0d0d')
      root.style.setProperty('--text-muted', 'rgba(0,0,0,0.55)')
      root.style.setProperty('--qadam-border', 'rgba(0,0,0,0.1)')
      root.style.setProperty('--card-bg', 'rgba(0,0,0,0.03)')
      root.style.setProperty('--nav-bg', 'rgba(248,249,250,0.95)')
    }

    const t = translations[savedLang]
    if (t) {
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n')
        if (key && t[key]) el.textContent = t[key]
      })
    }
  }, [])

  return null
}