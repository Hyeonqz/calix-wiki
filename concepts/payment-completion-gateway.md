---
tags: [spring, transaction, event, async, gateway, payment, best-practices]
created: 2026-04-20
updated: 2026-04-20
sources: [qrgw-payment 세션 2026-04-15~20]
related: [[transaction-event-publishing]], [[kafka-dlt]]
---

# Spring @TransactionalEventListener 모범사례

> Spring Boot 3.x / JPA / 결제 시스템 기준

---

## 핵심 원칙

```
@TransactionalEventListener(AFTER_COMMIT) 은
활성 트랜잭션이 COMMIT된 직후에만 실행된다.

트랜잭션이 없으면 → 리스너가 영원히 실행되지 않는다.
트랜잭션이 있으면 → COMMIT 후 리스너가 실행된다.
```

---

## 왜 문제가 생기는가

### 안티패턴 — 트랜잭션 없는 곳에서 publishEvent()

```java
// processPayment()에 @Transactional 없음
@Async("linePayExecutor")
public CompletableFuture<ResponseEntity<Void>> processPayment(String orderId) {

    // 외부 API 호출들...
    Payment saved = persistenceService.savePayment(payment, outputs);

    // 트랜잭션이 없는 상태에서 발행
    eventPublisher.publishEvent(new PaymentCompletedEvent(saved));
    // → @TransactionalEventListener 리스너 실행 안 됨
}
```

```
실행 흐름:
  processPayment() 스레드 → 트랜잭션 없음
  savePayment() → 내부 @Transactional 시작 → COMMIT → 종료
  publishEvent() → 트랜잭션 없음 → AFTER_COMMIT 트리거 없음
  리스너: 무반응
```

### 왜 @Async 메서드는 트랜잭션을 받지 못하는가

```java
// 호출자 스레드 (트랜잭션 있어도)
linePayDispatch.processPayment(orderId); // @Async → 별도 스레드로 분기

// linePayExecutor 스레드 (새 스레드)
// Spring TX Context = null  ← 스레드 로컬이라 전파 불가
```

Spring 트랜잭션은 ThreadLocal 기반이다. `@Async`로 새 스레드가 생성되는 순간 트랜잭션 컨텍스트가 끊긴다.

---

## 올바른 구조 — PaymentCompletionGateway 패턴

### 설계 원칙

```
savePayment()       → 저장만 담당 (SRP)
PaymentCompletionGateway → 이벤트 발행 담당 (SRP)
```

Gateway가 `TransactionSynchronizationManager`로 트랜잭션 유무를 직접 감지하여 처리한다. 호출자는 트랜잭션 유무를 신경 쓰지 않아도 된다.

### 두 가지 접근법 비교

| 접근법 | 방식 | 장점 | 단점 |
|--------|------|------|------|
| `fallbackExecution = true` | 리스너에 옵션 추가 | 간단 | 리스너마다 설정 필요, TX 없으면 즉시 실행 |
| `TransactionSynchronizationManager` | Gateway가 TX 감지 | 발행 시점에서 제어, 호출자 투명 | 구현이 약간 복잡 |

**권장: `TransactionSynchronizationManager` 방식** — Gateway가 책임지므로 리스너는 TX 유무를 신경 쓸 필요 없음.

---

## 구현 코드

### PaymentCompletionGateway

```java
@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentCompletionGateway {

    private final ApplicationEventPublisher eventPublisher;

    /**
     * 트랜잭션 활성 여부를 내부에서 자동 판단
     * - 트랜잭션 있음 → COMMIT 후 발행 (AFTER_COMMIT)
     * - 트랜잭션 없음 → 즉시 발행
     *
     * 호출자는 트랜잭션 유무를 신경 쓰지 않아도 됨
     */
    public void complete(Payment payment) {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        publish(payment);
                    }
                }
            );
            log.debug("[Gateway] AFTER_COMMIT 이벤트 등록 - txNo: {}",
                payment.getTransactionNo());
        } else {
            publish(payment);
            log.debug("[Gateway] 즉시 이벤트 발행 - txNo: {}",
                payment.getTransactionNo());
        }
    }

    /**
     * 트랜잭션 COMMIT 이후 발행 (명시적 버전)
     * 반드시 활성 트랜잭션 안에서 호출해야 함
     */
    public void publishAfterCommit(Payment payment) {
        if (!TransactionSynchronizationManager.isActualTransactionActive()) {
            throw new IllegalStateException(
                "publishAfterCommit은 활성 트랜잭션 안에서 호출해야 합니다. txNo: "
                + payment.getTransactionNo()
            );
        }
        TransactionSynchronizationManager.registerSynchronization(
            new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    publish(payment);
                }
            }
        );
    }

    /**
     * 트랜잭션 없이 즉시 발행
     */
    public void publishImmediately(Payment payment) {
        publish(payment);
    }

    private void publish(Payment payment) {
        eventPublisher.publishEvent(new PaymentStateUpdatedEvent(payment));
        eventPublisher.publishEvent(new PaymentCompletedEvent(payment));
    }
}
```

### savePayment — 저장 후 Gateway 호출

```java
@Transactional
public Payment savePayment(Payment payment, IlkApproveOutputs response) {

    // [1] payment 저장
    if (SUCCESS.equals(response.getStatus())) {
        payment.updateLatestStage(PaymentConstants.PaymentStage.Q1APR);
        payment.updateState(PaymentConstants.PaymentState.COMPLETED);
    } else {
        payment.updateLatestStage(PaymentConstants.PaymentStage.Q1FAL);
        payment.updateState(PaymentConstants.PaymentState.FAILED);
    }
    Payment saved = paymentRepository.save(payment);

    // [2] payment_result 저장
    paymentResultRepository.save(buildPaymentResult(payment, response));

    // [3] 이벤트 발행 위임 — Gateway가 트랜잭션 감지 후 AFTER_COMMIT 등록
    paymentCompletionGateway.complete(saved);

    return saved;
}
```

### processPayment — 외부 API는 트랜잭션 밖

```java
@Async("linePayExecutor")
// @Transactional 없음 — 의도적. 외부 API가 포함되어 있어 커넥션 점유 방지
public CompletableFuture<ResponseEntity<Void>> processPayment(String orderId) {

    Payment payment = loadPaymentPort.findByTransactionNo(orderId);

    // 외부 API 호출 — 트랜잭션 밖 (의도적)
    LinepayCardInfoOutputs cardInfo = linePayExternalApiService.cardInfoRequest(...);
    IlkApproveOutputs approveOutputs = linePayExternalApiService.cardApproveRequest(...);

    // savePayment 내부의 @Transactional 안에서 Gateway.complete() 호출됨
    Payment savedPayment = persistenceService.savePayment(payment, approveOutputs);

    // 알림 송신 — 트랜잭션 밖
    linePayExternalApiService.sendApprovalNotification(...);

    return CompletableFuture.completedFuture(responseEntity);
}
```

---

## 전체 트랜잭션 흐름

```
linePayExecutor 스레드
  │
  ├─ cardInfoRequest()              // 외부 API — TX 없음, DB 커넥션 미점유
  ├─ cardApproveRequest()           // 외부 API — TX 없음, DB 커넥션 미점유
  │
  ├─ savePayment()
  │     @Transactional 시작          // DB 커넥션 획득 (여기서만)
  │     ├─ paymentRepository.save()
  │     ├─ paymentResultRepository.save()
  │     └─ Gateway.complete()
  │           └─ TransactionSynchronizationManager 감지
  │                 → 트랜잭션 활성 → AFTER_COMMIT 큐에 등록
  │     COMMIT                        // DB 커넥션 반환
  │           └─ AFTER_COMMIT 트리거
  │                 ├─ PaymentStateUpdateListener   (eventListenerExecutor)
  │                 └─ RealTimeTransactionListener  (eventListenerExecutor)
  │
  └─ sendApprovalNotification()      // TX 없음
```

---

## 리스너 구현

### PaymentStateUpdateListener

```java
@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentStateUpdateListener {

    private final TransactionStateRedisRepository redisRepository;

    @Async("eventListenerExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void updateState(PaymentStateUpdatedEvent event) {
        try {
            redisRepository.updateState(getTransactionState(event.payment()));
        } catch (Exception e) {
            log.error("[Redis State Update] 실패 | 거래번호: {} | Cause: {}",
                event.payment().getTransactionNo(), e.getMessage(), e);
            // Redis 캐시 실패는 조용히 삼킴 — 다음 조회 시 DB에서 보정 가능
        }
    }
}
```

### RealTimeTransactionListener

```java
@Slf4j
@Component
@RequiredArgsConstructor
public class RealTimeTransactionListener {

    private final KafkaRealTimeTransactionProducer realTimeTransactionProducer;
    private final LoadMerchantPort loadMerchantPort;
    private final AgencyRepository agencyRepository;

    @Async("eventListenerExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onCompleted(PaymentCompletedEvent event) {
        try {
            Payment payment = event.payment();
            if (!RealTimeAgency.isAllowed(payment.getPartnerCode())) return;

            loadMerchantPort.findMerchantByMerchantId(payment.getMerchantId())
                .flatMap(merchant -> agencyRepository.findById(merchant.getAgencyId()))
                .ifPresent(agency ->
                    realTimeTransactionProducer.sendRealtimeTransactionBatch(
                        payment.getTransactionNo(),
                        agency.getCode(),
                        payment.getPosCommunicationMethod()
                    )
                );
        } catch (Exception e) {
            log.error("[RealTime Send] 실패 | 거래번호: {} | Cause: {}",
                event.payment().getTransactionNo(), e.getMessage(), e);
        }
    }
}
```

---

## 이벤트 DTO — POJO record 방식 (Spring 4.2+ 표준)

```java
// ❌ ApplicationEvent 상속 방식은 레거시
// public class PaymentCompletedEvent extends ApplicationEvent { ... }

// ✅ POJO record 방식 — 프레임워크 의존성 없음, 불변, 멀티스레드 안전
public record PaymentStateUpdatedEvent(Payment payment) {}
public record PaymentCompletedEvent(Payment payment) {}
```

### 엔티티 대신 DTO를 사용해야 하는 이유

```java
// ⚠️ 위험 — Lazy 로딩 가능성
public record PaymentCompletedEvent(Payment payment) {}

// ✅ 안전 — 필요한 값만 추출 (트랜잭션 안, 세션 유효한 시점에 추출)
public record PaymentCompletedEvent(
    String transactionNo,
    String terminalUuid,       // payment.getMerchantTerminal().getUuid() — 세션 필요
    String stateCode,
    String latestStageCode,
    String partnerCode,
    Long   merchantId,
    String posCommunicationMethod
) {}
```

AFTER_COMMIT 이후에는 JPA 세션이 닫혀있다. `@Async` 리스너에서 Payment 엔티티의 Lazy 필드에 접근하면 `LazyInitializationException` 발생.

---

## eventListenerExecutor 스레드풀 설정

```java
@Configuration
public class AsyncConfig implements AsyncConfigurer {

    @Bean("eventListenerExecutor")
    public Executor eventListenerExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("event-listener-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
```

`CallerRunsPolicy`: 큐가 가득 차면 호출자 스레드에서 직접 실행 (이벤트 유실 방지).

---

## 각 컴포넌트 단일 책임 정리

| 컴포넌트 | 책임 | 트랜잭션 |
|---|---|---|
| `LinePayDispatch.processPayment()` | 결제 플로우 조율, 외부 API 호출 | 없음 (의도적) |
| `LinePayPersistenceService.savePayment()` | DB 저장만 | `@Transactional` |
| `PaymentCompletionGateway` | 이벤트 발행 조율, TX 감지 | 없음 (내부 감지) |
| `PaymentStateUpdateListener` | Redis 상태 업데이트 | AFTER_COMMIT |
| `RealTimeTransactionListener` | Kafka 실시간 전송 | AFTER_COMMIT |

---

## 교훈 — 자주 하는 실수 체크리스트

- `@Async` 메서드에 `@Transactional`을 기대하고 `publishEvent()` 호출
  → `@Async`는 새 스레드. 트랜잭션 컨텍스트 전파 안 됨

- 외부 API 호출을 `@Transactional` 범위 안에 포함
  → DB 커넥션 점유 시간 증가 → 커넥션 풀 고갈 위험

- `@TransactionalEventListener` 리스너에 `@Async` 없이 무거운 작업 처리
  → 이벤트 발행 스레드 블로킹

- 리스너에서 예외 처리 없이 예외 전파
  → catch로 삼키지 않으면 결제 성공 건이 실패 처리될 수 있음

- Payment 엔티티를 이벤트에 직접 담고 `@Async` 리스너에서 Lazy 로딩 접근
  → AFTER_COMMIT 이후 JPA 세션 없음 → `LazyInitializationException`

---

## 참고

- [[transaction-event-publishing]] — 개념 정리 (이벤트 발행 기본, 리스너 필터링 패턴)
- [[kafka-dlt]] — Kafka DLT 설계 (이벤트 리스너에서 Kafka 전송 실패 시 DLT 처리)
