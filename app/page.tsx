import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import LangThemeToggle from '@/components/LangThemeToggle'
import CounterStats from '@/components/CounterStats'

export default async function LandingPage() {
  const companiesCount = await prisma.company.count({ where: { approved: true } })
  const usersCount = await prisma.user.count()

  const features = [
    { icon: '🤖', titleKey: 'feat_ai_title', descKey: 'feat_ai_desc', titleDefault: 'AI Помощник', descDefault: 'Карьерные советы, улучшение резюме и помощь с отчётами на трёх языках' },
    { icon: '📔', titleKey: 'feat_diary_title', descKey: 'feat_diary_desc', titleDefault: 'Дневник стажировки', descDefault: 'Ежедневные отчёты, посещаемость и подтверждение от руководителя' },
    { icon: '🏢', titleKey: 'feat_companies_title', descKey: 'feat_companies_desc', titleDefault: 'Топовые компании', descDefault: 'Kaspi Bank, Kolesa Group, EPAM, Yandex и другие лидеры рынка' },
    { icon: '📊', titleKey: 'feat_analytics_title', descKey: 'feat_analytics_desc', titleDefault: 'Аналитика', descDefault: 'Статистика посещаемости и прогресс для студентов и кураторов' },
    { icon: '📄', titleKey: 'feat_docs_title', descKey: 'feat_docs_desc', titleDefault: 'Документы', descDefault: 'Автоматическая генерация и управление документами стажировки' },
    { icon: '🔔', titleKey: 'feat_notif_title', descKey: 'feat_notif_desc', titleDefault: 'Уведомления', descDefault: 'Мгновенные уведомления о статусе заявок и активности' },
  ]

  const roles = [
    { icon: '🎓', titleKey: 'role_student_title', descKey: 'role_student_desc', titleDefault: 'Студент', descDefault: 'Подаёт заявки, ведёт дневник, общается с AI' },
    { icon: '👩‍🏫', titleKey: 'role_curator_title', descKey: 'role_curator_desc', titleDefault: 'Куратор', descDefault: 'Следит за группой, проверяет заявки' },
    { icon: '🏢', titleKey: 'role_company_title', descKey: 'role_company_desc', titleDefault: 'Компания', descDefault: 'Принимает стажёров, подтверждает дневник' },
    { icon: '⚙️', titleKey: 'role_admin_title', descKey: 'role_admin_desc', titleDefault: 'Админ', descDefault: 'Управляет всей платформой и пользователями' },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text)', fontFamily: 'system-ui, sans-serif' }}>

      {/* Навигация */}
      <nav style={{ padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--qadam-border)', position: 'sticky', top: 0, backgroundColor: 'var(--nav-bg)', backdropFilter: 'blur(10px)', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>Q</div>
          <span style={{ fontSize: '20px', fontWeight: '700' }}>Qadam</span>
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

      {/* Герой */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 40px 40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid var(--qadam-border)', color: 'var(--text-muted)', fontSize: '13px', padding: '6px 16px', borderRadius: '999px', marginBottom: '28px' }}>
          <span style={{ width: '6px', height: '6px', backgroundColor: '#60a5fa', borderRadius: '50%', display: 'inline-block' }}></span>
          <span data-i18n="badge">Алматы политехникалық колледжі</span>
        </div>

        <h1 style={{ fontSize: '80px', fontWeight: '800', lineHeight: '1.05', marginBottom: '20px', letterSpacing: '-2px' }}>
          <span data-i18n="hero_title">Мансапқа алғашқы қадамды</span><br />
          <span style={{ color: '#60a5fa' }} data-i18n="hero_accent">бірге жасайық</span>
        </h1>

        <p data-i18n="hero_desc" style={{ fontSize: '22px', color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.6' }}>
          Qadam студенттерге тағылымдама табуға және AI көмегімен мансапты дамытуға көмектеседі
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '48px' }}>
          <Link href="/register" data-i18n="btn_find" style={{ backgroundColor: '#3b82f6', color: '#fff', textDecoration: 'none', padding: '18px 36px', borderRadius: '12px', fontWeight: '600', fontSize: '18px' }}>Тағылымдама табу</Link>
          <Link href="/companies" data-i18n="btn_companies" style={{ border: '1px solid var(--qadam-border)', color: 'var(--text-muted)', textDecoration: 'none', padding: '18px 36px', borderRadius: '12px', fontWeight: '600', fontSize: '18px' }}>Компанияларды көру</Link>
        </div>

        {/* Превью */}
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--qadam-border)', borderRadius: '20px', padding: '24px', maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '14px', padding: '20px', border: '1px solid var(--qadam-border)', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontWeight: '700' }}>А</div>
                <div style={{ textAlign: 'left' }}>
                  <p data-i18n="preview_name" style={{ margin: 0, fontWeight: '600', fontSize: '15px' }}>Аяулым Бекова</p>
                  <p data-i18n="preview_group" style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>ИС-21 • Тағылымдама белсенді</p>
                </div>
              </div>
              <span data-i18n="preview_status" style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#4ade80', fontSize: '13px', padding: '6px 14px', borderRadius: '999px' }}>Қабылданды ✓</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div style={{ backgroundColor: 'rgba(59,130,246,0.1)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#60a5fa' }}>92%</p>
                <p data-i18n="preview_attendance" style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Қатысу</p>
              </div>
              <div style={{ backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#4ade80' }}>18</p>
                <p data-i18n="preview_days" style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Күн жазбалары</p>
              </div>
              <div style={{ backgroundColor: 'rgba(168,85,247,0.1)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#c084fc' }}>Kaspi</p>
                <p data-i18n="preview_company_label" style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Компания</p>
              </div>
            </div>
          </div>
          <p data-i18n="preview_label" style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Студент бақылау тақтасының үлгісі</p>
        </div>
      </section>

      {/* Статистика */}
      <CounterStats
        usersCount={usersCount}
        companiesCount={companiesCount}
        labels={{
          users: 'Пользователей',
          companies: 'Компаний',
          employment: 'Трудоустройство',
          languages: 'Языка',
        }}
      />

      {/* Возможности */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 data-i18n="features_title" style={{ fontSize: '48px', fontWeight: '800', marginBottom: '16px' }}>Всё для успешной стажировки</h2>
          <p data-i18n="features_sub" style={{ color: 'var(--text-muted)', fontSize: '20px' }}>Один инструмент для студентов, компаний и кураторов</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {features.map((item, i) => (
            <div key={i} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--qadam-border)', borderRadius: '16px', padding: '28px' }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>{item.icon}</div>
              <h3 data-i18n={item.titleKey} style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>{item.titleDefault}</h3>
              <p data-i18n={item.descKey} style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>{item.descDefault}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Роли */}
      <section style={{ borderTop: '1px solid var(--qadam-border)', padding: '60px 40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 data-i18n="roles_title" style={{ fontSize: '48px', fontWeight: '800', marginBottom: '16px' }}>Для каждого своя роль</h2>
            <p data-i18n="roles_sub" style={{ color: 'var(--text-muted)', fontSize: '20px' }}>Платформа работает для всех участников процесса</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {roles.map((item, i) => (
              <div key={i} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--qadam-border)', borderRadius: '16px', padding: '28px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>{item.icon}</div>
                <h3 data-i18n={item.titleKey} style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>{item.titleDefault}</h3>
                <p data-i18n={item.descKey} style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>{item.descDefault}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderTop: '1px solid var(--qadam-border)', padding: '60px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 data-i18n="cta_title" style={{ fontSize: '48px', fontWeight: '800', marginBottom: '16px' }}>Готов начать?</h2>
          <p data-i18n="cta_desc" style={{ color: 'var(--text-muted)', fontSize: '20px', marginBottom: '40px' }}>
            Зарегистрируйся бесплатно и найди стажировку уже сегодня
          </p>
          <Link href="/register" data-i18n="cta_btn" style={{ backgroundColor: '#3b82f6', color: '#fff', textDecoration: 'none', padding: '20px 48px', borderRadius: '12px', fontWeight: '600', fontSize: '20px', display: 'inline-block' }}>
            Зарегистрироваться бесплатно →
          </Link>
        </div>
      </section>

      {/* Футер */}
      <footer style={{ borderTop: '1px solid var(--qadam-border)', padding: '32px 40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', backgroundColor: '#3b82f6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#fff' }}>Q</div>
            <span style={{ fontWeight: '700' }}>Qadam</span>
          </div>
          <p data-i18n="footer_copy" style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>© 2026 Алматы политехникалық колледжі</p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="/companies" data-i18n="companies" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Компании</Link>
            <Link href="/contact" data-i18n="contact" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Контакты</Link>
            <Link href="/login" data-i18n="login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Войти</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}