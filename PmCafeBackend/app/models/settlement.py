from sqlalchemy import Column, Integer, String, Date, Boolean, Text, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from app.database import Base


class DailySettlement(Base):
    """일일 정산 모델"""
    __tablename__ = "daily_settlements"
    __table_args__ = (
        Index('idx_daily_settlements_date', 'date'),
    )

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, unique=True, nullable=False, index=True)
    total_orders = Column(Integer, default=0)
    total_revenue = Column(Integer, default=0)
    personal_orders = Column(Integer, default=0)
    personal_revenue = Column(Integer, default=0)
    cell_orders = Column(Integer, default=0)
    cell_revenue = Column(Integer, default=0)
    is_confirmed = Column(Boolean, default=False)
    confirmed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    confirmed_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<DailySettlement(date={self.date}, total_revenue={self.total_revenue}, is_confirmed={self.is_confirmed})>"


class SystemSetting(Base):
    """시스템 설정 모델"""
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<SystemSetting(key='{self.key}', value='{self.value}')>"
