"""
Option API routes
Based on docs/backend/04-option-api.md
"""
from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.menu import OptionGroup, OptionItem, OptionType, MenuOptionGroup
from app.models.user import User
from app.schemas.menu import (
    OptionGroupCreateRequest, OptionGroupUpdateRequest,
    OptionItemCreateRequest, OptionItemUpdateRequest
)
from app.dependencies.auth import get_current_user, get_current_super_user

router = APIRouter(prefix="/api/v1/option-groups", tags=["Options"])


@router.get("", response_model=dict)
def get_option_groups(
    includeItems: bool = Query(True, description="Include option items"),
    db: Session = Depends(get_db)
):
    """
    옵션 그룹 목록 조회 (Public)

    - **includeItems**: 옵션 항목 포함 여부 (기본: true)
    """
    query = db.query(OptionGroup)

    # Include items if requested
    if includeItems:
        query = query.options(joinedload(OptionGroup.items))

    # Order by display_order
    option_groups = query.order_by(OptionGroup.display_order).all()

    # Convert to response
    result = []
    for group in option_groups:
        group_data = {
            "id": group.id,
            "name": group.name,
            "icon": group.icon,
            "type": group.type.value,
            "isRequired": group.is_required,
            "displayOrder": group.display_order
        }

        if includeItems:
            items = []
            for item in sorted(group.items, key=lambda x: x.display_order):
                items.append({
                    "id": item.id,
                    "name": item.name,
                    "price": item.price,
                    "isDefault": item.is_default,
                    "displayOrder": item.display_order
                })
            group_data["items"] = items

        result.append(group_data)

    return {
        "success": True,
        "data": result
    }


@router.post("", response_model=dict)
def create_option_group(
    group_data: OptionGroupCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    옵션 그룹 생성 (관리자)
    """
    # Create option group
    new_group = OptionGroup(
        name=group_data.name,
        icon=group_data.icon,
        type=OptionType[group_data.type],
        is_required=group_data.is_required,
        display_order=group_data.display_order if group_data.display_order is not None else 0
    )

    db.add(new_group)
    db.commit()
    db.refresh(new_group)

    return {
        "success": True,
        "data": {
            "id": new_group.id,
            "name": new_group.name,
            "type": new_group.type.value
        }
    }


@router.put("/{group_id}", response_model=dict)
def update_option_group(
    group_id: int,
    group_data: OptionGroupUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    옵션 그룹 수정 (관리자)
    """
    group = db.query(OptionGroup).filter(OptionGroup.id == group_id).first()
    if not group:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "success": False,
                "error": {
                    "code": "OPTION_GROUP_NOT_FOUND",
                    "message": "옵션 그룹을 찾을 수 없습니다"
                }
            }
        )

    # Update fields if provided
    if group_data.name is not None:
        group.name = group_data.name

    if group_data.icon is not None:
        group.icon = group_data.icon

    if group_data.type is not None:
        group.type = OptionType[group_data.type]

    if group_data.is_required is not None:
        group.is_required = group_data.is_required

    if group_data.display_order is not None:
        group.display_order = group_data.display_order

    db.commit()
    db.refresh(group)

    return {
        "success": True,
        "data": {
            "id": group.id,
            "name": group.name,
            "type": group.type.value
        }
    }


@router.delete("/{group_id}", response_model=dict)
def delete_option_group(
    group_id: int,
    current_user: User = Depends(get_current_super_user),
    db: Session = Depends(get_db)
):
    """
    옵션 그룹 삭제 (SUPER 관리자만)
    """
    group = db.query(OptionGroup).filter(OptionGroup.id == group_id).first()
    if not group:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "success": False,
                "error": {
                    "code": "OPTION_GROUP_NOT_FOUND",
                    "message": "옵션 그룹을 찾을 수 없습니다"
                }
            }
        )

    # Check if option group is used by any menu
    menu_count = db.query(MenuOptionGroup).filter(MenuOptionGroup.option_group_id == group_id).count()
    if menu_count > 0:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={
                "success": False,
                "error": {
                    "code": "OPTION_GROUP_IN_USE",
                    "message": f"이 옵션 그룹은 {menu_count}개의 메뉴에서 사용 중입니다"
                }
            }
        )

    # Delete option group (CASCADE will delete option items)
    db.delete(group)
    db.commit()

    return {
        "success": True,
        "data": {
            "id": group_id,
            "message": "옵션 그룹이 삭제되었습니다"
        }
    }


@router.post("/{group_id}/items", response_model=dict)
def create_option_item(
    group_id: int,
    item_data: OptionItemCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    옵션 항목 추가 (관리자)
    """
    # Check if group exists
    group = db.query(OptionGroup).filter(OptionGroup.id == group_id).first()
    if not group:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "success": False,
                "error": {
                    "code": "OPTION_GROUP_NOT_FOUND",
                    "message": "옵션 그룹을 찾을 수 없습니다"
                }
            }
        )

    # Create option item
    new_item = OptionItem(
        option_group_id=group_id,
        name=item_data.name,
        price=item_data.price,
        is_default=item_data.is_default,
        display_order=item_data.display_order if item_data.display_order is not None else 0
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return {
        "success": True,
        "data": {
            "id": new_item.id,
            "name": new_item.name,
            "price": new_item.price
        }
    }


@router.put("/{group_id}/items/{item_id}", response_model=dict)
def update_option_item(
    group_id: int,
    item_id: int,
    item_data: OptionItemUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    옵션 항목 수정 (관리자)
    """
    item = db.query(OptionItem).filter(
        OptionItem.id == item_id,
        OptionItem.option_group_id == group_id
    ).first()

    if not item:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "success": False,
                "error": {
                    "code": "OPTION_ITEM_NOT_FOUND",
                    "message": "옵션 항목을 찾을 수 없습니다"
                }
            }
        )

    # Update fields if provided
    if item_data.name is not None:
        item.name = item_data.name

    if item_data.price is not None:
        item.price = item_data.price

    if item_data.is_default is not None:
        item.is_default = item_data.is_default

    if item_data.display_order is not None:
        item.display_order = item_data.display_order

    db.commit()
    db.refresh(item)

    return {
        "success": True,
        "data": {
            "id": item.id,
            "name": item.name,
            "price": item.price
        }
    }


@router.delete("/{group_id}/items/{item_id}", response_model=dict)
def delete_option_item(
    group_id: int,
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    옵션 항목 삭제 (관리자)
    """
    item = db.query(OptionItem).filter(
        OptionItem.id == item_id,
        OptionItem.option_group_id == group_id
    ).first()

    if not item:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "success": False,
                "error": {
                    "code": "OPTION_ITEM_NOT_FOUND",
                    "message": "옵션 항목을 찾을 수 없습니다"
                }
            }
        )

    # Delete option item
    db.delete(item)
    db.commit()

    return {
        "success": True,
        "data": {
            "id": item_id,
            "message": "옵션 항목이 삭제되었습니다"
        }
    }
