import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

export async function generateMetadata({ params }) {
  const { date } = await params
  return { title: `TIL ${date} | Calix Wiki` }
}

export default async function TilDetailPage({ params }) {
  const { date } = await params
  const tilDir = path.join(process.cwd(), 'TIL')
  const filePath = path.join(tilDir, `${date}.md`)

  if (!fs.existsSync(filePath)) {
    notFound()
  }

  let content
  try {
    content = fs.readFileSync(filePath, 'utf-8')
  } catch {
    notFound()
  }
  const allDates = fs.readdirSync(tilDir)
    .filter((file) => /^\d{4}-\d{2}-\d{2}\.md$/.test(file))
    .map((file) => file.replace('.md', ''))
    .sort()

  const currentIndex = allDates.indexOf(date)
  const prevDate = currentIndex > 0 ? allDates[currentIndex - 1] : null
  const nextDate = currentIndex < allDates.length - 1 ? allDates[currentIndex + 1] : null

  return (
    <main style={styles.wrapper}>
      <Link href="/til" style={styles.back}>← TIL 목록</Link>
      <header style={styles.header}>
        <p style={styles.kicker}>Daily Note</p>
        <h1 style={styles.heading}>{date}</h1>
      </header>
      <article style={styles.article}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {content}
        </ReactMarkdown>
      </article>
      <nav style={styles.nav} aria-label="TIL 날짜 이동">
        {prevDate ? (
          <Link href={`/til/${prevDate}`} style={styles.navLink}>← {prevDate}</Link>
        ) : <span />}
        {nextDate ? (
          <Link href={`/til/${nextDate}`} style={styles.navLink}>{nextDate} →</Link>
        ) : <span />}
      </nav>
    </main>
  )
}

const styles = {
  wrapper: {
    maxWidth: '920px',
    margin: '0 auto',
    padding: '2.5rem 1rem 4rem',
  },
  back: {
    display: 'inline-block',
    marginBottom: '1.25rem',
    color: '#0f766e',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: 700,
  },
  header: {
    marginBottom: '1.5rem',
    borderBottom: '1px solid var(--nextra-border, #e5e7eb)',
    paddingBottom: '1rem',
  },
  kicker: {
    margin: '0 0 0.35rem',
    color: '#6b7280',
    fontSize: '0.82rem',
    fontWeight: 800,
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  heading: {
    margin: 0,
    fontSize: '2rem',
    lineHeight: 1.2,
    fontWeight: 820,
    letterSpacing: 0,
  },
  article: {
    lineHeight: 1.8,
    fontSize: '0.96rem',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    marginTop: '2.25rem',
    paddingTop: '1rem',
    borderTop: '1px solid var(--nextra-border, #e5e7eb)',
  },
  navLink: {
    color: '#0f766e',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: 750,
  },
}
