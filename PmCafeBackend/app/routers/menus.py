"""
Menu API routes
Based on docs/backend/02-menu-api.md
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.menu import Menu, Category, OptionGroup, OptionItem, MenuOptionGroup
from app.models.user import User
from app.schemas.menu import (
    MenuListResponse, MenuDetailResponse, CategoryResponse,
    OptionGroupResponse, OptionItemResponse, MenuCreateRequest,
    MenuUpdateRequest, MenuSoldOutRequest
)
from app.dependencies.auth import get_current_user, get_current_super_user

router = APIRouter(prefix="/api/v1/menus", tags=["Menus"])


@router.get("", response_model=dict)
def get_menus(
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    include_inactive: bool = Query(False, description="Include inactive menus"),
    db: Session = Depends(get_db)
):
    """
    전체 메뉴 조회 (Public)

    - **category_id**: 카테고리별 필터링
    - **include_inactive**: 비활성 메뉴 포함 여부
    """
    query = db.query(Menu).options(joinedload(Menu.category))

    # Filter by category
    if category_id:
        query = query.filter(Menu.category_id == category_id)

    # Filter active menus only (unless include_inactive is True)
    if not include_inactive:
        query = query.filter(Menu.is_active == True)

    # Order by display_order
    query = query.order_by(Menu.display_order, Menu.id)

    menus = query.all()

    # Convert to response schema
    menu_list = []
    for menu in menus:
        menu_data = MenuListResponse(
            id=menu.id,
            name=menu.name,
            eng_name=menu.eng_name,
            price=menu.price,
            category=CategoryResponse(
                id=menu.category.id,
                code=menu.category.code,
                name=menu.category.name
            ),
            description=menu.description,
            image_url=menu.image_url,
            is_sold_out=menu.is_sold_out,
            is_active=menu.is_active,
            display_order=menu.display_order
        )
        menu_list.append(menu_data.model_dump())

    return {
        "success": True,
        "data": menu_list
    }


@router.get("/{menu_id}", response_model=dict)
def get_menu_detail(
    menu_id: int,
    db: Session = Depends(get_db)
):
    """
    메뉴 상세 조회 (옵션 그룹 포함)
    """
    menu = db.query(Menu).options(
        joinedload(Menu.category),
        joinedload(Menu.option_groups).joinedload(MenuOptionGroup.option_group).joinedload(OptionGroup.items)
    ).filter(Menu.id == menu_id).first()

    if not menu:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "success": False,
                "error": {
                    "code": "MENU_NOT_FOUND",
                    "message": "메뉴를 찾을 수 없습니다"
                }
            }
        )

    # Build option groups
    option_groups = []
    for menu_opt_group in sorted(menu.option_groups, key=lambda x: x.display_order):
        opt_group = menu_opt_group.option_group

        # Build option items
        items = []
        for item in sorted(opt_group.items, key=lambda x: x.display_order):
            items.append(OptionItemResponse(
                id=item.id,
                name=item.name,
                price=item.price,
                is_default=item.is_default
            ))

        option_groups.append(OptionGroupResponse(
            id=opt_group.id,
            name=opt_group.name,
            icon=opt_group.icon,
            type=opt_group.type.value,
            is_required=opt_group.is_required,
            items=items
        ))

    menu_detail = MenuDetailResponse(
        id=menu.id,
        name=menu.name,
        eng_name=menu.eng_name,
        price=menu.price,
        category=CategoryResponse(
            id=menu.category.id,
            code=menu.category.code,
            name=menu.category.name
        ),
        description=menu.description,
        image_url=menu.image_url,
        is_sold_out=menu.is_sold_out,
        is_active=menu.is_active,
        display_order=menu.display_order,
        option_groups=option_groups
    )

    return {
        "success": True,
        "data": menu_detail.model_dump()
    }


@router.post("", response_model=dict)
def create_menu(
    menu_data: MenuCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    메뉴 생성 (관리자)
    """
    # Check if category exists
    category = db.query(Category).filter(Category.id == menu_data.category_id).first()
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

    # Check for duplicate menu name
    existing_menu = db.query(Menu).filter(Menu.name == menu_data.name).first()
    if existing_menu:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={
                "success": False,
                "error": {
                    "code": "DUPLICATE_MENU_NAME",
                    "message": "이미 존재하는 메뉴 이름입니다"
                }
            }
        )

    # Create menu
    new_menu = Menu(
        name=menu_data.name,
        eng_name=menu_data.eng_name,
        price=menu_data.price,
        category_id=menu_data.category_id,
        description=menu_data.description,
        image_url=menu_data.image_url,
        display_order=menu_data.display_order if menu_data.display_order is not None else 0,
        is_sold_out=False,
        is_active=True
    )

    db.add(new_menu)
    db.flush()  # Get the menu ID

    # Create menu-option group associations
    for idx, option_group_id in enumerate(menu_data.option_group_ids):
        # Check if option group exists
        opt_group = db.query(OptionGroup).filter(OptionGroup.id == option_group_id).first()
        if not opt_group:
            db.rollback()
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={
                    "success": False,
                    "error": {
                        "code": "OPTION_GROUP_NOT_FOUND",
                        "message": f"옵션 그룹을 찾을 수 없습니다 (ID: {option_group_id})"
                    }
                }
            )

        menu_opt_group = MenuOptionGroup(
            menu_id=new_menu.id,
            option_group_id=option_group_id,
            display_order=idx
        )
        db.add(menu_opt_group)

    db.commit()
    db.refresh(new_menu)

    return {
        "success": True,
        "data": {
            "id": new_menu.id,
            "name": new_menu.name,
            "price": new_menu.price
        }
    }


@router.put("/{menu_id}", response_model=dict)
def update_menu(
    menu_id: int,
    menu_data: MenuUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    메뉴 수정 (관리자)
    """
    menu = db.query(Menu).filter(Menu.id == menu_id).first()
    if not menu:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "success": False,
                "error": {
                    "code": "MENU_NOT_FOUND",
                    "message": "메뉴를 찾을 수 없습니다"
                }
            }
        )

    # Update fields if provided
    if menu_data.name is not None:
        # Check for duplicate name (excluding current menu)
        existing = db.query(Menu).filter(
            Menu.name == menu_data.name,
            Menu.id != menu_id
        ).first()
        if existing:
            return JSONResponse(
                status_code=status.HTTP_409_CONFLICT,
                content={
                    "success": False,
                    "error": {
                        "code": "DUPLICATE_MENU_NAME",
                        "message": "이미 존재하는 메뉴 이름입니다"
                    }
                }
            )
        menu.name = menu_data.name

    if menu_data.eng_name is not None:
        menu.eng_name = menu_data.eng_name

    if menu_data.price is not None:
        menu.price = menu_data.price

    if menu_data.category_id is not None:
        category = db.query(Category).filter(Category.id == menu_data.category_id).first()
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
        menu.category_id = menu_data.category_id

    if menu_data.description is not None:
        menu.description = menu_data.description

    if menu_data.image_url is not None:
        menu.image_url = menu_data.image_url

    if menu_data.display_order is not None:
        menu.display_order = menu_data.display_order

    # Update option groups if provided
    if menu_data.option_group_ids is not None:
        # Delete existing associations
        db.query(MenuOptionGroup).filter(MenuOptionGroup.menu_id == menu_id).delete()

        # Create new associations
        for idx, option_group_id in enumerate(menu_data.option_group_ids):
            opt_group = db.query(OptionGroup).filter(OptionGroup.id == option_group_id).first()
            if not opt_group:
                db.rollback()
                return JSONResponse(
                    status_code=status.HTTP_404_NOT_FOUND,
                    content={
                        "success": False,
                        "error": {
                            "code": "OPTION_GROUP_NOT_FOUND",
                            "message": f"옵션 그룹을 찾을 수 없습니다 (ID: {option_group_id})"
                        }
                    }
                )

            menu_opt_group = MenuOptionGroup(
                menu_id=menu_id,
                option_group_id=option_group_id,
                display_order=idx
            )
            db.add(menu_opt_group)

    db.commit()
    db.refresh(menu)

    return {
        "success": True,
        "data": {
            "id": menu.id,
            "name": menu.name,
            "price": menu.price
        }
    }


@router.patch("/{menu_id}/sold-out", response_model=dict)
def toggle_sold_out(
    menu_id: int,
    sold_out_data: MenuSoldOutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    메뉴 품절 토글 (관리자)
    """
    menu = db.query(Menu).filter(Menu.id == menu_id).first()
    if not menu:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "success": False,
                "error": {
                    "code": "MENU_NOT_FOUND",
                    "message": "메뉴를 찾을 수 없습니다"
                }
            }
        )

    menu.is_sold_out = sold_out_data.is_sold_out
    db.commit()

    return {
        "success": True,
        "data": {
            "id": menu.id,
            "name": menu.name,
            "isSoldOut": menu.is_sold_out
        }
    }


@router.delete("/{menu_id}", response_model=dict)
def delete_menu(
    menu_id: int,
    current_user: User = Depends(get_current_super_user),
    db: Session = Depends(get_db)
):
    """
    메뉴 삭제 (SUPER 관리자만)
    """
    menu = db.query(Menu).filter(Menu.id == menu_id).first()
    if not menu:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "success": False,
                "error": {
                    "code": "MENU_NOT_FOUND",
                    "message": "메뉴를 찾을 수 없습니다"
                }
            }
        )

    # Delete menu (CASCADE will delete menu_option_groups)
    db.delete(menu)
    db.commit()

    return {
        "success": True,
        "data": {
            "id": menu_id,
            "message": "메뉴가 삭제되었습니다"
        }
    }
