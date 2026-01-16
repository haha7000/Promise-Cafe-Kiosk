from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class PayType(str, enum.Enum):
    """결제 타입"""
    PERSONAL = "PERSONAL"  # 개인 결제
    CELL = "CELL"          # 셀 결제


class OrderStatus(str, enum.Enum):
    """주문 상태"""
    PENDING = "PENDING"      # 대기
    MAKING = "MAKING"        # 제조 중
    COMPLETED = "COMPLETED"  # 완료
    CANCELLED = "CANCELLED"  # 취소


class Order(Base):
    """주문 모델"""
    __tablename__ = "orders"
    __table_args__ = (
        Index('idx_orders_status', 'status'),
        Index('idx_orders_created_at', 'created_at'),
        Index('idx_orders_daily_num', 'daily_num'),
    )

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(100), unique=True, nullable=False, index=True)  # 'ORD-1234567890-abc123'
    daily_num = Column(Integer, nullable=False)  # 1-12 순환 번호
    pay_type = Column(Enum(PayType), nullable=False)
    cell_id = Column(Integer, ForeignKey("cells.id"), nullable=True)
    total_amount = Column(Integer, nullable=False)
    status = Column(Enum(OrderStatus), nullable=False, default=OrderStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)

    # 관계
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Order(id={self.id}, order_id='{self.order_id}', daily_num={self.daily_num}, status='{self.status}')>"


class OrderItem(Base):
    """주문 항목 모델"""
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    menu_id = Column(Integer, ForeignKey("menus.id"), nullable=True)
    menu_name = Column(String(100), nullable=False)  # 스냅샷 (메뉴 삭제시에도 유지)
    menu_price = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)
    total_price = Column(Integer, nullable=False)  # (menu_price + options_price) * quantity
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 관계
    order = relationship("Order", back_populates="items")
    options = relationship("OrderItemOption", back_populates="order_item", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<OrderItem(id={self.id}, menu_name='{self.menu_name}', quantity={self.quantity})>"


class OrderItemOption(Base):
    """주문 항목의 선택된 옵션"""
    __tablename__ = "order_item_options"

    id = Column(Integer, primary_key=True, index=True)
    order_item_id = Column(Integer, ForeignKey("order_items.id", ondelete="CASCADE"), nullable=False)
    option_group_name = Column(String(100), nullable=False)
    option_item_name = Column(String(100), nullable=False)
    option_item_price = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 관계
    order_item = relationship("OrderItem", back_populates="options")

    def __repr__(self):
        return f"<OrderItemOption(group='{self.option_group_name}', item='{self.option_item_name}')>"
