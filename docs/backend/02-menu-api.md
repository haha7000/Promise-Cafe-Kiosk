# 🍽️ 메뉴 API (Menus)

## 1️⃣ 전체 메뉴 조회

```
GET /menus
```

### Query Parameters
- `category` (optional): COFFEE, NON_COFFEE, DESSERT, SEASONAL
- `includeInactive` (optional): true/false (기본: false)

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "아메리카노",
      "engName": "Americano",
      "price": 3500,
      "category": {
        "id": 1,
        "code": "COFFEE",
        "name": "커피"
      },
      "description": "풍부한 에스프레소의 깊은 맛과 향을 즐길 수 있는 커피",
      "imageUrl": "https://example.com/images/americano.jpg",
      "isSoldOut": false,
      "optionGroups": [
        {
          "id": 1,
          "name": "온도 선택",
          "icon": "🌡️",
          "type": "SINGLE",
          "isRequired": true,
          "items": [
            {
              "id": 101,
              "name": "HOT",
              "price": 0,
              "isDefault": true
            },
            {
              "id": 102,
              "name": "ICE",
              "price": 0,
              "isDefault": false
            }
          ]
        },
        {
          "id": 2,
          "name": "사이즈 선택",
          "icon": "📏",
          "type": "SINGLE",
          "isRequired": true,
          "items": [
            {
              "id": 201,
              "name": "R (Regular)",
              "price": 0,
              "isDefault": true
            },
            {
              "id": 202,
              "name": "L (Large)",
              "price": 500,
              "isDefault": false
            }
          ]
        }
      ]
    }
  ]
}
```

### 프론트엔드 연동
- **파일**: `components/MenuViews.tsx` (MenuGrid 컴포넌트)
- **파일**: `features/kiosk/components/OptimizedMenuGrid.tsx`
- **파일**: `constants.ts` (MOCK_MENU 교체)

### 구현 예시
```typescript
// MenuViews.tsx 또는 새로운 hooks/useMenus.ts
useEffect(() => {
  fetch('/api/v1/menus')
    .then(res => res.json())
    .then(data => setMenus(data.data));
}, []);
```

---

## 2️⃣ 메뉴 생성 (관리자)

```
POST /menus
```

### Headers
```
Authorization: Bearer {token}
```

### Request Body
```json
{
  "name": "바닐라 라떼",
  "engName": "Vanilla Latte",
  "price": 4500,
  "categoryId": 1,
  "description": "달콤한 바닐라 향이 가득한 부드러운 라떼",
  "imageUrl": "https://example.com/images/vanilla-latte.jpg",
  "optionGroupIds": [1, 2, 3]
}
```

### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": 7,
    "name": "바닐라 라떼",
    "engName": "Vanilla Latte",
    "price": 4500,
    "category": {
      "id": 1,
      "code": "COFFEE",
      "name": "커피"
    },
    "description": "달콤한 바닐라 향이 가득한 부드러운 라떼",
    "imageUrl": "https://example.com/images/vanilla-latte.jpg",
    "isSoldOut": false,
    "isActive": true,
    "createdAt": "2026-01-15T10:30:00Z"
  }
}
```

### 프론트엔드 연동
- **파일**: `pages/admin/AdminMenusPage.tsx` (메뉴 추가 버튼 - 49줄)

---

## 3️⃣ 메뉴 수정 (관리자)

```
PUT /menus/:id
```

### Headers
```
Authorization: Bearer {token}
```

### Request Body
```json
{
  "name": "바닐라 라떼 (수정)",
  "price": 5000,
  "description": "업데이트된 설명",
  "categoryId": 1,
  "optionGroupIds": [1, 2]
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 7,
    "name": "바닐라 라떼 (수정)",
    "price": 5000,
    "updatedAt": "2026-01-15T11:00:00Z"
  }
}
```

### 프론트엔드 연동
- **파일**: `pages/admin/AdminMenusPage.tsx` (수정 버튼 - 153줄)

---

## 4️⃣ 메뉴 품절 토글 (관리자)

```
PATCH /menus/:id/sold-out
```

### Headers
```
Authorization: Bearer {token}
```

### Request Body
```json
{
  "isSoldOut": true
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 5,
    "isSoldOut": true,
    "updatedAt": "2026-01-15T11:15:00Z"
  }
}
```

### 프론트엔드 연동
- **파일**: `pages/admin/AdminMenusPage.tsx` (toggleSoldOut 함수 - 21줄)

### 구현 예시
```typescript
const toggleSoldOut = async (menuId: number) => {
  const menu = menus.find(m => m.id === menuId);
  await fetch(`/api/v1/menus/${menuId}/sold-out`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ isSoldOut: !menu?.isSoldOut })
  });

  // 메뉴 목록 다시 불러오기
  fetchMenus();
};
```

---

## 5️⃣ 메뉴 삭제 (관리자)

```
DELETE /menus/:id
```

### Headers
```
Authorization: Bearer {token}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "메뉴가 삭제되었습니다"
}
```

### Response (409 Conflict)
```json
{
  "success": false,
  "error": {
    "code": "MENU_IN_USE",
    "message": "주문 내역이 있는 메뉴는 삭제할 수 없습니다 (비활성화만 가능)"
  }
}
```

### 프론트엔드 연동
- **파일**: `pages/admin/AdminMenusPage.tsx` (삭제 버튼 - 157줄)

---

## 📝 에러 코드

| 코드 | 설명 |
|------|------|
| `MENU_NOT_FOUND` | 메뉴를 찾을 수 없음 |
| `MENU_IN_USE` | 주문 내역이 있어 삭제 불가 |
| `INVALID_CATEGORY` | 유효하지 않은 카테고리 |
| `DUPLICATE_MENU_NAME` | 중복된 메뉴명 |

---

## 🔗 관련 문서
- [카테고리 API](./03-category-api.md)
- [옵션 API](./04-option-api.md)
- [프론트엔드 매핑](./11-frontend-mapping.md#메뉴-menus)
