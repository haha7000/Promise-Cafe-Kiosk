"""
초기 데이터 삽입 스크립트

Usage:
    python scripts/init_data.py
"""

import sys
import os

# 프로젝트 루트를 Python 경로에 추가
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
import bcrypt
from app.database import SessionLocal
from app.models import (
    User, UserRole, Category, OptionGroup, OptionItem,
    OptionType, SystemSetting
)


def init_admin_user(db: Session):
    """관리자 계정 생성"""
    print("Creating admin user...")

    # 이미 존재하는지 확인
    existing_admin = db.query(User).filter(User.username == "admin").first()
    if existing_admin:
        print("  ⚠️  Admin user already exists, skipping...")
        return

    # bcrypt로 비밀번호 해싱
    password = "admin123"
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    admin = User(
        username="admin",
        password_hash=password_hash,  # 초기 비밀번호: admin123
        name="관리자",
        role=UserRole.SUPER
    )
    db.add(admin)
    db.commit()
    print("  ✅ Admin user created (username: admin, password: admin123)")


def init_categories(db: Session):
    """카테고리 초기 데이터"""
    print("Creating categories...")

    categories_data = [
        {"code": "COFFEE", "name": "커피", "display_order": 1},
        {"code": "NON_COFFEE", "name": "논커피", "display_order": 2},
        {"code": "DESSERT", "name": "디저트", "display_order": 3},
        {"code": "SEASONAL", "name": "시즌메뉴", "display_order": 4},
    ]

    for cat_data in categories_data:
        existing = db.query(Category).filter(Category.code == cat_data["code"]).first()
        if existing:
            print(f"  ⚠️  Category '{cat_data['name']}' already exists, skipping...")
            continue

        category = Category(**cat_data)
        db.add(category)
        print(f"  ✅ Created category: {cat_data['name']}")

    db.commit()


def init_option_groups(db: Session):
    """옵션 그룹 및 항목 초기 데이터"""
    print("Creating option groups and items...")

    # 1. 온도 선택
    temp_group = db.query(OptionGroup).filter(OptionGroup.name == "온도 선택").first()
    if not temp_group:
        temp_group = OptionGroup(
            name="온도 선택",
            icon="🌡️",
            type=OptionType.SINGLE,
            is_required=True,
            display_order=1
        )
        db.add(temp_group)
        db.flush()  # ID 생성을 위해 flush

        # 온도 옵션 항목
        temp_items = [
            {"name": "HOT", "price": 0, "is_default": True, "display_order": 1},
            {"name": "ICE", "price": 0, "is_default": False, "display_order": 2},
        ]
        for item_data in temp_items:
            item = OptionItem(option_group_id=temp_group.id, **item_data)
            db.add(item)

        print("  ✅ Created option group: 온도 선택")
    else:
        print("  ⚠️  Option group '온도 선택' already exists, skipping...")

    # 2. 사이즈 선택
    size_group = db.query(OptionGroup).filter(OptionGroup.name == "사이즈 선택").first()
    if not size_group:
        size_group = OptionGroup(
            name="사이즈 선택",
            icon="📏",
            type=OptionType.SINGLE,
            is_required=True,
            display_order=2
        )
        db.add(size_group)
        db.flush()

        # 사이즈 옵션 항목
        size_items = [
            {"name": "R (Regular)", "price": 0, "is_default": True, "display_order": 1},
            {"name": "L (Large)", "price": 500, "is_default": False, "display_order": 2},
        ]
        for item_data in size_items:
            item = OptionItem(option_group_id=size_group.id, **item_data)
            db.add(item)

        print("  ✅ Created option group: 사이즈 선택")
    else:
        print("  ⚠️  Option group '사이즈 선택' already exists, skipping...")

    # 3. 추가 옵션
    extra_group = db.query(OptionGroup).filter(OptionGroup.name == "추가 옵션").first()
    if not extra_group:
        extra_group = OptionGroup(
            name="추가 옵션",
            icon="➕",
            type=OptionType.MULTIPLE,
            is_required=False,
            display_order=3
        )
        db.add(extra_group)
        db.flush()

        # 추가 옵션 항목
        extra_items = [
            {"name": "샷 추가", "price": 500, "is_default": False, "display_order": 1},
            {"name": "시럽 추가", "price": 500, "is_default": False, "display_order": 2},
            {"name": "휘핑크림 추가", "price": 500, "is_default": False, "display_order": 3},
        ]
        for item_data in extra_items:
            item = OptionItem(option_group_id=extra_group.id, **item_data)
            db.add(item)

        print("  ✅ Created option group: 추가 옵션")
    else:
        print("  ⚠️  Option group '추가 옵션' already exists, skipping...")

    db.commit()


def init_system_settings(db: Session):
    """시스템 설정 초기 데이터"""
    print("Creating system settings...")

    settings_data = [
        {"key": "next_order_number", "value": "1", "description": "다음 주문 번호 (1-12)"},
        {"key": "bonus_rate", "value": "10", "description": "포인트 충전 보너스율 (%)"},
        {"key": "is_kiosk_active", "value": "true", "description": "키오스크 활성화 여부"},
    ]

    for setting_data in settings_data:
        existing = db.query(SystemSetting).filter(SystemSetting.key == setting_data["key"]).first()
        if existing:
            print(f"  ⚠️  Setting '{setting_data['key']}' already exists, skipping...")
            continue

        setting = SystemSetting(**setting_data)
        db.add(setting)
        print(f"  ✅ Created setting: {setting_data['key']}")

    db.commit()


def main():
    """메인 함수"""
    print("\n" + "="*60)
    print("P.M CAFE - 초기 데이터 삽입 스크립트")
    print("="*60 + "\n")

    db = SessionLocal()
    try:
        init_admin_user(db)
        init_categories(db)
        init_option_groups(db)
        init_system_settings(db)

        print("\n" + "="*60)
        print("✅ 초기 데이터 삽입 완료!")
        print("="*60)
        print("\n📝 초기 관리자 계정:")
        print("   Username: admin")
        print("   Password: admin123")
        print("\n⚠️  보안을 위해 로그인 후 비밀번호를 변경하세요!\n")

    except Exception as e:
        print(f"\n❌ 오류 발생: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
