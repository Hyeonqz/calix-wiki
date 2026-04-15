---
title: Permission Modes
---

# 권한 모드

Claude에게 주는 자율권을 단계로 조절한다. 신입에게는 매번 확인받게 하고, 신뢰가 쌓이면 알아서 일하게 만드는 비유.

## 6개 모드

자율성이 낮은 순 → 높은 순:

| 모드 | CLI 플래그 | 설명 |
|---|---|---|
| **Plan** | `plan` | 코드 수정 불가, 분석/계획만 (읽기 전용 도구만) |
| **Default** | `default` | 파일 읽기 자동, 수정/명령 실행은 매번 승인 (기본값) |
| **Auto-accept Edits** | `acceptEdits` | 파일 수정 자동, 명령 실행은 승인 필요 |
| **Auto** | `auto` | 분류기가 백그라운드에서 안전 검사, 프롬프트 피로 없이 작업 |
| **Don't Ask** | `dontAsk` | 사전 승인된 것만 자동, 나머지는 자동 거부 |
| **Bypass Permissions** | `bypassPermissions` | 모든 작업 자동 (위험) |

> **Auto 모드 제약 (2026-04 기준)**: 리서치 프리뷰. **Team / Enterprise / API 플랜에서만** 사용 가능 (Pro/Max 불가). Sonnet 4.6 또는 Opus 4.6 필요.

`--dangerously-skip-permissions`는 `--permission-mode bypassPermissions`의 단축 플래그. 이름의 "dangerously"는 위험성 강조용.

## 시작과 전환

```bash
claude                              # Default 모드
claude --permission-mode plan
claude --permission-mode dontAsk
claude --permission-mode bypassPermissions
```

대화 중에는 **`Shift+Tab`**으로 일상 모드 3개만 순환:

```
Default → Plan → Auto-accept → Default → ...
```

현재 모드는 입력창 옆에 표시:

- Default: (표시 없음)
- Plan: `plan mode on`
- Auto-accept: `accept edits on`
- Bypass: `bypass permissions on`

`Don't Ask`와 `Bypass Permissions`는 Shift+Tab 순환에 없고, CLI 플래그나 설정 파일로만 진입.

Desktop 앱은 `Code` 탭의 모드 선택기에서 4개(Ask permissions / Auto accept edits / Plan / Bypass)를 클릭 전환.

## 어떤 순서로 올릴까

1. 처음엔 그냥 `claude` (Default) — 매번 승인하면서 Claude가 무엇을 하는지 관찰
2. 익숙해지면 단순 편집은 **Auto-accept**
3. 복잡한 작업은 항상 **Plan 먼저** → 검토 후 실행 모드로 전환
4. 위험한 작업은 [Permission Rules](/claude-code/permission-rules)의 deny로 봉쇄해두면 상위 모드도 안전

## Related

- [Plan Mode](/claude-code/plan-mode) — 가장 자주 쓰는 모드 활용법
- [Permission Rules](/claude-code/permission-rules) — `/permissions`로 자동 허용/거부 규칙 설정
