'use client'

import { useState, useEffect } from 'react'
import { studentTranslations, Lang } from './i18n/student'

export function useLang() {
  const [lang, setLang] = useState<Lang>('ru')

  useEffect(() => {
    const saved = (localStorage.getItem('lang') ?? 'ru') as Lang
    setLang(saved)
  }, [])

  const t = studentTranslations[lang]

  return { lang, t }
}