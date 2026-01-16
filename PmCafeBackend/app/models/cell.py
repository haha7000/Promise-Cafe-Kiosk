from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Cell(Base):
    """셀 정보 모델"""
    __tablename__ = "cells"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    leader = Column(String(100), nullable=False)
    phone_last4 = Column(String(4), unique=True, nullable=False, index=True)  # 휴대폰 뒷 4자리
    balance = Column(Integer, default=0)  # 포인트 잔액
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Cell(id={self.id}, name='{self.name}', balance={self.balance})>"
