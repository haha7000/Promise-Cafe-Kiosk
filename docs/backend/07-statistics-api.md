# 📊 통계 API (Statistics)

## 1️⃣ 대시보드 통계

```
GET /statistics/dashboard
```

### Headers
```
Authorization: Bearer {token}
```

### Query Parameters
- `date` (optional): YYYY-MM-DD (기본: 오늘)

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "todayOrders": 25,
    "todayRevenue": 125000,
    "pendingOrders": 3,
    "completedOrders": 22,
    "personalOrders": 15,
    "personalRevenue": 75000,
    "cellOrders": 10,
    "cellRevenue": 50000,
    "topMenus": [
      {
        "menuId": 1,
        "menuName": "아메리카노",
        "quantity": 15,
        "revenue": 52500
      },
      {
        "menuId": 2,
        "menuName": "카페라떼",
        "quantity": 10,
        "revenue": 40000
      },
      {
        "menuId": 3,
        "menuName": "바닐라라떼",
        "quantity": 8,
        "revenue": 36000
      },
      {
        "menuId": 4,
        "menuName": "카라멜 마끼아또",
        "quantity": 6,
        "revenue": 27000
      },
      {
        "menuId": 5,
        "menuName": "딸기라떼",
        "quantity": 5,
        "revenue": 25000
      }
    ]
  }
}
```

### 프론트엔드 연동
- **파일**: `pages/admin/AdminDashboardPage.tsx` (stats 계산 - 16줄)

### 구현 예시
```typescript
// AdminDashboardPage.tsx
useEffect(() => {
  const fetchDashboardStats = async () => {
    const response = await fetch('/api/v1/statistics/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const result = await response.json();
    if (result.success) {
      setStats(result.data);
    }
  };

  fetchDashboardStats();
}, []);
```

---

## 2️⃣ 메뉴별 판매 통계

```
GET /statistics/menus
```

### Headers
```
Authorization: Bearer {token}
```

### Query Parameters
- `startDate` (required): YYYY-MM-DD
- `endDate` (required): YYYY-MM-DD
- `categoryId` (optional): 카테고리 ID

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "menuId": 1,
      "menuName": "아메리카노",
      "category": "커피",
      "totalQuantity": 150,
      "totalRevenue": 525000,
      "averagePrice": 3500
    },
    {
      "menuId": 2,
      "menuName": "카페라떼",
      "category": "커피",
      "totalQuantity": 120,
      "totalRevenue": 480000,
      "averagePrice": 4000
    },
    {
      "menuId": 3,
      "menuName": "바닐라라떼",
      "category": "커피",
      "totalQuantity": 95,
      "totalRevenue": 427500,
      "averagePrice": 4500
    }
  ]
}
```

### 프론트엔드 연동
- **파일**: `pages/admin/AdminStatisticsPage.tsx`

---

## 3️⃣ 일별 매출 통계

```
GET /statistics/daily
```

### Headers
```
Authorization: Bearer {token}
```

### Query Parameters
- `startDate` (required): YYYY-MM-DD
- `endDate` (required): YYYY-MM-DD

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-01-15",
      "totalOrders": 25,
      "totalRevenue": 125000,
      "personalOrders": 15,
      "personalRevenue": 75000,
      "cellOrders": 10,
      "cellRevenue": 50000,
      "completedOrders": 22,
      "cancelledOrders": 3
    },
    {
      "date": "2026-01-14",
      "totalOrders": 30,
      "totalRevenue": 150000,
      "personalOrders": 18,
      "personalRevenue": 90000,
      "cellOrders": 12,
      "cellRevenue": 60000,
      "completedOrders": 28,
      "cancelledOrders": 2
    },
    {
      "date": "2026-01-13",
      "totalOrders": 28,
      "totalRevenue": 140000,
      "personalOrders": 16,
      "personalRevenue": 80000,
      "cellOrders": 12,
      "cellRevenue": 60000,
      "completedOrders": 26,
      "cancelledOrders": 2
    }
  ]
}
```

### 프론트엔드 연동
- **파일**: `pages/admin/AdminStatisticsPage.tsx`
- **파일**: `pages/admin/AdminSettlementsPage.tsx`

---

## 4️⃣ 카테고리별 판매 통계

```
GET /statistics/categories
```

### Headers
```
Authorization: Bearer {token}
```

### Query Parameters
- `startDate` (required): YYYY-MM-DD
- `endDate` (required): YYYY-MM-DD

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "categoryId": 1,
      "categoryCode": "COFFEE",
      "categoryName": "커피",
      "totalQuantity": 365,
      "totalRevenue": 1432500,
      "orderCount": 120,
      "percentage": 65.5
    },
    {
      "categoryId": 2,
      "categoryCode": "NON_COFFEE",
      "categoryName": "논커피",
      "totalQuantity": 120,
      "totalRevenue": 540000,
      "orderCount": 45,
      "percentage": 24.7
    },
    {
      "categoryId": 3,
      "categoryCode": "DESSERT",
      "categoryName": "디저트",
      "totalQuantity": 75,
      "totalRevenue": 225000,
      "orderCount": 30,
      "percentage": 10.3
    }
  ]
}
```

---

## 5️⃣ 시간대별 주문 통계

```
GET /statistics/hourly
```

### Headers
```
Authorization: Bearer {token}
```

### Query Parameters
- `date` (optional): YYYY-MM-DD (기본: 오늘)

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "hour": 9,
      "orders": 5,
      "revenue": 25000
    },
    {
      "hour": 10,
      "orders": 8,
      "revenue": 40000
    },
    {
      "hour": 11,
      "orders": 12,
      "revenue": 60000
    },
    {
      "hour": 12,
      "orders": 15,
      "revenue": 75000
    },
    {
      "hour": 13,
      "orders": 10,
      "revenue": 50000
    }
  ]
}
```

---

## 6️⃣ 셀별 사용 통계

```
GET /statistics/cells
```

### Headers
```
Authorization: Bearer {token}
```

### Query Parameters
- `startDate` (required): YYYY-MM-DD
- `endDate` (required): YYYY-MM-DD

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "cellId": 1,
      "cellName": "청년1셀",
      "totalOrders": 25,
      "totalSpent": 125000,
      "averageOrderAmount": 5000,
      "currentBalance": 45000
    },
    {
      "cellId": 2,
      "cellName": "청년2셀",
      "totalOrders": 18,
      "totalSpent": 90000,
      "averageOrderAmount": 5000,
      "currentBalance": 32000
    }
  ]
}
```

---

## 📊 통계 데이터 활용

### 대시보드
- 실시간 운영 현황 파악
- 오늘의 주문/매출/대기 주문
- 인기 메뉴 TOP 5

### 메뉴별 통계
- 메뉴 성과 분석
- 재고 관리 데이터
- 신메뉴 기획 근거

### 일별 매출 통계
- 매출 추이 분석
- 요일별 패턴 파악
- 정산 데이터

### 카테고리별 통계
- 카테고리 비중 분석
- 제품 구성 최적화

### 시간대별 통계
- 피크 타임 파악
- 바리스타 배치 계획
- 재고 준비

### 셀별 통계
- 셀 사용 현황
- 충전 권장 타이밍
- 셀 활동도 분석

---

## 📝 에러 코드

| 코드 | 설명 |
|------|------|
| `INVALID_DATE_RANGE` | 유효하지 않은 날짜 범위 |
| `DATE_RANGE_TOO_LARGE` | 조회 기간이 너무 긺 (최대 1년) |

---

## 🔗 관련 문서
- [정산 API](./08-settlement-api.md)
- [주문 API](./06-order-api.md)
- [프론트엔드 매핑](./11-frontend-mapping.md#통계-statistics)
