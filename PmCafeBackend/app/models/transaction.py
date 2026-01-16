from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Index
from sqlalchemy.sql import func
from app.database import Base
import enum


class TransactionType(str, enum.Enum):
    """거래 타입"""
    CHARGE = "CHARGE"  # 충전
    USE = "USE"        # 사용
    REFUND = "REFUND"  # 환불


class PointTransaction(Base):
    """셀 포인트 거래 내역"""
    __tablename__ = "point_transactions"
    __table_args__ = (
        Index('idx_point_transactions_cell_id', 'cell_id'),
        Index('idx_point_transactions_created_at', 'created_at'),
    )

    id = Column(Integer, primary_key=True, index=True)
    cell_id = Column(Integer, ForeignKey("cells.id"), nullable=False)
    type = Column(Enum(TransactionType), nullable=False)
    amount = Column(Integer, nullable=False)  # 양수: 충전/환불, 음수: 사용
    balance_after = Column(Integer, nullable=False)  # 거래 후 잔액
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)  # 사용/환불시 연결
    memo = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # 관리자 기록
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<PointTransaction(id={self.id}, type='{self.type}', amount={self.amount}, balance_after={self.balance_after})>"
