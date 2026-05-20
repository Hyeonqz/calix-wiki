---
title: CLAUDE.md Best Practices
---

# CLAUDE.md 작성법

CLAUDE.md는 **Claude가 코드에서 추론할 수 없는 것**만 적는 라이브 문서. 코드처럼 정기적으로 다듬어야 한다.

## 핵심 원리

> Claude Code 창시자 Boris의 운영 방식:
>
> *"Claude가 실수할 때마다 CLAUDE.md에 추가한다. 그러면 다음에는 같은 실수를 하지 않는다."*
>
> *"수정을 마치면 'CLAUDE.md에 이 규칙을 추가해'라고 말한다."*

Boris의 팀 CLAUDE.md에는 **코딩 스타일 규칙이 없다**. 워크플로우 명령어와 순서만 있다. 코드에서 추론할 수 있는 것은 빼는 것이 핵심.

## 넣어야 할 것

- Claude가 추측할 수 없는 명령어 (빌드 / 테스트 / 린트)
- 기본값과 다른 코드 스타일 규칙
- 저장소 관례 (브랜치 네이밍, PR 규칙)
- 프로젝트 고유의 아키텍처 결정
- 비개발 업무의 문서 형식·톤·반복 패턴

## 빼야 할 것

- 코드를 읽으면 알 수 있는 것
- 언어의 표준 관례 (Claude는 이미 알고 있음)
- 자주 바뀌는 정보
- 긴 설명이나 튜토리얼
- 파일별 상세 설명
- *"깔끔하게 작성"* 같은 자명한 지시

한 줄을 적을 때마다 *"이걸 빼면 Claude가 실수할까?"*를 따져본다. 아니라면 빼는 것이 낫다. *"깔끔하게 작성"*보다 *"들여쓰기 2칸, 세미콜론 생략"*이 효과적이다.

## 200줄 룰

CLAUDE.md는 길이에 관계없이 **전체가 로드된다** (200줄에서 잘리는 게 아님). 문제는 LLM 본질에 있다. 지시가 많아질수록 개별 지시에 대한 주의력이 분산되어, 정작 중요한 규칙을 놓친다.

> 공식 문서: *"CLAUDE.md가 너무 길면 절반을 무시한다."*

200줄을 넘으면 **분리**한다.

## `@` 임포트로 분리

CLAUDE.md 안에서 다른 파일을 가져올 수 있다. 임포트된 파일은 세션 시작 시 함께 로드된다.

```markdown
# 프로젝트 개요
@README.md 참고

# Git 워크플로우
@docs/git-instructions.md

# 개인 설정 (Git에 포함되지 않음)
@~/.claude/my-project-instructions.md
```

다른 방법: `.claude/rules/` 디렉토리에 규칙 파일을 나눠 둔다. **자주 쓰지 않는 전문 지침은 스킬로 분리**하면 필요할 때만 로드된다.

## 압축 후에도 살아남는다

`/compact`나 `/clear` 후에도 **CLAUDE.md는 디스크에서 다시 로드되어 컨텍스트에 주입**된다. 매번 반복해야 하는 중요한 규칙은 대화에 적지 말고 CLAUDE.md에 적어두면 압축 후에도 유실되지 않는다. ([Context Management](/claude-code/context-management) 참고)

## 보안 주의

- **API 키 / 비밀번호 절대 금지** — 프로젝트 CLAUDE.md는 Git에 커밋되므로 노출
- 개인 비밀은 `~/.claude/` 아래의 글로벌 파일이나 환경변수로

## Related

- [Context Management](/claude-code/context-management) — 압축 시 CLAUDE.md가 보존되는 메커니즘
- [Plan Mode](/claude-code/plan-mode) — 복잡한 작업의 방향 잡기
