---
title: Permission Rules
---

# 권한 규칙 (`/permissions`)

특정 도구·명령을 매번 승인하기 번거로울 때 사전 허용/차단 규칙을 둔다. `.claude/settings.json`에 저장되어 팀원과 공유 가능.

## 4개 탭

`/permissions`로 진입:

| 탭 | 역할 |
|---|---|
| **Allow** | 허용된 도구는 승인 없이 자동 실행 |
| **Ask** | 이 도구를 쓸 때마다 항상 확인 |
| **Deny** | 거부된 도구는 항상 차단 |
| **Workspace** | Claude가 접근할 수 있는 작업 디렉토리 관리 |

## 규칙 형식

`도구명` 또는 `도구명(상세지정)`:

| 규칙 | 의미 |
|---|---|
| `Bash(npm test)` | `npm test` 명령만 허용 |
| `Bash(npm run *)` | `npm run`으로 시작하는 모든 명령 허용 |
| `Read(.env)` | `.env` 읽기 차단 (Deny에 추가) |

## 우선순위

겹치면 **`Deny > Ask > Allow`**. Deny에 들어가면 Allow에 있어도 차단된다.

## 민감 정보 보호 (Deny 규칙)

`.env` 같은 비밀 파일은 **Read / Edit / Bash 모두** 차단해야 확실하다. Claude에게 부탁하면 알아서 추가해준다:

> ".env 파일과 secrets/ 폴더를 Claude가 읽지 못하도록 권한 설정해줘"

생성되는 규칙 예 (`.claude/settings.json`):

```json
{
  "permissions": {
    "deny": [
      "Read(.env)", "Read(**/.env)", "Read(**/.env.*)",
      "Read(secrets/**)",
      "Edit(.env)", "Edit(**/.env)", "Edit(secrets/**)",
      "Bash(cat:*.env*)", "Bash(cat:*secrets/*)"
    ]
  }
}
```

## Defense-in-Depth

공식 문서는 deny 규칙을 **1차 방어선**으로 본다. 추가 방어층:

1. **Deny 규칙** — Claude의 시도 자체를 차단
2. **Sandbox** — 격리된 환경에서 실행 *(이후 학습 예정)*
3. **Hooks** — 도구 호출 전후에 검증 로직 *(이후 학습 예정)*

Deny만으로는 부족할 수 있는 경우(예: prompt injection으로 우회 시도)에 대비해 sandbox/hooks를 함께 쓰는 것이 권장된다.

## Related

- [Permission Modes](/claude-code/permission-modes)
