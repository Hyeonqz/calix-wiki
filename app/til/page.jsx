import fs from 'fs'
import path from 'path'
import Link from 'next/link'

export const metadata = { title: 'TIL | Calix Wiki' }

export default function TilListPage() {
  const tilDir = path.join(process.cwd(), 'TIL')
  const files = fs.existsSync(tilDir)
    ? fs.readdirSync(tilDir).filter((f) => f.endsWith('.md')).sort().reverse()
    : []

  const dates = files.map((f) => f.replace('.md', ''))

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.heading}>Today I Learned</h1>
      {dates.length === 0 ? (
        <p style={styles.empty}>아직 기록이 없습니다.</p>
      ) : (
        <ul style={styles.list}>
          {dates.map((date) => (
            <li key={date} style={styles.item}>
              <Link href={`/til/${date}`} style={styles.link}>
                📅 {date}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const styles = {
  wrapper: {
    maxWidth: '680px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  heading: {
    fontSize: '1.75rem',
    fontWeight: 700,
    marginBottom: '1.5rem',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  item: {
    borderBottom: '1px solid var(--nextra-border, #e5e7eb)',
    paddingBottom: '0.5rem',
  },
  link: {
    fontSize: '1rem',
    textDecoration: 'none',
    color: '#2563eb',
    fontWeight: 500,
  },
  empty: {
    color: '#6b7280',
  },
}
