---
title: "Spring Bean 초기화 순서 제어 — @PostConstruct vs ApplicationReadyEvent"
category: "spring"
tags: [spring, bean-lifecycle, PostConstruct, ApplicationReadyEvent, DependsOn, initialization]
created: 2026-06-02
updated: 2026-06-02
---

# Spring Bean 초기화 순서 제어 — @PostConstruct vs ApplicationReadyEvent

## 개요

Spring 컨텍스트가 뜨는 과정에서 특정 빈이 다른 빈의 초기화 결과에 의존하는 경우,
초기화 순서를 명시적으로 제어해야 한다.
대표적인 두 가지 방법이 `@PostConstruct` + `@DependsOn`과 `@EventListener(ApplicationReadyEvent.class)`다.

---

## Spring Boot 기동 타임라인

```
[1] 빈 인스턴스 생성 (new)
[2] 의존성 주입 (생성자 / @Autowired)
[3] @PostConstruct 실행           ← 빈 단위로 즉시 실행 (순서 불명확)
[4] 컨텍스트 완전 로딩 완료
[5] ApplicationReadyEvent 발행    ← 모든 @PostConstruct 이후 단 한 번
[6] HTTP 요청 수신 시작
```

---

## 두 방식 비교

| 항목 | `@PostConstruct` | `@EventListener(ApplicationReadyEvent)` |
|------|-----------------|----------------------------------------|
| 실행 시점 | 해당 빈 초기화 직후 | 컨텍스트 전체 로딩 완료 후 |
| 다른 빈 준비 보장 | **보장 안 됨** (순서 불명확) | **보장됨** (모든 빈 초기화 완료) |
| 순서 제어 방법 | `@DependsOn` 필요 | `@Order`로 리스너 간 순서 제어 |
| 리팩토링 안전성 | 빈 이름 하드코딩 위험 | 없음 |
| 사용 적합 대상 | 단순 자기 초기화 | 다른 빈의 상태에 의존하는 초기화 |

---

## `@PostConstruct` + `@DependsOn` 방식

다른 빈의 `@PostConstruct`가 먼저 완료되어야 할 때 사용.

```java
// 먼저 실행되어야 하는 빈 — 스토리지에 데이터를 채움
@Component("serviceInitializer")
public class ServiceInitializer {

    @PostConstruct
    void onPostConstruct() {
        List<PaymentCompany> companies = paymentCompanyRepository.findAllEager();
        paymentCompanyStorages.convertPaymentCompanies(companies);  // 인메모리 캐시 초기화
    }
}

// ServiceInitializer가 완료된 후 초기화되어야 하는 빈
@DependsOn("serviceInitializer")
@Component
public class LinePayDispatch {

    @PostConstruct
    public void init() {
        // paymentCompanyStorages가 이미 채워진 상태
        PaymentCompany company = paymentCompanyProvider.getPaymentCompany("LINEPAY");
        if (company == null) throw new QRBankException(...);
        this.linepayService = paymentServiceFactory.createLinepayService(...);
    }
}
```

### 주의: `@Order`는 `@PostConstruct` 순서에 효과 없음

```java
@Order(Ordered.HIGHEST_PRECEDENCE)  // ← @Component에선 @PostConstruct 순서 미적용
@Component
public class ServiceInitializer { ... }
```

`@Order`는 `ApplicationListener`, `BeanPostProcessor`, `Filter` 등에서만 유효하다.
일반 `@Component`의 `@PostConstruct` 순서에는 영향을 주지 않는다.

---

## `@EventListener(ApplicationReadyEvent.class)` 방식

모든 빈 초기화가 완료된 시점 이후에 실행되므로 **순서 문제가 원천 차단**된다.

```java
// ServiceInitializer — @PostConstruct 그대로 유지
@Component("serviceInitializer")
public class ServiceInitializer {

    @PostConstruct
    void onPostConstruct() {
        paymentCompanyStorages.convertPaymentCompanies(...);
    }
}

// LinePayDispatch — @DependsOn 제거, ApplicationReadyEvent로 변경
@Component
public class LinePayDispatch {

    @EventListener(ApplicationReadyEvent.class)  // ← 모든 PostConstruct 완료 이후
    public void init() {
        PaymentCompany company = paymentCompanyProvider.getPaymentCompany("LINEPAY");
        if (company == null) throw new QRBankException(...);
        this.linepayService = paymentServiceFactory.createLinepayService(...);
    }
}
```

이 프로젝트의 `NonBeanLinePayConfig`가 동일한 패턴을 사용한다:

```java
@Component
@ConfigurationProperties(prefix = "qrbank.url.linepay")
public class NonBeanLinePayConfig {

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady(ApplicationReadyEvent event) {
        LinepayService.setLinepayService(baseUrl, channelId, cancelUrl);
    }
}
```

---

## 여러 `ApplicationReadyEvent` 리스너 간 순서 제어

같은 이벤트를 여러 리스너가 처리할 때 `@Order`가 유효하다.

```java
@Order(1)
@EventListener(ApplicationReadyEvent.class)
public void initFirst() { ... }   // 먼저 실행

@Order(2)
@EventListener(ApplicationReadyEvent.class)
public void initSecond() { ... }  // 나중에 실행
```

---

## 선택 기준

```
초기화 로직이 자기 자신의 필드만 설정한다
  → @PostConstruct (단순하고 직관적)

초기화 로직이 다른 빈의 @PostConstruct 결과를 읽어야 한다
  → @EventListener(ApplicationReadyEvent.class) 또는 @DependsOn

@DependsOn vs ApplicationReadyEvent 선택 기준:
  - 빈 이름이 바뀔 가능성이 없고 단순한 경우 → @DependsOn
  - 여러 빈에 의존하거나 리팩토링 가능성이 있다 → ApplicationReadyEvent
```

---

## 실제 적용 사례 (이 프로젝트)

| 클래스 | 방식 | 이유 |
|--------|------|------|
| `ServiceInitializer` | `@PostConstruct` | 자체 스토리지 초기화, 다른 빈 의존 없음 |
| `LinePayDispatch` | `@EventListener(ApplicationReadyEvent)` | `ServiceInitializer`가 채운 스토리지 읽음 |
| `NonBeanLinePayConfig` | `@EventListener(ApplicationReadyEvent)` | 외부 서비스 static 초기화 |

---

## 참고

- [Spring Docs — @PostConstruct](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-postconstruct-and-predestroy-annotations)
- [Spring Docs — ApplicationReadyEvent](https://docs.spring.io/spring-boot/docs/current/api/org/springframework/boot/context/event/ApplicationReadyEvent.html)
- 관련 코드: `module-common/.../LinePayDispatch.java`, `module-common/.../NonBeanLinePayConfig.java`
