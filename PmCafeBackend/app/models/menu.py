from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class Category(Base):
    """카테고리 모델"""
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)  # 'COFFEE', 'NON_COFFEE', etc.
    name = Column(String(100), nullable=False)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 관계
    menus = relationship("Menu", back_populates="category")

    def __repr__(self):
        return f"<Category(id={self.id}, code='{self.code}', name='{self.name}')>"


class OptionType(str, enum.Enum):
    """옵션 타입"""
    SINGLE = "SINGLE"      # 단일 선택
    MULTIPLE = "MULTIPLE"  # 다중 선택


class OptionGroup(Base):
    """옵션 그룹 모델"""
    __tablename__ = "option_groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)  # '온도 선택', '사이즈 선택'
    icon = Column(String(10), nullable=True)     # 이모지
    type = Column(Enum(OptionType), nullable=False)
    is_required = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 관계
    items = relationship("OptionItem", back_populates="group", cascade="all, delete-orphan")
    menu_associations = relationship("MenuOptionGroup", back_populates="option_group")

    def __repr__(self):
        return f"<OptionGroup(id={self.id}, name='{self.name}', type='{self.type}')>"


class OptionItem(Base):
    """옵션 항목 모델"""
    __tablename__ = "option_items"

    id = Column(Integer, primary_key=True, index=True)
    option_group_id = Column(Integer, ForeignKey("option_groups.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)  # 'HOT', 'ICE', '샷 추가'
    price = Column(Integer, default=0)
    is_default = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 관계
    group = relationship("OptionGroup", back_populates="items")

    def __repr__(self):
        return f"<OptionItem(id={self.id}, name='{self.name}', price={self.price})>"


class Menu(Base):
    """메뉴 모델"""
    __tablename__ = "menus"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    eng_name = Column(String(100), nullable=True)
    price = Column(Integer, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    description = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    is_sold_out = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 관계
    category = relationship("Category", back_populates="menus")
    option_groups = relationship("MenuOptionGroup", back_populates="menu", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Menu(id={self.id}, name='{self.name}', price={self.price})>"


class MenuOptionGroup(Base):
    """메뉴-옵션그룹 연결 테이블"""
    __tablename__ = "menu_option_groups"
    __table_args__ = (
        UniqueConstraint('menu_id', 'option_group_id', name='uq_menu_option'),
    )

    id = Column(Integer, primary_key=True, index=True)
    menu_id = Column(Integer, ForeignKey("menus.id", ondelete="CASCADE"), nullable=False)
    option_group_id = Column(Integer, ForeignKey("option_groups.id", ondelete="CASCADE"), nullable=False)
    display_order = Column(Integer, default=0)

    # 관계
    menu = relationship("Menu", back_populates="option_groups")
    option_group = relationship("OptionGroup", back_populates="menu_associations")

    def __repr__(self):
        return f"<MenuOptionGroup(menu_id={self.menu_id}, option_group_id={self.option_group_id})>"
