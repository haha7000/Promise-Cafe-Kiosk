# 📚 P.M CAFE 백엔드 API 문서

## 📖 문서 구성

이 폴더는 P.M CAFE 백엔드 API의 전체 문서를 기능별로 분리하여 관리합니다.

### 📋 문서 목록

1. **[00-overview.md](./00-overview.md)** - 프로젝트 개요 및 데이터베이스 스키마
   - 프로젝트 목적 및 핵심 기능
   - 13개 테이블 스키마 정의
   - 아키텍처 설명

2. **[01-auth-api.md](./01-auth-api.md)** - 인증 API
   - 관리자 로그인/로그아웃
   - 토큰 검증
   - JWT 기반 인증

3. **[02-menu-api.md](./02-menu-api.md)** - 메뉴 관리 API
   - 메뉴 CRUD
   - 품절 관리
   - 메뉴 조회

4. **[03-category-api.md](./03-category-api.md)** - 카테고리 API
   - 카테고리 조회/생성
   - 카테고리 관리

5. **[04-option-api.md](./04-option-api.md)** - 옵션 관리 API
   - 옵션 그룹 관리
   - 옵션 항목 관리

6. **[05-cell-api.md](./05-cell-api.md)** - 셀 관리 API
   - 셀 인증
   - 포인트 충전/관리
   - 거래 내역

7. **[06-order-api.md](./06-order-api.md)** - 주문 관리 API
   - 주문 생성/조회
   - 주문 상태 변경
   - 주문 취소
   - 주문 번호 관리

8. **[07-statistics-api.md](./07-statistics-api.md)** - 통계 API
   - 대시보드 통계
   - 메뉴별 판매 통계
   - 일별 매출 통계

9. **[08-settlement-api.md](./08-settlement-api.md)** - 정산 API
   - 일별 정산 목록
   - 정산 확정

10. **[09-settings-api.md](./09-settings-api.md)** - 시스템 설정 API
    - 설정 조회/변경
    - 시스템 파라미터 관리

11. **[10-websocket.md](./10-websocket.md)** - WebSocket 실시간 동기화
    - 실시간 주문 알림
    - 주문 상태 변경 알림
    - 메뉴 품절 알림

12. **[11-frontend-mapping.md](./11-frontend-mapping.md)** - 프론트엔드 연동 매핑
    - API별 프론트엔드 파일 매핑
    - 구현 위치 및 라인 번호
    - 키오스크/바리스타/관리자별 매핑

---

## 📍 Base URL

```
http://localhost:3001/api/v1
```

---

## 🎯 프로젝트 정보

- **작성일**: 2026-01-15
- **버전**: 2.0 (리팩토링된 프론트엔드 기준)
- **프론트엔드 버전**: 시니어 수준 리팩토링 완료
- **백엔드 프레임워크**: Node.js + Express (또는 NestJS 권장)
- **데이터베이스**: PostgreSQL (또는 MySQL)
- **총 API 엔드포인트**: 38개

---

## 🚀 빠른 시작

1. [프로젝트 개요](./00-overview.md)에서 전체 구조 파악
2. [데이터베이스 스키마](./00-overview.md#데이터베이스-스키마) 확인
3. 필요한 API 문서 참조
4. [프론트엔드 매핑](./11-frontend-mapping.md)으로 구현 위치 확인

---

## 📊 API 요약

### 인증 (Auth) - 3개
- 로그인, 로그아웃, 토큰 검증

### 메뉴 (Menus) - 5개
- 조회, 생성, 수정, 품절 토글, 삭제

### 카테고리 (Categories) - 2개
- 조회, 생성

### 옵션 (Options) - 3개
- 그룹 조회/생성, 항목 추가

### 셀 (Cells) - 5개
- 인증, 조회, 생성, 충전, 거래내역

### 주문 (Orders) - 5개
- 생성, 조회, 상태변경, 취소, 번호초기화

### 통계 (Statistics) - 3개
- 대시보드, 메뉴별, 일별

### 정산 (Settlements) - 2개
- 목록 조회, 확정

### 설정 (Settings) - 2개
- 조회, 변경

### 실시간 (WebSocket) - 3개 이벤트
- 주문 생성, 상태 변경, 메뉴 품절

---

## 🔐 인증 방식

### JWT 토큰 기반
- Access Token: 1시간 유효
- Refresh Token: 7일 유효 (선택 사항)

### 권한 레벨
1. **Public**: 메뉴 조회, 주문 생성, 셀 인증
2. **Admin (NORMAL)**: 주문 관리, 메뉴 품절, 통계 조회
3. **Admin (SUPER)**: 모든 기능 + 메뉴/셀 삭제, 정산 확정

---

## 📝 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": { /* ... */ }
}
```

### 에러 응답
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지"
  }
}
```

---

## 🔄 다음 단계

### Phase 1: 기본 API 구현 (1주)
- 데이터베이스 스키마 생성
- 메뉴 CRUD API
- 주문 생성 API
- 셀 인증 API
- 관리자 로그인 API

### Phase 2: 고급 기능 (2주)
- 주문 상태 관리 API
- 통계 & 정산 API
- 셀 관리 API
- 옵션 관리 API

### Phase 3: 최적화 & 배포 (1주)
- WebSocket 실시간 동기화
- 캐싱 (Redis)
- 에러 핸들링 강화
- API 문서 자동화 (Swagger)
- 배포 (AWS, Heroku 등)

---

**작성 완료일**: 2026-01-15
**프론트엔드 기준**: 시니어 수준 리팩토링 완료 버전
