export const PRACTICE_PERIODS = [
  {
    id: 'PRODUCTION',
    name: 'Производственная практика',
    nameKk: 'Өндірістік тәжірибе',
    nameEn: 'Industrial Practice',
    start: '2025-11-10',
    end: '2025-12-12',
    semester: 1,
  },
  {
    id: 'PREDIPLOMA',
    name: 'Преддипломная практика',
    nameKk: 'Дипломалды тәжірибесі',
    nameEn: 'Pre-diploma Practice',
    start: '2026-03-26',
    end: '2026-06-03',
    semester: 2,
  },
]

export function getCurrentPractice() {
  const today = new Date()
  return PRACTICE_PERIODS.find(p => {
    const start = new Date(p.start)
    const end = new Date(p.end)
    return today >= start && today <= end
  })
}

export function isDateInPractice(dateStr: string): boolean {
  const date = new Date(dateStr)
  return PRACTICE_PERIODS.some(p => {
    const start = new Date(p.start)
    const end = new Date(p.end)
    return date >= start && date <= end
  })
}

export function isDateAllowed(dateStr: string): boolean {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  // Не будущая дата
  if (date > today) return false

  // Входит в период практики
  return isDateInPractice(dateStr)
}