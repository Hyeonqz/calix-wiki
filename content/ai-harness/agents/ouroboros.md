---
title: Ouroboros
---

# Ouroboros

## 개요

**진화적 개발 루프 에이전트**. 모호한 목표를 구체적인 명세(Seed)로 정제하고, 자동으로 실행하고, 검증하는 전체 사이클을 관리한다. 이름은 자기 꼬리를 먹는 뱀(우로보로스)에서 유래 — 끝없이 자기를 개선하는 루프를 상징한다.

## 철학

- **수렴(Convergence)** — 모호한 아이디어를 A-grade 명세로 점진적으로 수렴
- **소크라테스식 인터뷰** — 질문을 통해 요구사항의 모호함을 제거
- **진화적 실행** — 실행 → 평가 → 진화의 반복으로 품질 향상

## 핵심 워크플로우

```
interview → seed → run → evaluate → evolve
  (요구사항     (명세     (실행)    (평가)     (진화)
   정제)       생성)
```

## 주요 명령어

| 명령어 | 역할 |
|--------|------|
| `/ouroboros:interview` | 소크라테스식 인터뷰로 요구사항 정제 |
| `/ouroboros:seed` | 인터뷰 결과에서 검증된 Seed 명세 생성 |
| `/ouroboros:run` | Seed 명세를 워크플로우 엔진으로 실행 |
| `/ouroboros:evaluate` | 3단계 검증 파이프라인으로 실행 결과 평가 |
| `/ouroboros:evolve` | 진화적 개발 루프 시작/모니터링 |
| `/ouroboros:auto` | 목표에서 A-grade Seed까지 자동 수렴 후 실행 |
| `/ouroboros:ralph` | MCP 기반 Ralph 루프 (백그라운드 evolve) |
| `/ouroboros:unstuck` | 정체 상태 돌파 — 측면 사고 페르소나 활용 |

## Related

- [Hermes Agent](/ai-harness/agents/hermes)
- [Oh My ClaudeCode](/ai-harness/plugins/omc)
