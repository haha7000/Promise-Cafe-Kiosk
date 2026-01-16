"""
Cell API schemas
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class CellAuthRequest(BaseModel):
    """Cell authentication request schema"""
    phoneLast4: str = Field(..., min_length=4, max_length=4, pattern="^[0-9]{4}$")


class CellAuthResponse(BaseModel):
    """Cell authentication response schema"""
    id: int
    name: str
    leader: str
    balance: int

    class Config:
        from_attributes = True


class CellResponse(BaseModel):
    """Cell response schema"""
    id: int
    name: str
    leader: str
    phoneLast4: str
    balance: int
    isActive: bool
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True


class CellCreateRequest(BaseModel):
    """Cell creation request schema"""
    name: str = Field(..., min_length=1, max_length=100)
    leader: str = Field(..., min_length=1, max_length=100)
    phoneLast4: str = Field(..., min_length=4, max_length=4, pattern="^[0-9]{4}$")


class CellUpdateRequest(BaseModel):
    """Cell update request schema"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    leader: Optional[str] = Field(None, min_length=1, max_length=100)
    phoneLast4: Optional[str] = Field(None, min_length=4, max_length=4, pattern="^[0-9]{4}$")


class CellChargeRequest(BaseModel):
    """Cell charge request schema"""
    amount: int = Field(..., gt=0)
    bonusRate: int = Field(..., ge=0, le=100)
    memo: Optional[str] = None


class TransactionCreatorResponse(BaseModel):
    """Transaction creator response schema"""
    id: int
    name: str

    class Config:
        from_attributes = True


class TransactionOrderResponse(BaseModel):
    """Transaction order response schema"""
    orderId: str
    dailyNum: int


class TransactionResponse(BaseModel):
    """Transaction response schema"""
    id: int
    type: str
    amount: int
    balanceAfter: int
    memo: Optional[str] = None
    createdBy: Optional[TransactionCreatorResponse] = None
    order: Optional[TransactionOrderResponse] = None
    createdAt: datetime

    class Config:
        from_attributes = True
