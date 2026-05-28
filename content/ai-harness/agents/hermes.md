---
title: Hermes Agent
---

# Hermes Agent

## 개요

Nous Research가 개발한 **자기 개선형(self-improving) AI 에이전트**. 터미널 기반으로 동작하며, 다양한 AI 프로바이더(Claude, GPT, Gemini 등)를 백엔드로 사용할 수 있다. Claude Code와 상호 연동이 가능하다.

## 철학

- **자율성** — 목표를 주면 스스로 계획하고 실행하고 검증
- **자기 개선** — 실행 결과를 피드백으로 받아 다음 시도를 개선
- **도구 게이트웨이** — 다양한 외부 도구(Claude Code, 터미널, 브라우저 등)를 통합 호출

## 핵심 기능

| 기능 | 설명 |
|------|------|
| 멀티 프로바이더 | Claude, GPT, Gemini 등 다양한 LLM 백엔드 지원 |
| 스킬 시스템 | 번들 스킬 + 커스텀 스킬로 작업 자동화 |
| Claude Code 연동 | print mode(원샷) / interactive mode(tmux) 두 가지 방식 |
| 자기 개선 루프 | 실행 → 평가 → 개선의 반복 사이클 |

## Claude Code 연동 모드

| 모드 | 방식 | 특징 |
|------|------|------|
| Print mode | 원샷 실행 후 결과 반환 | PTY 불필요, 가장 깔끔한 통합 |
| Interactive mode | tmux 기반 TUI | capture-pane으로 모니터링, send-keys로 입력 |

## 참고

- [WikiDocs — Hermes Agent](https://wikidocs.net/334919)
- [Hermes Agent 공식 문서](https://hermes-agent.nousresearch.com/docs/skills)
- [GitHub — NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)

## Related

- [Ouroboros](/ai-harness/agents/ouroboros)
- [Oh My ClaudeCode](/ai-harness/plugins/omc)
