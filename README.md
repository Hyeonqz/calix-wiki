# Personal LLM Wiki

LLM이 유지/관리하는 개인 지식 위키. Andrej Karpathy의 [LLM Wiki](https://github.com/karpathy/llm-wiki) 아이디어에 기반.

## Quick Start

```bash
cd ~/wiki
claude
```

Then tell Claude one of:
- `"ingest sources/spring-boot/article.md"` — 소스를 위키에 통합
- `"query: JPA Entity와 TypeORM Entity 차이"` — 위키에서 답변 검색
- `"lint"` — 위키 상태 점검

## Structure

```
sources/                           # 원문 소스 (불변, 사용자가 관리)
  general/                         # 범용 소스
  {domain}/                        # 도메인별 소스
wiki/                              # 위키 페이지 (LLM이 관리)
  _index.md                        # Master MOC (전체 진입점)
  _log.md                          # 작업 기록
  _cross-domain/                   # 교차 도메인 분석/비교
    _index.md
  {domain}/                        # 도메인별 위키
    _index.md                      # Domain MOC
    {domain}.{subtopic}.md         # Dendron 네임스페이스 노트
CLAUDE.md                          # 스키마 — LLM 위키 관리 규칙
```

## Design: Dendron Hierarchy + MOC Index

- **Dendron 네임스페이스**: 파일명에 도메인 포함 → 이름 충돌 방지
  - `spring-boot.jpa.entity.md` vs `nestjs.typeorm.entity.md`
- **MOC 인덱스**: 모든 폴더에 `_index.md` → 2홉 내 모든 노트 접근
- **교차 도메인**: `_cross-domain/`에서 기술 간 비교/패턴 분석

## Workflow

1. **소스 추가**: 기사, 논문, 노트를 `sources/{domain}/`에 저장
2. **Ingest**: Claude에게 소스 처리 요청 → 위키 페이지 생성/업데이트
3. **Query**: 위키 기반으로 질문 → 교차 참조된 답변
4. **Lint**: 주기적으로 위키 품질 점검
5. **Browse**: Obsidian으로 위키를 열어서 그래프 뷰로 탐색
