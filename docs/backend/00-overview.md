# 🎯 P.M CAFE 백엔드 - 프로젝트 개요

## 📋 문서 정보
- **작성일**: 2026-01-15
- **버전**: 2.0 (리팩토링된 프론트엔드 기준)
- **프론트엔드 버전**: 시니어 수준 리팩토링 완료
- **백엔드 프레임워크**: Node.js + Express (또는 NestJS 권장)
- **데이터베이스**: PostgreSQL (또는 MySQL)

---

## 🎯 프로젝트 개요

### 목적
교회 카페 키오스크를 위한 RESTful API 백엔드 시스템 구축

### 핵심 기능
1. **키오스크 주문 시스템** (개인결제 / 셀별결제)
2. **바리스타 주문 관리** (대기 → 제조 → 완료)
3. **관리자 시스템** (메뉴, 셀, 통계, 정산)
4. **실시간 주문 동기화** (WebSocket 권장)

---

## 📊 데이터베이스 스키마

### 1. Users (사용자 - 관리자)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('SUPER', 'NORMAL')),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Cells (셀 정보)
```sql
CREATE TABLE cells (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  leader VARCHAR(100) NOT NULL,
  phone_last4 VARCHAR(4) NOT NULL UNIQUE, -- 휴대폰 뒷 4자리 (인증용)
  balance INTEGER DEFAULT 0, -- 포인트 잔액
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Categories (카테고리)
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL, -- 'COFFEE', 'NON_COFFEE', 'DESSERT', 'SEASONAL'
  name VARCHAR(100) NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Option_Groups (옵션 그룹)
```sql
CREATE TABLE option_groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL, -- '온도 선택', '사이즈 선택', '추가 옵션'
  icon VARCHAR(10), -- 이모지
  type VARCHAR(20) NOT NULL CHECK (type IN ('SINGLE', 'MULTIPLE')),
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Option_Items (옵션 항목)
```sql
CREATE TABLE option_items (
  id SERIAL PRIMARY KEY,
  option_group_id INTEGER REFERENCES option_groups(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- 'HOT', 'ICE', 'R (Regular)', '샷 추가'
  price INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 6. Menus (메뉴)
```sql
CREATE TABLE menus (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  eng_name VARCHAR(100),
  price INTEGER NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  description TEXT,
  image_url TEXT,
  is_sold_out BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 7. Menu_Option_Groups (메뉴-옵션그룹 연결)
```sql
CREATE TABLE menu_option_groups (
  id SERIAL PRIMARY KEY,
  menu_id INTEGER REFERENCES menus(id) ON DELETE CASCADE,
  option_group_id INTEGER REFERENCES option_groups(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  UNIQUE(menu_id, option_group_id)
);
```

### 8. Orders (주문)
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(100) UNIQUE NOT NULL, -- 'ORD-1234567890-abc123'
  daily_num INTEGER NOT NULL, -- 1-12 순환 번호
  pay_type VARCHAR(20) NOT NULL CHECK (pay_type IN ('PERSONAL', 'CELL')),
  cell_id INTEGER REFERENCES cells(id),
  total_amount INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'MAKING', 'COMPLETED', 'CANCELLED')),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_daily_num ON orders(daily_num);
```

### 9. Order_Items (주문 항목)
```sql
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  menu_id INTEGER REFERENCES menus(id),
  menu_name VARCHAR(100) NOT NULL, -- 스냅샷 (메뉴 삭제시에도 기록 유지)
  menu_price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  total_price INTEGER NOT NULL, -- (menu_price + options_price) * quantity
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 10. Order_Item_Options (주문 항목의 선택된 옵션)
```sql
CREATE TABLE order_item_options (
  id SERIAL PRIMARY KEY,
  order_item_id INTEGER REFERENCES order_items(id) ON DELETE CASCADE,
  option_group_name VARCHAR(100) NOT NULL,
  option_item_name VARCHAR(100) NOT NULL,
  option_item_price INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 11. Point_Transactions (셀 포인트 거래 내역)
```sql
CREATE TABLE point_transactions (
  id SERIAL PRIMARY KEY,
  cell_id INTEGER REFERENCES cells(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('CHARGE', 'USE', 'REFUND')),
  amount INTEGER NOT NULL, -- 양수: 충전/환불, 음수: 사용
  balance_after INTEGER NOT NULL, -- 거래 후 잔액
  order_id INTEGER REFERENCES orders(id), -- 사용/환불시 연결
  memo TEXT,
  created_by INTEGER REFERENCES users(id), -- 관리자 기록
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_point_transactions_cell_id ON point_transactions(cell_id);
CREATE INDEX idx_point_transactions_created_at ON point_transactions(created_at);
```

### 12. Daily_Settlements (일일 정산)
```sql
CREATE TABLE daily_settlements (
  id SERIAL PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  total_orders INTEGER DEFAULT 0,
  total_revenue INTEGER DEFAULT 0,
  personal_orders INTEGER DEFAULT 0,
  personal_revenue INTEGER DEFAULT 0,
  cell_orders INTEGER DEFAULT 0,
  cell_revenue INTEGER DEFAULT 0,
  is_confirmed BOOLEAN DEFAULT false,
  confirmed_by INTEGER REFERENCES users(id),
  confirmed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_daily_settlements_date ON daily_settlements(date);
```

### 13. System_Settings (시스템 설정)
```sql
CREATE TABLE system_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_by INTEGER REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 초기 데이터
INSERT INTO system_settings (key, value, description) VALUES
('next_order_number', '1', '다음 주문 번호 (1-12)'),
('bonus_rate', '10', '포인트 충전 보너스율 (%)'),
('is_kiosk_active', 'true', '키오스크 활성화 여부');
```

---

## 🏗️ 아키텍처

### 기술 스택
- **Backend**: Node.js + Express / NestJS
- **Database**: PostgreSQL / MySQL
- **Authentication**: JWT
- **Real-time**: WebSocket (Socket.io)
- **Caching**: Redis (선택 사항)

### API 구조
```
/api/v1
  ├── /auth (인증)
  ├── /menus (메뉴)
  ├── /categories (카테고리)
  ├── /option-groups (옵션)
  ├── /cells (셀)
  ├── /orders (주문)
  ├── /statistics (통계)
  ├── /settlements (정산)
  └── /settings (설정)
```

### 응답 형식
**성공 응답:**
```json
{
  "success": true,
  "data": { /* ... */ }
}
```

**에러 응답:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지"
  }
}
```

---

## 🔐 인증 & 권한

### JWT 토큰 기반 인증
- Access Token: 1시간 유효
- Refresh Token: 7일 유효 (선택 사항)

### 권한 레벨
1. **Public**: 메뉴 조회, 주문 생성, 셀 인증
2. **Admin (NORMAL)**: 주문 관리, 메뉴 품절, 통계 조회
3. **Admin (SUPER)**: 모든 기능 + 메뉴/셀 삭제, 정산 확정

---

## 📦 다음 문서

- [인증 API](./01-auth-api.md)
- [메뉴 API](./02-menu-api.md)
- [카테고리 API](./03-category-api.md)
- [옵션 API](./04-option-api.md)
- [셀 API](./05-cell-api.md)
- [주문 API](./06-order-api.md)
- [통계 API](./07-statistics-api.md)
- [정산 API](./08-settlement-api.md)
- [설정 API](./09-settings-api.md)
- [WebSocket](./10-websocket.md)
- [프론트엔드 매핑](./11-frontend-mapping.md)
