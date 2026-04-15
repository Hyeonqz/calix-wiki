---
title: Activity Log
---

# Activity Log

위키 작업(ingest, query, lint)의 시간순 기록.

## [2026-04-11] init | Wiki Initialized

Wiki structure created with Dendron hierarchy + MOC index pattern.
Schema defined in CLAUDE.md.

## [2026-04-15] scaffold | claude-code domain created

`claude-code` 도메인 골격 생성. 학습 소스로 [WikiDocs](https://wikidocs.net/book/19104)와 [공식 한국어 문서](https://code.claude.com/docs/ko/overview)를 사용 예정.

생성된 파일:
- `sources/claude-code/README.md` — 학습 소스 카탈로그
- `content/claude-code/index.md` — 도메인 MOC (계획된 토픽 목록 포함)
- `content/claude-code/_meta.js` — 사이드바 설정

업데이트된 파일:
- `content/index.md` — claude-code 도메인 등록
- `content/_meta.js` — 최상위 사이드바에 claude-code 추가

## [2026-04-15] ingest | WikiDocs 기초 4개 챕터

WikiDocs/공식문서의 기초 4개 영역(대화와 세션 / 자율권과 안전 / 컨텍스트 관리 / CLAUDE.md 잘 쓰는 방법)을 학습. 그대로 옮기지 않고 핵심만 추려 7개 토픽 페이지 + 1개 소스 요약으로 분해.

생성된 페이지:
- `claude-code/sessions.md` — 세션 시작/이어하기/체크포인트/보관기간
- `claude-code/cli-essentials.md` — `@`, `/`, 멀티라인 입력
- `claude-code/permission-modes.md` — 6개 권한 모드 (Auto는 Team/Enterprise/API 한정)
- `claude-code/plan-mode.md` — 실행 전 계획 워크플로우
- `claude-code/permission-rules.md` — `/permissions` + deny 1차 방어선 + defense-in-depth
- `claude-code/context-management.md` — `/clear`/`/compact`/`/context` + 자동압축 환경변수
- `claude-code/claude-md-best-practices.md` — 추론 불가능한 것만, 200줄 룰, `@` 임포트
- `claude-code/src-wikidocs-foundations.md` — 소스 요약 + 다음 학습 우선순위

업데이트된 파일:
- `claude-code/index.md` — Topics를 학습완료/예정으로 재구성, Sources 섹션 추가
- `claude-code/_meta.js` — 사이드바에 8개 항목 추가 (학습 흐름 순서로 정렬)

다음 학습 우선순위: hooks → sandbox → skills → subagents → MCP.
