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

## [2026-04-15] ingest | Claude Skills 구축 완벽 가이드

Anthropic 공식 "The Complete Guide to Building Skills for Claude"를 학습. 스킬의 개념/설계 원칙/파일 구조/프론트매터/사용 사례 3대 카테고리/성공 기준/명령어 작성법/테스트 방법론/배포 모델/API/워크플로 패턴 5가지/트러블슈팅을 5개 토픽 페이지 + 1개 소스 요약으로 분해.

생성된 페이지:
- `claude-code/skills-overview.md` — 스킬 개념, 설계 원칙(점진적 공개/조합성/이식성), 파일 구조, 프론트매터, MCP 관계
- `claude-code/skills-development.md` — 사용 사례 정의, 3대 카테고리(문서생성/워크플로자동화/MCP강화), 성공 기준, 명령어 작성법
- `claude-code/skills-testing.md` — 트리거/기능/성능 테스트, skill-creator 사용법, 피드백 기반 반복
- `claude-code/skills-deployment.md` — 배포 모델(개인/조직), 오픈 표준, API, 포지셔닝
- `claude-code/skills-patterns.md` — 5가지 워크플로 패턴, 트러블슈팅, 빠른 체크리스트
- `claude-code/src-skills-building-guide.md` — 소스 요약, 핵심 인사이트 7개

업데이트된 파일:
- `claude-code/index.md` — "스킬" 섹션 추가, skills를 학습 예정에서 제거, Sources에 소스 추가
- `claude-code/_meta.js` — 사이드바에 6개 항목 추가

다음 학습 우선순위: hooks → sandbox → subagents → MCP.

## [2026-04-15] refactor | Skills 페이지를 하위 카테고리로 재구성

기존 `claude-code/skills-*.md` 6개 플랫 파일을 `claude-code/skills-building-guide/` 하위 섹션으로 재구성. 하나의 소스(Anthropic 공식 가이드 PDF)에서 나온 내용을 응집된 서브 카테고리로 묶음.

변경 사항:
- `content/claude-code/skills-building-guide/` 디렉터리 생성 (index.md + _meta.js)
- 5개 토픽 페이지 이동: skills-overview, skills-development, skills-testing, skills-deployment, skills-patterns
- `src-skills-building-guide.md` 제거 → 소스 요약을 하위 섹션 index.md에 통합
- 모든 내부 링크를 새 경로로 수정
- 부모 `claude-code/index.md`, `_meta.js` 업데이트
