---
title: "Spring Cache — @Cacheable 동작 원리와 활용"
category: "spring"
tags: [spring, cache, cacheable, caffeine, concurrentmap, aop]
created: 2026-06-09
updated: 2026-06-09
---

# Spring Cache — @Cacheable 동작 원리와 활용

## 개요

Spring Cache는 AOP 기반으로 메서드 결과를 캐싱하는 추상화 레이어다.
`@Cacheable`, `@CacheEvict`, `@CachePut` 어노테이션으로 선언적 캐싱을 지원하며,
실제 저장소(ConcurrentMap, Caffeine, Redis 등)는 `CacheManager` 구현체로 교체 가능하다.

---

## 핵심 개념: CacheManager와 Cache

```
CacheManager (Spring 빈)
├── "currencies"            → Cache (실제 저장소: ConcurrentHashMap 등)
│     ├── "KRW" → CurrencyBase{...}
│     └── "USD" → CurrencyBase{...}
└── "hmacAuthSecretKeyCache" → Cache
      └── "posId_xxx" → SecretKey{...}
```

- **CacheManager**: 캐시 저장소들을 관리하는 컨테이너
- **Cache**: 이름을 가진 독립된 key-value 저장소 (서로 격리)
- `@Cacheable(value = "currencies")`의 `value`가 어느 Cache를 쓸지 지정

---

## 설정: CacheManager 등록

### Spring Boot 기본 (ConcurrentMapCacheManager)

```java
@Configuration
@EnableCaching
public class CacheConfig {

    public static final String CURRENCY_CACHE = "currencies";

    @Bean
    public CacheManager cacheManager() {
        ConcurrentMapCacheManager manager = new ConcurrentMapCacheManager();
        // setCacheNames() 호출 시 "정적 모드" — 목록에 없는 이름 사용 시 런타임 에러
        // setCacheNames() 없으면 "동적 모드" — 처음 사용 시 자동 생성
        manager.setCacheNames(Arrays.asList("hmacAuthSecretKeyCache", CURRENCY_CACHE));
        return manager;
    }
}
```

### Caffeine CacheManager (통계 + 세밀한 설정)

```java
@Bean
public CacheManager cacheManager() {
    CaffeineCacheManager manager = new CaffeineCacheManager();
    manager.registerCustomCache("currencies",
        Caffeine.newBuilder()
            .maximumSize(200)
            .recordStats()  // 히트율 통계
            .build()
    );
    return manager;
}
```

---

## @Cacheable 동작 원리

```
findCurrency("KRW") 호출
        │
        ▼
[Spring AOP Proxy가 가로챔]
        │
        ▼
CacheManager.getCache("currencies")   ← value로 저장소 탐색
        │
        ▼
cache.get("KRW")                      ← key="#currencyCode" → "KRW"
        │
  ┌─────┴──────┐
  │ HIT        │ MISS
  ▼            ▼
캐시 값 반환  원본 메서드 실행 (DB 조회)
(DB 조회X)   → 결과를 cache.put("KRW", result)
              → 반환
```

```java
@Cacheable(value = "currencies", key = "#currencyCode")
public CurrencyBase findCurrency(String currencyCode) {
    // 첫 번째 호출만 실행, 이후는 캐시에서 반환
    return loadCurrencyPort.findByCurrencyCode(currencyCode)
        .orElseThrow(...);
}
```

---

## key 표현식 (SpEL)

| 표현식 | 예시 | 설명 |
|--------|------|------|
| `#파라미터명` | `key = "#currencyCode"` | 파라미터 값 그대로 |
| `#객체.필드` | `key = "#user.id"` | 객체 필드 참조 |
| 문자열 조합 | `key = "#type + '_' + #id"` | 복합 키 |
| 상수 문자열 | `key = "'ALL'"` | 고정 키 (전체 목록 캐싱 시) |
| 조건부 | `condition = "#id > 0"` | 조건 만족 시만 캐싱 |

---

## 3가지 캐시 어노테이션

```java
// 1. @Cacheable — 캐시 있으면 반환, 없으면 실행 후 저장
@Cacheable(value = "currencies", key = "#code")
public CurrencyBase findByCode(String code) { ... }

// 2. @CacheEvict — 캐시에서 해당 항목 삭제 (데이터 변경 시)
@CacheEvict(value = "currencies", key = "#code")
public void updateCurrency(String code) { ... }

// 전체 초기화
@CacheEvict(value = "currencies", allEntries = true)
public void refreshAll() { ... }

// 3. @CachePut — 항상 메서드 실행 + 결과를 캐시에 저장 (강제 갱신)
@CachePut(value = "currencies", key = "#currency.code")
public CurrencyBase save(CurrencyBase currency) { ... }
```

---

## 지연 로딩 vs 사전 로딩

### 지연 로딩 (Lazy) — `@Cacheable`

```
서버 기동 → currencies 캐시: {}  (비어있음)

첫 번째 findCurrency("KRW") → DB 조회 → {"KRW": ...}
두 번째 findCurrency("KRW") → 캐시 반환 (DB 조회X)
```

- **장점**: 구현 단순, 실제 사용하는 항목만 캐싱
- **단점**: 첫 번째 호출은 DB hit
- **적합**: 참조 코드 수백 개 중 실제 사용은 소수인 경우

### 사전 로딩 (Eager) — `ApplicationRunner` 패턴

```java
@Component
public class CurrencyCache implements ApplicationRunner {
    private volatile Map<String, CurrencyBase> codeMap = new ConcurrentHashMap<>();

    @Override
    public void run(ApplicationArguments args) {
        // 서버 기동 시 전체 로드
        this.codeMap = loadCurrencyPort.findAll()
            .stream()
            .collect(Collectors.toMap(CurrencyBase::getCode, Function.identity()));
    }

    public CurrencyBase getByCode(String code) {
        return Optional.ofNullable(codeMap.get(code))
            .orElseThrow(() -> new QRBankException(WRONG_CURRENCY_CODE));
    }
}
```

- **장점**: 서버 기동 직후 모든 조회가 캐시 hit
- **단점**: `findAll()` Port 메서드 추가 필요, 기동 시간 소폭 증가
- **적합**: 배치 서버처럼 기동 직후 즉시 대량 처리가 시작되는 경우

---

## 캐시 저장소 선택 기준

| 저장소 | 언제 쓰는가 | 특징 |
|--------|------------|------|
| **ConcurrentMap** | 소량 정적 데이터, TTL 불필요 | 의존성 없음, 통계 없음 |
| **Caffeine** | 통계/모니터링 필요, 세밀한 eviction 제어 | `maximumSize`, `expireAfterWrite` 등 풍부한 옵션 |
| **Redis** | 인스턴스 간 캐시 공유 필요, 분산 환경 | 네트워크 비용 있음, 인프라 필요 |

> 통화코드처럼 **변경 빈도 거의 없고, 인스턴스 간 공유 불필요**한 참조 데이터는 `ConcurrentMap`으로 충분하다.
> Redis는 여러 서버 인스턴스가 동일 캐시를 공유해야 할 때 선택한다.

---

## 주의사항

### self-call에서 @Cacheable 미동작

```java
@Component
public class MyService {

    public void process() {
        this.findCurrency("KRW");  // ❌ AOP 프록시 우회 → 캐시 미적용
    }

    @Cacheable(value = "currencies", key = "#code")
    public CurrencyBase findCurrency(String code) { ... }
}
```

`@Cacheable`은 Spring AOP 프록시 기반이므로, **같은 클래스 내 this 호출은 프록시를 거치지 않아 캐시가 동작하지 않는다.**
반드시 외부 빈(다른 `@Component`)에서 주입받아 호출해야 한다.

### ConcurrentMapCacheManager의 정적/동적 모드

```java
// 정적 모드: setCacheNames() 사용 후 목록에 없는 이름 → 예외
manager.setCacheNames(Arrays.asList("currencies"));
// @Cacheable(value = "other") → 런타임 에러

// 동적 모드: setCacheNames() 미사용 → 처음 사용 시 자동 생성
// 단점: 오타로 잘못된 캐시 이름을 써도 에러 없이 별도 캐시가 생성됨
```

상수(`public static final String CURRENCY_CACHE = "currencies"`)를 정의하고 참조하면 오타를 방지할 수 있다.

---

## 실제 적용 사례 (이 프로젝트)

| 캐시 이름 | 대상 | 방식 | 위치 |
|----------|------|------|------|
| `hmacAuthSecretKeyCache` | HMAC 서명 검증용 SecretKey | `@Cacheable` (지연) | `module-common` |
| `currencies` | ISO 4217 통화코드 (`CurrencyBase`) | `@Cacheable` (지연) | `module-common` |
| `agencies` (Caffeine) | 대리점 정보 | `ApplicationRunner` (사전) | `module-scheduler` |

---

## 참고

- [Spring Docs — Cache Abstraction](https://docs.spring.io/spring-framework/docs/current/reference/html/integration.html#cache)
- [Caffeine GitHub](https://github.com/ben-manes/caffeine)
