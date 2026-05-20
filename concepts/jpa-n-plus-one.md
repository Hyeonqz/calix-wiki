---
tags: [jpa, hibernate, n-plus-one, entity-graph, spring-boot, performance, best-practices]
created: 2026-04-24
updated: 2026-04-24
sources: [qrgw-payment 세션 2026-04-24]
related: [[kafka-dlt]], [[transaction-event-publishing]]
---

# JPA N+1 문제와 해결 전략

## 핵심 개념

연관관계 조회 시 1개의 메인 쿼리 + N개의 추가 쿼리가 발생하는 성능 문제.

### JPA 기본 Fetch 타입

| 어노테이션 | 기본값 | 주의 |
|-----------|--------|------|
| `@OneToMany` | **LAZY** | |
| `@ManyToMany` | **LAZY** | |
| `@ManyToOne` | **EAGER** | 즉시 로드 |
| `@OneToOne` | **EAGER** | 즉시 로드, 특히 non-owning 측 주의 |

---

## @OneToOne non-owning 측의 특수한 N+1

```java
// Payment 엔티티 (owning 측이 아님 - mappedBy 사용)
@OneToOne(mappedBy = "payment")   // EAGER 기본값
private PaymentResult paymentResult;

@OneToOne(mappedBy = "payment")   // EAGER 기본값
private PaymentStep1Request paymentStep1Request;
```

**문제**: `Payment` 로드 시 `mappedBy` `@OneToOne` 4개가 각각 별도 SELECT 발생.

```
findByTransactionNo(txNo)       → 1 query (Payment)
                                → 1 query (paymentResult)
                                → 1 query (paymentStep1Request)
                                → 1 query (paymentStep2Request)
                                → 1 query (systemCancellation)
                                = 총 5 queries
```

**Hibernate 이슈**: non-owning `@OneToOne`은 `LAZY`로 선언해도 null 여부 확인을 위해 쿼리가 발생할 수 있음. Hibernate 6 (Spring Boot 3.x)에서는 개선됨.

---

## 해결 전략

### 1. `@EntityGraph` - 엔티티 수정 없이 즉시 적용 (권장)

```java
// Use case 1: PaymentResult만 필요
@EntityGraph(attributePaths = {"paymentResult"})
@Query("SELECT p FROM Payment p WHERE p.transactionNo = :transactionNo")
Optional<Payment> findWithResultByTransactionNo(@Param("transactionNo") String transactionNo);

// Use case 2: PaymentResult + MerchantTerminal 필요
@EntityGraph(attributePaths = {"paymentResult", "merchantTerminal"})
@Query("SELECT p FROM Payment p WHERE p.transactionNo = :transactionNo")
Optional<Payment> findWithResultAndTerminalByTransactionNo(@Param("transactionNo") String transactionNo);
```

- 해당 메서드에서만 fetch plan 오버라이드 (기존 메서드 영향 없음)
- JOIN 1회로 필요한 연관관계만 로드
- 나머지 EAGER 연관관계는 로드하지 않음

### 2. Fetch 타입 LAZY로 변경 (근본 해결)

```java
@OneToOne(mappedBy = "payment", cascade = CascadeType.PERSIST, fetch = FetchType.LAZY)
private PaymentResult paymentResult;

@OneToOne(mappedBy = "payment", fetch = FetchType.LAZY)
private PaymentStep1Request paymentStep1Request;
```

필요 시 `@EntityGraph` 또는 `JOIN FETCH`로 명시적으로 로드.

### 3. QueryDSL `fetchJoin` (복잡한 동적 조건)

```java
public Optional<Payment> findWithPaymentResult(String transactionNo) {
    return Optional.ofNullable(
        queryFactory
            .selectFrom(payment)
            .leftJoin(payment.paymentResult).fetchJoin()
            .where(payment.transactionNo.eq(transactionNo))
            .fetchOne()
    );
}
```

### 4. `@BatchSize` - `@OneToMany` 리스트 조회 시

```java
@OneToMany(mappedBy = "payment")
@BatchSize(size = 100)
private Set<PaymentItem> paymentItems;
```

N+1 → IN절 2 queries로 감소:
```sql
SELECT * FROM payment_item WHERE payment_id IN (1, 2, 3, ... 100)
```

---

## OneToOne vs OneToMany JOIN 성능 비교

| 관계 | JOIN 방식 | Cartesian Product | 권장 전략 |
|------|----------|-------------------|----------|
| `@OneToOne` | ✅ 항상 유리 | 없음 (1:1) | `@EntityGraph` |
| `@ManyToOne` | ✅ 항상 유리 | 없음 (N:1) | `@EntityGraph` |
| `@OneToMany` 단건 | ⚠️ DISTINCT 필요 | 발생 (중복 행) | 별도 쿼리 2회 |
| `@OneToMany` 리스트 | ❌ 위험 | 심각한 데이터 뻥튀기 | `@BatchSize` |

### @OneToMany + JOIN 문제 예시

```
Payment (1건) + PaymentItems (3건) JOIN 결과:

payment_id | amount | item_id | item_name
    1      | 10000  |    1    | 커피       ← payment 행 중복
    1      | 10000  |    2    | 케이크     ← payment 행 중복
    1      | 10000  |    3    | 주스       ← payment 행 중복
```

→ Payment 데이터가 item 수만큼 중복 전송 → 메모리/네트워크 낭비

---

## 1차 캐시 (Persistence Context) 고려

```java
// 같은 트랜잭션 내라면 N+1 발생 안 함
Payment payment = paymentRepository.findById(1L);  // 1차 캐시 적재

// payment가 캐시에 있으면 추가 쿼리 없음
settlementHistory.getPayment();  // 캐시 히트 → 0 queries
```

**주의**: DTO 기반 조회 시 Payment 객체가 1차 캐시에 없을 수 있음 → N+1 발생 가능.

---

## Set.of() + null = NPE 함정

```java
// Set.of()는 null 조회 자체를 금지
private static final Set<String> ALLOWED = Set.of("cresoty");

ALLOWED.contains(null);  // 💥 NullPointerException!
// at ImmutableCollections$Set12.contains(...)

// 해결: null 체크 선행
String code = payment.getPartnerCode();
if (code != null && ALLOWED.contains(code)) { ... }
```

`HashSet`, `Collections.unmodifiableSet`은 `contains(null)` 시 `false` 반환 (NPE 없음).

---

## 교훈

1. `@EntityGraph`는 엔티티 수정 없이 용도별 fetch plan을 정의하는 가장 현실적인 방법
2. `@OneToOne`은 항상 JOIN이 유리, `@OneToMany`는 JOIN보다 별도 쿼리 or `@BatchSize`
3. DTO 조회 시 1차 캐시 미적재 → LAZY 연관관계 접근 시 N+1 발생
4. `Set.of()`는 null-safe하지 않음 → 외부 입력값 `contains()` 전 null 체크 필수

## 참고

- [[kafka-dlt]]
- [[transaction-event-publishing]]
