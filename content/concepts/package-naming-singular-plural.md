---
title: "패키지/클래스/테이블 단수·복수 네이밍 규칙"
category: "convention"
tags: [naming, package, jpa, ddd, best-practice]
created: 2026-06-09
updated: 2026-06-09
---

# 패키지/클래스/테이블 단수·복수 네이밍 규칙

## 개요

도메인 코드를 짤 때 `event`인지 `events`인지 헷갈리는 이유는, **계층마다 적용되는 규칙이 다르다**는 걸 인지하지 못해서다. 패키지·클래스는 "개념의 이름"이라 단수, DB 테이블은 "행(레코드)의 집합"이라 복수가 관례다. 둘이 섞여 있는 것이 **정상**이며 불일치가 아니다.

## 핵심 규칙

| 대상 | 규칙 | 예 |
|------|------|-----|
| 패키지(package) | **단수** | `event`, `coupon`, `user`, `order` |
| 클래스(class) | **단수** | `Event`, `Coupon`, `EventRepository` |
| DB 테이블 | **복수** | `events`, `coupons`, `event_participations` |
| 컬렉션 변수/엔드포인트 | **복수** | `List<Event> events`, `GET /events` |

## 왜 패키지·클래스는 단수인가

패키지는 "이 도메인 영역"이라는 **개념(concept)의 이름**이다. `com.example.order`는 "주문이라는 개념의 영역"이지 "주문들이 담긴 상자"가 아니다. 클래스도 인스턴스 하나의 타입을 정의하므로 단수다 (`Event event = new Event()`).

Spring/DDD 진영의 표준 패키지 구조도 모두 단수다:

```
com.example.order        ← 단수
com.example.user
com.example.payment
```

```
event/                   ✅ event/domain/Event.java   (자연스러움)
events/                  ❌ events/domain/Event.java   (단/복수 불일치, 어색)
```

## 왜 DB 테이블은 복수인가

테이블은 같은 구조의 **행이 여러 개 모인 집합**이다. `SELECT * FROM events`는 "이벤트들에서 조회"로 자연스럽게 읽힌다. 그래서 ORM 매핑에서 클래스(단수)와 테이블(복수)이 어긋나는 게 정상이며, 명시적으로 매핑한다:

```java
@Entity
@Table(name = "events")   // 클래스 Event(단수) → 테이블 events(복수)
public class Event { ... }
```

패키지명과 테이블명은 **독립적**이다. 패키지를 단수로 둬도 `@Table(name = "events")`로 복수 테이블을 그대로 가리킨다.

> **참고:** 테이블 단수 vs 복수는 팀 컨벤션 차이가 있다(일부 팀은 단수 `event` 선호). 핵심은 **한 프로젝트 안에서 일관성**이다. 다만 패키지·클래스 단수는 거의 보편적 관례다.

## 흔한 혼동

- "패키지가 단수면 테이블도 단수로 맞춰야 하지 않나?" → 아니다. 서로 다른 규칙을 따르는 다른 레이어다. 일치시킬 대상이 아니다.
- "REST 엔드포인트는?" → 컬렉션이라 복수(`GET /api/v1/events`). 이건 테이블과 같은 "집합" 논리다. 단일 리소스는 `GET /events/{id}`로 컬렉션 하위 경로를 쓴다 ([REST Resource Naming](/concepts/rest-resource-naming) 참고).

## 결론

- 패키지 단수, 클래스 단수, 테이블 복수 — 이 조합이 표준이다.
- 단·복수가 레이어마다 다른 것은 버그가 아니라 의도된 컨벤션이다.
- `event/domain/Event.java` + `@Table(name = "events")` 형태로 가면 된다.

## Related

- [REST API Resource Naming 규칙](/concepts/rest-resource-naming) — 리소스 단수(Document)·복수(Collection) 구분과 동일한 "집합" 논리
- [Concepts Overview](/concepts) — Spring Boot / JPA 실무 모범사례 모음
