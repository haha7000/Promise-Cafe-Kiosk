"""
Category API routes
Based on docs/backend/03-category-api.md
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.menu import Category, Menu
from app.models.user import User
from app.schemas.menu import (
    CategoryResponse, CategoryCreateRequest,
    CategoryUpdateRequest, CategoryActiveRequest
)
from app.dependencies.auth import get_current_user, get_current_super_user

router = APIRouter(prefix="/api/v1/categories", tags=["Categories"])


@router.get("", response_model=dict)
def get_categories(
    includeInactive: bool = Query(False, description="Include inactive categories"),
    db: Session = Depends(get_db)
):
    """
    카테고리 목록 조회 (Public)

    - **includeInactive**: 비활성 카테고리 포함 여부 (기본: false)
    """
    query = db.query(Category)

    # Filter active categories only (unless includeInactive is True)
    if not includeInactive:
        query = query.filter(Category.is_active == True)

    # Order by display_order
    categories = query.order_by(Category.display_order).all()

    # Convert to response schema
    category_list = []
    for category in categories:
        cat_data = {
            "id": category.id,
            "code": category.code,
            "name": category.name,
            "displayOrder": category.display_order,
            "isActive": category.is_active
        }
        category_list.append(cat_data)

    return {
        "success": True,
        "data": category_list
    }


@router.post("", response_model=dict)
def create_category(
    category_data: CategoryCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    카테고리 생성 (관리자)
    """
    # Check for duplicate code
    existing = db.query(Category).filter(Category.code == category_data.code).first()
    if existing:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={
                "success": False,
                "error": {
                    "code": "DUPLICATE_CATEGORY_CODE",
                    "message": "이미 존재하는 카테고리 코드입니다"
                }
            }
        )

    # Create category
    new_category = Category(
        code=category_data.code,
        name=category_data.name,
        display_order=category_data.display_order if category_data.display_order is not None else 0,
        is_active=True
    )

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return {
        "success": True,
        "data": {
            "id": new_category.id,
            "code": new_category.code,
            "name": new_category.name
        }
    }


@router.put("/{category_id}", response_model=dict)
def update_category(
    category_id: int,
    category_data: CategoryUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    카테고리 수정 (관리자)
    """
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "success": False,
                "error": {
                    "code": "CATEGORY_NOT_FOUND",
                    "message": "카테고리를 찾을 수 없습니다"
                }
            }
        )

    # Update fields if provided
    if category_data.code is not None:
        # Check for duplicate code (excluding current category)
        existing = db.query(Category).filter(
            Category.code == category_data.code,
            Category.id != category_id
        ).first()
        if existing:
            return JSONResponse(
                status_code=status.HTTP_409_CONFLICT,
                content={
                    "success": False,
                    "error": {
                        "code": "DUPLICATE_CATEGORY_CODE",
                        "message": "이미 존재하는 카테고리 코드입니다"
                    }
                }
            )
        category.code = category_data.code

    if category_data.name is not None:
        category.name = category_data.name

    if category_data.display_order is not None:
        category.display_order = category_data.display_order

    db.commit()
    db.refresh(category)

    return {
        "success": True,
        "data": {
            "id": category.id,
            "code": category.code,
            "name": category.name
        }
    }


@router.patch("/{category_id}/active", response_model=dict)
def toggle_category_active(
    category_id: int,
    active_data: CategoryActiveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    카테고리 활성화/비활성화 (관리자)
    """
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "success": False,
                "error": {
                    "code": "CATEGORY_NOT_FOUND",
                    "message": "카테고리를 찾을 수 없습니다"
                }
            }
        )

    category.is_active = active_data.is_active
    db.commit()

    return {
        "success": True,
        "data": {
            "id": category.id,
            "code": category.code,
            "isActive": category.is_active
        }
    }


@router.delete("/{category_id}", response_model=dict)
def delete_category(
    category_id: int,
    current_user: User = Depends(get_current_super_user),
    db: Session = Depends(get_db)
):
    """
    카테고리 삭제 (SUPER 관리자만)
    """
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "success": False,
                "error": {
                    "code": "CATEGORY_NOT_FOUND",
                    "message": "카테고리를 찾을 수 없습니다"
                }
            }
        )

    # Check if category has menus
    menu_count = db.query(Menu).filter(Menu.category_id == category_id).count()
    if menu_count > 0:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={
                "success": False,
                "error": {
                    "code": "CATEGORY_HAS_MENUS",
                    "message": f"이 카테고리에 {menu_count}개의 메뉴가 있습니다. 먼저 메뉴를 삭제하거나 다른 카테고리로 이동해주세요."
                }
            }
        )

    # Delete category
    db.delete(category)
    db.commit()

    return {
        "success": True,
        "data": {
            "id": category_id,
            "message": "카테고리가 삭제되었습니다"
        }
    }
