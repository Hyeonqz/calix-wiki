---
title: Source — WikiDocs 기초
---

# WikiDocs 기초 학습 정리

**출처:**
- [WikiDocs 클로드 코드 가이드](https://wikidocs.net/book/19104)
- [Claude Code 공식 문서 (한국어)](https://code.claude.com/docs/ko/overview)

**ingest 일자:** 2026-04-15

## 다룬 주제

WikiDocs 기초 챕터에서 학습한 내용을 7개 페이지로 추출:

### 세션과 CLI

- [Sessions](/claude-code/sessions) — 세션 시작/이어하기/이름/체크포인트 되감기/보관 기간
- [CLI Essentials](/claude-code/cli-essentials) — `@` 파일 참조, `/` 슬래시 명령, 멀티라인 입력

### 자율권과 안전

- [Permission Modes](/claude-code/permission-modes) — 6개 모드 (Plan / Default / Auto-accept / Auto / Don't Ask / Bypass)
- [Plan Mode](/claude-code/plan-mode) — 계획 후 실행 워크플로우
- [Permission Rules](/claude-code/permission-rules) — `/permissions`, deny 규칙, defense-in-depth

### 컨텍스트와 메모리

- [Context Management](/claude-code/context-management) — `/clear`, `/compact`, `/context`, 자동 압축
- [CLAUDE.md Best Practices](/claude-code/claude-md-best-practices) — 무엇을 넣고 무엇을 빼나, 200줄 룰

## 핵심 인사이트

이번 학습에서 일관되게 강조된 메시지 세 가지:

1. **자율권은 점진적으로** — 신뢰가 쌓이면 모드를 한 단계씩 올리고, 위험은 deny로 봉쇄
2. **방향 수정 비용 > 코딩 비용** — Plan 모드, `/clear`로 실패 시도 정리
3. **CLAUDE.md는 코드에서 추론 불가능한 것만** — 길수록 주의력 분산

## 아직 다루지 않은 영역

다음 학습 우선순위:

- **Hooks** (defense-in-depth의 두 번째 층)
- **Sandbox** (defense-in-depth의 세 번째 층)
- **Skills** (자주 안 쓰는 지침을 분리해 필요 시만 로드)
- **Subagents**
- **MCP 서버** — `/mcp`로 서버별 토큰 비용 확인 가능
