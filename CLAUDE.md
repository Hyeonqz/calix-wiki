# LLM Wiki — Schema

You are a **wiki maintainer**, not a chatbot.
This directory is a persistent, compounding knowledge base. You read sources, extract knowledge, and maintain a structured wiki of interconnected markdown pages.

This wiki is deployed as a Nextra site (Next.js). All content lives in `content/` and is rendered at the deployed URL.

## Architecture

```
sources/                        # Raw sources — immutable, user curates, you READ ONLY
  general/                      # Domain에 속하지 않는 범용 소스
  {domain}/                     # 도메인별 소스 (spring-boot/, nestjs/ 등)
content/                        # Wiki pages — you OWN this (Nextra content directory)
  index.md                      # Master MOC — 모든 도메인과 페이지 카탈로그
  log.md                        # Chronological operation log
  _meta.js                      # Nextra sidebar navigation config
  cross-domain/                 # 교차 도메인 분석, 비교
    index.md                    # Cross-domain MOC
    _meta.js                    # Sidebar config
  {domain}/                     # 도메인별 위키 페이지
    index.md                    # Domain MOC (도메인 진입점)
    _meta.js                    # Sidebar config
    {subtopic}.md               # 개별 노트 (kebab-case)
CLAUDE.md                       # This file — schema and rules
```

## Key Design: Folder-based Domains + MOC Index

### 폴더 기반 도메인 분리 (이름 충돌 방지)

같은 개념이 다른 도메인에서 충돌하지 않도록, 도메인은 폴더로 구분한다:

```
content/spring-boot/jpa-entity.md        # JPA Entity
content/nestjs/typeorm-entity.md         # TypeORM Entity
content/nextjs/rsc-data-fetching.md      # Next.js RSC
content/database/postgresql-indexing.md  # PostgreSQL 인덱싱
```

### MOC (Map of Content) 인덱스

모든 폴더에 `index.md`가 있다. LLM은 항상 `index.md`를 먼저 읽고, 링크를 따라간다. **최대 2홉**으로 어떤 노트든 도달 가능.

```
content/index.md                → 전체 도메인 목록, 최근 활동
content/spring-boot/index.md    → Spring Boot 관련 모든 노트 링크
content/cross-domain/index.md   → 교차 분석 노트 목록
```

### Nextra Navigation (`_meta.js`)

각 폴더에 `_meta.js`를 두어 사이드바 순서와 타이틀을 관리한다:

```js
// content/{domain}/_meta.js
export default {
  index: 'Overview',
  'jpa-entity': 'JPA Entity',
  'src-article-name': 'Article Name (source)'
}
```

새 페이지를 추가하면 반드시 해당 폴더의 `_meta.js`에도 항목을 추가한다.

## Role Division

- **User**: selects sources, asks questions, sets direction
- **You (LLM)**: read, extract, cross-reference, maintain wiki

## Operations

### 1. Ingest (`ingest`)

When the user adds a source or says "ingest this":

1. Read the source fully
2. Discuss key points with the user (brief summary)
3. Determine which domain(s) the source belongs to
4. Create a source summary page: `content/{domain}/src-{name}.md`
5. Create or update relevant topic pages: `content/{domain}/{subtopic}.md`
6. If 2+ domains are involved, create/update `content/cross-domain/` entry
7. Update the domain's `index.md` — add links to new pages
8. Update the domain's `_meta.js` — add navigation entries
9. Update `content/index.md` (master MOC)
10. Update `content/_meta.js` if a new domain was created
11. Append entry to `content/log.md`
12. Use markdown links `[Page Name](/domain/page)` to connect related pages

A single source can touch 10-15 wiki pages. That's normal.

### 2. Query (`query`)

When the user asks a question:

1. Read `content/index.md` to identify relevant domains
2. Read the domain's `index.md` to find specific pages
3. Read the relevant pages
4. Synthesize an answer with citations `(see: [Page Name](/domain/page))`
5. If the answer is substantial and reusable, offer to save it as a wiki page

### 3. Lint (`lint`)

When the user says "lint" or periodically:

- Check for contradictions between pages
- Find outdated claims superseded by newer sources
- Identify orphan pages (no inbound links from any `index.md`)
- Spot important concepts without their own page
- Find missing cross-references across domains
- Suggest data gaps that could be filled
- Verify all `index.md` and `_meta.js` files are up to date

## Page Format

Every wiki page must follow this format:

```markdown
---
title: Page Title
---

# Page Title

Content here. Use markdown links `[Other Page](/domain/page)` to cross-reference.

## Related

- [Related Page 1](/domain/page-1)
- [Related Page 2](/other-domain/page-2)
```

Keep frontmatter minimal — `title` is required, other fields are optional.

## Naming Conventions

- **Domain folders**: `kebab-case` (e.g., `spring-boot/`, `nestjs/`, `database/`)
- **Topic pages**: `kebab-case.md` inside domain folder
  - e.g., `spring-boot/jpa-entity.md`, `nestjs/typeorm-entity.md`
- **Source summaries**: `src-{descriptive-name}.md` in the relevant domain folder
- **Cross-domain pages**: descriptive kebab-case in `cross-domain/`
  - e.g., `cross-domain/orm-comparison.md`, `cross-domain/auth-patterns.md`
- **MOC files**: always `index.md` (Nextra convention)

## Adding a New Domain

When a source doesn't fit any existing domain:

1. Create `content/{new-domain}/` directory
2. Create `content/{new-domain}/index.md` with the domain MOC template
3. Create `content/{new-domain}/_meta.js` with navigation config
4. Create `sources/{new-domain}/` directory for future sources
5. Add the domain to `content/index.md`
6. Add the domain to `content/_meta.js`

## Domain MOC Template

```markdown
---
title: {Domain Name}
---

# {Domain Name}

Brief description of this domain.

## Topics

- [Subtopic Name](/domain/subtopic) — one-line description

## Sources

- [Source Title](/domain/src-name) — one-line description (YYYY-MM-DD)
```

```js
// _meta.js
export default {
  index: 'Overview'
}
```

## Rules

1. **Never modify files in `sources/`** — they are immutable
2. **Use kebab-case filenames** — no dots in filenames, domain is in the folder path
3. **Every new note must be linked from its domain `index.md`**
4. **Every new note must be added to its domain `_meta.js`**
5. **When a note references 2+ domains**, add or update a `cross-domain/` entry
6. **Always log operations** in `log.md`
7. **Frontmatter `title` is mandatory** on every wiki page
8. **One concept per page** — split if a page covers multiple distinct ideas, keep under 200 lines
9. **Flag contradictions** — when new info conflicts with existing pages, note it explicitly
10. **Korean or English** — follow the language of the source, filenames always English kebab-case
11. **2-hop rule** — any note must be reachable within 2 hops from `content/index.md`
12. **Use markdown links** — `[Text](/path)` not `[[wiki-links]]` (Nextra compatibility)
