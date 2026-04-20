---
title: Skills 개요
---

# Skills 개요

**스킬(Skill)**은 Claude가 특정 작업이나 워크플로를 처리하는 방법을 가르치는 명령어 집합으로, 간단한 폴더 형태로 패키징된다. 매번 대화할 때마다 선호도, 프로세스, 도메인 전문 지식을 다시 설명하는 대신, 스킬을 통해 한 번만 가르치고 재사용할 수 있다.

## 스킬이란?

스킬은 다음을 포함하는 폴더다:

| 파일/폴더 | 필수 여부 | 역할 |
|---|---|---|
| `SKILL.md` | **필수** | YAML 프론트매터 + 마크다운 명령어 |
| `scripts/` | 선택 | 실행 가능한 코드 (Python, Bash 등) |
| `references/` | 선택 | 필요 시 로드되는 문서 |
| `assets/` | 선택 | 템플릿, 폰트, 아이콘 등 |

## 핵심 설계 원칙

### 점진적 공개 (Progressive Disclosure)

스킬은 3단계 시스템으로 토큰을 최소화하면서 전문 지식을 유지한다:

1. **1단계 — YAML 프론트매터**: 항상 시스템 프롬프트에 로드. 스킬의 트리거 조건만 제공
2. **2단계 — SKILL.md 본문**: Claude가 관련성을 판단하면 로드. 전체 명령어 포함
3. **3단계 — 링크된 파일**: `scripts/`, `references/`, `assets/` 등. 필요 시 탐색

### 조합성 (Composability)

여러 스킬을 동시에 로드 가능. 스킬은 유일한 기능이라고 가정해서는 안 된다.

### 이식성 (Portability)

Claude.ai, Claude Code, API 전반에서 동일하게 동작. 단, 환경이 필요한 의존성을 지원해야 한다.

## 파일 구조

```
your-skill-name/
├── SKILL.md              # 필수 - 메인 스킬 파일
├── scripts/              # 선택 - 실행 가능한 코드
├── references/           # 선택 - 문서
└── assets/               # 선택 - 템플릿 등
```

### 명명 규칙

| 항목 | 규칙 | 예시 |
|---|---|---|
| 스킬 폴더 | kebab-case, 공백/밑줄/대문자 금지 | `notion-project-setup` |
| SKILL.md | 정확히 `SKILL.md` (대소문자 구분) | - |
| README.md | 스킬 폴더 안에 포함하지 않음 | - |

## YAML 프론트매터

스킬에서 **가장 중요한 부분**. Claude가 스킬 로드 여부를 결정하는 기준이다.

### 필수 필드

```yaml
---
name: your-skill-name        # kebab-case, 폴더명과 일치
description: 무엇을 하는지. 사용자가 [특정 문구]를 요청할 때 사용합니다.
---
```

### 선택 필드

```yaml
license: MIT                              # 오픈 소스 라이선스
compatibility: "Claude Code 전용"          # 환경 요구사항 (1-500자)
allowed-tools: "Bash(python:*) WebFetch"  # 도구 접근 제한
metadata:
  author: Company Name
  version: 1.0.0
  mcp-server: server-name
```

### 보안 제한

- XML 꺾쇠괄호 (`< >`) 금지 — 프론트매터는 시스템 프롬프트에 나타나므로 인젝션 위험
- "claude" 또는 "anthropic" 접두사로 명명된 스킬 금지 (예약어)

## description 필드 작성법

`[무엇을 하는지]` + `[언제 사용하는지]` + `[핵심 기능]` 구조:

```yaml
# 좋음 - 구체적이고 트리거 문구 포함
description: Figma 디자인 파일을 분석하고 개발자 핸드오프 문서를 생성합니다.
  사용자가 "디자인 스펙", "컴포넌트 문서"를 요청할 때 사용합니다.

# 나쁨 - 너무 모호하고 트리거 없음
description: 프로젝트에 도움을 줍니다.
```

## MCP와의 관계

| MCP (연결성) | 스킬 (지식) |
|---|---|
| Claude를 서비스에 **연결** | Claude가 서비스를 효과적으로 **사용하는 방법** 교육 |
| 실시간 데이터 접근 및 도구 호출 제공 | 워크플로 및 모범 사례 캡처 |
| Claude가 **할 수 있는 것** | Claude가 **어떻게 해야 하는지** |

비유: MCP는 **전문 주방**(도구/재료/장비), 스킬은 **레시피**(단계별 명령어).

## Related

- [Skills 개발 가이드](/claude-code/skills-development) — 사용 사례, 성공 기준, 명령어 작성
- [Skills 테스트](/claude-code/skills-testing) — 트리거/기능/성능 테스트, skill-creator
- [Skills 배포](/claude-code/skills-deployment) — 배포 모델, API, 포지셔닝
- [Skills 패턴 및 트러블슈팅](/claude-code/skills-patterns) — 5가지 워크플로 패턴, 문제 해결
- [CLAUDE.md 작성법](/claude-code/claude-md-best-practices) — 프로젝트 지침 파일
