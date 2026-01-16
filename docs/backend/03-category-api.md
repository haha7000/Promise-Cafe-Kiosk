# 🏷️ 카테고리 API (Categories)

## 1️⃣ 전체 카테고리 조회

```
GET /categories
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
      "code": "COFFEE",
      "name": "커피",
      "displayOrder": 1,
      "isActive": true
    },
    {
      "id": 2,
      "code": "NON_COFFEE",
      "name": "논커피",
      "displayOrder": 2,
      "isActive": true
    },
    {
      "id": 3,
      "code": "DESSERT",
      "name": "디저트",
      "displayOrder": 3,
      "isActive": true
    },
    {
      "id": 4,
      "code": "SEASONAL",
      "name": "시즌메뉴",
      "displayOrder": 4,
      "isActive": true
    }
  ]
}
```

### 프론트엔드 연동
- **파일**: `components/MenuViews.tsx` (CategoryTabs - 46줄)
- **파일**: `pages/admin/AdminCategoriesPage.tsx`

---

## 2️⃣ 카테고리 생성 (관리자)

```
POST /categories
```

### Headers
```
Authorization: Bearer {token}
```

### Request Body
```json
{
  "code": "BAKERY",
  "name": "베이커리",
  "displayOrder": 5
}
```

### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": 5,
    "code": "BAKERY",
    "name": "베이커리",
    "displayOrder": 5,
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
    "code": "DUPLICATE_CATEGORY_CODE",
    "message": "이미 존재하는 카테고리 코드입니다"
  }
}
```

### 프론트엔드 연동
- **파일**: `pages/admin/AdminCategoriesPage.tsx` (카테고리 추가 기능)

---

## 3️⃣ 카테고리 수정 (관리자)

```
PUT /categories/:id
```

### Headers
```
Authorization: Bearer {token}
```

### Request Body
```json
{
  "name": "베이커리 & 디저트",
  "displayOrder": 3
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 5,
    "code": "BAKERY",
    "name": "베이커리 & 디저트",
    "displayOrder": 3,
    "updatedAt": "2026-01-15T11:00:00Z"
  }
}
```

### 프론트엔드 연동
- **파일**: `pages/admin/AdminCategoriesPage.tsx` (카테고리 수정 기능)

---

## 4️⃣ 카테고리 활성화/비활성화 (관리자)

```
PATCH /categories/:id/active
```

### Headers
```
Authorization: Bearer {token}
```

### Request Body
```json
{
  "isActive": false
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 5,
    "isActive": false,
    "updatedAt": "2026-01-15T11:15:00Z"
  }
}
```

---

## 5️⃣ 카테고리 삭제 (관리자)

```
DELETE /categories/:id
```

### Headers
```
Authorization: Bearer {token}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "카테고리가 삭제되었습니다"
}
```

### Response (409 Conflict)
```json
{
  "success": false,
  "error": {
    "code": "CATEGORY_HAS_MENUS",
    "message": "메뉴가 등록된 카테고리는 삭제할 수 없습니다 (비활성화만 가능)"
  }
}
```

---

## 📝 에러 코드

| 코드 | 설명 |
|------|------|
| `CATEGORY_NOT_FOUND` | 카테고리를 찾을 수 없음 |
| `DUPLICATE_CATEGORY_CODE` | 중복된 카테고리 코드 |
| `CATEGORY_HAS_MENUS` | 메뉴가 있어 삭제 불가 |

---

## 🔗 관련 문서
- [메뉴 API](./02-menu-api.md)
- [프론트엔드 매핑](./11-frontend-mapping.md#카테고리-categories)
