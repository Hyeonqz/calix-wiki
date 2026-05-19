import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'

export async function generateMetadata({ params }) {
  const { date } = await params
  return { title: `TIL ${date} | Calix Wiki` }
}

export default async function TilDetailPage({ params }) {
  const { date } = await params
  const filePath = path.join(process.cwd(), 'TIL', `${date}.md`)

  if (!fs.existsSync(filePath)) {
    notFound()
  }

  const content = fs.readFileSync(filePath, 'utf-8')

  return (
    <div style={styles.wrapper}>
      <Link href="/til" style={styles.back}>← 목록으로</Link>
      <h1 style={styles.heading}>{date}</h1>
      <article style={styles.article}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </article>
    </div>
  )
}

const styles = {
  wrapper: {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  back: {
    display: 'inline-block',
    marginBottom: '1.25rem',
    color: '#2563eb',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
  heading: {
    fontSize: '1.75rem',
    fontWeight: 700,
    marginBottom: '1.5rem',
    borderBottom: '1px solid var(--nextra-border, #e5e7eb)',
    paddingBottom: '0.75rem',
  },
  article: {
    lineHeight: 1.8,
    fontSize: '0.95rem',
  },
}
