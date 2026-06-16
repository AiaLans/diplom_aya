'use client'

import { useState } from 'react'
import Link from 'next/link'
import LangThemeToggle from '@/components/LangThemeToggle'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    })

    if (res.ok) {
      setSent(true)
      setName('')
      setEmail('')
      setMessage('')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text)', fontFamily: 'system-ui, sans-serif' }}>

      {/* Навигация */}
      <nav style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--qadam-border)', position: 'sticky', top: 0, backgroundColor: 'var(--nav-bg)', backdropFilter: 'blur(10px)', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>Q</div>
          <Link href="/" style={{ fontSize: '20px', fontWeight: '700', textDecoration: 'none', color: 'var(--text)' }}>Qadam</Link>
        </div>
        <div style={{ display: 'flex', gap: '32px' }}>
          <Link href="/companies" data-i18n="companies" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Компании</Link>
          <Link href="/contact" data-i18n="contact" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Контакты</Link>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/login" data-i18n="login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Войти</Link>
          <Link href="/register" data-i18n="start" style={{ backgroundColor: '#3b82f6', color: '#fff', textDecoration: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '500' }}>Начать →</Link>
        </div>
        <LangThemeToggle />
      </nav>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '60px 40px' }}>
        <h2 data-i18n="contact_title" style={{ fontSize: '40px', fontWeight: '700', marginBottom: '8px' }}>Связаться с нами</h2>
        <p data-i18n="contact_sub" style={{ color: 'var(--text-muted)', marginBottom: '48px', fontSize: '18px' }}>Есть вопросы? Напиши нам и мы ответим в течение 24 часов</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
          <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--qadam-border)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '28px', marginBottom: '8px' }}>📍</p>
            <p data-i18n="contact_address_label" style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Адрес</p>
            <p data-i18n="contact_address" style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Алматы, ул. Байзакова 320</p>
          </div>
          <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--qadam-border)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '28px', marginBottom: '8px' }}>📧</p>
            <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Email</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>qadamalmaty@gmail.com</p>
          </div>
          <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--qadam-border)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '28px', marginBottom: '8px' }}>📞</p>
            <p data-i18n="contact_phone_label" style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Телефон</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>+7 (778) 851-66-43</p>
          </div>
        </div>

        {sent ? (
          <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--qadam-border)', borderRadius: '16px', padding: '60px', textAlign: 'center' }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>✅</p>
            <h3 data-i18n="contact_sent_title" style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Сообщение отправлено!</h3>
            <p data-i18n="contact_sent_desc" style={{ color: 'var(--text-muted)' }}>Мы свяжемся с тобой в ближайшее время</p>
          </div>
        ) : (
          <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--qadam-border)', borderRadius: '16px', padding: '32px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label data-i18n="contact_name_label" style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Имя</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', backgroundColor: 'var(--bg)', border: '1px solid var(--qadam-border)', borderRadius: '10px', padding: '12px 16px', color: 'var(--text)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="Твоё имя"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', backgroundColor: 'var(--bg)', border: '1px solid var(--qadam-border)', borderRadius: '10px', padding: '12px 16px', color: 'var(--text)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div>
                <label data-i18n="contact_message_label" style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Сообщение</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ width: '100%', backgroundColor: 'var(--bg)', border: '1px solid var(--qadam-border)', borderRadius: '10px', padding: '12px 16px', color: 'var(--text)', fontSize: '14px', outline: 'none', resize: 'none', height: '120px', boxSizing: 'border-box' }}
                  placeholder="Твой вопрос или сообщение..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                data-i18n="contact_send_btn"
                style={{ backgroundColor: loading ? '#6b7280' : '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px', fontSize: '16px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', width: '100%' }}
              >
                {loading ? 'Отправляем...' : 'Отправить'}
              </button>
            </form>
          </div>
        )}
      </div>

      <footer style={{ borderTop: '1px solid var(--qadam-border)', padding: '32px 40px', marginTop: '40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: '700' }}>Qadam</span>
          <p data-i18n="footer_copy" style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>© 2026 Алматы политехникалық колледжі</p>
        </div>
      </footer>
    </div>
  )
}