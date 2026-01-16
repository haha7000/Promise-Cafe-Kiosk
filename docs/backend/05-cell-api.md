# 🏢 셀 관리 API (Cells)

## 1️⃣ 셀 인증 (휴대폰 뒷 4자리)

```
POST /cells/auth
```

### Request Body
```json
{
  "phoneLast4": "1234"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "청년1셀",
    "leader": "김셀장",
    "balance": 45000
  }
}
```

### Response (404 Not Found)
```json
{
  "success": false,
  "error": {
    "code": "CELL_NOT_FOUND",
    "message": "등록된 셀 정보가 없습니다"
  }
}
```

### 프론트엔드 연동
- **파일**: `components/PaymentViews.tsx` (CellAuthView의 handleCheck - 74줄)

### 구현 예시
```typescript
// PaymentViews.tsx - CellAuthView
const handleCheck = async () => {
  try {
    const response = await fetch('/api/v1/cells/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneLast4: input })
    });

    const result = await response.json();

    if (result.success) {
      onSuccess(result.data);
    } else {
      setError(result.error.message);
      setInput('');
    }
  } catch (error) {
    setError('인증 중 오류가 발생했습니다');
  }
};
```

---

## 2️⃣ 전체 셀 목록 조회 (관리자)

```
GET /cells
```

### Headers
```
Authorization: Bearer {token}
```

### Query Parameters
- `includeInactive` (optional): true/false (기본: false)

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "청년1셀",
      "leader": "김셀장",
      "phoneLast4": "1234",
      "balance": 45000,
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "name": "청년2셀",
      "leader": "이리더",
      "phoneLast4": "5678",
      "balance": 32000,
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-14T15:20:00Z"
    }
  ]
}
```

### 프론트엔드 연동
- **파일**: `pages/admin/AdminCellsPage.tsx` (cells state - 12줄)

### 구현 예시
```typescript
// AdminCellsPage.tsx
useEffect(() => {
  fetch('/api/v1/cells', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => setCells(data.data));
}, []);
```

---

## 3️⃣ 셀 생성 (관리자)

```
POST /cells
```

### Headers
```
Authorization: Bearer {token}
```

### Request Body
```json
{
  "name": "청년3셀",
  "leader": "박리더",
  "phoneLast4": "5678"
}
```

### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "청년3셀",
    "leader": "박리더",
    "phoneLast4": "5678",
    "balance": 0,
    "isActive": true,
    "createdAt": "2026-01-15T10:30:00Z"
  }
}
```

### Response (409 Conflict)
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_PHONE",
    "message": "이미 등록된 휴대폰 번호입니다"
  }
}
```

### 프론트엔드 연동
- **파일**: `pages/admin/AdminCellsPage.tsx` (셀 추가 기능)

---

## 4️⃣ 포인트 충전 (관리자)

```
POST /cells/:id/charge
```

### Headers
```
Authorization: Bearer {token}
```

### Request Body
```json
{
  "amount": 50000,
  "bonusRate": 10,
  "memo": "정기 충전"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "cellId": 1,
    "chargeAmount": 50000,
    "bonusAmount": 5000,
    "totalCharge": 55000,
    "balanceBefore": 45000,
    "balanceAfter": 100000,
    "transaction": {
      "id": 123,
      "type": "CHARGE",
      "amount": 55000,
      "balanceAfter": 100000,
      "memo": "정기 충전",
      "createdAt": "2026-01-15T10:30:00Z"
    }
  }
}
```

### 프론트엔드 연동
- **파일**: `pages/admin/AdminCellsPage.tsx` (handleCharge - 21줄)

### 구현 예시
```typescript
const handleCharge = async () => {
  if (!selectedCell || !chargeAmount) return;

  const response = await fetch(`/api/v1/cells/${selectedCell.id}/charge`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: parseInt(chargeAmount),
      bonusRate: parseInt(bonusRate),
      memo: chargeMemo
    })
  });

  const result = await response.json();

  if (result.success) {
    // 셀 목록 다시 불러오기
    fetchCells();
    setIsChargeModalOpen(false);
  }
};
```

---

## 5️⃣ 포인트 거래 내역 조회

```
GET /cells/:id/transactions
```

### Headers
```
Authorization: Bearer {token}
```

### Query Parameters
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD
- `type` (optional): CHARGE, USE, REFUND
- `limit` (optional): 기본 50
- `offset` (optional): 기본 0

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": 123,
        "type": "CHARGE",
        "amount": 55000,
        "balanceAfter": 100000,
        "memo": "정기 충전",
        "createdBy": {
          "id": 1,
          "name": "관리자"
        },
        "createdAt": "2026-01-15T10:30:00Z"
      },
      {
        "id": 122,
        "type": "USE",
        "amount": -4500,
        "balanceAfter": 45000,
        "order": {
          "orderId": "ORD-1234567890-abc",
          "dailyNum": 5
        },
        "createdAt": "2026-01-15T09:15:00Z"
      },
      {
        "id": 121,
        "type": "REFUND",
        "amount": 3500,
        "balanceAfter": 49500,
        "order": {
          "orderId": "ORD-1234567890-xyz",
          "dailyNum": 4
        },
        "memo": "주문 취소",
        "createdAt": "2026-01-15T08:50:00Z"
      }
    ],
    "total": 3,
    "limit": 50,
    "offset": 0
  }
}
```

### 프론트엔드 연동
- **파일**: `pages/admin/AdminCellsPage.tsx` (거래 내역 표시)

---

## 6️⃣ 셀 수정 (관리자)

```
PUT /cells/:id
```

### Headers
```
Authorization: Bearer {token}
```

### Request Body
```json
{
  "name": "청년1셀 (수정)",
  "leader": "최셀장",
  "phoneLast4": "9999"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "청년1셀 (수정)",
    "leader": "최셀장",
    "phoneLast4": "9999",
    "updatedAt": "2026-01-15T11:00:00Z"
  }
}
```

---

## 7️⃣ 셀 삭제 (관리자)

```
DELETE /cells/:id
```

### Headers
```
Authorization: Bearer {token}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "셀이 삭제되었습니다"
}
```

### Response (409 Conflict)
```json
{
  "success": false,
  "error": {
    "code": "CELL_HAS_BALANCE",
    "message": "잔액이 있는 셀은 삭제할 수 없습니다"
  }
}
```

---

## 📝 거래 타입 설명

| 타입 | 설명 | amount 부호 |
|------|------|-------------|
| `CHARGE` | 포인트 충전 | 양수 (+) |
| `USE` | 주문 결제 | 음수 (-) |
| `REFUND` | 주문 취소 환불 | 양수 (+) |

---

## 📝 에러 코드

| 코드 | 설명 |
|------|------|
| `CELL_NOT_FOUND` | 셀을 찾을 수 없음 |
| `DUPLICATE_PHONE` | 중복된 휴대폰 번호 |
| `CELL_HAS_BALANCE` | 잔액이 있어 삭제 불가 |
| `INSUFFICIENT_BALANCE` | 포인트 부족 |

---

## 🔗 관련 문서
- [주문 API](./06-order-api.md)
- [프론트엔드 매핑](./11-frontend-mapping.md#셀-cells)
