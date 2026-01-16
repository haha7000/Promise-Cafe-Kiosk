# ✅ P.M CAFE 개발 체크리스트

**기술 스택**: Python + FastAPI + PostgreSQL + SQLAlchemy + React + TypeScript
**개발 시작일**: 2026-01-15
**현재 Phase**: Phase 4 (프론트엔드 연동)

---

## 📊 전체 진행률

### 백엔드 API (34개 완료)
- ✅ **Phase 0**: 프로젝트 설정 (완료)
- ✅ **Phase 1**: 핵심 기능 (11개 API 완료)
- ✅ **Phase 2**: 관리 기능 (19개 API 완료)
- ✅ **Phase 3**: 테스트 (41개 테스트 100% 통과)
- ⏳ **Phase 4**: 프론트엔드 연동 (진행 중)

### 프론트엔드 연동
- ✅ 인증 (AuthContext)
- ✅ 주문 (OrderContext, BaristaPage)
- ✅ 대시보드 (AdminDashboardPage)
- ✅ 키오스크 (KioskPage - 메뉴 조회, 셀 인증, 주문 생성) ⭐
- ✅ 관리자 메뉴 관리 (AdminMenusPage - 생성/수정/삭제) ⭐
- ⏳ 셀 관리 (AdminCellsPage 부분 완료)
- ⬜ 관리자 카테고리 관리
- ⬜ 관리자 정산/통계 페이지

---

## 📋 Phase 0: 프로젝트 설정 ✅

### 환경 설정
- [x] Python 3.9+ 가상환경
- [x] FastAPI 및 Uvicorn 설치
- [x] requirements.txt 생성
- [x] .gitignore 설정

### 데이터베이스 설정
- [x] PostgreSQL 설치 및 데이터베이스 생성
- [x] SQLAlchemy 설정 (`app/database.py`)
- [x] Alembic 설치 및 초기화
- [x] 환경변수 설정 (`.env` 파일)

### 기본 구조
- [x] 폴더 구조 설계 (app, models, schemas, routers, dependencies, utils, core)
- [x] CORS 설정 (`fastapi.middleware.cors`)

---

## 📋 Phase 1: 핵심 기능 구현 ✅

### 1️⃣ 데이터베이스 스키마 생성 (13개 테이블)

- [x] users - 관리자 계정 (SUPER/NORMAL)
- [x] cells - 셀 정보 (휴대폰 인증, 포인트 잔액)
- [x] categories - 메뉴 카테고리
- [x] option_groups - 옵션 그룹 (SINGLE/MULTIPLE)
- [x] option_items - 옵션 항목
- [x] menus - 메뉴
- [x] menu_option_groups - 메뉴-옵션 연결 (M:N)
- [x] orders - 주문 (daily_num 1-12 순환)
- [x] order_items - 주문 항목 (스냅샷)
- [x] order_item_options - 선택된 옵션 (스냅샷)
- [x] point_transactions - 포인트 거래 내역
- [x] daily_settlements - 일일 정산
- [x] system_settings - 시스템 설정

### 2️⃣ 인증 API (Auth) - 3개

- [x] `POST /api/v1/auth/login` - 관리자 로그인 (JWT 토큰 생성)
- [x] `GET /api/v1/auth/verify` - 토큰 검증
- [x] JWT 의존성 함수 (`dependencies/auth.py` - get_current_user, get_current_super_user)

### 3️⃣ 메뉴 API (Menus) - 6개

- [x] `GET /api/v1/menus` - 전체 메뉴 조회 (카테고리, 옵션 포함)
- [x] `GET /api/v1/menus/:id` - 메뉴 상세 조회
- [x] `POST /api/v1/menus` - 메뉴 생성 (관리자)
- [x] `PUT /api/v1/menus/:id` - 메뉴 수정 (관리자)
- [x] `PATCH /api/v1/menus/:id/sold-out` - 품절 토글 (관리자)
- [x] `DELETE /api/v1/menus/:id` - 메뉴 삭제 (SUPER 관리자)

### 4️⃣ 셀 API (Cells) - 5개

- [x] `POST /api/v1/cells/auth` - 셀 인증 (휴대폰 뒷 4자리)
- [x] `GET /api/v1/cells` - 셀 목록 조회 (관리자)
- [x] `POST /api/v1/cells` - 셀 생성 (관리자)
- [x] `POST /api/v1/cells/:id/charge` - 포인트 충전 (관리자, 보너스 계산)
- [x] `GET /api/v1/cells/:id/transactions` - 거래 내역 조회 (관리자)

### 5️⃣ 주문 API (Orders) - 3개 ⭐

- [x] `POST /api/v1/orders` - 주문 생성
  - 개인/셀 결제 지원
  - daily_num 1-12 순환
  - 트랜잭션 처리 (주문, 아이템, 옵션, 포인트 차감)
- [x] `GET /api/v1/orders` - 주문 목록 조회 (필터링, 페이지네이션)
- [x] `PATCH /api/v1/orders/:orderId/status` - 주문 상태 변경 (PENDING→MAKING→COMPLETED)

---

## 📋 Phase 2: 관리 기능 구현 ✅

### 6️⃣ 카테고리 API (Categories) - 5개

- [x] `GET /api/v1/categories` - 카테고리 조회 (includeInactive 지원)
- [x] `POST /api/v1/categories` - 카테고리 생성 (관리자)
- [x] `PUT /api/v1/categories/:id` - 카테고리 수정 (관리자)
- [x] `PATCH /api/v1/categories/:id/active` - 활성화/비활성화 (관리자)
- [x] `DELETE /api/v1/categories/:id` - 카테고리 삭제 (관리자)

### 7️⃣ 옵션 API (Options) - 7개

- [x] `GET /api/v1/option-groups` - 옵션 그룹 조회 (includeItems 지원)
- [x] `POST /api/v1/option-groups` - 옵션 그룹 생성 (관리자)
- [x] `PUT /api/v1/option-groups/:id` - 옵션 그룹 수정 (관리자)
- [x] `DELETE /api/v1/option-groups/:id` - 옵션 그룹 삭제 (관리자)
- [x] `POST /api/v1/option-groups/:groupId/items` - 옵션 항목 추가 (관리자)
- [x] `PUT /api/v1/option-groups/:groupId/items/:itemId` - 옵션 항목 수정 (관리자)
- [x] `DELETE /api/v1/option-groups/:groupId/items/:itemId` - 옵션 항목 삭제 (관리자)

### 8️⃣ 통계 API (Statistics) - 3개

- [x] `GET /api/v1/statistics/dashboard` - 대시보드 통계 (날짜별 주문/매출, 결제 타입별, 상태별)
- [x] `GET /api/v1/statistics/menus` - 메뉴별 판매 통계 (날짜 범위, 카테고리 필터)
- [x] `GET /api/v1/statistics/daily` - 일별 매출 통계 (날짜 범위)

### 9️⃣ 정산 API (Settlements) - 2개

- [x] `GET /api/v1/settlements` - 정산 목록 조회 (날짜 범위, 확정 상태 필터)
- [x] `POST /api/v1/settlements/:date/confirm` - 정산 확정 (SUPER 관리자, 자동 생성)

### 🔟 시스템 설정 API (Settings)

> **Note**: 현재 미구현. system_settings 테이블은 존재하며 next_order_number는 주문 API에서 사용 중

---

## 📋 Phase 3: 실시간 & 최적화

### WebSocket 실시간 동기화

> **Note**: 미구현. 현재는 30초 폴링 방식 사용 (OrderContext)
> - 계획된 이벤트: order:created, order:status_changed, menu:sold_out_changed

### 테스트 ✅

- [x] pytest 설치 및 설정
- [x] 통합 테스트 작성 (41개 테스트, 100% 통과)
  - [x] 인증 API 테스트 (9개)
  - [x] 메뉴 API 테스트 (6개)
  - [x] 셀 API 테스트 (4개)
  - [x] 주문 API 테스트 (14개)
  - [x] 카테고리 API 테스트 (4개)
  - [x] 옵션 API 테스트 (4개)

---

## 📋 Phase 4: 프론트엔드 연동 ⏳

### 🔧 API 클라이언트 설정
- [x] axios 설치
- [x] API 클라이언트 생성 (`shared/api/client.ts`)
  - [x] JWT 토큰 자동 추가 (Request Interceptor)
  - [x] 에러 핸들링 (Response Interceptor)
  - [x] 401 자동 로그아웃

### 🔐 인증 API 연동
- [x] `shared/api/auth.ts` 생성
  - [x] POST /auth/login
  - [x] GET /auth/verify
- [x] AuthContext 실제 API 연동
  - [x] Mock 로그인 제거
  - [x] localStorage 토큰 저장
  - [x] 초기 로드 시 토큰 검증

### 🍽️ 메뉴 API 연동
- [x] `shared/api/menus.ts` 생성
  - [x] GET /menus
  - [x] GET /menus/:id
  - [x] POST /menus
  - [x] PUT /menus/:id
  - [x] PATCH /menus/:id/sold-out
  - [x] DELETE /menus/:id
- [x] KioskPage 메뉴 조회 연동 (MenuGrid 컴포넌트)
- [x] MOCK_MENU 제거
- [x] AdminMenusPage 메뉴 관리 연동 ⭐
  - [x] GET /menus 연동
  - [x] POST /menus 연동 (메뉴 생성 모달)
  - [x] PUT /menus/:id 연동 (메뉴 수정 모달)
  - [x] PATCH /menus/:id/sold-out 연동
  - [x] DELETE /menus/:id 연동
  - [ ] 옵션 설정 저장 API 연동 (현재 로컬 state만)

### 🏢 셀 API 연동
- [x] `shared/api/cells.ts` 생성
  - [x] POST /cells/auth
  - [x] GET /cells (관리자)
  - [x] POST /cells (관리자)
  - [x] POST /cells/:id/charge (관리자)
  - [x] GET /cells/:id/transactions (관리자)
- [x] KioskPage 셀 인증 연동 (CellAuthView 컴포넌트)
- [x] AdminCellsPage 셀 관리 연동 (부분 완료)
  - [x] 셀 목록 조회 (fetchCells)
  - [x] 포인트 충전 (handleCharge)
  - [x] 로딩/에러 처리
  - [ ] 셀 생성 모달
  - [ ] 거래 내역 조회

### 📦 주문 API 연동
- [x] `shared/api/orders.ts` 생성
  - [x] POST /orders
  - [x] GET /orders
  - [x] PATCH /orders/:id/status
- [x] KioskPage 주문 생성 연동 (handleOrder 함수)
- [x] BaristaPage 주문 목록 연동
  - [x] OrderContext의 orders 사용
  - [x] 상태 변경 시 API 호출
  - [x] 30초마다 자동 새로고침 (폴링)
- [x] OrderContext 실제 API 연동
  - [x] Mock 데이터 제거
  - [x] `useEffect`로 주문 목록 API 호출
  - [x] `updateOrderStatus` 함수에서 실제 API 호출
  - [x] 30초 자동 갱신 추가

### 📊 관리자 페이지 API 연동
- [x] AdminDashboardPage - 대시보드 통계 API
  - [x] GET /statistics/dashboard
  - [x] GET /statistics/menus (TOP 5)
  - [x] 1분 자동 갱신
- [ ] AdminMenusPage - 메뉴 관리 CRUD
- [x] AdminCellsPage - 셀 관리 CRUD (부분 완료)
  - [x] GET /cells 연동
  - [x] POST /cells/:id/charge 연동
  - [ ] POST /cells 연동 (셀 생성)
  - [ ] GET /cells/:id/transactions 연동
- [ ] AdminSettlementsPage - 정산 관리
  - [ ] GET /settlements 연동
  - [ ] POST /settlements/:date/confirm 연동
- [ ] AdminCategoriesPage - 카테고리 관리 CRUD
  - [ ] GET /categories 연동
  - [ ] POST /categories 연동
  - [ ] PUT /categories/:id 연동
  - [ ] DELETE /categories/:id 연동
- [ ] AdminStatisticsPage - 통계 페이지
  - [ ] GET /statistics/daily 연동
  - [ ] GET /statistics/menus 연동

---

## 📝 개발 명령어

### 백엔드 (FastAPI)
```bash
# 가상환경 활성화
source venv/bin/activate  # Mac/Linux

# 개발 서버 실행 (자동 재시작)
cd PmCafeBackend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 테스트 실행
pytest

# 데이터베이스 마이그레이션
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### 프론트엔드 (React + Vite)
```bash
# 개발 서버 실행
cd PmCafeFrontend
npm run dev

# 빌드
npm run build
```

---

## 🔗 참고 문서

- [프로젝트 개요](./00-overview.md)
- [인증 API](./01-auth-api.md)
- [메뉴 API](./02-menu-api.md)
- [카테고리 API](./03-category-api.md)
- [옵션 API](./04-option-api.md)
- [셀 API](./05-cell-api.md)
- [주문 API](./06-order-api.md)
- [통계 API](./07-statistics-api.md)
- [정산 API](./08-settlement-api.md)
- [WebSocket](./10-websocket.md)
- [프론트엔드 매핑](./11-frontend-mapping.md)

---

**마지막 업데이트**: 2026-01-15 (오늘 작업 완료!)
**전체 완료율**: 백엔드 API 100% (34/34), 프론트엔드 연동 75% ⭐⭐

---

## 📝 남은 작업 체크리스트

### ~~우선순위 1: 메뉴 관리 완성~~ ✅ 완료!
- [x] AdminMenusPage - 옵션 설정 저장 API 연동 ✅
  - MenuOptionModal에서 `menuApi.updateMenu()` 호출
  - 로딩 상태 및 에러 처리 추가

### 우선순위 2: 셀 관리 완성
- [x] AdminCellsPage - 셀 생성 모달 + API 연동 ✅
  - CreateCellModal 컴포넌트 생성
  - 입력 검증 (4자리 숫자)
  - `cellApi.createCell()` API 연동 완료
- [ ] AdminCellsPage - 거래 내역 조회 모달
  - 셀 선택 → 거래 내역 버튼
  - GET /cells/:id/transactions
  - 날짜/타입 필터링

### 우선순위 3: 카테고리 관리 API 연동
- [ ] AdminCategoriesPage - API 연동
  - GET /categories
  - POST /categories
  - PUT /categories/:id
  - DELETE /categories/:id
  - MOCK 데이터 제거

### 우선순위 4: 정산 관리 API 연동
- [ ] AdminSettlementsPage - API 연동
  - GET /settlements
  - POST /settlements/:date/confirm
  - orders prop 제거, API 데이터 사용

### 우선순위 5: 통계 페이지 API 연동
- [ ] AdminStatisticsPage - API 연동
  - GET /statistics/daily
  - GET /statistics/menus
  - orders prop 제거, API 데이터 사용

### 선택사항 (나중에)
- [ ] 메뉴 이미지 업로드 기능 (현재는 URL 입력만)
- [ ] 옵션 그룹 관리 페이지 (AdminOptionsPage)
- [ ] WebSocket 실시간 동기화 (현재 30초 폴링)
- [ ] 주문 취소 기능 UI
- [ ] 정산 리포트 다운로드

---
