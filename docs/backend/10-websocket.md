# 🔄 WebSocket - 실시간 동기화

## 📍 연결 정보

### WebSocket URL
```
ws://localhost:3001/ws
```

### 프로덕션 URL
```
wss://your-domain.com/ws
```

---

## 🔌 연결

### 클라이언트 연결 예시
```typescript
// OrderContext.tsx
useEffect(() => {
  const ws = new WebSocket('ws://localhost:3001/ws');

  ws.onopen = () => {
    console.log('WebSocket 연결됨');
  };

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    handleWebSocketMessage(message);
  };

  ws.onerror = (error) => {
    console.error('WebSocket 오류:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket 연결 종료');
    // 재연결 로직
    setTimeout(() => {
      // 재연결 시도
    }, 5000);
  };

  return () => ws.close();
}, []);
```

---

## 📨 이벤트 타입

### 1️⃣ 새 주문 생성 알림

```json
{
  "event": "order:created",
  "data": {
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
        "totalPrice": 8000
      }
    ],
    "totalAmount": 8000,
    "status": "PENDING",
    "createdAt": "2026-01-15T10:30:00Z"
  }
}
```

**프론트엔드 연동:**
- **파일**: `shared/contexts/OrderContext.tsx`
- **파일**: `components/BaristaView.tsx` (새 주문 알림)

**구현 예시:**
```typescript
case 'order:created':
  // 새 주문 추가
  setOrders(prev => [message.data, ...prev]);

  // 알림음 재생 (선택 사항)
  playNotificationSound();

  // 토스트 알림 표시
  showToast(`새 주문: #${message.data.dailyNum}`);
  break;
```

---

### 2️⃣ 주문 상태 변경 알림

```json
{
  "event": "order:status_changed",
  "data": {
    "orderId": "ORD-1737005400000-abc123",
    "dailyNum": 5,
    "status": "MAKING",
    "previousStatus": "PENDING",
    "updatedAt": "2026-01-15T10:35:00Z"
  }
}
```

**프론트엔드 연동:**
- **파일**: `shared/contexts/OrderContext.tsx`
- **파일**: `components/BaristaView.tsx` (실시간 상태 업데이트)
- **파일**: `pages/admin/AdminOrdersPage.tsx`

**구현 예시:**
```typescript
case 'order:status_changed':
  // 주문 상태 업데이트
  setOrders(prev => prev.map(order =>
    order.orderId === message.data.orderId
      ? {
          ...order,
          status: message.data.status,
          ...(message.data.status === 'COMPLETED'
            ? { completedAt: new Date(message.data.updatedAt) }
            : {})
        }
      : order
  ));
  break;
```

---

### 3️⃣ 메뉴 품절 상태 변경 알림

```json
{
  "event": "menu:sold_out_changed",
  "data": {
    "menuId": 5,
    "menuName": "딸기라떼",
    "isSoldOut": true,
    "updatedAt": "2026-01-15T10:40:00Z"
  }
}
```

**프론트엔드 연동:**
- **파일**: `components/MenuViews.tsx`
- **파일**: `features/kiosk/components/OptimizedMenuGrid.tsx`
- **파일**: `pages/admin/AdminMenusPage.tsx`

**구현 예시:**
```typescript
case 'menu:sold_out_changed':
  // 메뉴 품절 상태 업데이트
  setMenus(prev => prev.map(menu =>
    menu.id === message.data.menuId
      ? { ...menu, isSoldOut: message.data.isSoldOut }
      : menu
  ));

  // 품절 알림 표시
  if (message.data.isSoldOut) {
    showToast(`${message.data.menuName}가 품절되었습니다`);
  }
  break;
```

---

### 4️⃣ 주문 취소 알림

```json
{
  "event": "order:cancelled",
  "data": {
    "orderId": "ORD-1737005400000-abc123",
    "dailyNum": 5,
    "reason": "고객 요청",
    "cancelledAt": "2026-01-15T10:45:00Z"
  }
}
```

**구현 예시:**
```typescript
case 'order:cancelled':
  // 주문 상태를 CANCELLED로 변경
  setOrders(prev => prev.map(order =>
    order.orderId === message.data.orderId
      ? { ...order, status: 'CANCELLED', cancelledAt: new Date(message.data.cancelledAt) }
      : order
  ));

  showToast(`주문 #${message.data.dailyNum}이 취소되었습니다`);
  break;
```

---

### 5️⃣ 셀 포인트 변경 알림

```json
{
  "event": "cell:balance_changed",
  "data": {
    "cellId": 1,
    "cellName": "청년1셀",
    "balanceBefore": 45000,
    "balanceAfter": 100000,
    "changeAmount": 55000,
    "type": "CHARGE",
    "updatedAt": "2026-01-15T10:50:00Z"
  }
}
```

**프론트엔드 연동:**
- **파일**: `pages/admin/AdminCellsPage.tsx`

---

### 6️⃣ 시스템 설정 변경 알림

```json
{
  "event": "settings:changed",
  "data": {
    "key": "is_kiosk_active",
    "value": "false",
    "updatedBy": {
      "id": 1,
      "name": "관리자"
    },
    "updatedAt": "2026-01-15T10:55:00Z"
  }
}
```

**구현 예시:**
```typescript
case 'settings:changed':
  // 키오스크 비활성화 시 점검 화면 표시
  if (message.data.key === 'is_kiosk_active' && message.data.value === 'false') {
    showMaintenanceScreen();
  }
  break;
```

---

## 🔄 완전한 WebSocket 구현 예시

```typescript
// shared/contexts/OrderContext.tsx
import { useEffect, useRef } from 'react';

export const OrderProvider = ({ children }) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket('ws://localhost:3001/ws');

    ws.onopen = () => {
      console.log('✅ WebSocket 연결됨');
      wsRef.current = ws;
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.event) {
          case 'order:created':
            setOrders(prev => [message.data, ...prev]);
            playNotificationSound();
            break;

          case 'order:status_changed':
            setOrders(prev => prev.map(order =>
              order.orderId === message.data.orderId
                ? { ...order, status: message.data.status }
                : order
            ));
            break;

          case 'menu:sold_out_changed':
            // 메뉴 상태 업데이트 로직
            break;

          case 'order:cancelled':
            setOrders(prev => prev.map(order =>
              order.orderId === message.data.orderId
                ? { ...order, status: 'CANCELLED' }
                : order
            ));
            break;

          default:
            console.warn('알 수 없는 이벤트:', message.event);
        }
      } catch (error) {
        console.error('WebSocket 메시지 파싱 오류:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket 오류:', error);
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket 연결 종료');
      wsRef.current = null;

      // 5초 후 재연결 시도
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('🔄 WebSocket 재연결 시도...');
        connectWebSocket();
      }, 5000);
    };

    return ws;
  }, []);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  // ... rest of provider
};
```

---

## 🛡️ 에러 처리 및 재연결

### 재연결 전략
1. 연결 끊김 감지
2. 5초 대기
3. 재연결 시도
4. 최대 5회 시도
5. 실패 시 수동 새로고침 안내

```typescript
const MAX_RECONNECT_ATTEMPTS = 5;
let reconnectAttempts = 0;

ws.onclose = () => {
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    reconnectAttempts++;
    setTimeout(() => {
      connectWebSocket();
    }, 5000);
  } else {
    showError('서버 연결이 끊어졌습니다. 페이지를 새로고침해주세요.');
  }
};

ws.onopen = () => {
  reconnectAttempts = 0; // 연결 성공 시 카운터 초기화
};
```

---

## 📝 WebSocket 장점

### 실시간 동기화
- 바리스타 화면에서 새 주문 즉시 표시
- 관리자 화면에서 실시간 통계 업데이트
- 키오스크에서 품절 메뉴 즉시 비활성화

### 서버 부하 감소
- Polling 방식 대비 95% 이상 트래픽 감소
- 변경사항만 전송하여 대역폭 절약

### 사용자 경험 개선
- 새 주문 알림음
- 실시간 주문 상태 업데이트
- 즉각적인 피드백

---

## 🔗 관련 문서
- [주문 API](./06-order-api.md)
- [메뉴 API](./02-menu-api.md)
- [프론트엔드 매핑](./11-frontend-mapping.md#websocket)
