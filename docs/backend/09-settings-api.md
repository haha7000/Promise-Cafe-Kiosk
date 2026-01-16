# ⚙️ 시스템 설정 API (Settings)

## 1️⃣ 전체 설정 조회

```
GET /settings
```

### Headers
```
Authorization: Bearer {token}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "key": "next_order_number",
      "value": "5",
      "description": "다음 주문 번호 (1-12)",
      "updatedBy": {
        "id": 1,
        "name": "관리자"
      },
      "updatedAt": "2026-01-15T10:00:00Z"
    },
    {
      "key": "bonus_rate",
      "value": "10",
      "description": "포인트 충전 보너스율 (%)",
      "updatedBy": {
        "id": 1,
        "name": "관리자"
      },
      "updatedAt": "2026-01-10T00:00:00Z"
    },
    {
      "key": "is_kiosk_active",
      "value": "true",
      "description": "키오스크 활성화 여부",
      "updatedBy": null,
      "updatedAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

### 프론트엔드 연동
- **파일**: `pages/admin/AdminSettingsPage.tsx`

---

## 2️⃣ 특정 설정 조회

```
GET /settings/:key
```

### Headers
```
Authorization: Bearer {token}
```

### Path Parameters
- `key`: 설정 키 (예: bonus_rate)

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "key": "bonus_rate",
    "value": "10",
    "description": "포인트 충전 보너스율 (%)",
    "updatedBy": {
      "id": 1,
      "name": "관리자"
    },
    "updatedAt": "2026-01-10T00:00:00Z"
  }
}
```

---

## 3️⃣ 설정 값 변경

```
PUT /settings/:key
```

### Headers
```
Authorization: Bearer {token}
```

### Path Parameters
- `key`: 설정 키

### Request Body
```json
{
  "value": "15"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "key": "bonus_rate",
    "value": "15",
    "description": "포인트 충전 보너스율 (%)",
    "updatedBy": {
      "id": 1,
      "name": "관리자"
    },
    "updatedAt": "2026-01-15T10:30:00Z"
  }
}
```

### 프론트엔드 연동
- **파일**: `pages/admin/AdminSettingsPage.tsx` (설정 변경)

---

## 4️⃣ 여러 설정 일괄 변경

```
PATCH /settings/batch
```

### Headers
```
Authorization: Bearer {token}
```

### Request Body
```json
{
  "settings": [
    {
      "key": "bonus_rate",
      "value": "15"
    },
    {
      "key": "is_kiosk_active",
      "value": "false"
    }
  ]
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "updated": 2,
    "settings": [
      {
        "key": "bonus_rate",
        "value": "15"
      },
      {
        "key": "is_kiosk_active",
        "value": "false"
      }
    ]
  }
}
```

---

## 5️⃣ 새 설정 추가 (Super Admin)

```
POST /settings
```

### Headers
```
Authorization: Bearer {token}
```

### Request Body
```json
{
  "key": "max_daily_orders",
  "value": "100",
  "description": "일일 최대 주문 건수"
}
```

### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "key": "max_daily_orders",
    "value": "100",
    "description": "일일 최대 주문 건수",
    "updatedBy": {
      "id": 1,
      "name": "관리자"
    },
    "updatedAt": "2026-01-15T11:00:00Z"
  }
}
```

---

## 📝 주요 설정 항목

### 주문 관련
| Key | 설명 | 타입 | 기본값 |
|-----|------|------|--------|
| `next_order_number` | 다음 주문 번호 (1-12) | number | 1 |
| `max_daily_orders` | 일일 최대 주문 건수 | number | 1000 |
| `order_timeout_minutes` | 주문 자동 완료 시간 (분) | number | 30 |

### 포인트 관련
| Key | 설명 | 타입 | 기본값 |
|-----|------|------|--------|
| `bonus_rate` | 포인트 충전 보너스율 (%) | number | 10 |
| `min_charge_amount` | 최소 충전 금액 | number | 10000 |
| `max_charge_amount` | 최대 충전 금액 | number | 1000000 |

### 시스템 관련
| Key | 설명 | 타입 | 기본값 |
|-----|------|------|--------|
| `is_kiosk_active` | 키오스크 활성화 여부 | boolean | true |
| `maintenance_mode` | 점검 모드 | boolean | false |
| `maintenance_message` | 점검 안내 메시지 | string | "시스템 점검 중입니다" |

### 알림 관련
| Key | 설명 | 타입 | 기본값 |
|-----|------|------|--------|
| `enable_notifications` | 알림 활성화 | boolean | true |
| `notification_sound` | 알림음 활성화 | boolean | true |
| `auto_print_receipt` | 영수증 자동 출력 | boolean | false |

---

## 🔄 설정 변경 시 동작

### 주문 번호 초기화
- `next_order_number` 변경 시
- 다음 주문부터 새 번호 적용

### 보너스율 변경
- `bonus_rate` 변경 시
- 즉시 적용 (다음 충전부터)

### 키오스크 비활성화
- `is_kiosk_active = false` 설정 시
- 키오스크 접근 차단
- 점검 화면 표시

### 점검 모드
- `maintenance_mode = true` 설정 시
- 모든 화면에서 점검 메시지 표시
- 관리자 화면만 접근 가능

---

## 📝 설정 값 타입

### Boolean
- `"true"` 또는 `"false"` 문자열로 저장
- 프론트엔드에서 파싱 필요

```typescript
const isActive = settings.is_kiosk_active === "true";
```

### Number
- 숫자도 문자열로 저장
- 프론트엔드에서 파싱 필요

```typescript
const bonusRate = parseInt(settings.bonus_rate);
```

### String
- 그대로 사용

```typescript
const message = settings.maintenance_message;
```

---

## 🔐 권한

### Normal Admin
- 설정 조회: ✅
- 설정 변경: ✅ (일부 항목만)
  - `bonus_rate`
  - `is_kiosk_active`
  - `notification_sound`

### Super Admin
- 설정 조회: ✅
- 설정 변경: ✅ (모든 항목)
- 설정 추가: ✅
- 설정 삭제: ✅

---

## 📝 에러 코드

| 코드 | 설명 |
|------|------|
| `SETTING_NOT_FOUND` | 설정을 찾을 수 없음 |
| `INVALID_VALUE` | 유효하지 않은 값 |
| `READ_ONLY_SETTING` | 읽기 전용 설정 (변경 불가) |
| `DUPLICATE_KEY` | 중복된 설정 키 |

---

## 🔗 관련 문서
- [주문 API](./06-order-api.md)
- [셀 API](./05-cell-api.md)
- [프론트엔드 매핑](./11-frontend-mapping.md#설정-settings)
