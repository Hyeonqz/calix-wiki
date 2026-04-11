# Personal LLM Wiki

LLM이 유지/관리하는 개인 지식 위키. Andrej Karpathy의 [LLM Wiki](https://github.com/karpathy/llm-wiki) 아이디어에 기반.

## Quick Start

```bash
cd ~/wiki
claude
```

Then tell Claude one of:
- `"ingest sources/article-name.md"` — 소스를 위키에 통합
- `"query: 질문 내용"` — 위키에서 답변 검색
- `"lint"` — 위키 상태 점검

## Structure

```
sources/          # 원문 소스 (불변, 사용자가 관리)
wiki/             # 위키 페이지 (LLM이 관리)
  entities/       # 인물, 조직, 제품, 도구
  concepts/       # 아이디어, 프레임워크, 패턴
  syntheses/      # 교차 분석, 비교, 타임라인
  index.md        # 전체 페이지 카탈로그
  log.md          # 작업 기록
CLAUDE.md         # 스키마 — LLM 위키 관리 규칙
```

## Workflow

1. **소스 추가**: 기사, 논문, 노트를 `sources/`에 저장
2. **Ingest**: Claude에게 소스 처리 요청 → 위키 페이지 생성/업데이트
3. **Query**: 위키 기반으로 질문 → 교차 참조된 답변
4. **Lint**: 주기적으로 위키 품질 점검
5. **Browse**: Obsidian으로 위키를 열어서 그래프 뷰로 탐색
