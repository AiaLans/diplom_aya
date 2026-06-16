'use client'

import { useEffect, useRef, useState } from 'react'

function Counter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 2000
          const steps = 60
          const increment = value / steps
          let current = 0
          const timer = setInterval(() => {
            current += increment
            if (current >= value) {
              setCount(value)
              clearInterval(timer)
            } else {
              setCount(Math.floor(current))
            }
          }, duration / steps)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value])

  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <p style={{ margin: 0, fontSize: '40px', fontWeight: '700', color: 'var(--text)' }}>
        {count}{suffix}
      </p>
      <p data-i18n="stat_users" style={{ margin: '8px 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
        {label}
      </p>
    </div>
  )
}

type Props = {
  usersCount: number
  companiesCount: number
  labels: {
    users: string
    companies: string
    employment: string
    languages: string
  }
}

export default function CounterStats({ usersCount, companiesCount, labels }: Props) {
  return (
    <section style={{ borderTop: '1px solid var(--qadam-border)', borderBottom: '1px solid var(--qadam-border)', padding: '64px 40px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px' }}>
        <Counter value={usersCount} suffix="+" label={labels.users} />
        <Counter value={companiesCount} suffix="" label={labels.companies} />
        <Counter value={95} suffix="%" label={labels.employment} />
        <Counter value={3} suffix="" label={labels.languages} />
      </div>
    </section>
  )
}