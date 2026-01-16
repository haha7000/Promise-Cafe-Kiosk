# 서비스 레이어 도입 작업 체크리스트

## 📋 전체 진행 상황

- [x] Phase 1: 기반 구조 (2/2) ✅
- [ ] Phase 2: 핵심 서비스 구현 (2/7) 🔄
- [ ] Phase 3: 최종 검증 및 문서화 (0/3)

**전체 진행률**: 5/12 (41.7%)

---

## 🧪 테스트 정책

**⚠️ 중요: 각 단계 완료 시 반드시 테스트를 실행하고 통과해야 다음 단계로 진행!**

### 테스트 우선순위
1. **서비스 유닛 테스트** (각 서비스 작성 시)
   - 비즈니스 로직만 독립적으로 테스트
   - 실제 DB 사용 (TestClient)
   - 성공/실패 케이스 모두 커버

2. **통합 테스트** (라우터 리팩토링 후)
   - 기존 테스트 모두 통과 확인
   - API 엔드포인트 정상 작동 검증
   - Regression 방지

3. **최종 전체 테스트** (Phase 3)
   - 모든 테스트 한번에 실행
   - 41개 + 신규 30개 = 총 71개 테스트 통과

---

## Phase 1: 기반 구조 ✅

### ✅ 1. 서비스 레이어 아키텍처 설계 및 디렉토리 구조 생성
- [x] `app/services/` 디렉토리 확인
- [x] 서비스 레이어 아키텍처 설계 완료

**완료일**: 2026-01-16

---

### ✅ 2. 공통 예외 클래스 정의
- [x] `app/exceptions.py` 파일 생성
- [x] `BusinessException` 베이스 클래스
- [x] 인증/인가 예외 (`AuthenticationError`, `AuthorizationError`)
- [x] 리소스 Not Found 예외
  - [x] `CellNotFoundError`
  - [x] `MenuNotFoundError`
  - [x] `OrderNotFoundError`
  - [x] `CategoryNotFoundError`
- [x] 비즈니스 로직 예외
  - [x] `InsufficientBalanceError`
  - [x] `MissingCellIdError`
  - [x] `InvalidCellAuthError`
  - [x] `MenuSoldOutError`
  - [x] `InvalidOrderStatusTransitionError`
- [x] 검증 예외
  - [x] `ValidationError`
  - [x] `DuplicateResourceError`

**완료일**: 2026-01-16

---

## Phase 2: 핵심 서비스 구현

### ✅ 3. OrderService 생성 - 주문 생성 비즈니스 로직 분리

#### 구현
- [x] `app/services/order_service.py` 파일 생성
- [x] `OrderService` 클래스 정의
- [x] 주문 생성 메서드
  - [x] `create_order(db, order_data)` - 메인 로직
  - [x] `_validate_cell_payment(db, order_data)` - 셀 검증
  - [x] `_generate_order_id()` - 주문 ID 생성
  - [x] `_get_next_daily_num(db)` - 순환 번호 생성
  - [x] `_create_order_entity(db, ...)` - Order 엔티티 생성
  - [x] `_create_order_items(db, order, items)` - OrderItem 생성
  - [x] `_create_order_item_options(db, order_item, options)` - 옵션 생성
  - [x] `_process_cell_payment(db, cell, amount, order_id)` - 포인트 차감
- [x] 주문 조회 및 상태 변경 메서드
  - [x] `get_orders(db, status, payType, limit, offset)` - 주문 목록
  - [x] `get_order_by_id(db, order_id)` - 주문 상세
  - [x] `update_order_status(db, order_id, new_status)` - 상태 변경

#### 🧪 테스트 (필수)
- [x] `tests/services/test_order_service.py` 생성
- [x] 주문 생성 성공 테스트
  - [x] PERSONAL 결제 주문 생성
  - [x] CELL 결제 주문 생성
  - [x] 옵션 포함 주문 생성
- [x] 주문 생성 실패 테스트
  - [x] 잔액 부족 (`InsufficientBalanceError`)
  - [x] 셀 없음 (`CellNotFoundError`)
  - [x] cellId 누락 (`MissingCellIdError`)
- [x] 주문 조회 테스트
  - [x] 전체 조회
  - [x] 상태별 필터링
  - [x] 결제타입별 필터링
  - [x] 페이지네이션
  - [x] ID로 조회
  - [x] Not Found 케이스
- [x] 주문 상태 변경 테스트
  - [x] MAKING으로 변경
  - [x] COMPLETED로 변경
  - [x] CANCELLED로 변경
  - [x] Not Found 케이스
- [x] **테스트 실행**: `pytest tests/services/test_order_service.py -v`
- [x] **통과 확인**: ✅ **16개 테스트 모두 PASSED**

**완료**: 350줄 (서비스) + 300줄 (테스트)
**완료일**: 2026-01-16

---

### ✅ 4. OrderService - 주문 조회 및 상태 변경 로직 분리

**Note**: 3단계에서 함께 구현 완료됨

---

### ✅ 5. orders.py 라우터 리팩토링

#### 구현
- [x] `OrderService` import
- [x] Dependency Injection 설정 (`get_order_service`)
- [x] `create_order` 엔드포인트 리팩토링
  - [x] 비즈니스 로직 제거
  - [x] `order_service.create_order()` 호출
  - [x] 예외 처리 → HTTP 예외 변환
- [x] `get_orders` 엔드포인트 리팩토링
- [x] `update_order_status` 엔드포인트 리팩토링
- [x] Custom HTTPException handler 추가 (main.py)

#### 🧪 테스트 (필수)
- [x] **기존 통합 테스트 실행**: `pytest tests/test_orders.py -v`
- [x] **✅ 14개 테스트 모두 통과 확인**
  - [x] 주문 생성 테스트 (6개)
  - [x] 주문 조회 테스트 (4개)
  - [x] 주문 상태 변경 테스트 (4개)

**결과**: ✅ **395줄 → 255줄 (-35.4%)**
**완료일**: 2026-01-16

#### 추가 개선사항
- [x] `app/dependencies/order.py` 생성 (DI)
- [x] `app/main.py` - Custom exception handler 추가
- [x] `app/models/order.py` - updated_at 필드 추가
- [x] `app/models/order.py` - cell relationship 추가

---

### ⬜ 6. CellService 생성

#### 구현
- [ ] `app/services/cell_service.py` 파일 생성
- [ ] `CellService` 클래스 정의
- [ ] 셀 인증 메서드
  - [ ] `authenticate_cell(db, name, phone_last4)` - 인증
  - [ ] `_validate_phone_number(phone_last4)` - 휴대폰 검증
- [ ] 포인트 충전 메서드
  - [ ] `charge_points(db, cell_id, amount, bonus_rate, creator_id)` - 충전
  - [ ] `_calculate_bonus(amount, bonus_rate)` - 보너스 계산
  - [ ] `_create_charge_transaction(db, ...)` - 트랜잭션 기록
- [ ] 셀 CRUD 메서드
  - [ ] `get_cells(db)` - 셀 목록
  - [ ] `get_cell_by_id(db, cell_id)` - 셀 상세
  - [ ] `create_cell(db, cell_data)` - 셀 생성

#### 🧪 테스트 (필수)
- [ ] `tests/services/test_cell_service.py` 생성
- [ ] 셀 인증 테스트
  - [ ] 인증 성공
  - [ ] 인증 실패 (`InvalidCellAuthError`)
- [ ] 포인트 충전 테스트
  - [ ] 충전 성공 (보너스 계산 포함)
  - [ ] 트랜잭션 기록 확인
- [ ] 셀 CRUD 테스트
- [ ] **테스트 실행**: `pytest tests/services/test_cell_service.py -v`
- [ ] **통과 확인**: 모든 테스트 PASSED

**예상**: ~120줄 (서비스) + ~90줄 (테스트)

---

### ⬜ 7. cells.py 라우터 리팩토링

#### 구현
- [ ] `CellService` import 및 DI 설정
- [ ] 모든 엔드포인트 리팩토링
  - [ ] `POST /auth` - 셀 인증
  - [ ] `GET /` - 셀 목록
  - [ ] `POST /` - 셀 생성
  - [ ] `POST /{cell_id}/charge` - 포인트 충전
  - [ ] `GET /{cell_id}/transactions` - 거래 내역

#### 🧪 테스트 (필수)
- [ ] **기존 통합 테스트 실행**: `pytest tests/test_cells.py -v`
- [ ] **4개 테스트 모두 통과 확인**
- [ ] Swagger UI 동작 확인
  - [ ] POST `/api/v1/cells/auth` 테스트
  - [ ] POST `/api/v1/cells/{id}/charge` 테스트

**목표**: 300줄 → ~80줄 (-73%)

---

### ⬜ 8. MenuService 생성

#### 구현
- [ ] `app/services/menu_service.py` 파일 생성
- [ ] `MenuService` 클래스 정의
- [ ] 메뉴 CRUD 메서드
  - [ ] `get_menus(db, category_id, include_inactive)` - 메뉴 목록
  - [ ] `get_menu_by_id(db, menu_id)` - 메뉴 상세
  - [ ] `create_menu(db, menu_data)` - 메뉴 생성
  - [ ] `update_menu(db, menu_id, menu_data)` - 메뉴 수정
  - [ ] `delete_menu(db, menu_id)` - 메뉴 삭제
  - [ ] `toggle_sold_out(db, menu_id)` - 품절 토글
- [ ] 검증 메서드
  - [ ] `_validate_category_exists(db, category_id)`
  - [ ] `_validate_option_groups_exist(db, option_group_ids)`

#### 🧪 테스트 (필수)
- [ ] `tests/services/test_menu_service.py` 생성
- [ ] 메뉴 CRUD 테스트
  - [ ] 생성/조회/수정/삭제
- [ ] 품절 토글 테스트
- [ ] 검증 로직 테스트
  - [ ] 존재하지 않는 카테고리 (`CategoryNotFoundError`)
- [ ] **테스트 실행**: `pytest tests/services/test_menu_service.py -v`
- [ ] **통과 확인**: 모든 테스트 PASSED

**예상**: ~130줄 (서비스) + ~100줄 (테스트)

---

### ⬜ 9. menus.py 라우터 리팩토링

#### 구현
- [ ] `MenuService` import 및 DI 설정
- [ ] 모든 엔드포인트 리팩토링
  - [ ] `GET /` - 메뉴 목록
  - [ ] `GET /{menu_id}` - 메뉴 상세
  - [ ] `POST /` - 메뉴 생성
  - [ ] `PUT /{menu_id}` - 메뉴 수정
  - [ ] `DELETE /{menu_id}` - 메뉴 삭제
  - [ ] `PATCH /{menu_id}/sold-out` - 품절 토글

#### 🧪 테스트 (필수)
- [ ] **기존 통합 테스트 실행**: `pytest tests/test_menus.py -v`
- [ ] **6개 테스트 모두 통과 확인**
- [ ] Swagger UI 동작 확인
  - [ ] GET `/api/v1/menus` 테스트
  - [ ] POST `/api/v1/menus` 테스트

**목표**: 423줄 → ~120줄 (-72%)

---

## Phase 3: 최종 검증 및 문서화

### ⬜ 10. 전체 테스트 Suite 실행 및 검증

#### 🧪 모든 테스트 실행
- [ ] **전체 테스트 실행**: `pytest -v`
- [ ] 기존 통합 테스트 (41개)
  - [ ] `tests/test_auth.py` (7개)
  - [ ] `tests/test_menus.py` (6개)
  - [ ] `tests/test_cells.py` (4개)
  - [ ] `tests/test_orders.py` (14개)
  - [ ] `tests/test_categories.py` (4개)
  - [ ] `tests/test_options.py` (4개)
  - [ ] `tests/test_basic.py` (2개)
- [ ] 신규 서비스 유닛 테스트 (30+개)
  - [ ] `tests/services/test_order_service.py` (~12개)
  - [ ] `tests/services/test_cell_service.py` (~10개)
  - [ ] `tests/services/test_menu_service.py` (~10개)

#### 테스트 결과 확인
- [ ] **총 71개 테스트 모두 PASSED 확인**
- [ ] 실패한 테스트 있으면 수정 후 재실행
- [ ] Coverage 보고서 생성 (선택)

**목표**: 71개 테스트 100% 통과

---

### ⬜ 11. 성능 및 코드 품질 검증

#### 코드 라인 수 확인
- [ ] `wc -l app/routers/orders.py` (목표: ~100줄)
- [ ] `wc -l app/routers/cells.py` (목표: ~80줄)
- [ ] `wc -l app/routers/menus.py` (목표: ~120줄)
- [ ] 총 감소량 계산 및 기록

#### 코드 품질 검증
- [ ] Docstring 작성 완료 확인
  - [ ] `OrderService` 모든 메서드
  - [ ] `CellService` 모든 메서드
  - [ ] `MenuService` 모든 메서드
- [ ] Type hints 작성 확인
- [ ] Import 정리 (unused imports 제거)

#### API 동작 확인
- [ ] 백엔드 서버 실행
- [ ] Swagger UI 접속 (`http://localhost:8000/docs`)
- [ ] 주요 API 수동 테스트
  - [ ] POST `/api/v1/orders` - 주문 생성
  - [ ] POST `/api/v1/cells/auth` - 셀 인증
  - [ ] GET `/api/v1/menus` - 메뉴 조회
  - [ ] PATCH `/api/v1/orders/{id}/status` - 상태 변경

---

### ⬜ 12. 문서화 및 Git 커밋

#### 문서화
- [ ] `docs/backend/12-service-layer.md` 생성
  - [ ] 서비스 레이어 개념 설명
  - [ ] 아키텍처 다이어그램
  - [ ] 각 서비스 사용법
  - [ ] 예외 처리 가이드
- [ ] `PmCafeBackend/README.md` 업데이트
  - [ ] 서비스 레이어 설명 추가
  - [ ] 프로젝트 구조 업데이트

#### Git 커밋
- [ ] 모든 변경사항 확인 (`git status`)
- [ ] 커밋 메시지 작성 (아래 템플릿 사용)
- [ ] 커밋 및 푸시

```bash
git add .
git commit -m "feat: Introduce service layer architecture

🏗️ 아키텍처 개선
- 라우터에서 비즈니스 로직 분리
- 서비스 레이어 도입으로 책임 분리

✨ 새로운 서비스
- OrderService: 주문 생성/조회/상태 변경
- CellService: 셀 인증/포인트 충전
- MenuService: 메뉴 CRUD

🔧 리팩토링
- orders.py: 396줄 → 100줄 (-75%)
- cells.py: 300줄 → 80줄 (-73%)
- menus.py: 423줄 → 120줄 (-72%)

🧪 테스트
- 서비스 레이어 유닛 테스트 30+ 추가
- 기존 통합 테스트 41개 모두 통과

📚 문서화
- 서비스 레이어 아키텍처 가이드 추가
- 모든 서비스 메서드 docstring 작성

🚀 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

---

## 📊 예상 효과

### 코드 라인 감소
| 파일 | 기존 | 목표 | 감소율 |
|------|------|------|--------|
| `orders.py` | 396줄 | ~100줄 | -75% |
| `cells.py` | 300줄 | ~80줄 | -73% |
| `menus.py` | 423줄 | ~120줄 | -72% |

### 새로 추가되는 파일
| 파일 | 라인 수 |
|------|---------|
| `app/exceptions.py` | ~130줄 ✅ |
| `app/services/order_service.py` | ~250줄 |
| `app/services/cell_service.py` | ~120줄 |
| `app/services/menu_service.py` | ~130줄 |
| 서비스 테스트 파일 | ~270줄 |

### 순 증가량
- **라우터**: 1,119줄 → 300줄 (-819줄)
- **서비스**: 0줄 → 630줄 (+630줄)
- **총계**: **-189줄** (코드 품질 향상 + 재사용성 확보)

---

## 📝 참고 링크

- [프로젝트 개요](./backend/00-overview.md)
- [개발 체크리스트](./backend/DEVELOPMENT_CHECKLIST.md)
- [백엔드 README](../PmCafeBackend/README.md)
