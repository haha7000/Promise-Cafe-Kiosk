# 🚀 P.M CAFE Backend API

교회 카페 키오스크를 위한 FastAPI 기반 백엔드 서버

## 📚 기술 스택

- **Framework**: FastAPI 0.128.0
- **Language**: Python 3.14
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy 2.0
- **Migration**: Alembic
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt (passlib)

## 🛠️ 개발 환경 설정

### 1. 가상환경 활성화

```bash
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows
```

### 2. 패키지 설치 (이미 설치됨)

```bash
pip install -r requirements.txt
```

### 3. 데이터베이스 설정

PostgreSQL 설치 후:

```sql
CREATE DATABASE pmcafe;
CREATE USER pmcafe_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE pmcafe TO pmcafe_user;
```

### 4. 환경변수 설정

**중요**: `.env` 파일을 생성하고 설정해야 합니다.

```bash
# .env.example을 복사하여 .env 파일 생성
cp .env.example .env
```

`.env` 파일에서 다음 항목을 **반드시** 수정하세요:

1. **DATABASE_URL**: PostgreSQL 접속 정보
2. **SECRET_KEY**: JWT 토큰 서명용 비밀 키 (보안 중요!)

```bash
# SECRET_KEY 생성 (강력한 랜덤 키)
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

`.env` 예시:
```env
DATABASE_URL=postgresql://pmcafe_user:your_password@localhost/pmcafe
SECRET_KEY=xkLsDuuz3Kph9REBbfWWeU4bIBsyb6kGW_QsfWg9Viw  # 생성된 키로 교체
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

**⚠️ 보안 주의사항**:
- `.env` 파일은 절대 Git에 커밋하지 마세요 (`.gitignore`에 포함됨)
- `SECRET_KEY`는 프로덕션과 개발 환경에서 다른 값을 사용하세요
- `SECRET_KEY`가 노출되면 JWT 토큰 위조가 가능하므로 즉시 교체하세요

### 5. 서버 실행

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

서버 실행 후 접속:
- **API 서버**: http://localhost:8000
- **Swagger 문서**: http://localhost:8000/docs
- **ReDoc 문서**: http://localhost:8000/redoc

## 📁 프로젝트 구조

```
PmCafeBackend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 앱 초기화
│   ├── database.py          # DB 연결 설정
│   ├── models/              # SQLAlchemy 모델
│   │   └── __init__.py
│   ├── schemas/             # Pydantic 스키마
│   │   └── __init__.py
│   ├── routers/             # API 라우터
│   │   └── __init__.py
│   ├── services/            # 비즈니스 로직
│   │   └── __init__.py
│   ├── utils/               # 유틸리티
│   │   └── __init__.py
│   └── core/                # 설정
│       ├── __init__.py
│       └── config.py
├── migrations/              # Alembic 마이그레이션
├── tests/                   # 테스트
├── scripts/                 # 유틸리티 스크립트
├── venv/                    # 가상환경
├── .env                     # 환경변수
├── .gitignore
├── requirements.txt
└── README.md
```

## 🔥 다음 단계

1. **데이터베이스 모델 생성**
   - `app/models/user.py` - Users 테이블
   - `app/models/cell.py` - Cells 테이블
   - `app/models/menu.py` - Menus, Categories, Options 테이블
   - `app/models/order.py` - Orders 테이블

2. **Alembic 마이그레이션 설정**
   ```bash
   alembic init migrations
   alembic revision --autogenerate -m "initial tables"
   alembic upgrade head
   ```

3. **API 라우터 구현**
   - `app/routers/auth.py` - 인증 API
   - `app/routers/menus.py` - 메뉴 API
   - `app/routers/orders.py` - 주문 API
   - `app/routers/cells.py` - 셀 API

4. **체크리스트 확인**
   - 📋 [개발 체크리스트](../docs/backend/DEVELOPMENT_CHECKLIST.md) 참고

## 📖 API 문서

- [프로젝트 개요](../docs/backend/00-overview.md)
- [인증 API](../docs/backend/01-auth-api.md)
- [메뉴 API](../docs/backend/02-menu-api.md)
- [주문 API](../docs/backend/06-order-api.md)
- [전체 문서](../docs/backend/README.md)

## 🧪 테스트

```bash
pytest
```

## 📝 라이선스

MIT
