# 🔗 프론트엔드-백엔드 연동 매핑

이 문서는 각 API 엔드포인트가 프론트엔드의 어느 파일에서 사용되는지 매핑합니다.

---

## 🎨 키오스크 (Kiosk)

### 메뉴 조회
| API | 파일 | 라인 | 설명 |
|-----|------|------|------|
| `GET /menus` | `components/MenuViews.tsx` | - | 메뉴 목록 조회 |
| `GET /menus` | `features/kiosk/components/OptimizedMenuGrid.tsx` | - | 메뉴 그리드 표시 |
| `GET /menus` | `constants.ts` | - | MOCK_MENU 교체 |

### 카테고리 조회
| API | 파일 | 라인 | 설명 |
|-----|------|------|------|
| `GET /categories` | `components/MenuViews.tsx` | 46 | 카테고리 탭 표시 |

### 셀 인증
| API | 파일 | 라인 | 설명 |
|-----|------|------|------|
| `POST /cells/auth` | `components/PaymentViews.tsx` | 74 | 휴대폰 뒷 4자리 인증 |

### 주문 생성
| API | 파일 | 라인 | 설명 |
|-----|------|------|------|
| `POST /orders` | `features/kiosk/hooks/useOrderSubmit.ts` | 31 | 주문 제출 로직 |
| `POST /orders` | `features/kiosk/KioskPageRefactored.tsx` | 26 | 주문 완료 처리 |

### 옵션 정보
| API | 파일 | 라인 | 설명 |
|-----|------|------|------|
| (메뉴 API에 포함) | `components/OptionModal.tsx` | - | 메뉴별 옵션 표시 |

---

## ☕ 바리스타 (Barista)

### 주문 목록 조회
| API | 파일 | 라인 | 설명 |
|-----|------|------|------|
| `GET /orders?status=PENDING,MAKING,COMPLETED` | `pages/BaristaPage.tsx` | - | 주문 목록 |
| `GET /orders` | `components/BaristaView.tsx` | - | 대기/제조/완료 주문 |

### 주문 상태 변경
| API | 파일 | 라인 | 설명 |
|-----|------|------|------|
| `PATCH /orders/:id/status` | `components/BaristaView.tsx` | 53 | 접수/제조/완료 버튼 |
| `PATCH /orders/:id/status` | `shared/contexts/OrderContext.tsx` | 31 | 상태 업데이트 함수 |

### 실시간 동기화
| API | 파일 | 라인 | 설명 |
|-----|------|------|------|
| WebSocket `/ws` | `shared/contexts/OrderContext.tsx` | - | 실시간 주문 알림 |
| WebSocket `/ws` | `components/BaristaView.tsx` | - | 새 주문 알림음 |

---

## 🔐 관리자 - 인증 (Admin Auth)

| API | 파일 | 라인 | 설명 |
|-----|------|------|------|
| `POST /auth/login` | `pages/admin/AdminLoginPage.tsx` | 19 | 로그인 폼 제출 |
| `POST /auth/login` | `shared/contexts/AuthContext.tsx` | 19 | 로그인 함수 |
| `POST /auth/logout` | `shared/contexts/AuthContext.tsx` | 28 | 로그아웃 함수 |
| `GET /auth/verify` | `App.tsx` | - | 초기 로드시 검증 |

---

## 📊 관리자 - 대시보드 (Admin Dashboard)

| API | 파일 | 라인 | 설명 |
|-----|------|------|------|
| `GET /statistics/dashboard` | `pages/admin/AdminDashboardPage.tsx` | 16 | 통계 데이터 조회 |
| `GET /orders` | `pages/admin/AdminDashboardPage.tsx` | - | 최근 주문 조회 |

---

## 🍽️ 관리자 - 메뉴 관리 (Admin Menus)

| API | 파일 | 라인 | 설명 |
|-----|------|------|------|
| `GET /menus` | `pages/admin/AdminMenusPage.tsx` | - | 메뉴 목록 조회 |
| `POST /menus` | `pages/admin/AdminMenusPage.tsx` | 49 | 메뉴 추가 |
| `PUT /menus/:id` | `pages/admin/AdminMenusPage.tsx` | 153 | 메뉴 수정 |
| `PATCH /menus/:id/sold-out` | `pages/admin/AdminMenusPage.tsx` | 21 | 품절 토글 |
| `DELETE /menus/:id` | `pages/admin/AdminMenusPage.tsx` | 157 | 메뉴 삭제 |
| `GET /option-groups` | `pages/admin/AdminMenusPage.tsx` | 198 | 옵션 그룹 조회 |
| `POST /option-groups` | `pages/admin/AdminMenusPage.tsx` | 208 | 옵션 그룹 추가 |
| `POST /option-groups/:id/items` | `pages/admin/AdminMenusPage.tsx` | 228 | 옵션 항목 추가 |

---

## 🏢 관리자 - 셀 관리 (Admin Cells)

| API | 파일 | 라인 | 설명 |
|-----|------|------|------|
| `GET /cells` | `pages/admin/AdminCellsPage.tsx` | 12 | 셀 목록 조회 |
| `POST /cells` | `pages/admin/AdminCellsPage.tsx` | - | 셀 추가 |
| `POST /cells/:id/charge` | `pages/admin/AdminCellsPage.tsx` | 21 | 포인트 충전 |
| `GET /cells/:id/transactions` | `pages/admin/AdminCellsPage.tsx` | - | 거래 내역 조회 |

---

## 📦 관리자 - 주문 관리 (Admin Orders)

| API | 파일 | 라인 | 설명 |
|-----|------|------|------|
| `GET /orders` | `pages/admin/AdminOrdersPage.tsx` | - | 주문 목록 조회 |
| `PATCH /orders/:id/status` | `pages/admin/AdminOrdersPage.tsx` | - | 주문 상태 변경 |
| `POST /orders/:id/cancel` | `pages/admin/AdminOrdersPage.tsx` | - | 주문 취소 |

---

## 📊 관리자 - 통계 (Admin Statistics)

| API | 파일 | 라인 | 설명 |
|-----|------|------|------|
| `GET /statistics/menus` | `pages/admin/AdminStatisticsPage.tsx` | - | 메뉴별 통계 |
| `GET /statistics/daily` | `pages/admin/AdminStatisticsPage.tsx` | - | 일별 통계 |
| `GET /statistics/categories` | `pages/admin/AdminStatisticsPage.tsx` | - | 카테고리별 통계 |

---

## 💰 관리자 - 정산 (Admin Settlements)

| API | 파일 | 라인 | 설명 |
|-----|------|------|------|
| `GET /settlements` | `pages/admin/AdminSettlementsPage.tsx` | - | 정산 목록 조회 |
| `GET /settlements/:date` | `pages/admin/AdminSettlementsPage.tsx` | - | 일자별 상세 조회 |
| `POST /settlements/:date/confirm` | `pages/admin/AdminSettlementsPage.tsx` | - | 정산 확정 |
| `GET /settlements/:date/report` | `pages/admin/AdminSettlementsPage.tsx` | - | 정산 리포트 다운로드 |

---

## ⚙️ 관리자 - 설정 (Admin Settings)

| API | 파일 | 라인 | 설명 |
|-----|------|------|------|
| `GET /settings` | `pages/admin/AdminSettingsPage.tsx` | - | 설정 목록 조회 |
| `PUT /settings/:key` | `pages/admin/AdminSettingsPage.tsx` | - | 설정 값 변경 |
| `POST /orders/reset-daily-number` | `pages/admin/AdminSettingsPage.tsx` | - | 주문번호 초기화 |

---

## 🏷️ 관리자 - 카테고리 (Admin Categories)

| API | 파일 | 라인 | 설명 |
|-----|------|------|------|
| `GET /categories` | `pages/admin/AdminCategoriesPage.tsx` | - | 카테고리 목록 |
| `POST /categories` | `pages/admin/AdminCategoriesPage.tsx` | - | 카테고리 추가 |
| `PUT /categories/:id` | `pages/admin/AdminCategoriesPage.tsx` | - | 카테고리 수정 |
| `DELETE /categories/:id` | `pages/admin/AdminCategoriesPage.tsx` | - | 카테고리 삭제 |

---

## 🔄 Context (전역 상태 관리)

### AuthContext
| API | 파일 | 라인 | 설명 |
|-----|------|------|------|
| `POST /auth/login` | `shared/contexts/AuthContext.tsx` | 19 | 로그인 |
| `POST /auth/logout` | `shared/contexts/AuthContext.tsx` | 28 | 로그아웃 |
| `GET /auth/verify` | `shared/contexts/AuthContext.tsx` | - | 토큰 검증 |

### OrderContext
| API | 파일 | 라인 | 설명 |
|-----|------|------|------|
| `GET /orders` | `shared/contexts/OrderContext.tsx` | - | 주문 목록 조회 |
| `PATCH /orders/:id/status` | `shared/contexts/OrderContext.tsx` | 31 | 주문 상태 변경 |
| `POST /orders/reset-daily-number` | `shared/contexts/OrderContext.tsx` | 43 | 주문번호 초기화 |
| WebSocket `/ws` | `shared/contexts/OrderContext.tsx` | - | 실시간 동기화 |

---

## 🔄 WebSocket 이벤트 매핑

### order:created (새 주문 생성)
| 파일 | 설명 |
|------|------|
| `shared/contexts/OrderContext.tsx` | 주문 목록에 추가 |
| `components/BaristaView.tsx` | 알림음 재생 |
| `pages/admin/AdminDashboardPage.tsx` | 통계 업데이트 |

### order:status_changed (주문 상태 변경)
| 파일 | 설명 |
|------|------|
| `shared/contexts/OrderContext.tsx` | 상태 업데이트 |
| `components/BaristaView.tsx` | UI 업데이트 |
| `pages/admin/AdminOrdersPage.tsx` | 주문 목록 업데이트 |

### menu:sold_out_changed (메뉴 품절)
| 파일 | 설명 |
|------|------|
| `components/MenuViews.tsx` | 메뉴 비활성화 |
| `features/kiosk/components/OptimizedMenuGrid.tsx` | 품절 표시 |
| `pages/admin/AdminMenusPage.tsx` | 상태 업데이트 |

### cell:balance_changed (셀 포인트 변경)
| 파일 | 설명 |
|------|------|
| `pages/admin/AdminCellsPage.tsx` | 잔액 업데이트 |

---

## 📊 API 사용 빈도 분석

### 높은 빈도 (실시간)
- `GET /orders` - 30초마다 폴링
- WebSocket 이벤트 - 실시간
- `GET /menus` - 키오스크 로드시

### 중간 빈도 (사용자 액션)
- `POST /orders` - 주문 완료시
- `PATCH /orders/:id/status` - 상태 변경시
- `POST /cells/auth` - 셀 인증시

### 낮은 빈도 (관리자)
- `GET /statistics/*` - 대시보드 접속시
- `GET /settlements` - 정산 화면 접속시
- `PUT /settings/*` - 설정 변경시

---

## 🔗 구현 우선순위

### Phase 1 (필수) - 1주
1. ✅ `POST /auth/login` - 관리자 로그인
2. ✅ `GET /menus` - 메뉴 조회
3. ✅ `POST /orders` - 주문 생성
4. ✅ `POST /cells/auth` - 셀 인증
5. ✅ `GET /orders` - 주문 목록

### Phase 2 (핵심) - 1주
6. ✅ `PATCH /orders/:id/status` - 주문 상태 변경
7. ✅ `GET /cells` - 셀 목록
8. ✅ `POST /cells/:id/charge` - 포인트 충전
9. ✅ `PATCH /menus/:id/sold-out` - 품절 토글
10. ✅ `GET /statistics/dashboard` - 대시보드 통계

### Phase 3 (고급) - 1주
11. WebSocket 실시간 동기화
12. `GET /settlements` - 정산 관리
13. `GET /statistics/*` - 상세 통계
14. 나머지 CRUD API들

---

## 📝 참고사항

### API 호출 패턴
1. **초기 로드**: `GET` 요청으로 데이터 조회
2. **사용자 액션**: `POST`, `PUT`, `PATCH`, `DELETE`
3. **실시간 업데이트**: WebSocket 이벤트 수신

### 에러 처리
- 모든 API 호출에서 `try-catch` 사용
- 에러 발생시 사용자 친화적 메시지 표시
- 네트워크 오류시 재시도 로직

### 성능 최적화
- 불필요한 API 호출 최소화
- 데이터 캐싱 (React Query 권장)
- WebSocket으로 실시간 동기화

---

## 🔗 관련 문서
- [프로젝트 개요](./00-overview.md)
- [인증 API](./01-auth-api.md)
- [주문 API](./06-order-api.md)
- [WebSocket](./10-websocket.md)
