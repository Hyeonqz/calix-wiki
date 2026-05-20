---
tags: [kafka, messaging, error-handling, dlt, dead-letter, best-practices]
created: 2026-04-16
updated: 2026-04-16
sources: [qrgw-payment 세션 2026-04-16]
related: [[kafka-consumer-config]], [[spring-boot]]
---

# Kafka DLT (Dead Letter Topic)

## 핵심 개념

DLT는 Kafka Consumer가 메시지 처리에 실패했을 때, 해당 메시지를 보관하는 **최종 실패 메시지 보관소**.
Spring Kafka의 `DeadLetterPublishingRecoverer`가 원본 토픽명에 `.DLT` 접미사를 붙여서 자동 발행한다.

```
원본 토픽: realtime-transaction-batch
DLT 토픽: realtime-transaction-batch.DLT
```

## 동작 흐름

```
Producer → 원본 토픽 → Consumer (메인 리스너)
                         ↓ 실패
                    DefaultErrorHandler
                         ↓ 재시도 (FixedBackOff)
                         ↓ 최종 실패
                    DeadLetterPublishingRecoverer
                         ↓
                    {topic}.DLT → DLT 전용 리스너
```

## DLT 메시지 구조

DLT 토픽에 쌓이는 메시지는 원본을 **그대로 복사** + 에러 정보를 Header에 추가한 구조:

| 필드 | 내용 |
|------|------|
| Key | 원본 메시지 Key (그대로) |
| Value | 원본 메시지 Value (바이트 그대로) |
| `kafka_dlt-exception-message` | 예외 메시지 (`KafkaHeaders.EXCEPTION_MESSAGE`) |
| `kafka_dlt-original-topic` | 원본 토픽명 (`KafkaHeaders.ORIGINAL_TOPIC`) |
| `kafka_dlt-exception-stacktrace` | 전체 스택트레이스 |
| `kafka_dlt-original-partition` | 원본 파티션 번호 |
| `kafka_dlt-original-offset` | 원본 오프셋 |

Kafka UI에서 Value가 "암호화된 것처럼" 보이는 이유: `JsonSerializer`가 만든 바이트 배열을 UI가 해석 못하기 때문. Value deserializer를 JSON으로 설정하면 정상 표시.

## 설계 기준 (브로커 3대)

### Replicas vs MIN_IN_SYNC_REPLICAS

| 설정 | 역할 | 권장값 |
|------|------|--------|
| `replicas` | 데이터 사본 수 (리더 포함) | 3 |
| `min.insync.replicas` | 쓰기 성공 최소 동기화 수 | 2 |

- 브로커 1대 다운 → 2/3 동기화 → 읽기/쓰기 정상
- 브로커 2대 다운 → 1/3 → 읽기 가능, 쓰기 거부 (데이터 유실 방지)

### DLT 토픽 설정

```java
TopicBuilder
    .name(topic + ".DLT")
    .partitions(1)           // 실패 메시지는 소량, 순서 보장 유리
    .replicas(3)             // 유실 방지
    .config(TopicConfig.RETENTION_MS_CONFIG, Duration.ofDays(14).toMillis())
    .config(TopicConfig.MIN_IN_SYNC_REPLICAS_CONFIG, "2")
    .build();
```

## 교훈

### .DLT.DLT 체인 문제

DLT 리스너가 메인 리스너와 **동일한 `ContainerFactory`** (DeadLetterPublishingRecoverer 포함)를 사용하면, DLT 리스너 실패 시 `.DLT.DLT` 토픽이 생성되는 무한 체인 발생.

**원인**: DLT 리스너의 `@Header` 파라미터 바인딩 실패 (헤더 없음), 역직렬화 실패 등이 `try-catch` 바깥에서 발생.

**해결**: DLT 전용 ContainerFactory를 만들어서 `DeadLetterPublishingRecoverer` 제거:

```java
@Bean("dltKafkaListenerContainerFactory")
public ConcurrentKafkaListenerContainerFactory<String, Object> dltFactory(
    ConsumerFactory<String, Object> consumerFactory) {
    var factory = new ConcurrentKafkaListenerContainerFactory<String, Object>();
    factory.setConsumerFactory(consumerFactory);
    factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.MANUAL);
    // DLT에서는 재발행 없이 로그만
    factory.setCommonErrorHandler(new DefaultErrorHandler(new FixedBackOff(0L, 0L)));
    return factory;
}
```

### @Header required = false

DLT 리스너에서 헤더를 읽을 때 `required = false` 추가 권장:

```java
@Header(name = KafkaHeaders.EXCEPTION_MESSAGE, required = false) String errorMessage
```

수동으로 DLT 토픽에 메시지를 넣거나 헤더 없는 메시지가 들어올 경우 메서드 진입 전 예외를 방지.

## 모범사례 (Best Practices)

### 1. DLT 토픽은 명시적으로 생성하라

`auto.create.topics.enable=true`에 의존하지 말고 `NewTopic` Bean으로 명시적 생성. 자동 생성 시 브로커 기본값(파티션 1, 기본 retention)이 적용되어 운영에 부적합.

```java
@Bean
public NewTopic realtimeTransactionDltTopic() {
    return TopicBuilder
        .name(topic + ".DLT")
        .partitions(1)
        .replicas(3)
        .config(TopicConfig.RETENTION_MS_CONFIG, String.valueOf(Duration.ofDays(14).toMillis()))
        .config(TopicConfig.MIN_IN_SYNC_REPLICAS_CONFIG, "2")
        .build();
}
```

### 2. DLT 리스너는 반드시 전용 ContainerFactory를 사용하라

메인 리스너와 같은 factory를 쓰면 `.DLT.DLT` 체인 발생. DLT 전용 factory에는 `DeadLetterPublishingRecoverer`를 **제거**한다.

### 3. DLT 리스너의 @Header는 `required = false`로 선언하라

헤더가 없는 메시지가 들어오면 메서드 진입 전에 예외가 발생하여 `try-catch`로 잡을 수 없음.

### 4. DLT에서 최종 실패 시 알림을 발송하라

DLT는 **마지막 방어선**. 여기서도 실패하면 사람이 개입해야 하므로 Telegram/Slack 등으로 즉시 알림.

```java
catch (Exception e) {
    log.error("[DLT] 최종 실패 - txNo: {}", dto.transactionNo(), e);
    telegramProvider.sendAlert(...);  // 반드시 알림
    acknowledgment.acknowledge();     // 더 이상 재시도 없음
}
```

### 5. DLT retention은 원본보다 길게 설정하라

| 토픽 | 권장 retention |
|------|---------------|
| 원본 | 7일 (기본) |
| DLT | 14~30일 |

실패 메시지는 디버깅/재처리에 여유가 필요하므로 최소 2배 이상.

### 6. DLT 파티션은 1개로 충분하다

실패 메시지는 소량이며, 파티션이 1개면 **실패 순서가 보장**되어 디버깅이 쉽다. 원본 토픽과 같은 파티션 수를 줄 필요 없음.

### 7. 메인 리스너의 재시도 전략을 적절히 설정하라

DLT로 보내기 전에 메인 리스너에서 충분히 재시도:

```java
// 1초 간격, 최대 2회 재시도 → 실패 시 DLT
new DefaultErrorHandler(
    new DeadLetterPublishingRecoverer(kafkaTemplate),
    new FixedBackOff(1000L, 2L)
);
```

네트워크 일시적 오류는 재시도로 해결되므로, DLT에는 **진짜 처리 불가능한 메시지만** 도달해야 한다.

### 8. DLT 메시지 모니터링 체계를 갖추라

- Kafka UI에서 DLT 토픽 Consumer Lag 모니터링
- DLT 메시지 유입 시 Prometheus 메트릭 + Grafana 알림
- 주기적으로 DLT 토픽 잔여 메시지 확인

## 참고

- [[kafka-consumer-config]]
- [[spring-boot]]
