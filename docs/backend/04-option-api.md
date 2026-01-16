# ⚙️ 옵션 API (Options)

## 1️⃣ 전체 옵션 그룹 조회

```
GET /option-groups
```

### Query Parameters
- `includeItems` (optional): true (기본: true) - 옵션 항목 포함 여부

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "온도 선택",
      "icon": "🌡️",
      "type": "SINGLE",
      "isRequired": true,
      "displayOrder": 1,
      "items": [
        {
          "id": 101,
          "name": "HOT",
          "price": 0,
          "isDefault": true,
          "displayOrder": 1
        },
        {
          "id": 102,
          "name": "ICE",
          "price": 0,
          "isDefault": false,
          "displayOrder": 2
        }
      ]
    },
    {
      "id": 2,
      "name": "사이즈 선택",
      "icon": "📏",
      "type": "SINGLE",
      "isRequired": true,
      "displayOrder": 2,
      "items": [
        {
          "id": 201,
          "name": "R (Regular)",
          "price": 0,
          "isDefault": true,
          "displayOrder": 1
        },
        {
          "id": 202,
          "name": "L (Large)",
          "price": 500,
          "isDefault": false,
          "displayOrder": 2
        }
      ]
    },
    {
      "id": 3,
      "name": "추가 옵션",
      "icon": "➕",
      "type": "MULTIPLE",
      "isRequired": false,
      "displayOrder": 3,
      "items": [
        {
          "id": 301,
          "name": "샷 추가",
          "price": 500,
          "isDefault": false,
          "displayOrder": 1
        },
        {
          "id": 302,
          "name": "시럽 추가",
          "price": 500,
          "isDefault": false,
          "displayOrder": 2
        },
        {
          "id": 303,
          "name": "휘핑크림 추가",
          "price": 500,
          "isDefault": false,
          "displayOrder": 3
        }
      ]
    }
  ]
}
```

### 프론트엔드 연동
- **파일**: `components/OptionModal.tsx` (메뉴별로 연결된 옵션 표시)
- **파일**: `pages/admin/AdminMenusPage.tsx` (MenuOptionModal - 198줄)
- **파일**: `pages/admin/AdminOptionsPage.tsx`

---

## 2️⃣ 옵션 그룹 생성 (관리자)

```
POST /option-groups
```

### Headers
```
Authorization: Bearer {token}
```

### Request Body
```json
{
  "name": "당도 선택",
  "icon": "🍬",
  "type": "SINGLE",
  "isRequired": false,
  "displayOrder": 4
}
```

### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": 4,
    "name": "당도 선택",
    "icon": "🍬",
    "type": "SINGLE",
    "isRequired": false,
    "displayOrder": 4,
    "createdAt": "2026-01-15T10:30:00Z"
  }
}
```

### 프론트엔드 연동
- **파일**: `pages/admin/AdminMenusPage.tsx` (handleAddGroup - 208줄)

---

## 3️⃣ 옵션 항목 추가

```
POST /option-groups/:groupId/items
```

### Headers
```
Authorization: Bearer {token}
```

### Request Body
```json
{
  "name": "연하게",
  "price": 0,
  "isDefault": true,
  "displayOrder": 1
}
```

### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": 401,
    "optionGroupId": 4,
    "name": "연하게",
    "price": 0,
    "isDefault": true,
    "displayOrder": 1,
    "createdAt": "2026-01-15T10:35:00Z"
  }
}
```

### 프론트엔드 연동
- **파일**: `pages/admin/AdminMenusPage.tsx` (handleAddItem - 228줄)

---

## 4️⃣ 옵션 그룹 수정 (관리자)

```
PUT /option-groups/:id
```

### Headers
```
Authorization: Bearer {token}
```

### Request Body
```json
{
  "name": "당도 조절",
  "icon": "🍯",
  "isRequired": true,
  "displayOrder": 3
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 4,
    "name": "당도 조절",
    "icon": "🍯",
    "isRequired": true,
    "displayOrder": 3,
    "updatedAt": "2026-01-15T11:00:00Z"
  }
}
```

---

## 5️⃣ 옵션 항목 수정

```
PUT /option-groups/:groupId/items/:itemId
```

### Headers
```
Authorization: Bearer {token}
```

### Request Body
```json
{
  "name": "연하게 (30%)",
  "price": 0,
  "isDefault": false,
  "displayOrder": 2
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 401,
    "name": "연하게 (30%)",
    "price": 0,
    "isDefault": false,
    "displayOrder": 2,
    "updatedAt": "2026-01-15T11:05:00Z"
  }
}
```

---

## 6️⃣ 옵션 항목 삭제

```
DELETE /option-groups/:groupId/items/:itemId
```

### Headers
```
Authorization: Bearer {token}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "옵션 항목이 삭제되었습니다"
}
```

---

## 7️⃣ 옵션 그룹 삭제 (관리자)

```
DELETE /option-groups/:id
```

### Headers
```
Authorization: Bearer {token}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "옵션 그룹 및 하위 항목이 모두 삭제되었습니다"
}
```

### Response (409 Conflict)
```json
{
  "success": false,
  "error": {
    "code": "OPTION_GROUP_IN_USE",
    "message": "메뉴에 연결된 옵션 그룹은 삭제할 수 없습니다"
  }
}
```

---

## 📝 옵션 타입 설명

### SINGLE (단일 선택)
- 사용자는 **하나만** 선택 가능
- 예: 온도 선택 (HOT / ICE), 사이즈 선택 (R / L)

### MULTIPLE (다중 선택)
- 사용자는 **여러 개** 선택 가능
- 예: 추가 옵션 (샷 추가, 시럽 추가, 휘핑크림 추가)

---

## 📝 에러 코드

| 코드 | 설명 |
|------|------|
| `OPTION_GROUP_NOT_FOUND` | 옵션 그룹을 찾을 수 없음 |
| `OPTION_ITEM_NOT_FOUND` | 옵션 항목을 찾을 수 없음 |
| `OPTION_GROUP_IN_USE` | 메뉴에 연결되어 삭제 불가 |
| `INVALID_OPTION_TYPE` | 유효하지 않은 옵션 타입 |

---

## 🔗 관련 문서
- [메뉴 API](./02-menu-api.md)
- [프론트엔드 매핑](./11-frontend-mapping.md#옵션-options)
