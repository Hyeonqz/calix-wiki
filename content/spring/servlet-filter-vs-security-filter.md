---
title: "Servlet 필터 vs Spring Security 필터 — 실행 위치와 차이"
category: "spring"
tags: [spring, spring-security, servlet-filter, filter, tomcat, auto-configuration]
created: 2026-06-04
updated: 2026-06-04
---

# Servlet 필터 vs Spring Security 필터

## 개요

Spring Boot 웹 애플리케이션에서 필터는 두 레벨에서 동작한다.

| 레벨 | 이름 | 등록 방식 | 동작 위치 |
|------|------|---------|---------|
| Servlet Container | Servlet 필터 | `@Bean`, `@Component`, `FilterRegistrationBean` | Tomcat → Spring 전체 앞 |
| Spring Security | Security 필터 | `.addFilterBefore()`, `.addFilterAfter()` 등 | Servlet 필터 체인 내부 (Security 전용 체인) |

---

## 요청 처리 흐름

```
[Client 요청]
     │
     ▼
[Tomcat (Servlet Container)]
     │
     ▼
[Servlet 필터 체인]          ← ① Servlet 필터 동작 위치
     │  ├─ StaticResourceFilter (@Bean / Auto-Config)
     │  ├─ CharacterEncodingFilter
     │  └─ DelegatingFilterProxy  ◀─── Spring Security의 진입점
     │           │
     │           ▼
     │    [Security 필터 체인]   ← ② Security 필터 동작 위치
     │           ├─ SecurityContextHolderFilter
     │           ├─ UsernamePasswordAuthenticationFilter
     │           ├─ CustomFilter (.addFilterBefore로 추가)
     │           └─ ExceptionTranslationFilter
     │
     ▼
[DispatcherServlet]
     │
     ▼
[Controller]
```

> Spring Security는 `DelegatingFilterProxy`라는 Servlet 필터 하나를 통해 Tomcat에 등록된다.
> Security 필터 체인은 그 내부에서 실행된다.

---

## ① Servlet 필터 (Tomcat 레벨)

### 특징

- `javax.servlet.Filter` / `jakarta.servlet.Filter` 구현
- Servlet Container(Tomcat)가 직접 관리
- Spring Context 없이도 동작 가능
- **Spring Security보다 먼저 실행**

### 등록 방법

**방법 1 — `@Component`**
```java
@Component
public class MyFilter extends OncePerRequestFilter {
    // @SpringBootApplication의 컴포넌트 스캔 범위 안에 있어야 등록됨
}
```

**방법 2 — `@Bean` (순서 지정 가능)**
```java
@Bean
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public MyFilter myFilter() {
    return new MyFilter();
}
```

**방법 3 — `FilterRegistrationBean` (URL 패턴, 순서 명시)**
```java
@Bean
public FilterRegistrationBean<MyFilter> myFilter() {
    FilterRegistrationBean<MyFilter> bean = new FilterRegistrationBean<>(new MyFilter());
    bean.setOrder(Ordered.HIGHEST_PRECEDENCE + 10);
    bean.addUrlPatterns("/*");
    return bean;
}
```

**방법 4 — Auto-Configuration (공유 라이브러리에서 자동 등록)**
```java
// supports/web 같은 라이브러리 모듈에서 사용
@AutoConfiguration
public class WebSupportAutoConfiguration {
    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE + 10)
    public StaticResourceFilter staticResourceFilter() {
        return new StaticResourceFilter();
    }
}
```
```
# META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
kr.co.qrbank.supports.web.WebSupportAutoConfiguration
```

> **공유 라이브러리 모듈에서는 Auto-Configuration이 필수다.**
> `@Component`는 소비 모듈의 `@SpringBootApplication` 컴포넌트 스캔 범위 밖이면 인식되지 않는다.

---

## ② Spring Security 필터 (Security 체인 레벨)

### 특징

- Spring Security 내부 필터 체인 안에서 동작
- `HttpSecurity`로 등록
- **인증/인가 처리가 목적**
- Spring Context 의존 (Security 인프라 활용 가능)

### 등록 방법

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .addFilterBefore(new MySecurityFilter(), SecurityContextHolderFilter.class)
        .addFilterAfter(new AnotherFilter(), UsernamePasswordAuthenticationFilter.class);
    return http.build();
}
```

---

## 어느 레벨에 등록해야 하는가

| 목적 | 적합한 레벨 | 이유 |
|------|-----------|------|
| 봇/스캐너 차단, 블랙리스트 URL 차단 | **Servlet 필터** | Security 처리 전에 차단 → 불필요한 처리 방지 |
| HMAC 서명 검증 | **Servlet 필터** | Security 체인 진입 전에 조기 차단 |
| 인증 토큰 검사 (JWT 등) | **Security 필터** | Security Context 설정, 인증 객체 접근 필요 |
| 인가 처리 | **Security 필터** | Security 인프라 활용 필수 |
| 요청 로깅 | **Servlet 필터** | 모든 요청 대상, Security와 무관 |
| CORS | **Servlet 필터** | Preflight 요청도 처리해야 하므로 Security 앞에 위치 권장 |

---

## `DelegatingFilterProxy` — 두 레벨의 연결 고리

Spring Security는 내부적으로 `DelegatingFilterProxy`라는 Servlet 필터를 Tomcat에 등록한다.
이 필터가 요청을 받으면 Spring의 `FilterChainProxy`(Security 필터 체인)에 위임한다.

```
Servlet 필터 체인
└─ DelegatingFilterProxy (Servlet 레벨)
        └─ FilterChainProxy (Spring Bean)
                └─ SecurityFilterChain (Security 필터들)
```

따라서 **Servlet 필터에 등록된 커스텀 필터는 `DelegatingFilterProxy`보다 앞에 위치시켜야**
Security 체인 처리 전에 동작한다. `@Order(Ordered.HIGHEST_PRECEDENCE + N)`으로 순서를 제어한다.

---

## `OncePerRequestFilter` 중복 등록 주의

`OncePerRequestFilter`는 요청 속성(`{filterName}.FILTERED`)으로 중복 실행을 방지한다.
같은 필터를 Servlet 레벨과 Security 레벨 양쪽에 등록해도 실제로는 한 번만 실행된다.

그러나 **동일 필터를 두 레벨에 등록하는 것은 코드 혼란을 유발**하므로, 목적에 맞는 레벨 하나만 선택해야 한다.

---

## 실제 적용 예시 (이 프로젝트)

### AS-IS — Security 체인 내부에 수동 등록

```java
// WebSecurityConfig.java
http.addFilterBefore(new StaticResourceFilter(), SecurityContextHolderFilter.class);
```

- `StaticResourceFilter`가 Security 체인 안에서 실행
- Security 처리 시작 후에 차단 → 불필요한 처리 발생
- `module-api`에만 적용됨

### TO-BE — Auto-Configuration으로 Servlet 레벨 등록

```java
// WebSupportAutoConfiguration.java (supports/web 모듈)
@AutoConfiguration
public class WebSupportAutoConfiguration {
    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE + 10)
    public StaticResourceFilter staticResourceFilter() {
        return new StaticResourceFilter();
    }
}
```

- Tomcat 레벨(Security 앞)에서 차단 → 더 효율적
- `module-api`, `module-socket` 양쪽에 자동 적용
- 단일 소스 — 변경 시 모든 모듈에 자동 반영

---

## 참고

- Spring Security 공식 문서 — Filter Chain
- `DelegatingFilterProxy`, `FilterChainProxy` 소스코드
- 관련 작업: `StaticResourceFilter`를 `supports/web`으로 이동하여 Auto-Configuration 적용 (2026-06-04)
