import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import LangThemeToggle from '@/components/LangThemeToggle'

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    where: { approved: true },
    include: { internships: true }
  })

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

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 40px' }}>
        <h2 data-i18n="companies_title" style={{ fontSize: '40px', fontWeight: '700', marginBottom: '8px' }}>Компании партнёры</h2>
        <p data-i18n="companies_sub" style={{ color: 'var(--text-muted)', marginBottom: '48px', fontSize: '18px' }}>Ведущие компании Алматы готовы принять студентов на стажировку</p>

        {companies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</p>
            <p data-i18n="companies_empty">Компаний пока нет</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            {companies.map((company: any) => (
              <div key={company.id} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--qadam-border)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>{company.name}</h3>
                    {company.founded && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0' }}>
                        <span data-i18n="company_founded">Основана в</span> {company.founded}
                      </p>
                    )}
                  </div>
                  <span style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#4ade80', fontSize: '12px', padding: '4px 12px', borderRadius: '999px', whiteSpace: 'nowrap' }} data-i18n="company_badge">
                    Принимает стажёров
                  </span>
                </div>

                {company.description && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px', lineHeight: '1.6' }}>{company.description}</p>
                )}

                {company.requirements && (
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }} data-i18n="company_requirements">Требования:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {company.requirements.split(',').map((req: string, i: number) => (
                        <span key={i} style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#60a5fa', fontSize: '12px', padding: '4px 10px', borderRadius: '999px' }}>
                          {req.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--qadam-border)', marginBottom: company.internships.length > 0 ? '16px' : '0' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }} data-i18n="company_salary_label">Зарплата</p>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#4ade80', margin: '2px 0 0' }}>
                      {company.salary ?? <span data-i18n="company_salary_negotiable">По договорённости</span>}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }} data-i18n="company_vacancies_label">Вакансий</p>
                    <p style={{ fontSize: '14px', fontWeight: '600', margin: '2px 0 0' }}>{company.internships.length}</p>
                  </div>
                </div>

                {company.internships.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {company.internships.map((internship: any) => (
                      <div key={internship.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px 14px' }}>
                        <span style={{ fontSize: '14px' }}>{internship.title}</span>
                        <Link href="/register" data-i18n="company_apply_btn" style={{ backgroundColor: '#3b82f6', color: '#fff', textDecoration: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '500' }}>
                          Подать заявку
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
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