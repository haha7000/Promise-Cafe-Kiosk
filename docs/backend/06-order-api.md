# 📦 주문 API (Orders)

## 1️⃣ 주문 생성

```
POST /orders
```

### Request Body
```json
{
  "payType": "CELL",
  "cellId": 1,
  "items": [
    {
      "menuId": 1,
      "menuName": "아메리카노",
      "menuPrice": 3500,
      "quantity": 2,
      "selectedOptions": [
        {
          "groupName": "온도 선택",
          "items": [
            {
              "name": "HOT",
              "price": 0
            }
          ]
        },
        {
          "groupName": "사이즈 선택",
          "items": [
            {
              "name": "L (Large)",
              "price": 500
            }
          ]
        }
      ]
    }
  ],
  "totalAmount": 8000
}
```

### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "orderId": "ORD-1737005400000-abc123",
    "dailyNum": 5,
    "payType": "CELL",
    "cellInfo": {
      "id": 1,
      "name": "청년1셀",
      "balance": 37000
    },
    "items": [
      {
        "menuName": "아메리카노",
        "menuPrice": 3500,
        "quantity": 2,
        "selectedOptions": [
          {
            "groupName": "온도 선택",
            "items": [{ "name": "HOT", "price": 0 }]
          },
          {
            "groupName": "사이즈 선택",
            "items": [{ "name": "L (Large)", "price": 500 }]
          }
        ],
        "totalPrice": 8000
      }
    ],
    "totalAmount": 8000,
    "status": "PENDING",
    "createdAt": "2026-01-15T10:30:00Z"
  }
}
```

### Response (400 Bad Request) - 포인트 부족
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "포인트가 부족합니다 (잔액: 5,000원)"
  }
}
```

### 프론트엔드 연동
- **파일**: `features/kiosk/hooks/useOrderSubmit.ts` (submitOrder - 31줄)
- **파일**: `features/kiosk/KioskPageRefactored.tsx` (handleOrder - 26줄)

### 구현 예시
```typescript
// useOrderSubmit.ts
const submitOrder = useCallback(async (orderData: CreateOrderData): Promise<OrderSubmitResult> => {
  setIsSubmitting(true);
  setError(null);

  try {
    // 유효성 검사
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('장바구니가 비어있습니다');
    }

    // API 호출
    const response = await fetch('/api/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payType: orderData.payType,
        cellId: orderData.cellInfo?.id,
        items: orderData.items.map(item => ({
          menuId: item.menu.id,
          menuName: item.menu.name,
          menuPrice: item.menu.price,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions
        })),
        totalAmount: orderData.totalAmount
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error.message);
    }

    logger.info('Order created', { orderId: result.data.orderId });
    addOrder(result.data);

    return { success: true, order: result.data };
  } catch (err) {
    const message = err instanceof Error ? err.message : '주문 처리 중 오류가 발생했습니다';
    logger.error('Order failed', err);
    setError(message);
    return { success: false, error: message };
  } finally {
    setIsSubmitting(false);
  }
}, [addOrder]);
```

---

## 2️⃣ 전체 주문 조회

```
GET /orders
```

### Query Parameters
- `status` (optional): PENDING, MAKING, COMPLETED, CANCELLED
- `payType` (optional): PERSONAL, CELL
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD
- `limit` (optional): 기본 100
- `offset` (optional): 기본 0

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "orderId": "ORD-1737005400000-abc123",
        "dailyNum": 5,
        "payType": "CELL",
        "cellInfo": {
          "id": 1,
          "name": "청년1셀"
        },
        "items": [
          {
            "menuName": "아메리카노",
            "quantity": 2,
            "selectedOptions": [
              {
                "groupName": "온도 선택",
                "items": [{ "name": "HOT", "price": 0 }]
              }
            ],
            "totalPrice": 8000
          }
        ],
        "totalAmount": 8000,
        "status": "PENDING",
        "createdAt": "2026-01-15T10:30:00Z",
        "completedAt": null
      }
    ],
    "total": 1,
    "limit": 100,
    "offset": 0
  }
}
```

### 프론트엔드 연동
- **파일**: `shared/contexts/OrderContext.tsx` (orders state)
- **파일**: `components/BaristaView.tsx` (바리스타 화면)
- **파일**: `pages/admin/AdminOrdersPage.tsx`
- **파일**: `pages/admin/AdminDashboardPage.tsx`

### 구현 예시
```typescript
// OrderContext.tsx
useEffect(() => {
  const fetchOrders = async () => {
    const response = await fetch('/api/v1/orders?limit=100');
    const result = await response.json();
    if (result.success) {
      setOrders(result.data.orders);
    }
  };

  fetchOrders();

  // 30초마다 자동 갱신
  const interval = setInterval(fetchOrders, 30000);
  return () => clearInterval(interval);
}, []);
```

---

## 3️⃣ 주문 상태 변경

```
PATCH /orders/:orderId/status
```

### Request Body
```json
{
  "status": "MAKING"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "orderId": "ORD-1737005400000-abc123",
    "status": "MAKING",
    "updatedAt": "2026-01-15T10:35:00Z"
  }
}
```

### 상태 전환 규칙
```
PENDING → MAKING → COMPLETED
   ↓         ↓
CANCELLED  CANCELLED
```

### 프론트엔드 연동
- **파일**: `shared/contexts/OrderContext.tsx` (updateOrderStatus - 31줄)
- **파일**: `components/BaristaView.tsx` (handleStatusChange - 53줄)
- **파일**: `pages/admin/AdminOrdersPage.tsx`

### 구현 예시
```typescript
// OrderContext.tsx
const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  try {
    const response = await fetch(`/api/v1/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    const result = await response.json();

    if (result.success) {
      setOrders(prev => prev.map(order =>
        order.orderId === orderId
          ? {
              ...order,
              status,
              ...(status === 'COMPLETED' ? { completedAt: new Date() } : {})
            }
          : order
      ));
    }
  } catch (error) {
    logger.error('Failed to update order status', error);
  }
};
```

---

## 4️⃣ 주문 취소 (관리자)

```
POST /orders/:orderId/cancel
```

### Headers
```
Authorization: Bearer {token}
```

### Request Body
```json
{
  "reason": "고객 요청"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "orderId": "ORD-1737005400000-abc123",
    "status": "CANCELLED",
    "refund": {
      "cellId": 1,
      "amount": 8000,
      "balanceAfter": 45000
    },
    "cancelledAt": "2026-01-15T10:40:00Z"
  }
}
```

### 프론트엔드 연동
- **파일**: `pages/admin/AdminOrdersPage.tsx` (주문 취소 기능)

---

## 5️⃣ 오늘의 주문 번호 초기화 (관리자)

```
POST /orders/reset-daily-number
```

### Headers
```
Authorization: Bearer {token}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "nextOrderNumber": 1,
    "message": "주문 번호가 1번으로 초기화되었습니다"
  }
}
```

### 프론트엔드 연동
- **파일**: `shared/contexts/OrderContext.tsx` (resetOrderNumber - 43줄)
- **파일**: `pages/admin/AdminSettingsPage.tsx` (onResetOrderNumber)

### 구현 예시
```typescript
// OrderContext.tsx
const resetOrderNumber = async () => {
  try {
    const response = await fetch('/api/v1/orders/reset-daily-number', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const result = await response.json();

    if (result.success) {
      setNextOrderNumber(1);
    }
  } catch (error) {
    logger.error('Failed to reset order number', error);
  }
};
```

---

## 📝 주문 상태 (OrderStatus)

| 상태 | 설명 | 다음 가능 상태 |
|------|------|----------------|
| `PENDING` | 주문 접수 (대기) | MAKING, CANCELLED |
| `MAKING` | 제조 중 | COMPLETED, CANCELLED |
| `COMPLETED` | 완료 | - |
| `CANCELLED` | 취소됨 | - |

---

## 📝 주문 번호 시스템

### Daily Number (1-12 순환)
- 12간지를 모티브로 한 1-12 순환 번호
- 매일 자동으로 1번부터 시작
- 관리자가 수동으로 초기화 가능

### Order ID
- 형식: `ORD-{timestamp}-{random}`
- 예: `ORD-1737005400000-abc123`
- 전역 고유 식별자

---

## 📝 에러 코드

| 코드 | 설명 |
|------|------|
| `ORDER_NOT_FOUND` | 주문을 찾을 수 없음 |
| `INSUFFICIENT_BALANCE` | 포인트 부족 |
| `INVALID_STATUS_TRANSITION` | 유효하지 않은 상태 전환 |
| `EMPTY_CART` | 장바구니가 비어있음 |
| `MENU_SOLD_OUT` | 품절된 메뉴 포함 |

---

## 🔗 관련 문서
- [셀 API](./05-cell-api.md)
- [메뉴 API](./02-menu-api.md)
- [WebSocket](./10-websocket.md)
- [프론트엔드 매핑](./11-frontend-mapping.md#주문-orders)
