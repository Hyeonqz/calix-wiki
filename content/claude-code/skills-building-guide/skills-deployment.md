---
title: Skills 배포
---

# Skills 배포

스킬 배포 모델, API 사용법, 그리고 효과적인 스킬 포지셔닝을 다룬다.

## 배포 모델 (2026년 1월 기준)

### 개별 사용자

1. 스킬 폴더 다운로드 (또는 `git clone`)
2. 폴더 압축 (.zip)
3. 설정 > 기능 > 스킬을 통해 Claude.ai에 업로드
4. 또는 Claude Code 스킬 디렉터리에 배치

### 조직 수준

- 관리자가 워크스페이스 전체에 스킬 배포 가능 (2025년 12월 출시)
- 자동 업데이트, 중앙화된 관리

## 오픈 표준

Anthropic은 에이전트 스킬을 오픈 표준으로 게시했다. MCP와 마찬가지로 스킬은 도구와 플랫폼 간에 이식 가능해야 한다. `compatibility` 필드로 플랫폼 특화 여부를 표시할 수 있다.

## API를 통한 스킬 사용

| 기능 | 설명 |
|---|---|
| `/v1/skills` 엔드포인트 | 스킬 목록 및 관리 |
| `container.skills` 파라미터 | Messages API 요청에 스킬 추가 |
| Claude Console | 버전 제어 및 관리 |
| Agent SDK | 커스텀 에이전트 구축과 함께 사용 |

> API의 스킬은 **Code Execution Tool 베타**가 필요하며, 스킬 실행을 위한 보안 환경을 제공한다.

### 플랫폼 선택 기준

| 사용 사례 | 최적 플랫폼 |
|---|---|
| 최종 사용자 직접 상호작용 | Claude.ai / Claude Code |
| 개발 중 수동 테스트 | Claude.ai / Claude Code |
| 개별 즉석 워크플로 | Claude.ai / Claude Code |
| 프로그래밍 방식 사용 | API |
| 규모의 프로덕션 배포 | API |
| 자동화된 파이프라인/에이전트 시스템 | API |

## GitHub 호스팅 (권장)

1. **공개 저장소** — 오픈 소스 스킬, 설치 지침이 있는 README
2. **MCP 저장소에 문서화** — MCP 문서에서 스킬로 링크, 빠른 시작 가이드
3. **설치 가이드 작성:**

```markdown
## 스킬 설치

1. 저장소 클론: `git clone https://github.com/company/skills`
2. Claude.ai > 설정 > 스킬 > "스킬 업로드" > 스킬 폴더 선택
3. 스킬 활성화 + MCP 서버 연결 확인
4. 테스트: "[서비스]에서 새 프로젝트 설정해줘"
```

## 스킬 포지셔닝

**기능이 아닌 결과에 집중:**

```
# 좋음
"ProjectHub 스킬로 팀은 수동 설정에 30분을 보내는 대신
완전한 프로젝트 워크스페이스를 몇 초 만에 설정할 수 있습니다."

# 나쁨
"ProjectHub 스킬은 MCP 서버 도구를 호출하는 YAML 프론트매터와
마크다운 명령어를 포함하는 폴더입니다."
```

**MCP + 스킬 스토리 강조:**

```
MCP 서버는 Claude에게 Linear 프로젝트에 대한 접근을 제공합니다.
스킬은 Claude에게 팀의 스프린트 계획 워크플로를 가르칩니다.
함께하면 AI 기반 프로젝트 관리가 가능합니다.
```

## Related

- [Skills 개요](/claude-code/skills-building-guide/skills-overview) — 스킬 개념, 설계 원칙
- [Skills 개발 가이드](/claude-code/skills-building-guide/skills-development) — 사용 사례, 명령어 작성법
- [Skills 테스트](/claude-code/skills-building-guide/skills-testing) — 테스트, skill-creator
