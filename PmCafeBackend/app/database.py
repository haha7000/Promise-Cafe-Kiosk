from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# .env 파일 로드
load_dotenv()

# 데이터베이스 URL (환경변수에서 읽기)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://pmcafe_user:password@localhost/pmcafe"
)

# SQLAlchemy 엔진 생성
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # 연결 유효성 검사
    echo=True,  # SQL 로그 출력 (개발용)
)

# 세션 로컬
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base 클래스 (모든 모델의 부모 클래스)
Base = declarative_base()


# DB 세션 의존성 (FastAPI Depends에서 사용)
def get_db():
    """
    데이터베이스 세션을 생성하고 요청이 끝나면 닫습니다.

    Usage:
        @app.get("/users")
        def get_users(db: Session = Depends(get_db)):
            return db.query(User).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
