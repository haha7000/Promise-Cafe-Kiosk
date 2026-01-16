"""
Menu API schemas
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class CategoryResponse(BaseModel):
    """Category response schema"""
    id: int
    code: str
    name: str

    class Config:
        from_attributes = True


class OptionItemResponse(BaseModel):
    """Option item response schema"""
    id: int
    name: str
    price: int
    is_default: bool

    class Config:
        from_attributes = True


class OptionGroupResponse(BaseModel):
    """Option group response schema"""
    id: int
    name: str
    icon: Optional[str] = None
    type: str
    is_required: bool
    items: List[OptionItemResponse] = []

    class Config:
        from_attributes = True


class MenuListResponse(BaseModel):
    """Menu list item response schema"""
    id: int
    name: str
    eng_name: Optional[str] = None
    price: int
    category: CategoryResponse
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_sold_out: bool
    is_active: bool
    display_order: int

    class Config:
        from_attributes = True


class MenuDetailResponse(BaseModel):
    """Menu detail response schema with option groups"""
    id: int
    name: str
    eng_name: Optional[str] = None
    price: int
    category: CategoryResponse
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_sold_out: bool
    is_active: bool
    display_order: int
    option_groups: List[OptionGroupResponse] = []

    class Config:
        from_attributes = True


class MenuCreateRequest(BaseModel):
    """Menu creation request schema"""
    name: str = Field(..., min_length=1, max_length=100)
    eng_name: Optional[str] = Field(None, max_length=100)
    price: int = Field(..., ge=0)
    category_id: int
    description: Optional[str] = None
    image_url: Optional[str] = None
    option_group_ids: List[int] = []
    display_order: Optional[int] = None


class MenuUpdateRequest(BaseModel):
    """Menu update request schema"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    eng_name: Optional[str] = Field(None, max_length=100)
    price: Optional[int] = Field(None, ge=0)
    category_id: Optional[int] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    option_group_ids: Optional[List[int]] = None
    display_order: Optional[int] = None


class MenuSoldOutRequest(BaseModel):
    """Menu sold out toggle request schema"""
    is_sold_out: bool


class CategoryCreateRequest(BaseModel):
    """Category creation request schema"""
    code: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=100)
    display_order: Optional[int] = None


class CategoryUpdateRequest(BaseModel):
    """Category update request schema"""
    code: Optional[str] = Field(None, min_length=1, max_length=50)
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    display_order: Optional[int] = None


class CategoryActiveRequest(BaseModel):
    """Category active toggle request schema"""
    is_active: bool


class OptionGroupCreateRequest(BaseModel):
    """Option group creation request schema"""
    name: str = Field(..., min_length=1, max_length=100)
    icon: Optional[str] = Field(None, max_length=10)
    type: str = Field(..., pattern="^(SINGLE|MULTIPLE)$")
    is_required: bool = False
    display_order: Optional[int] = None


class OptionGroupUpdateRequest(BaseModel):
    """Option group update request schema"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    icon: Optional[str] = Field(None, max_length=10)
    type: Optional[str] = Field(None, pattern="^(SINGLE|MULTIPLE)$")
    is_required: Optional[bool] = None
    display_order: Optional[int] = None


class OptionItemCreateRequest(BaseModel):
    """Option item creation request schema"""
    name: str = Field(..., min_length=1, max_length=100)
    price: int = Field(..., ge=0)
    is_default: bool = False
    display_order: Optional[int] = None


class OptionItemUpdateRequest(BaseModel):
    """Option item update request schema"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[int] = Field(None, ge=0)
    is_default: Optional[bool] = None
    display_order: Optional[int] = None
