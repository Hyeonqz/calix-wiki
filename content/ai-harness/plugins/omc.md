---
title: Oh My ClaudeCode (OMC / OMX)
---

# Oh My ClaudeCode (OMC / OMX)

## 개요

Claude Code 위에 올라가는 **멀티 에이전트 오케스트레이션 레이어**. 단일 에이전트의 한계를 넘어, 전문화된 여러 에이전트를 조율하여 복잡한 작업을 처리한다.

OMC는 스킬/워크플로우 레이어, OMX는 MCP 도구 확장 레이어로 같은 oh-my-claudecode 시리즈이며 철학과 동작 원리가 동일하다.

## 철학

- **위임 우선** — 사소한 작업은 직접, 복잡한 작업은 전문 에이전트에 위임
- **검증 후 완료** — 작업 완료를 선언하기 전 반드시 검증 단계를 거침
- **최소 복잡도** — 품질을 유지하면서 가장 가벼운 경로를 선택
- **모델 라우팅** — haiku(빠른 조회), sonnet(표준), opus(심층 분석)으로 자동 라우팅

## 에이전트 카탈로그

| 에이전트 | 역할 |
|----------|------|
| executor | 구현 작업 실행 (Sonnet) |
| planner | 전략적 계획 수립 (Opus) |
| architect | 아키텍처 설계 및 디버깅 자문 (Opus, READ-ONLY) |
| code-reviewer | 코드 리뷰 (심각도 평가, SOLID 검증) |
| security-reviewer | 보안 취약점 탐지 (OWASP Top 10) |
| test-engineer | 테스트 전략, TDD |
| designer | UI/UX 디자인-개발 (Sonnet) |
| writer | 기술 문서 작성 (Haiku) |
| verifier | 검증 전략, 증거 기반 완료 확인 |
| debugger | 근본 원인 분석, 스택 트레이스 분석 |
| scientist | 데이터 분석 및 연구 |
| explorer | 코드베이스 탐색 |
| critic | 작업 계획 및 코드 리뷰 (Opus) |
| tracer | 증거 기반 인과 추적 |

---

## 스킬 카탈로그

주로 **실행 자동화**, **코드 품질**, **연구/문서**에 초점.

### 실행

| 스킬 | 트리거 | 역할 |
|------|--------|------|
| `autopilot` | `autopilot` | 아이디어→코드 완전 자율 실행 |
| `ralph` | `ralph` | 완료+검증까지 루프 반복 |
| `ultrawork` | `ulw` | 병렬 고속 작업 처리 |
| `ultraqa` | - | 테스트→수정 QA 순환 |
| `team` | `/team` | N개 에이전트 공유 태스크 리스트 협업 |
| `ralplan` | `ralplan` | 합의 계획 후 실행 |

### 계획 / 분석

| 스킬 | 트리거 | 역할 |
|------|--------|------|
| `plan` | - | 전략적 계획 수립 |
| `deep-interview` | `deep interview` | 소크라테스식 심층 인터뷰 |
| `deep-dive` | - | 인과조사→요구사항 결정화 (trace + deep-interview 2단계) |

### 코드 품질

| 스킬 | 트리거 | 역할 |
|------|--------|------|
| `ai-slop-cleaner` | `deslop`, `anti-slop` | AI 생성 코드 슬롭 정리 |
| `verify` | - | 완료 전 동작 검증 |
| `self-improve` | - | 자율 진화형 코드 개선 엔진 |

### 연구 / 문서

| 스킬 | 트리거 | 역할 |
|------|--------|------|
| `autoresearch` | - | 단일 미션 개선 루프 (마크다운 결정 로그) |
| `external-context` | - | 외부 웹/문서 병렬 검색 (document-specialist 에이전트) |
| `sciomc` | - | 병렬 과학자 에이전트 분석 (AUTO 모드) |
| `wiki` | - | 영구 마크다운 지식 베이스 |

### 개발 도구

| 스킬 | 트리거 | 역할 |
|------|--------|------|
| `deepinit` | - | 코드베이스 딥 초기화 (계층적 AGENTS.md 생성) |
| `project-session-manager` | - | 워크트리 기반 개발 환경 관리 |
| `release` | - | 릴리스 가이드 (RELEASE_RULE.md 캐시) |
| `debug` | - | 세션/저장소 진단 (로그, 트레이스, 상태) |
| `ccg` | `ccg` | Claude-Codex-Gemini 3모델 오케스트레이션 |
| `omc-teams` | - | tmux CLI 팀 런타임 (프로세스 기반 병렬) |

### 설정

| 스킬 | 트리거 | 역할 |
|------|--------|------|
| `setup` / `omc-setup` | `setup omc` | 설치/업데이트 |
| `omc-doctor` | - | 문제 진단 및 수정 |
| `mcp-setup` | - | MCP 서버 설정 |
| `configure-notifications` | - | 알림 설정 (Telegram, Discord, Slack) |
| `hud` | - | HUD 표시 설정 |
| `cancel` | `cancelomc` | 활성 모드 종료 |
| `skill` | - | 스킬 관리 (list, add, remove, edit) |

### 기타

| 스킬 | 트리거 | 역할 |
|------|--------|------|
| `remember` | - | 프로젝트 지식 저장 (project memory, notepad) |
| `learner` | - | 대화에서 학습 스킬 추출 |
| `skillify` | - | 현재 워크플로우→재사용 스킬 변환 |
| `visual-verdict` | - | 스크린샷-참조 시각적 QA |
| `writer-memory` | - | 작가용 메모리 (캐릭터, 관계, 장면 추적) |
| `trace` | - | 증거 주도 인과 추적 (경쟁 가설) |
| `ask` | - | Claude/Codex/Gemini 모델 라우팅 어드바이저 |

---

## OMX (MCP 도구 레이어)

OMX는 OMC의 MCP 서버 확장으로, Claude Code에 추가 도구를 제공한다.

| 도구 | 역할 |
|------|------|
| LSP 도구 | hover, goto definition, find references, rename 등 |
| AST grep | 구문 트리 기반 코드 검색/치환 |
| Python REPL | 인라인 Python 실행 |
| 상태 관리 | 세션 간 상태 읽기/쓰기/목록 |
| Notepad | 우선순위/작업/수동 노트 관리 |
| Project Memory | 프로젝트별 영구 메모리 |
| Shared Memory | 에이전트 간 공유 메모리 |
| Wiki 도구 | 지식 베이스 ingest/query/lint |
| 세션 검색 | 과거 세션 검색 |
| 트레이스 | 타임라인/요약 |

## Related

- [Superpowers](/ai-harness/plugins/superpowers)
- [Hermes Agent](/ai-harness/agents/hermes)
- [Ouroboros](/ai-harness/agents/ouroboros)
