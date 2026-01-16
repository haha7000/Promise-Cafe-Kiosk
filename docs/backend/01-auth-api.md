# 🔐 인증 API (Authentication)

## 1️⃣ 관리자 로그인

```
POST /auth/login
```

### Request Body
```json
{
  "username": "admin",
  "password": "admin123"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "name": "관리자",
      "role": "SUPER",
      "lastLogin": "2026-01-15T10:30:00Z"
    }
  }
}
```

### Response (401 Unauthorized)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "아이디 또는 비밀번호가 올바르지 않습니다"
  }
}
```

### 프론트엔드 연동
- **파일**: `pages/admin/AdminLoginPage.tsx` (19줄)
- **파일**: `shared/contexts/AuthContext.tsx` (login 함수)

### 구현 예시
```typescript
// AuthContext.tsx 수정 필요
const login = async (username: string, password: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      const { data } = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setIsAdminLoggedIn(true);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};
```

---

## 2️⃣ 관리자 로그아웃

```
POST /auth/logout
```

### Headers
```
Authorization: Bearer {token}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "로그아웃되었습니다"
}
```

### 프론트엔드 연동
- **파일**: `shared/contexts/AuthContext.tsx` (logout 함수)

---

## 3️⃣ 토큰 검증

```
GET /auth/verify
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
    "user": {
      "id": 1,
      "username": "admin",
      "name": "관리자",
      "role": "SUPER"
    }
  }
}
```

### Response (401 Unauthorized)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "유효하지 않은 토큰입니다"
  }
}
```

### 프론트엔드 연동
- **위치**: App 초기화시 자동 호출
- **목적**: 새로고침시 로그인 상태 유지

---

## 🔐 JWT 토큰 정보

### Access Token
- **유효 기간**: 1시간
- **포함 정보**: userId, username, role
- **저장 위치**: localStorage

### Refresh Token (선택 사항)
- **유효 기간**: 7일
- **포함 정보**: userId
- **저장 위치**: httpOnly Cookie

---

## 🛡️ 보안 고려사항

1. **비밀번호 해싱**: bcrypt 사용 (salt rounds: 10)
2. **토큰 저장**: XSS 방지를 위해 httpOnly Cookie 권장
3. **CORS**: 프론트엔드 도메인만 허용
4. **Rate Limiting**: 로그인 시도 5회/분 제한

---

## 📝 에러 코드

| 코드 | 설명 |
|------|------|
| `INVALID_CREDENTIALS` | 아이디 또는 비밀번호 오류 |
| `INVALID_TOKEN` | 유효하지 않은 토큰 |
| `TOKEN_EXPIRED` | 만료된 토큰 |
| `UNAUTHORIZED` | 인증 필요 |

---

## 🔗 관련 문서
- [프론트엔드 매핑](./11-frontend-mapping.md#인증-auth)
- [프로젝트 개요](./00-overview.md#인증--권한)
