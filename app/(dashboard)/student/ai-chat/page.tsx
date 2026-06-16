'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import LangSwitcher from '@/components/LangSwitcher'
import { useLang } from '@/lib/useLang'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

const translations = {
  ru: {
    title: 'AI Помощник',
    back: '← Назад',
    online: 'Онлайн',
    clearHistory: 'Очистить историю',
    confirmClear: 'Очистить историю чата?',
    loadingHistory: 'Загружаем историю...',
    greeting: 'Привет! Я твой AI помощник на платформе Qadam. Могу помочь с карьерными советами, улучшением резюме или написанием отчётов. Чем могу помочь? 😊',
    cleared: 'История очищена. Чем могу помочь? 😊',
    error: 'Произошла ошибка',
    placeholder: 'Напиши сообщение... (Enter для отправки)',
    send: 'Отправить',
    hint: 'Enter — отправить, Shift+Enter — новая строка',
  },
  kz: {
    title: 'AI Көмекші',
    back: '← Артқа',
    online: 'Онлайн',
    clearHistory: 'Тарихты тазалау',
    confirmClear: 'Чат тарихын тазалау керек пе?',
    loadingHistory: 'Тарих жүктелуде...',
    greeting: 'Сәлем! Мен Qadam платформасындағы AI көмекшіңізбін. Мансаптық кеңестер, түйіндемені жақсарту немесе есептер жазуға көмектесе аламын. Қалай көмектесе аламын? 😊',
    cleared: 'Тарих тазаланды. Қалай көмектесе аламын? 😊',
    error: 'Қате орын алды',
    placeholder: 'Хабарлама жазыңыз... (Enter — жіберу)',
    send: 'Жіберу',
    hint: 'Enter — жіберу, Shift+Enter — жаңа жол',
  }
}

export default function AIChatPage() {
  const { lang } = useLang()
  const t = translations[lang as 'ru' | 'kz'] ?? translations.ru

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadHistory() {
    try {
      const res = await fetch('/api/ai/history')
      const data = await res.json()

      if (Array.isArray(data) && data.length > 0) {
        setMessages(data)
      } else {
        setMessages([{ role: 'assistant', content: t.greeting }])
      }
    } catch {
      setMessages([{ role: 'assistant', content: t.greeting }])
    }
    setLoadingHistory(false)
  }

  async function handleSend() {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    const history = messages.map((m) => ({ role: m.role, content: m.content }))
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])

    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage, history }),
    })

    const data = await res.json()

    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: data.reply ?? t.error },
    ])

    setLoading(false)
  }

  async function handleClearHistory() {
    if (!confirm(t.confirmClear)) return
    await fetch('/api/ai/history', { method: 'DELETE' })
    setMessages([{ role: 'assistant', content: t.cleared }])
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/student" className="text-gray-400 hover:text-gray-600">{t.back}</a>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">
              AI
            </div>
            <div>
              <h1 className="text-base font-bold">{t.title}</h1>
              <p className="text-xs text-green-500">{t.online}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LangSwitcher />
          <button
            onClick={handleClearHistory}
            className="text-xs text-gray-400 hover:text-red-500 px-3 py-1 rounded-lg hover:bg-red-50"
          >
            {t.clearHistory}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-3xl mx-auto w-full">
        {loadingHistory ? (
          <div className="text-center py-12 text-gray-400">
            <p>{t.loadingHistory}</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs mr-2 mt-1 flex-shrink-0">
                  AI
                </div>
              )}
              <div className={`max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white border text-gray-800 rounded-bl-sm'
              }`}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs mr-2 flex-shrink-0">
              AI
            </div>
            <div className="bg-white border px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="bg-white border-t p-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.placeholder}
            className="flex-1 border rounded-xl px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {t.send}
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">{t.hint}</p>
      </div>
    </div>
  )
}