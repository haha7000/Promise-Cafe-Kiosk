"""
pytest configuration and fixtures
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models import *  # Import all models

# Test database (in-memory SQLite)
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with overridden database"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_admin_user(db_session):
    """Create a sample admin user"""
    import bcrypt
    from app.models.user import User, UserRole

    password_hash = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    admin = User(
        username="admin",
        password_hash=password_hash,
        name="관리자",
        role=UserRole.SUPER
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin


@pytest.fixture
def sample_categories(db_session):
    """Create sample categories"""
    from app.models.menu import Category

    categories = [
        Category(code="COFFEE", name="커피", display_order=1),
        Category(code="NON_COFFEE", name="논커피", display_order=2),
        Category(code="DESSERT", name="디저트", display_order=3),
        Category(code="SEASONAL", name="시즌메뉴", display_order=4),
    ]
    db_session.add_all(categories)
    db_session.commit()
    for cat in categories:
        db_session.refresh(cat)
    return categories


@pytest.fixture
def sample_option_groups(db_session):
    """Create sample option groups with items"""
    from app.models.menu import OptionGroup, OptionItem, OptionType

    # 온도 선택
    temp_group = OptionGroup(
        name="온도 선택",
        icon="🌡️",
        type=OptionType.SINGLE,
        is_required=True,
        display_order=1
    )
    db_session.add(temp_group)
    db_session.commit()
    db_session.refresh(temp_group)

    temp_items = [
        OptionItem(option_group_id=temp_group.id, name="HOT", price=0, is_default=True, display_order=1),
        OptionItem(option_group_id=temp_group.id, name="ICE", price=0, is_default=False, display_order=2),
    ]
    db_session.add_all(temp_items)
    db_session.commit()

    return [temp_group]


@pytest.fixture
def sample_cell(db_session):
    """Create a sample cell"""
    from app.models.cell import Cell

    cell = Cell(
        name="청년부",
        leader="김셀장",
        phone_last4="1234",
        balance=10000
    )
    db_session.add(cell)
    db_session.commit()
    db_session.refresh(cell)
    return cell
