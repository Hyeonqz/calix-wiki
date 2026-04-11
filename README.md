# Calix Wiki

LLM이 유지/관리하는 개인 지식 위키. [GeekNews - LLM Wiki](https://news.hada.io/topic?id=28208) 아티클에서 얻은 아이디어에 기반.

Nextra (Next.js) 기반으로 배포되어 웹에서 열람 가능합니다.

## Quick Start

```bash
cd ~/wiki
claude
```

Then tell Claude one of:
- `"ingest sources/spring-boot/article.md"` — 소스를 위키에 통합
- `"query: JPA Entity와 TypeORM Entity 차이"` — 위키에서 답변 검색
- `"lint"` — 위키 상태 점검

다른 프로젝트에서 작업 중에도 `/wiki` 슬래시 커맨드로 지식을 저장할 수 있습니다.

## Structure

```
sources/                           # 원문 소스 (불변, 사용자가 관리)
  general/                         # 범용 소스
  {domain}/                        # 도메인별 소스
content/                           # 위키 페이지 (LLM이 관리, Nextra content)
  index.md                         # Master MOC (전체 진입점)
  log.md                           # 작업 기록
  _meta.js                         # 사이드바 네비게이션
  cross-domain/                    # 교차 도메인 분석/비교
  {domain}/                        # 도메인별 위키
    index.md                       # Domain MOC
    _meta.js                       # 사이드바 설정
    {subtopic}.md                  # 개별 노트 (kebab-case)
app/                               # Next.js App Router
CLAUDE.md                          # 스키마 — LLM 위키 관리 규칙
```

## Design

- **폴더 기반 도메인 분리**: 같은 개념의 이름 충돌 방지
  - `spring-boot/jpa-entity.md` vs `nestjs/typeorm-entity.md`
- **MOC 인덱스**: 모든 폴더에 `index.md` → 2홉 내 모든 노트 접근
- **교차 도메인**: `cross-domain/`에서 기술 간 비교/패턴 분석

## Development

```bash
npm run dev    # http://localhost:3000
npm run build  # Production build
```

## Workflow

1. **소스 추가**: 기사, 논문, 노트를 `sources/{domain}/`에 저장
2. **Ingest**: Claude에게 소스 처리 요청 → 위키 페이지 생성/업데이트
3. **Query**: 위키 기반으로 질문 → 교차 참조된 답변
4. **Lint**: 주기적으로 위키 품질 점검
5. **Browse**: 배포된 사이트 또는 Obsidian에서 탐색
