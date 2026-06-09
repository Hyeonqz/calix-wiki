---
title: Concepts
---

# Concepts

Spring Boot / JPA / Kafka 등 실무에서 정리한 개념과 모범사례.

## Topics

- [JPA N+1 문제와 해결 전략](/concepts/jpa-n-plus-one) — N+1 쿼리 원인과 EntityGraph, BatchSize 등 해결법
- [Kafka DLT (Dead Letter Topic)](/concepts/kafka-dlt) — 실패 메시지 보관소 설계와 운영 모범사례
- [Spring @TransactionalEventListener 모범사례](/concepts/payment-completion-gateway) — 트랜잭션 커밋 후 이벤트 처리, Gateway 패턴
- [트랜잭션과 이벤트 발행 모범사례](/concepts/transaction-event-publishing) — publishEvent, fallbackExecution, 리스너 설계
- [REST API Resource Naming 규칙](/concepts/rest-resource-naming) — 리소스 단수(Document)·복수(Collection) 구분과 URI 설계
- [패키지/클래스/테이블 단수·복수 네이밍 규칙](/concepts/package-naming-singular-plural) — 패키지·클래스는 단수, DB 테이블은 복수인 이유
