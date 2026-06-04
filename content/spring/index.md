---
title: Spring
---

# Spring

Spring Framework / Spring Boot 관련 설계 패턴, 트랜잭션, 테스트 전략 등을 정리한 도메인.

## Topics

- [Facade + Delegation 패턴 조합](/spring/facade-delegation-pattern) — 횡단 관심사를 단일 진입점에서 조율하고 각 구현을 위임 메서드로 분리하는 패턴
- [@TransactionalEventListener + @Transactional 충돌 해결](/spring/transactional-event-listener) — AFTER_COMMIT 이벤트 핸들러에서 전파 레벨 제약과 fallbackExecution 처리
- [Bean 초기화 순서 제어](/spring/bean-initialization-order) — @PostConstruct vs ApplicationReadyEvent, @DependsOn을 이용한 초기화 순서 보장
- [단위 테스트 vs 통합 테스트](/spring/unit-test-vs-integration-test) — 선택 기준, Mockito 작성 전략, RestClient fluent chain mock 패턴

## Related

- [Cross-Domain](/cross-domain)
