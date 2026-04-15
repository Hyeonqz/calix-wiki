---
title: Claude Code Sources
---

# Claude Code 학습 소스

이 폴더는 Claude Code 학습에 사용하는 원본 자료를 보관합니다.
**LLM은 이 폴더의 파일을 수정하지 않습니다** (read-only).

## 주요 학습 소스

### 1. WikiDocs — Claude Code 가이드 (한국어)

- **URL**: https://wikidocs.net/book/19104
- **언어**: 한국어
- **형태**: 온라인 책
- **용도**: 한국어 사용자 관점에서 Claude Code 사용법, 워크플로우, 사례를 학습
- **ingest 방식**: 챕터 단위로 읽고 `content/claude-code/`에 추출

### 2. Claude Code 공식 문서 (한국어)

- **URL**: https://code.claude.com/docs/ko/overview
- **언어**: 한국어 (공식 번역)
- **형태**: 공식 문서
- **용도**: 정확한 API, 설정, 기능 명세의 1차 출처(source of truth)
- **ingest 방식**: 섹션별로 읽고 `content/claude-code/` 해당 페이지에 반영. 위키독스와 충돌 시 공식 문서를 우선

## 소스 추가 규칙

- 새로운 자료(블로그, 영상 스크립트, PDF 등)를 추가할 때는 이 README에 한 줄로 기록
- 가능하면 원본 파일을 이 폴더에 함께 보관 (URL만으로는 사라질 수 있음)
- 파일명은 `kebab-case`, 출처/일자를 포함 (예: `wikidocs-ch01-intro.md`)
