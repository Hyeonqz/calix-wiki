---
title: Sessions
---

# 세션 관리

Claude Code의 모든 작업은 **세션** 단위. 시작, 이름 붙이기, 종료 후 재개, 잘못된 변경 되감기까지가 한 묶음.

## 시작과 종료

```bash
claude                              # 새 세션 시작
claude "이 프로젝트 구조를 설명해줘"   # 초기 프롬프트와 함께 시작
/exit                               # 세션 종료
```

Desktop 앱에서는 `Code` 탭에서 프로젝트 폴더를 지정한 뒤 입력.

## 이어하기

| 명령 | 효과 |
|---|---|
| `claude -c` | 가장 최근 세션을 이어서 시작 |
| `claude -r "이름"` | 이름이 붙은 세션을 재개 |
| `/resume` | (대화 중) 이전 세션 목록에서 선택 |
| `/rename 이름` | (대화 중) 현재 세션에 이름 붙이기 |

자주 돌아갈 작업이라면 `/rename`으로 이름을 붙여두는 것이 가장 빠른 재진입 방법.

## 체크포인트와 되감기

Claude가 파일을 수정할 때마다 자동으로 체크포인트를 만든다. 결과가 마음에 안 들면 **`Esc Esc`** (또는 `/rewind`)로 시점 선택 메뉴가 뜬다.

| 옵션 | 효과 |
|---|---|
| **Restore code** | 파일만 되돌리고 대화 맥락은 유지 (가장 자주 사용) |
| Restore code and conversation | 코드와 대화 모두 되돌림 |
| Restore conversation | 대화만 되돌리고 파일은 그대로 |
| Summarize from here | 이 시점부터 대화를 요약으로 압축 |

되돌리기 횟수에 제한 없음 — 자유롭게 실험하고 마음에 안 들면 되돌리는 워크플로우가 권장됨.

## 세션 보관 기간

기본값 **30일 후 자동 삭제**. 늘리려면 `~/.claude/settings.json`의 `cleanupPeriodDays`를 변경:

```json
{
  "cleanupPeriodDays": 365000
}
```

`0`이면 시작할 때마다 모든 기록 삭제 + 세션 저장 자체 비활성화.

## Related

- [CLI Essentials](/claude-code/cli-essentials) — 슬래시 명령, `@` 파일 참조, 멀티라인 입력
- [Context Management](/claude-code/context-management) — 세션 안에서 컨텍스트 비우기/압축
