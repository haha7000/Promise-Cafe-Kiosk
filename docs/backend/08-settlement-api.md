# 💰 정산 API (Settlements)

## 1️⃣ 일별 정산 목록 조회

```
GET /settlements
```

### Headers
```
Authorization: Bearer {token}
```

### Query Parameters
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD
- `isConfirmed` (optional): true/false

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "date": "2026-01-15",
      "totalOrders": 25,
      "totalRevenue": 125000,
      "personalOrders": 15,
      "personalRevenue": 75000,
      "cellOrders": 10,
      "cellRevenue": 50000,
      "isConfirmed": false,
      "confirmedBy": null,
      "confirmedAt": null,
      "notes": null,
      "createdAt": "2026-01-15T23:59:59Z"
    },
    {
      "id": 2,
      "date": "2026-01-14",
      "totalOrders": 30,
      "totalRevenue": 150000,
      "personalOrders": 18,
      "personalRevenue": 90000,
      "cellOrders": 12,
      "cellRevenue": 60000,
      "isConfirmed": true,
      "confirmedBy": {
        "id": 1,
        "name": "관리자"
      },
      "confirmedAt": "2026-01-15T09:00:00Z",
      "notes": "정산 완료",
      "createdAt": "2026-01-14T23:59:59Z"
    }
  ]
}
```

### 프론트엔드 연동
- **파일**: `pages/admin/AdminSettlementsPage.tsx`

---

## 2️⃣ 특정 일자 정산 상세 조회

```
GET /settlements/:date
```

### Headers
```
Authorization: Bearer {token}
```

### Path Parameters
- `date`: YYYY-MM-DD

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "date": "2026-01-15",
    "summary": {
      "totalOrders": 25,
      "totalRevenue": 125000,
      "personalOrders": 15,
      "personalRevenue": 75000,
      "cellOrders": 10,
      "cellRevenue": 50000,
      "completedOrders": 22,
      "cancelledOrders": 3
    },
    "paymentBreakdown": {
      "personal": {
        "orders": 15,
        "revenue": 75000,
        "percentage": 60.0
      },
      "cell": {
        "orders": 10,
        "revenue": 50000,
        "percentage": 40.0
      }
    },
    "categoryBreakdown": [
      {
        "categoryName": "커피",
        "orders": 15,
        "revenue": 75000,
        "percentage": 60.0
      },
      {
        "categoryName": "논커피",
        "orders": 6,
        "revenue": 30000,
        "percentage": 24.0
      },
      {
        "categoryName": "디저트",
        "orders": 4,
        "revenue": 20000,
        "percentage": 16.0
      }
    ],
    "topMenus": [
      {
        "menuName": "아메리카노",
        "quantity": 15,
        "revenue": 52500
      },
      {
        "menuName": "카페라떼",
        "quantity": 10,
        "revenue": 40000
      }
    ],
    "isConfirmed": false,
    "confirmedBy": null,
    "confirmedAt": null,
    "notes": null
  }
}
```

---

## 3️⃣ 일별 정산 확정

```
POST /settlements/:date/confirm
```

### Headers
```
Authorization: Bearer {token}
```

### Path Parameters
- `date`: YYYY-MM-DD

### Request Body
```json
{
  "notes": "정산 완료 - 이상 없음"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "date": "2026-01-15",
    "isConfirmed": true,
    "confirmedBy": {
      "id": 1,
      "name": "관리자"
    },
    "confirmedAt": "2026-01-16T09:00:00Z",
    "notes": "정산 완료 - 이상 없음"
  }
}
```

### Response (409 Conflict)
```json
{
  "success": false,
  "error": {
    "code": "ALREADY_CONFIRMED",
    "message": "이미 확정된 정산입니다"
  }
}
```

### 프론트엔드 연동
- **파일**: `pages/admin/AdminSettlementsPage.tsx` (정산 확정 기능)

---

## 4️⃣ 정산 확정 취소 (Super Admin)

```
POST /settlements/:date/unconfirm
```

### Headers
```
Authorization: Bearer {token}
```

### Path Parameters
- `date`: YYYY-MM-DD

### Request Body
```json
{
  "reason": "정산 데이터 수정 필요"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "date": "2026-01-15",
    "isConfirmed": false,
    "confirmedBy": null,
    "confirmedAt": null
  }
}
```

### 권한
- SUPER Admin만 실행 가능

---

## 5️⃣ 정산 리포트 다운로드

```
GET /settlements/:date/report
```

### Headers
```
Authorization: Bearer {token}
```

### Path Parameters
- `date`: YYYY-MM-DD

### Query Parameters
- `format` (optional): pdf, excel, csv (기본: pdf)

### Response
- Content-Type: application/pdf 또는 application/vnd.ms-excel
- File Download

---

## 6️⃣ 월간 정산 요약

```
GET /settlements/monthly/:year/:month
```

### Headers
```
Authorization: Bearer {token}
```

### Path Parameters
- `year`: YYYY (예: 2026)
- `month`: MM (예: 01)

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "year": 2026,
    "month": 1,
    "totalDays": 31,
    "confirmedDays": 15,
    "pendingDays": 16,
    "summary": {
      "totalOrders": 750,
      "totalRevenue": 3750000,
      "personalRevenue": 2250000,
      "cellRevenue": 1500000,
      "averageDailyRevenue": 120967
    },
    "dailyData": [
      {
        "date": "2026-01-01",
        "orders": 25,
        "revenue": 125000,
        "isConfirmed": true
      },
      {
        "date": "2026-01-02",
        "orders": 30,
        "revenue": 150000,
        "isConfirmed": true
      }
      // ... 나머지 일자
    ]
  }
}
```

---

## 📊 정산 프로세스

### 1. 자동 생성
- 매일 자정 (00:00)에 전날 정산 데이터 자동 생성
- `is_confirmed = false` 상태로 생성

### 2. 확인 및 검토
- 관리자가 정산 데이터 확인
- 주문 내역, 매출 내역, 취소 내역 검토

### 3. 정산 확정
- 관리자가 확정 버튼 클릭
- `is_confirmed = true` 변경
- 확정자 및 확정 시간 기록

### 4. 정산 리포트
- PDF/Excel로 다운로드
- 월간 리포트 생성

---

## 📝 정산 데이터 항목

### 주요 지표
- **총 주문 건수**: 완료된 주문 수
- **총 매출액**: 취소 제외한 실제 매출
- **결제 타입별 매출**: 개인결제 / 셀별결제
- **카테고리별 매출**: 커피 / 논커피 / 디저트 등

### 추가 정보
- 취소 주문 건수 및 금액
- 시간대별 매출 분포
- 인기 메뉴 TOP 10
- 셀별 사용 현황

---

## 📝 에러 코드

| 코드 | 설명 |
|------|------|
| `SETTLEMENT_NOT_FOUND` | 정산 데이터를 찾을 수 없음 |
| `ALREADY_CONFIRMED` | 이미 확정된 정산 |
| `FUTURE_DATE` | 미래 날짜는 정산할 수 없음 |
| `INSUFFICIENT_PERMISSION` | 권한 부족 (확정 취소는 SUPER만) |

---

## 🔗 관련 문서
- [통계 API](./07-statistics-api.md)
- [주문 API](./06-order-api.md)
- [프론트엔드 매핑](./11-frontend-mapping.md#정산-settlements)
