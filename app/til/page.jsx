import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import styles from './til.module.css'

export const metadata = { title: 'TIL | Calix Wiki' }

const weekdayFormatter = new Intl.DateTimeFormat('ko-KR', { weekday: 'short' })
const monthFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
})

export default function TilListPage() {
  const entries = getTilEntries()
  const months = groupByMonth(entries)
  const latest = entries[0]
  const totalSections = entries.reduce((sum, entry) => sum + entry.sectionCount, 0)
  const activeDays = entries.length

  return (
    <main className={styles.wrapper}>
      <header className={styles.hero}>
        <div>
          <p className={styles.kicker}>Learning Journal</p>
          <h1 className={styles.heading}>Today I Learned</h1>
          <p className={styles.description}>
            날짜별 기록을 월, 주, 일 단위로 묶어 최근 흐름과 빈도를 빠르게 훑어볼 수 있습니다.
          </p>
        </div>
        <div className={styles.summaryGrid} aria-label="TIL summary">
          <SummaryMetric label="기록일" value={activeDays} />
          <SummaryMetric label="학습 항목" value={totalSections} />
          <SummaryMetric label="최근 기록" value={latest?.displayDate ?? '-'} />
        </div>
      </header>

      {entries.length === 0 ? (
        <section className={styles.empty}>아직 기록이 없습니다.</section>
      ) : (
        <div className={styles.layout}>
          <aside className={styles.monthRail} aria-label="월별 바로가기">
            <div className={styles.railTitle}>월별</div>
            {months.map((month) => (
              <a key={month.key} href={`#month-${month.key}`} className={styles.monthLink}>
                <span>{month.label}</span>
                <strong>{month.entries.length}</strong>
              </a>
            ))}
          </aside>

          <section className={styles.timeline} aria-label="TIL timeline">
            {months.map((month) => (
              <MonthSection key={month.key} month={month} />
            ))}
          </section>
        </div>
      )}
    </main>
  )
}

function SummaryMetric({ label, value }) {
  return (
    <div className={styles.metric}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function MonthSection({ month }) {
  return (
    <section id={`month-${month.key}`} className={styles.monthSection}>
      <header className={styles.monthHeader}>
        <div>
          <h2>{month.label}</h2>
          <p>{month.entries.length}일 기록, {month.sectionCount}개 학습 항목</p>
        </div>
      </header>

      <div className={styles.weekStack}>
        {month.weeks.map((week) => (
          <section key={week.key} className={styles.weekSection}>
            <div className={styles.weekHeader}>
              <span>{week.label}</span>
              <strong>{week.entries.length}일</strong>
            </div>
            <div className={styles.dayGrid}>
              {week.entries.map((entry) => (
                <Link key={entry.date} href={`/til/${entry.date}`} className={styles.dayCard}>
                  <span className={styles.dateLine}>
                    <strong>{entry.day}</strong>
                    <span>{entry.weekday}</span>
                  </span>
                  <span className={styles.cardDate}>{entry.date}</span>
                  <span className={styles.cardTitle}>{entry.title}</span>
                  <span className={styles.cardMeta}>
                    {entry.sectionCount} sections
                    {entry.tags.length > 0 ? ` · ${entry.tags.slice(0, 2).join(', ')}` : ''}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}

function getTilEntries() {
  const tilDir = path.join(process.cwd(), 'TIL')
  if (!fs.existsSync(tilDir)) {
    return []
  }

  return fs.readdirSync(tilDir)
    .filter((file) => /^\d{4}-\d{2}-\d{2}\.md$/.test(file))
    .sort()
    .reverse()
    .map((file) => {
      const date = file.replace('.md', '')
      const content = readTilFile(path.join(tilDir, file))
      const parsedDate = parseLocalDate(date)
      const headings = [...content.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].trim())
      const tags = [...new Set([...content.matchAll(/#([A-Za-z0-9_-]+)/g)].map((match) => `#${match[1]}`))]

      return {
        date,
        displayDate: `${parsedDate.getMonth() + 1}.${parsedDate.getDate()}`,
        day: String(parsedDate.getDate()).padStart(2, '0'),
        weekday: weekdayFormatter.format(parsedDate),
        monthKey: date.slice(0, 7),
        monthLabel: monthFormatter.format(parsedDate),
        weekKey: getWeekKey(parsedDate),
        weekLabel: `${getWeekOfMonth(parsedDate)}주차`,
        title: content ? headings[0] || normalizeTitle(content, date) : '읽기 권한이 필요한 기록',
        sectionCount: headings.length || 1,
        tags,
      }
    })
}

function readTilFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return ''
  }
}

function groupByMonth(entries) {
  const monthMap = new Map()

  for (const entry of entries) {
    if (!monthMap.has(entry.monthKey)) {
      monthMap.set(entry.monthKey, {
        key: entry.monthKey,
        label: entry.monthLabel,
        entries: [],
        weeks: new Map(),
        sectionCount: 0,
      })
    }

    const month = monthMap.get(entry.monthKey)
    month.entries.push(entry)
    month.sectionCount += entry.sectionCount

    if (!month.weeks.has(entry.weekKey)) {
      month.weeks.set(entry.weekKey, {
        key: entry.weekKey,
        label: entry.weekLabel,
        entries: [],
      })
    }
    month.weeks.get(entry.weekKey).entries.push(entry)
  }

  return [...monthMap.values()].map((month) => ({
    ...month,
    weeks: [...month.weeks.values()],
  }))
}

function parseLocalDate(date) {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function getWeekOfMonth(date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
  const firstMondayOffset = (firstDay.getDay() + 6) % 7
  return Math.ceil((date.getDate() + firstMondayOffset) / 7)
}

function getWeekKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-w${getWeekOfMonth(date)}`
}

function normalizeTitle(content, date) {
  const firstHeading = content.match(/^#\s+(.+)$/m)?.[1]?.trim()
  return firstHeading || `TIL ${date}`
}
