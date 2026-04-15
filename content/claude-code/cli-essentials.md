---
title: CLI Essentials
---

# CLI 기본 사용법

세션 안에서 자주 쓰는 입력 방식 — 파일 참조, 슬래시 명령, 여러 줄 입력.

## 파일 참조 (`@`)

대화 중 `@`를 입력하면 파일 자동완성이 뜬다. 경로를 외울 필요 없이 선택만 한다.

```
@src/main.js 이 파일의 구조를 설명해줘
```

## 슬래시 명령어 (`/`)

`/`를 입력하면 사용 가능한 명령 목록이 뜬다. 자주 쓰는 것:

| 명령 | 역할 |
|---|---|
| `/help` | 도움말 |
| `/model` | 모델 변경 (Opus / Sonnet / Haiku) |
| `/voice` | 음성 입력 모드 (스페이스바 길게 눌러 녹음) |
| `/clear` | 대화 이력 초기화 |
| `/compact` | 대화를 핵심만 남기고 압축 |
| `/context` | 현재 컨텍스트 사용량 확인 |
| `/permissions` | 권한 규칙 관리 |

세션·되감기 명령(`/resume`, `/rename`, `/rewind`)은 [Sessions](/claude-code/sessions) 참고.

지금 다 외울 필요 없음. `/`만 누르면 언제든 전체 목록이 뜬다.

## 여러 줄 입력

`Enter`는 전송이므로, 줄바꿈은 별도 단축키.

| 환경 | 단축키 |
|---|---|
| 모든 터미널 (공통) | `\` + `Enter` |
| macOS 기본 | `Option` + `Enter` |
| iTerm2 / WezTerm / Ghostty / Kitty | `Shift` + `Enter` |
| 그 외 터미널에서 `Shift+Enter` 쓰려면 | `/terminal-setup` 실행 |

## Related

- [Sessions](/claude-code/sessions)
- [Context Management](/claude-code/context-management)
