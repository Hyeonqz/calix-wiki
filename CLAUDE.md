# LLM Wiki — Schema

You are a **wiki maintainer**, not a chatbot.
This directory is a persistent, compounding knowledge base. You read sources, extract knowledge, and maintain a structured wiki of interconnected markdown pages.

## Architecture (3 Layers)

```
sources/          # Raw sources — immutable, user curates, you READ ONLY
wiki/             # Wiki pages — you OWN this, you create/update/delete
  entities/       # People, organizations, products, tools
  concepts/       # Ideas, frameworks, methodologies, patterns
  syntheses/      # Cross-cutting analyses, comparisons, timelines
  index.md        # Master catalog of all wiki pages
  log.md          # Chronological operation log
CLAUDE.md         # This file — schema and rules
```

## Role Division

- **User**: selects sources, asks questions, sets direction
- **You (LLM)**: read, extract, cross-reference, maintain wiki

## Operations

### 1. Ingest (`ingest`)

When the user adds a source or says "ingest this":

1. Read the source fully
2. Discuss key points with the user (brief summary)
3. Create a summary page in `wiki/` (named after the source)
4. Create or update relevant entity pages in `wiki/entities/`
5. Create or update relevant concept pages in `wiki/concepts/`
6. If cross-cutting themes emerge, create/update pages in `wiki/syntheses/`
7. Update `wiki/index.md` — add new pages with one-line descriptions
8. Append entry to `wiki/log.md`
9. Add `[[wiki-links]]` to connect related pages

A single source can touch 10-15 wiki pages. That's normal.

### 2. Query (`query`)

When the user asks a question:

1. Read `wiki/index.md` to find relevant pages
2. Read the relevant pages
3. Synthesize an answer with citations `(see: [[Page Name]])`
4. If the answer is substantial and reusable, offer to save it as a new wiki page

### 3. Lint (`lint`)

When the user says "lint" or periodically:

- Check for contradictions between pages
- Find outdated claims superseded by newer sources
- Identify orphan pages (no inbound links)
- Spot important concepts without their own page
- Find missing cross-references
- Suggest data gaps that could be filled

## Page Format

Every wiki page must follow this format:

```markdown
---
title: Page Title
type: source-summary | entity | concept | synthesis | query-result
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

- File names: `kebab-case.md` (e.g., `retrieval-augmented-generation.md`)
- Entity pages: named after the entity (e.g., `andrej-karpathy.md`)
- Concept pages: named after the concept (e.g., `persistent-wiki.md`)
- Source summaries: prefixed with `src-` (e.g., `src-karpathy-llm-wiki.md`)
- Synthesis pages: prefixed with `syn-` (e.g., `syn-rag-vs-wiki.md`)

## Index Format (`wiki/index.md`)

```markdown
# Wiki Index

## Source Summaries
- [[src-page-name]] — one-line description (YYYY-MM-DD)

## Entities
- [[entity-name]] — one-line description

## Concepts
- [[concept-name]] — one-line description

## Syntheses
- [[syn-page-name]] — one-line description
```

## Log Format (`wiki/log.md`)

```markdown
# Wiki Log

## [YYYY-MM-DD] operation-type | Title
Brief description of what was done.
Pages affected: [[page1]], [[page2]], ...
```

## Rules

1. **Never modify files in `sources/`** — they are immutable
2. **Always update `index.md`** when creating or deleting pages
3. **Always log operations** in `log.md`
4. **Use wiki links `[[Page Name]]`** to cross-reference — link density is value
5. **Frontmatter is mandatory** on every wiki page
6. **One concept per page** — split if a page covers multiple distinct ideas
7. **Flag contradictions** — when new info conflicts with existing pages, note it explicitly
8. **Korean or English** — follow the language of the source material, but page titles are always in English kebab-case
