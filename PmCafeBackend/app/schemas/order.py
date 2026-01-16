"""
Order API schemas
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class OrderItemOptionItem(BaseModel):
    """Order item option item schema"""
    name: str
    price: int


class OrderItemOptionGroup(BaseModel):
    """Order item option group schema"""
    groupName: str
    items: List[OrderItemOptionItem]


class OrderItemRequest(BaseModel):
    """Order item request schema"""
    menuId: int
    menuName: str
    menuPrice: int
    quantity: int = Field(..., gt=0)
    selectedOptions: List[OrderItemOptionGroup] = []


class CreateOrderRequest(BaseModel):
    """Create order request schema"""
    payType: str = Field(..., pattern="^(PERSONAL|CELL)$")
    cellId: Optional[int] = None
    items: List[OrderItemRequest] = Field(..., min_length=1)
    totalAmount: int = Field(..., gt=0)


class CellInfoResponse(BaseModel):
    """Cell info response schema"""
    id: int
    name: str
    balance: Optional[int] = None


class OrderItemResponse(BaseModel):
    """Order item response schema"""
    menuName: str
    menuPrice: int
    quantity: int
    selectedOptions: List[OrderItemOptionGroup]
    totalPrice: int


class OrderResponse(BaseModel):
    """Order response schema"""
    orderId: str
    dailyNum: int
    payType: str
    cellInfo: Optional[CellInfoResponse] = None
    items: List[OrderItemResponse]
    totalAmount: int
    status: str
    createdAt: datetime
    completedAt: Optional[datetime] = None


class OrderStatusUpdateRequest(BaseModel):
    """Order status update request schema"""
    status: str = Field(..., pattern="^(PENDING|MAKING|COMPLETED|CANCELLED)$")
