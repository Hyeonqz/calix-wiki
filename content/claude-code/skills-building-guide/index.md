---
title: "Skills 구축 완벽 가이드"
---

# Skills 구축 완벽 가이드

> 원문: *The Complete Guide to Building Skills for Claude* (Anthropic)
>
> 소스: `The-Complete-Guide-to-Building-Skill-for-Claude.pdf` / `Claude_스킬_구축_완벽_가이드.md`

Anthropic이 공개한 Claude 스킬 구축에 대한 공식 가이드를 정리한 섹션. 스킬의 개념부터 배포까지 전 과정을 다룬다.

## 핵심 인사이트

1. **점진적 공개 3단계**: 프론트매터(항상 로드) → SKILL.md 본문(관련 시 로드) → 링크된 파일(필요 시 탐색)
2. **description 필드가 가장 중요**: `[WHAT] + [WHEN] + [핵심 기능]` 구조. 스킬 로드 여부를 결정
3. **MCP + 스킬 = 완전한 솔루션**: MCP는 도구 접근(주방), 스킬은 워크플로 지식(레시피)
4. **3대 사용 사례 카테고리**: 문서/자산 생성, 워크플로 자동화, MCP 강화
5. **5가지 워크플로 패턴**: 순차적 조율, 다중 MCP 조율, 반복적 개선, 컨텍스트 인식 도구 선택, 도메인 특화 지능
6. **오픈 표준**: 스킬은 Claude 전용이 아닌 오픈 표준으로 게시. 플랫폼 간 이식성 목표
7. **API 지원**: `/v1/skills` 엔드포인트, `container.skills` 파라미터. Code Execution Tool 베타 필요

## Topics

- [Skills 개요](/claude-code/skills-building-guide/skills-overview) — 스킬 개념, 설계 원칙(점진적 공개/조합성/이식성), 파일 구조, 프론트매터
- [Skills 개발 가이드](/claude-code/skills-building-guide/skills-development) — 사용 사례 카테고리, 성공 기준, 명령어 작성법
- [Skills 테스트](/claude-code/skills-building-guide/skills-testing) — 트리거/기능/성능 테스트, skill-creator, 피드백 반복
- [Skills 배포](/claude-code/skills-building-guide/skills-deployment) — 배포 모델, API, 포지셔닝
- [Skills 패턴 및 트러블슈팅](/claude-code/skills-building-guide/skills-patterns) — 5가지 워크플로 패턴, 문제 해결, 체크리스트

## Related

- [Claude Code Overview](/claude-code) — 상위 도메인
- [CLAUDE.md 작성법](/claude-code/claude-md-best-practices) — 프로젝트 지침 파일
- [Source: WikiDocs 기초](/claude-code/src-wikidocs-foundations) — 세션/권한/컨텍스트 기초
