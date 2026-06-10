---
title: MySQL DATETIME vs TIMESTAMP
---

# MySQL DATETIME vs TIMESTAMP — 정밀도(3)/(6)와 타임존

MySQL에서 시각을 저장하는 두 타입 `DATETIME`과 `TIMESTAMP`, 그리고 괄호 안의
**fsp(fractional seconds precision, 소수점 초 정밀도)** `(3)`/`(6)`이 무엇을 다르게
처리하는지 정리한다.

## 한눈 비교

| 항목 | `DATETIME` | `TIMESTAMP` |
|------|-----------|-------------|
| 의미 | 벽시계 값(literal) 그대로 저장 | UTC로 저장 후 세션 타임존으로 변환 |
| 타임존 변환 | **없음** (넣은 값 = 꺼낸 값) | **있음** (`time_zone` 세션 변수 따라 변환) |
| 범위 | 1000-01-01 ~ 9999-12-31 | 1970-01-01 ~ **2038-01-19** (UTC) |
| 기본 저장 크기 | 5 byte | 4 byte |
| `DEFAULT CURRENT_TIMESTAMP` | 지원 (5.6.5+) | 지원 |
| `ON UPDATE CURRENT_TIMESTAMP` | 지원 (5.6.5+) | 지원 |

> 핵심: **`TIMESTAMP`는 타임존을 안다, `DATETIME`은 모른다.** 이 한 줄이 둘의 거의 모든
> 차이를 만든다.

## fsp — `(3)`, `(6)`이 뜻하는 것

괄호 안 숫자는 **소수점 이하 초 자릿수**다. 두 타입 모두 `0`~`6`까지 지정 가능하며,
**MySQL은 나노초(9자리)를 지원하지 않는다 — 최대 마이크로초(6)까지**다.

| 정의 | 정밀도 | 예시 값 |
|------|--------|---------|
| `DATETIME` = `DATETIME(0)` | 초 단위 | `2026-06-09 12:00:01` |
| `DATETIME(3)` | **밀리초** | `2026-06-09 12:00:01.234` |
| `DATETIME(6)` | **마이크로초** | `2026-06-09 12:00:01.234567` |

### fsp에 따른 저장 크기 (MySQL 5.6.4+)

기본 크기에 소수부 바이트가 더해진다:

| fsp | 추가 바이트 | DATETIME 총합 | TIMESTAMP 총합 |
|-----|-------------|---------------|----------------|
| 0   | 0           | 5             | 4              |
| 1–2 | 1           | 6             | 5              |
| 3–4 | 2           | **7**         | **6**          |
| 5–6 | 3           | **8**         | **7**          |

즉 `DATETIME(3)` = 7byte, `DATETIME(6)` = 8byte. 정밀도를 한 단계 올릴 때마다
1~3byte를 더 쓴다.

## 주의해야 할 동작 (gotcha)

### 1. fsp 미지정 시 소수부가 사라진다

`DATETIME`(= fsp 0)으로 컬럼을 만들면 애플리케이션이 보낸 밀리초/마이크로초가
**조용히 버려진다**. Java `LocalDateTime.now()`는 나노초까지 갖고 있는데, 컬럼이
`DATETIME(0)`이면 `.now()` 직후 값과 DB에서 다시 읽은 값이 **달라져** 동등성 비교나
정렬, 테스트가 깨진다. → 정밀도가 필요하면 반드시 `(3)`/`(6)`을 명시한다.

### 2. 자르는 게 아니라 반올림한다

fsp를 초과하는 소수부를 넣으면 MySQL은 **truncate가 아니라 round(반올림)** 한다.

```sql
-- TIMESTAMP(3) 컬럼에 입력
INSERT ... VALUES ('2026-06-09 12:00:00.999500');
-- 저장 결과: 2026-06-09 12:00:01.000  (← 초가 올라감!)
```

밀리초/마이크로초 경계에서 시각이 1초 넘어가 버릴 수 있으므로, **컬럼 fsp를 애플리케이션
정밀도와 일치**시켜 반올림 자체가 일어나지 않게 하는 게 안전하다.

### 3. TIMESTAMP는 읽는 시점의 세션 타임존에 의존한다

같은 행이라도 `SET time_zone = '+00:00'`과 `'+09:00'`에서 **다른 문자열**로 보인다.
서버 타임존을 바꾸거나 커넥션마다 타임존이 다르면 값이 흔들린 것처럼 보인다.
`DATETIME`은 변환이 없어 항상 같은 문자열이 나온다.

### 4. 2038년 문제

`TIMESTAMP`는 32비트 Unix epoch라 **2038-01-19 03:14:07 UTC**가 상한이다. 만기일·
보험 계약 종료일·미래 예약처럼 먼 미래를 담는 컬럼에 `TIMESTAMP`를 쓰면 안 된다.

## 모범사례 (Best Practices)

1. **시각은 UTC로 저장하고 표시 시점에 변환한다.** 저장은 애플리케이션이 UTC로 통일하고,
   타임존 변환은 표현 계층(UI/API 응답)에서 한다. DB 레벨 암묵 변환에 의존하지 않는다.

2. **기본형은 `DATETIME` + 명시적 정밀도.** 변환이 없어 예측 가능하고 2038 한계가 없다.
   미래 날짜를 담을 수 있어 보험·예약·만기 도메인에 특히 적합하다.
   - 로그·이벤트·생성/수정 시각 → **`DATETIME(3)`**(밀리초, Java `Instant`/JS `Date`와 정렬)
   - 분산 트레이싱·순서 보장·고정밀 정렬 → **`DATETIME(6)`**(마이크로초)

3. **`TIMESTAMP`는 "자동 UTC 정규화 + 2038 이내"가 명확할 때만.** 세션 타임존 자동 변환이
   장점이 되는 좁은 경우(예: 서버 로컬시간 기준 감사 컬럼)에 한정한다.

4. **자동 시각 컬럼은 fsp까지 맞춘다.**
   ```sql
   created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
   updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                                   ON UPDATE CURRENT_TIMESTAMP(6)
   ```
   `CURRENT_TIMESTAMP(6)`처럼 default의 fsp도 컬럼 fsp와 동일하게 적는다.

5. **스키마 전체에서 한 가지 정밀도로 통일한다.** 어떤 컬럼은 `(3)`, 어떤 건 `(6)`이면
   조인·비교·정렬에서 미묘한 반올림 차이가 생긴다.

6. **MySQL 8.0의 `explicit_defaults_for_timestamp`는 켠 채로 둔다(기본 ON).** 과거
   `TIMESTAMP`의 암묵 `NOT NULL`·자동 default 같은 레거시 동작을 끄고 예측 가능하게 만든다.

### JPA / Hibernate 사용 시 (Spring Boot)

- Java 8 `LocalDateTime` / `Instant`는 보통 `DATETIME`으로 매핑된다. **DDL을 직접 관리**해
  `DATETIME(6)`로 정밀도를 고정하는 게 안전하다(Hibernate 6은 기본 마이크로초 매핑).
- `ddl-auto` 자동 생성에 맡기면 정밀도가 0으로 떨어져 위 gotcha #1이 그대로 터질 수 있다.
  마이그레이션(Flyway/Liquibase)에 `DATETIME(6)`을 명시하자.
- 엔티티 동등성/`@Version`/낙관적 락 비교가 시각에 의존한다면, 저장 전후 정밀도 불일치가
  버그의 단골 원인이다. → 컬럼 정밀도 = 애플리케이션 정밀도.

자세한 매핑은 [Spring](/spring) 도메인 참고.

## Related

- [Spring](/spring) — JPA/Hibernate 엔티티 매핑, `LocalDateTime` 처리
- [Concepts](/concepts) — 테이블/컬럼 네이밍 등 스키마 설계 규칙
