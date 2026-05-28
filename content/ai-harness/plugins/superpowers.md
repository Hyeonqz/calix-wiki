---
title: Superpowers
---

# Superpowers

## 개요

**개발 프로세스 규율 강제 플러그인**. 특정 상황에서 자동으로 트리거되는 스킬 세트를 제공하여, "코드 작성 전에 계획", "완료 전에 검증" 같은 모범사례를 강제한다.

## 철학

- **상황 인식** — 사용자의 의도를 감지하여 적절한 스킬을 자동 제안
- **프로세스 강제** — TDD, 디버깅, 계획, 검증, 코드리뷰 프로세스를 건너뛰지 못하게 함
- **증거 기반** — 주장하기 전에 증거(테스트 결과, 빌드 로그)를 수집

---

## 스킬 카탈로그

주로 **개발 프로세스 규율**(TDD, 디버깅, 계획, 검증, 코드리뷰) 강제에 초점.

### 프로세스 규율

| 스킬 | 트리거 | 역할 |
|------|--------|------|
| `brainstorming` | 창작/기능 추가 전 | 의도/요구사항/설계 탐색 후 구현 |
| `writing-plans` | 멀티스텝 작업 시작 전 | 스펙 기반 구현 계획 작성 |
| `executing-plans` | 계획 실행 시 | 리뷰 체크포인트가 포함된 계획 실행 |
| `test-driven-development` | 기능 구현 전 | TDD 워크플로우 강제 (테스트 먼저) |
| `systematic-debugging` | 버그/테스트 실패 시 | 수정 제안 전 체계적 디버깅 프로세스 |
| `verification-before-completion` | 작업 완료 선언 전 | 검증 명령 실행 후 성공 확인 필수 |

### 병렬 / 격리

| 스킬 | 트리거 | 역할 |
|------|--------|------|
| `dispatching-parallel-agents` | 독립 작업 2개 이상 | 공유 상태 없는 독립 작업 병렬 분배 |
| `subagent-driven-development` | 구현 계획 실행 시 | 서브에이전트 기반 병렬 구현 |
| `using-git-worktrees` | 기능 격리 필요 시 | git worktree로 격리된 작업 환경 |

### 리뷰 / 완료

| 스킬 | 트리거 | 역할 |
|------|--------|------|
| `requesting-code-review` | 작업 완료 / 기능 구현 후 | 요구사항 충족 여부 코드 리뷰 |
| `receiving-code-review` | 리뷰 피드백 수신 시 | 기술적 엄밀성 검증, 맹목적 동의 방지 |
| `finishing-a-development-branch` | 구현 완료 + 테스트 통과 | merge / PR / cleanup 결정 가이드 |

### 메타

| 스킬 | 트리거 | 역할 |
|------|--------|------|
| `using-superpowers` | 대화 시작 시 | 스킬 사용법 확립, Skill 도구 호출 필수 |
| `writing-skills` | 스킬 생성/편집 시 | 스킬 생성, 편집, 배포 전 검증 |

## Related

- [Oh My ClaudeCode](/ai-harness/plugins/omc)
- [Hermes Agent](/ai-harness/agents/hermes)
