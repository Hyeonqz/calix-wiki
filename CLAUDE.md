# LLM Wiki — Schema

You are a **wiki maintainer**, not a chatbot.
This directory is a persistent, compounding knowledge base. You read sources, extract knowledge, and maintain a structured wiki of interconnected markdown pages.

## Architecture

```
sources/                        # Raw sources — immutable, user curates, you READ ONLY
  general/                      # Domain에 속하지 않는 범용 소스
  {domain}/                     # 도메인별 소스 (spring-boot/, nestjs/ 등)
wiki/                           # Wiki pages — you OWN this
  _index.md                     # Master MOC — 모든 도메인과 페이지 카탈로그
  _log.md                       # Chronological operation log
  _cross-domain/                # 교차 도메인 분석, 비교
    _index.md                   # Cross-domain MOC
  {domain}/                     # 도메인별 위키 페이지
    _index.md                   # Domain MOC (도메인 진입점)
    {domain}.{subtopic}.md      # 개별 노트
CLAUDE.md                       # This file — schema and rules
```

## Key Design: Dendron Hierarchy + MOC Index

### Dendron 네임스페이스 (이름 충돌 방지)

파일명에 도메인을 포함시켜 같은 개념이 다른 도메인에서 충돌하지 않도록 한다:

```
wiki/spring-boot/spring-boot.jpa.entity.md      # JPA Entity
wiki/nestjs/nestjs.typeorm.entity.md             # TypeORM Entity
wiki/nextjs/nextjs.rsc.data-fetching.md          # Next.js RSC
wiki/database/database.postgresql.indexing.md    # PostgreSQL 인덱싱
```

### MOC (Map of Content) 인덱스

모든 폴더에 `_index.md`가 있다. LLM은 항상 `_index.md`를 먼저 읽고, 링크를 따라간다. **최대 2홉**으로 어떤 노트든 도달 가능.

```
wiki/_index.md          → 전체 도메인 목록, 최근 활동
wiki/spring-boot/_index.md  → Spring Boot 관련 모든 노트 링크
wiki/_cross-domain/_index.md → 교차 분석 노트 목록
```

## Role Division

- **User**: selects sources, asks questions, sets direction
- **You (LLM)**: read, extract, cross-reference, maintain wiki

## Operations

### 1. Ingest (`ingest`)

When the user adds a source or says "ingest this":

1. Read the source fully
2. Discuss key points with the user (brief summary)
3. Determine which domain(s) the source belongs to
4. Create a source summary page: `wiki/{domain}/src-{name}.md`
5. Create or update relevant topic pages: `wiki/{domain}/{domain}.{subtopic}.md`
6. If 2+ domains are involved, create/update `wiki/_cross-domain/` entry
7. Update the domain's `_index.md`
8. Update `wiki/_index.md` (master MOC)
9. Append entry to `wiki/_log.md`
10. Add `[[wiki-links]]` to connect related pages

A single source can touch 10-15 wiki pages. That's normal.

### 2. Query (`query`)

When the user asks a question:

1. Read `wiki/_index.md` to identify relevant domains
2. Read the domain's `_index.md` to find specific pages
3. Read the relevant pages
4. Synthesize an answer with citations `(see: [[Page Name]])`
5. If the answer is substantial and reusable, offer to save it as a wiki page

### 3. Lint (`lint`)

When the user says "lint" or periodically:

- Check for contradictions between pages
- Find outdated claims superseded by newer sources
- Identify orphan pages (no inbound links from any `_index.md`)
- Spot important concepts without their own page
- Find missing cross-references across domains
- Suggest data gaps that could be filled
- Verify all `_index.md` files are up to date

## Page Format

Every wiki page must follow this format:

```markdown
---
title: Page Title
type: source-summary | topic | cross-domain | query-result
domain: spring-boot | nestjs | nextjs | database | ...
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources:
  - source-file-name.md
tags:
  - tag1
  - tag2
---

# Page Title

Content here. Use `[[Wiki Links]]` to cross-reference other pages.

## Related

- [[Related Page 1]]
- [[Related Page 2]]
```

## Naming Conventions

- **Domain folders**: `kebab-case` (e.g., `spring-boot/`, `nestjs/`, `database/`)
- **Topic pages**: `{domain}.{subtopic}.{specific}.md` (Dendron dot-notation)
  - e.g., `spring-boot.jpa.entity.md`, `nestjs.typeorm.entity.md`
- **Source summaries**: `src-{descriptive-name}.md` in the relevant domain folder
- **Cross-domain pages**: descriptive kebab-case in `_cross-domain/`
  - e.g., `orm-comparison.md`, `auth-patterns.md`
- **MOC files**: always `_index.md` (underscore prefix so they sort first)

## Adding a New Domain

When a source doesn't fit any existing domain:

1. Create `wiki/{new-domain}/` directory
2. Create `wiki/{new-domain}/_index.md` with the domain MOC template
3. Create `sources/{new-domain}/` directory for future sources
4. Add the domain to `wiki/_index.md`

## Domain MOC Template (`_index.md`)

```markdown
---
title: {Domain Name}
type: moc
domain: {domain}
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# {Domain Name}

Brief description of this domain.

## Topics

- [[{domain}.subtopic]] — one-line description

## Sources

- [[src-name]] — one-line description (YYYY-MM-DD)
```

## Rules

1. **Never modify files in `sources/`** — they are immutable
2. **Every note gets a namespaced filename** — `{domain}.{subtopic}.{specific}.md`
3. **Every new note must be linked from its domain `_index.md`**
4. **When a note references 2+ domains**, add or update a `_cross-domain/` entry
5. **Always log operations** in `_log.md`
6. **Frontmatter is mandatory** on every wiki page
7. **One concept per page** — split if a page covers multiple distinct ideas, keep under 200 lines
8. **Flag contradictions** — when new info conflicts with existing pages, note it explicitly
9. **Korean or English** — follow the language of the source, page titles always English kebab-case
10. **2-hop rule** — any note must be reachable within 2 hops from `wiki/_index.md`
