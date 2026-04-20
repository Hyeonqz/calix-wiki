---
title: Claude Code
---

# Claude Code

Anthropic의 공식 CLI 코딩 에이전트. 터미널, 데스크탑 앱, 웹, IDE 확장 등 여러 서피스에서 동작하며, 파일 편집/명령 실행/도구 호출/서브에이전트 위임 등의 기능으로 소프트웨어 엔지니어링 작업을 보조합니다.

> 이 도메인은 [WikiDocs Claude Code 가이드](https://wikidocs.net/book/19104)와 [공식 문서(한국어)](https://code.claude.com/docs/ko/overview)를 1차 소스로 학습하며 점진적으로 확장됩니다.

## Topics

### 세션과 CLI

- [Sessions](/claude-code/sessions) — 세션 시작/이어하기/이름/체크포인트 되감기/보관 기간
- [CLI Essentials](/claude-code/cli-essentials) — `@` 파일 참조, `/` 슬래시 명령, 멀티라인 입력

### 자율권과 안전

- [Permission Modes](/claude-code/permission-modes) — Plan / Default / Auto-accept / Auto / Don't Ask / Bypass 6개 모드
- [Plan Mode](/claude-code/plan-mode) — 실행 전 계획만 세우기, 가장 자주 쓰는 패턴
- [Permission Rules](/claude-code/permission-rules) — `/permissions`, allow/ask/deny 규칙, defense-in-depth

### 컨텍스트와 메모리

- [Context Management](/claude-code/context-management) — `/clear`, `/compact`, `/context`, 자동 압축
- [CLAUDE.md Best Practices](/claude-code/claude-md-best-practices) — 무엇을 넣고 무엇을 빼나, 200줄 룰

### 스킬

- [Skills 구축 완벽 가이드](/claude-code/skills-building-guide) — Anthropic 공식 가이드 정리. 개념/개발/테스트/배포/패턴 5개 하위 페이지

### 학습 예정

- `hooks` — 도구 호출 전후 검증 로직, defense-in-depth 2층
- `sandbox` — 격리 실행 환경, defense-in-depth 3층
- `subagents` — Agent 도구, 작업 위임 패턴
- `mcp-servers` — Model Context Protocol 서버 통합
- `ide-integration` — VS Code, JetBrains 등
- `workflows` — 일반적인 작업 패턴 (PR 리뷰, 디버깅, 리팩토링)

## Sources

- [Source — WikiDocs 기초](/claude-code/src-wikidocs-foundations) — 2026-04-15 ingest. 세션·권한·컨텍스트·CLAUDE.md 4개 영역
- [Skills 구축 완벽 가이드](/claude-code/skills-building-guide) — 2026-04-15 ingest. Anthropic 공식 스킬 가이드 (하위 섹션)

## Cross-Domain

학습이 진행되면 아래 교차 분석 페이지가 추가될 수 있습니다:

- `cross-domain/agent-orchestration` — Claude Code subagent vs OMC vs MCP 비교
- `cross-domain/llm-coding-tools` — Claude Code vs Cursor vs Codex vs Aider
