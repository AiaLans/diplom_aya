'use client'

import { useState, useEffect } from 'react'

const translations: Record<string, Record<string, string>> = {
  ru: {
    companies: 'Компании',
    contact: 'Контакты',
    login: 'Войти',
    start: 'Начать →',
    hero_title: 'Твой первый шаг',
    hero_accent: 'в карьеру',
    hero_desc: 'Qadam помогает студентам найти стажировку, отслеживать прогресс и развивать карьеру с помощью AI',
    btn_find: 'Найти стажировку',
    btn_companies: 'Смотреть компании',
    preview_label: 'Пример дашборда студента',
    stat_users: 'Пользователей',
    stat_companies: 'Компаний',
    stat_employment: 'Трудоустройство',
    stat_languages: 'Языка',
    features_title: 'Всё для успешной стажировки',
    features_sub: 'Один инструмент для студентов, компаний и кураторов',
    roles_title: 'Для каждого своя роль',
    roles_sub: 'Платформа работает для всех участников процесса',
    cta_title: 'Готов начать?',
    cta_desc: 'Зарегистрируйся бесплатно и найди стажировку уже сегодня',
    cta_btn: 'Зарегистрироваться бесплатно →',
    badge: 'Алматинский политехнический колледж',
    preview_name: 'Аяулым Бекова',
    preview_group: 'ИС-21 • Стажировка активна',
    preview_status: 'Принято ✓',
    preview_attendance: 'Посещаемость',
    preview_days: 'Дней записей',
    preview_company_label: 'Компания',
    feat_ai_title: 'AI Помощник',
    feat_ai_desc: 'Карьерные советы, улучшение резюме и помощь с отчётами на трёх языках',
    feat_diary_title: 'Дневник стажировки',
    feat_diary_desc: 'Ежедневные отчёты, посещаемость и подтверждение от руководителя',
    feat_companies_title: 'Топовые компании',
    feat_companies_desc: 'Kaspi Bank, Kolesa Group, EPAM, Yandex и другие лидеры рынка',
    feat_analytics_title: 'Аналитика',
    feat_analytics_desc: 'Статистика посещаемости и прогресс для студентов и кураторов',
    feat_docs_title: 'Документы',
    feat_docs_desc: 'Автоматическая генерация и управление документами стажировки',
    feat_notif_title: 'Уведомления',
    feat_notif_desc: 'Мгновенные уведомления о статусе заявок и активности',
    role_student_title: 'Студент',
    role_student_desc: 'Подаёт заявки, ведёт дневник, общается с AI',
    role_curator_title: 'Куратор',
    role_curator_desc: 'Следит за группой, проверяет заявки',
    role_company_title: 'Компания',
    role_company_desc: 'Принимает стажёров, подтверждает дневник',
    role_admin_title: 'Админ',
    role_admin_desc: 'Управляет всей платформой и пользователями',
    footer_copy: '© 2026 Алматинский политехнический колледж',
    companies_title: 'Компании партнёры',
    companies_sub: 'Ведущие компании Алматы готовы принять студентов на стажировку',
    companies_empty: 'Компаний пока нет',
    company_founded: 'Основана в',
    company_badge: 'Принимает стажёров',
    company_requirements: 'Требования:',
    company_salary_label: 'Зарплата',
    company_salary_negotiable: 'По договорённости',
    company_vacancies_label: 'Вакансий',
    company_apply_btn: 'Подать заявку',
    contact_title: 'Связаться с нами',
    contact_sub: 'Есть вопросы? Напиши нам и мы ответим в течение 24 часов',
    contact_address_label: 'Адрес',
    contact_address: 'Алматы, ул. Байзакова 320',
    contact_phone_label: 'Телефон',
    contact_name_label: 'Имя',
    contact_message_label: 'Сообщение',
    contact_send_btn: 'Отправить',
    contact_sent_title: 'Сообщение отправлено!',
    contact_sent_desc: 'Мы свяжемся с тобой в ближайшее время',
  },
  kk: {
    companies: 'Компаниялар',
    contact: 'Байланыс',
    login: 'Кіру',
    start: 'Бастау →',
    hero_title: 'Мансапқа алғашқы қадамды',
    hero_accent: 'бірге жасайық',
    hero_desc: 'Qadam студенттерге тағылымдама табуға және AI көмегімен мансапты дамытуға көмектеседі',
    btn_find: 'Тағылымдама табу',
    btn_companies: 'Компанияларды көру',
    preview_label: 'Студент бақылау тақтасының үлгісі',
    stat_users: 'Пайдаланушылар',
    stat_companies: 'Компаниялар',
    stat_employment: 'Жұмысқа орналасу',
    stat_languages: 'Тіл',
    features_title: 'Тағылымдама үшін барлығы',
    features_sub: 'Студенттер, компаниялар және кураторлар үшін бір құрал',
    roles_title: 'Әркімнің өз рөлі бар',
    roles_sub: 'Платформа барлық қатысушылар үшін жұмыс істейді',
    cta_title: 'Бастауға дайынсың ба?',
    cta_desc: 'Тегін тіркеліп, бүгін тағылымдама тап',
    cta_btn: 'Тегін тіркелу →',
    badge: 'Алматы политехникалық колледжі',
    preview_name: 'Аяулым Бекова',
    preview_group: 'ИС-21 • Тағылымдама белсенді',
    preview_status: 'Қабылданды ✓',
    preview_attendance: 'Қатысу',
    preview_days: 'Күн жазбалары',
    preview_company_label: 'Компания',
    feat_ai_title: 'AI Көмекші',
    feat_ai_desc: 'Мансаптық кеңестер, түйіндеме жақсарту және үш тілде есеп жазуға көмек',
    feat_diary_title: 'Тағылымдама күнделігі',
    feat_diary_desc: 'Күнделікті есептер, қатысу және жетекшінің растауы',
    feat_companies_title: 'Үздік компаниялар',
    feat_companies_desc: 'Kaspi Bank, Kolesa Group, EPAM, Yandex және басқа нарық көшбасшылары',
    feat_analytics_title: 'Аналитика',
    feat_analytics_desc: 'Студенттер мен кураторлар үшін қатысу статистикасы',
    feat_docs_title: 'Құжаттар',
    feat_docs_desc: 'Тағылымдама құжаттарын автоматты түрде жасау және басқару',
    feat_notif_title: 'Хабарландырулар',
    feat_notif_desc: 'Өтінімдер мен белсенділік туралы жедел хабарландырулар',
    role_student_title: 'Студент',
    role_student_desc: 'Өтінім береді, күнделік жүргізеді, AI-мен сөйлеседі',
    role_curator_title: 'Куратор',
    role_curator_desc: 'Топты бақылайды, өтінімдерді тексереді',
    role_company_title: 'Компания',
    role_company_desc: 'Тағылымдамашыларды қабылдайды, күнделікті растайды',
    role_admin_title: 'Әкімші',
    role_admin_desc: 'Бүкіл платформа мен пайдаланушыларды басқарады',
    footer_copy: '© 2026 Алматы политехникалық колледжі',
    companies_title: 'Серіктес компаниялар',
    companies_sub: 'Алматының жетекші компаниялары студенттерді тағылымдамаға қабылдауға дайын',
    companies_empty: 'Компаниялар әлі жоқ',
    company_founded: 'Құрылған жылы',
    company_badge: 'Тағылымдамашыларды қабылдайды',
    company_requirements: 'Талаптар:',
    company_salary_label: 'Жалақы',
    company_salary_negotiable: 'Келісім бойынша',
    company_vacancies_label: 'Бос орындар',
    company_apply_btn: 'Өтінім беру',
    contact_title: 'Бізбен байланысу',
    contact_sub: 'Сұрақтарыңыз бар ма? Бізге жазыңыз, 24 сағат ішінде жауап береміз',
    contact_address_label: 'Мекенжай',
    contact_address: 'Алматы, Байзақов көшесі 320',
    contact_phone_label: 'Телефон',
    contact_name_label: 'Есім',
    contact_message_label: 'Хабарлама',
    contact_send_btn: 'Жіберу',
    contact_sent_title: 'Хабарлама жіберілді!',
    contact_sent_desc: 'Жақын арада сізбен байланысамыз',
  },
  en: {
    companies: 'Companies',
    contact: 'Contact',
    login: 'Sign in',
    start: 'Get started →',
    hero_title: 'Your first step',
    hero_accent: 'into your career',
    hero_desc: 'Qadam helps students find internships, track progress and grow their careers with AI',
    btn_find: 'Find internship',
    btn_companies: 'View companies',
    preview_label: 'Student dashboard preview',
    stat_users: 'Users',
    stat_companies: 'Companies',
    stat_employment: 'Employment rate',
    stat_languages: 'Languages',
    features_title: 'Everything for a successful internship',
    features_sub: 'One tool for students, companies and curators',
    roles_title: 'A role for everyone',
    roles_sub: 'The platform works for all participants',
    cta_title: 'Ready to start?',
    cta_desc: 'Register for free and find your internship today',
    cta_btn: 'Register for free →',
    badge: 'Almaty Polytechnic College',
    preview_name: 'Ayaulym Bekova',
    preview_group: 'IS-21 • Internship active',
    preview_status: 'Accepted ✓',
    preview_attendance: 'Attendance',
    preview_days: 'Days logged',
    preview_company_label: 'Company',
    feat_ai_title: 'AI Assistant',
    feat_ai_desc: 'Career advice, resume improvement and report writing in three languages',
    feat_diary_title: 'Internship diary',
    feat_diary_desc: 'Daily reports, attendance tracking and supervisor confirmation',
    feat_companies_title: 'Top companies',
    feat_companies_desc: 'Kaspi Bank, Kolesa Group, EPAM, Yandex and other market leaders',
    feat_analytics_title: 'Analytics',
    feat_analytics_desc: 'Attendance statistics and progress for students and curators',
    feat_docs_title: 'Documents',
    feat_docs_desc: 'Automatic generation and management of internship documents',
    feat_notif_title: 'Notifications',
    feat_notif_desc: 'Instant notifications about application status and activity',
    role_student_title: 'Student',
    role_student_desc: 'Applies, keeps diary, chats with AI',
    role_curator_title: 'Curator',
    role_curator_desc: 'Monitors group, reviews applications',
    role_company_title: 'Company',
    role_company_desc: 'Accepts interns, confirms diary',
    role_admin_title: 'Admin',
    role_admin_desc: 'Manages the whole platform and users',
    footer_copy: '© 2026 Almaty Polytechnic College',
    companies_title: 'Partner companies',
    companies_sub: 'Leading Almaty companies are ready to accept students for internships',
    companies_empty: 'No companies yet',
    company_founded: 'Founded in',
    company_badge: 'Accepting interns',
    company_requirements: 'Requirements:',
    company_salary_label: 'Salary',
    company_salary_negotiable: 'Negotiable',
    company_vacancies_label: 'Vacancies',
    company_apply_btn: 'Apply now',
    contact_title: 'Contact us',
    contact_sub: 'Have questions? Write to us and we will respond within 24 hours',
    contact_address_label: 'Address',
    contact_address: 'Almaty, Baizakov St. 320',
    contact_phone_label: 'Phone',
    contact_name_label: 'Name',
    contact_message_label: 'Message',
    contact_send_btn: 'Send',
    contact_sent_title: 'Message sent!',
    contact_sent_desc: 'We will get back to you shortly',
  },
}

export { translations }

export default function LangThemeToggle() {
  const [lang, setLang] = useState('ru')
  const [dark, setDark] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedLang = localStorage.getItem('qadam-lang') || 'ru'
    const savedTheme = localStorage.getItem('qadam-theme') || 'dark'
    setLang(savedLang)
    setDark(savedTheme === 'dark')
    applyTheme(savedTheme === 'dark')
    applyLang(savedLang)
  }, [])

  function applyTheme(isDark: boolean) {
    const root = document.documentElement
    if (isDark) {
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
  }

  function applyLang(newLang: string) {
    const t = translations[newLang]
    if (!t) return
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n')
      if (key && t[key]) el.textContent = t[key]
    })
  }

  function changeLang(newLang: string) {
    setLang(newLang)
    localStorage.setItem('qadam-lang', newLang)
    applyLang(newLang)
  }

  function toggleTheme() {
    const newDark = !dark
    setDark(newDark)
    localStorage.setItem('qadam-theme', newDark ? 'dark' : 'light')
    applyTheme(newDark)
  }

  if (!mounted) return null

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ display: 'flex', border: '1px solid var(--qadam-border)', borderRadius: '8px', overflow: 'hidden' }}>
        {(['ru', 'kk', 'en'] as const).map((l) => (
          <button
            key={l}
            onClick={() => changeLang(l)}
            style={{
              padding: '6px 10px',
              fontSize: '11px',
              fontWeight: '600',
              background: lang === l ? '#3b82f6' : 'transparent',
              color: lang === l ? '#fff' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {l}
          </button>
        ))}
      </div>

      <button
        onClick={toggleTheme}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          border: '1px solid var(--qadam-border)',
          background: 'transparent',
          cursor: 'pointer',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {dark ? '☀️' : '🌙'}
      </button>
    </div>
  )
}