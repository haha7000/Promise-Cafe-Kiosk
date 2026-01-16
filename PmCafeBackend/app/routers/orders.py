"""
Order API routes (Refactored with Service Layer)
Based on docs/backend/06-order-api.md
"""
from typing import Optional
from fastapi import APIRouter, Depends, status, Query, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.order_service import OrderService
from app.dependencies.order import get_order_service
from app.models.order import OrderStatus, PayType
from app.schemas.order import (
    CreateOrderRequest, OrderResponse, OrderItemResponse,
    CellInfoResponse, OrderItemOptionGroup, OrderStatusUpdateRequest
)
from app.exceptions import (
    MissingCellIdError,
    CellNotFoundError,
    InsufficientBalanceError,
    OrderNotFoundError
)

router = APIRouter(prefix="/api/v1/orders", tags=["Orders"])


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: CreateOrderRequest,
    db: Session = Depends(get_db),
    service: OrderService = Depends(get_order_service)
):
    """
    주문 생성

    - **payType**: PERSONAL 또는 CELL
    - **cellId**: CELL 결제시 필수
    - **items**: 주문 아이템 목록
    - **totalAmount**: 총 금액
    """
    try:
        order = service.create_order(db, order_data)

        # Build response
        cell_info = None
        if order.cell:
            cell_info = CellInfoResponse(
                id=order.cell.id,
                name=order.cell.name,
                balance=order.cell.balance
            )

        response_items = []
        for order_item in order.items:
            # Build options
            option_groups_dict = {}
            for option in order_item.options:
                group_name = option.option_group_name
                if group_name not in option_groups_dict:
                    option_groups_dict[group_name] = []
                option_groups_dict[group_name].append({
                    "name": option.option_item_name,
                    "price": option.option_item_price
                })

            selected_options = [
                OrderItemOptionGroup(
                    groupName=group_name,
                    items=[
                        {"name": item["name"], "price": item["price"]}
                        for item in items
                    ]
                )
                for group_name, items in option_groups_dict.items()
            ]

            response_items.append(OrderItemResponse(
                menuName=order_item.menu_name,
                menuPrice=order_item.menu_price,
                quantity=order_item.quantity,
                selectedOptions=selected_options,
                totalPrice=order_item.total_price
            ))

        order_response = OrderResponse(
            orderId=order.order_id,
            dailyNum=order.daily_num,
            payType=order.pay_type.value,
            cellInfo=cell_info,
            items=response_items,
            totalAmount=order.total_amount,
            status=order.status.value,
            createdAt=order.created_at,
            completedAt=order.completed_at
        )

        return {
            "success": True,
            "data": order_response.model_dump()
        }

    except MissingCellIdError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "error": {"code": e.code, "message": e.message}}
        )
    except CellNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "error": {"code": e.code, "message": e.message}}
        )
    except InsufficientBalanceError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "error": {"code": e.code, "message": e.message}}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "ORDER_CREATION_FAILED", "message": str(e)}
        )


@router.get("", response_model=dict)
def get_orders(
    status_filter: Optional[str] = Query(None, alias="status", pattern="^(PENDING|MAKING|COMPLETED|CANCELLED)$"),
    pay_type_filter: Optional[str] = Query(None, alias="payType", pattern="^(PERSONAL|CELL)$"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    service: OrderService = Depends(get_order_service)
):
    """
    주문 목록 조회

    - **status**: 주문 상태 필터 (PENDING, MAKING, COMPLETED, CANCELLED)
    - **payType**: 결제 타입 필터 (PERSONAL, CELL)
    - **limit**: 페이지 크기 (기본: 100)
    - **offset**: 페이지 오프셋 (기본: 0)
    """
    # Convert string filters to enums
    status_enum = OrderStatus[status_filter] if status_filter else None
    pay_type_enum = PayType[pay_type_filter] if pay_type_filter else None

    orders, total = service.get_orders(db, status_enum, pay_type_enum, limit, offset)

    # Build response
    order_list = []
    for order in orders:
        # Get cell info if CELL payment
        cell_info = None
        if order.cell:
            cell_info = CellInfoResponse(
                id=order.cell.id,
                name=order.cell.name
            )

        # Build items
        items = []
        for order_item in order.items:
            # Build options
            option_groups_dict = {}
            for option in order_item.options:
                group_name = option.option_group_name
                if group_name not in option_groups_dict:
                    option_groups_dict[group_name] = []
                option_groups_dict[group_name].append({
                    "name": option.option_item_name,
                    "price": option.option_item_price
                })

            selected_options = [
                OrderItemOptionGroup(
                    groupName=group_name,
                    items=[
                        {"name": item["name"], "price": item["price"]}
                        for item in items_list
                    ]
                )
                for group_name, items_list in option_groups_dict.items()
            ]

            items.append(OrderItemResponse(
                menuName=order_item.menu_name,
                menuPrice=order_item.menu_price,
                quantity=order_item.quantity,
                selectedOptions=selected_options,
                totalPrice=order_item.total_price
            ))

        order_data = OrderResponse(
            orderId=order.order_id,
            dailyNum=order.daily_num,
            payType=order.pay_type.value,
            cellInfo=cell_info,
            items=items,
            totalAmount=order.total_amount,
            status=order.status.value,
            createdAt=order.created_at,
            completedAt=order.completed_at
        )
        order_list.append(order_data.model_dump())

    return {
        "success": True,
        "data": {
            "orders": order_list,
            "total": total,
            "limit": limit,
            "offset": offset
        }
    }


@router.patch("/{order_id}/status", response_model=dict)
def update_order_status(
    order_id: str,
    status_update: OrderStatusUpdateRequest,
    db: Session = Depends(get_db),
    service: OrderService = Depends(get_order_service)
):
    """
    주문 상태 변경

    - **order_id**: 주문 ID
    - **status**: 변경할 상태 (PENDING, MAKING, COMPLETED, CANCELLED)

    상태 전환 규칙:
    - PENDING → MAKING → COMPLETED
    - PENDING → CANCELLED
    - MAKING → CANCELLED
    """
    try:
        new_status = OrderStatus[status_update.status]
        updated_order = service.update_order_status(db, order_id, new_status)

        return {
            "success": True,
            "data": {
                "orderId": updated_order.order_id,
                "status": updated_order.status.value,
                "updatedAt": updated_order.updated_at.isoformat() if updated_order.updated_at else None
            }
        }

    except OrderNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "error": {"code": e.code, "message": e.message}}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "ORDER_UPDATE_FAILED", "message": str(e)}
        )
