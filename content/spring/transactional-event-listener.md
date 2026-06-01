---
title: "@TransactionalEventListener + @Transactional 충돌 해결"
category: "spring"
tags: [spring, transaction, event, kafka, async]
created: 2026-05-29
updated: 2026-05-29
---

# @TransactionalEventListener + @Transactional 충돌 해결

## 개요

Spring에서 `@TransactionalEventListener`와 `@Transactional`을 함께 사용할 때 발생하는
전파 레벨 제약과 해결 방법을 정리한다.

---

## 원인

`@Transactional` 기본 전파 레벨(`REQUIRED`)이 전역 AOP 또는 설정에 의해 자동으로
이벤트 핸들러 메서드에 적용될 때, Spring이 시작 시점에 아래 오류를 던진다.

```
@TransactionalEventListener method must not be annotated with @Transactional
unless when declared as REQUIRES_NEW or NOT_SUPPORTED
```

### 발생 조건

- `@TransactionalEventListener`가 붙은 메서드에
- `@Transactional` (propagation = `REQUIRED` 또는 기타 비허용 레벨)이 함께 존재하는 경우

전역 AOP로 `@Transactional(readOnly = true)`가 모든 컴포넌트에 자동 적용되는 환경에서
빈번히 발생한다.

---

## 분석

### @EventListener vs @TransactionalEventListener 차이

| 항목 | `@EventListener` | `@TransactionalEventListener` |
|------|-----------------|-------------------------------|
| 실행 시점 | `publishEvent()` 호출 즉시 | 트랜잭션 단계(`AFTER_COMMIT` 등) 이후 |
| 트랜잭션 내 발행 | 미커밋 상태에서 핸들러 실행 가능 | 커밋 완료 후 실행 보장 |
| 트랜잭션 없을 때 | 항상 실행 | 기본적으로 무시 (`fallbackExecution = true`로 해결) |

### 왜 @EventListener가 위험한가

```
@Transactional
public void processCpmApprovalResponse(...) {
    payment.updateState(COMPLETED);
    paymentRepository.save(payment);        // ← DB 미커밋

    eventPublisher.publishEvent(event);     // ← @EventListener면 즉시 실행
}                                           //   @Async 스레드에서 DB 조회 시
                                            //   미커밋 데이터를 읽을 수 있음
```

### Spring의 @TransactionalEventListener 전파 제약

Spring은 `@TransactionalEventListener` 메서드에 `@Transactional`을 함께 사용할 때
두 가지 전파 레벨만 허용한다.

| 전파 레벨 | 허용 여부 | 이유 |
|-----------|---------|------|
| `REQUIRED` (기본값) | **불가** | AFTER_COMMIT 단계에서 원 트랜잭션에 참여 불가 |
| `MANDATORY`, `SUPPORTS` 등 | **불가** | 동일 이유 |
| `REQUIRES_NEW` | **허용** | 독립된 새 트랜잭션 시작 |
| `NOT_SUPPORTED` | **허용** | 트랜잭션 없이 실행 |

---

## 해결

### @Transactional(propagation = REQUIRES_NEW) 명시

```java
@Async("kafkaSendExecutor")
@TransactionalEventListener(
    classes = IntegrationTransactionPublishEvent.class,
    phase = TransactionPhase.AFTER_COMMIT,
    fallbackExecution = true            // 트랜잭션 외부 발행도 실행
)
@Transactional(propagation = Propagation.REQUIRES_NEW)  // 새 트랜잭션 명시
public void handleIntegrationTransactionPublish(IntegrationTransactionPublishEvent event) {
    // DB 조회 (merchantPersistenceFacade.getMerchant) + Kafka 전송
}
```

### fallbackExecution = true 가 필요한 이유

기존 D-MPM 흐름은 `@Transactional` 외부(수동 커밋 후)에서 `publishEvent()`를 호출한다.
`@TransactionalEventListener`의 기본 동작은 활성 트랜잭션 없으면 이벤트를 무시하므로,
`fallbackExecution = true`로 트랜잭션 없이 발행해도 실행되도록 보장한다.

```java
// QrCallbackService - 기존 D-MPM (트랜잭션 외부에서 발행)
transactionManager.commit(transactionStatus);           // 커밋
eventPublisher.publishEvent(integrationEvent);          // 발행 (트랜잭션 없음)
// → fallbackExecution = true 없으면 이 이벤트는 무시됨
```

### 단일 발행 포인트 설계

```java
@Transactional
public CpmHolder processCpmApprovalResponse(...) {
    CpmHolder result = switch (status) {
        case SUCCESS    -> handleSuccess(...);    // payment.state = COMPLETED
        case DECLINED   -> handleDeclined(...);   // payment.state = FAILED
        case USERPAYING -> handleUserPaying(...); // 폴링 후 SUCCESS or FAILED
        default         -> handleUnknownStatus(...);
    };

    // 단일 포인트: failRef == null = 성공 (SUCCESS, USERPAYING→SUCCESS 공통)
    if (result.failRef() == null) {
        eventPublisher.publishEvent(
            new IntegrationTransactionPublishEvent(payment, TransactionType.PAYMENT)
        );
    }

    return result;
    // @Transactional 메서드 종료 → DB 커밋
    // → @TransactionalEventListener(AFTER_COMMIT) 트리거
    // → @Async 스레드에서 Kafka 전송
}
```

---

## 전체 실행 흐름

```
processCpmApprovalResponse() @Transactional
    │
    ├── switch 분기 처리 + paymentRepository.save()
    │
    ├── failRef == null → publishEvent()   (등록만, 아직 미실행)
    │
    └── 메서드 종료 → DB 커밋
                        │
                        └── AFTER_COMMIT 트리거
                                │
                                └── @Async kafkaSendExecutor 스레드
                                        │
                                        ├── @Transactional(REQUIRES_NEW) 새 트랜잭션
                                        ├── merchantPersistenceFacade.getMerchant() DB 조회
                                        └── Kafka 전송
```

---

## 배운 점

1. **`@EventListener`는 트랜잭션 내 이벤트 발행에 적합하지 않다.**
   `@Async`와 결합해도 DB 커밋 타이밍을 보장하지 않아 Race Condition이 생긴다.

2. **`@TransactionalEventListener(AFTER_COMMIT)`으로 커밋 보장을 선언적으로 처리할 수 있다.**
   코드에서 커밋 여부를 직접 관리하지 않아도 된다.

3. **전역 AOP로 `@Transactional`이 자동 적용되는 환경에서는**
   이벤트 핸들러에 `REQUIRES_NEW` 또는 `NOT_SUPPORTED`를 명시해야 한다.

4. **`fallbackExecution = true`는 기존 코드와의 하위호환을 위한 안전장치다.**
   트랜잭션 내부/외부 양쪽에서 발행하는 혼합 환경에서 필수.

5. **단일 발행 포인트**는 분기 결과를 변수로 받아 `failRef == null` 하나로 판단하면
   모든 케이스(SUCCESS, USERPAYING→SUCCESS)를 커버하고 로직 산재를 막는다.
