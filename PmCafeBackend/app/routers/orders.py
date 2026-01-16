"""
Order API routes
Based on docs/backend/06-order-api.md
"""
import time
import random
import string
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, status, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.order import Order, OrderItem, OrderItemOption, PayType, OrderStatus
from app.models.cell import Cell
from app.models.transaction import PointTransaction, TransactionType
from app.models.settlement import SystemSetting
from app.schemas.order import (
    CreateOrderRequest, OrderResponse, OrderItemResponse,
    CellInfoResponse, OrderItemOptionGroup, OrderStatusUpdateRequest
)

router = APIRouter(prefix="/api/v1/orders", tags=["Orders"])


def generate_order_id() -> str:
    """Generate unique order ID: ORD-{timestamp}-{random}"""
    timestamp = int(time.time() * 1000)
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    return f"ORD-{timestamp}-{random_str}"


def get_next_daily_num(db: Session) -> int:
    """Get next daily number (1-12 cycling)"""
    setting = db.query(SystemSetting).filter(
        SystemSetting.key == "next_order_number"
    ).first()

    if not setting:
        # Create if not exists
        setting = SystemSetting(
            key="next_order_number",
            value="1",
            description="다음 주문 번호 (1-12)"
        )
        db.add(setting)
        db.commit()
        db.refresh(setting)

    current_num = int(setting.value)
    next_num = (current_num % 12) + 1
    setting.value = str(next_num)
    db.commit()

    return current_num


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: CreateOrderRequest,
    db: Session = Depends(get_db)
):
    """
    주문 생성

    - **payType**: PERSONAL 또는 CELL
    - **cellId**: CELL 결제시 필수
    - **items**: 주문 아이템 목록
    - **totalAmount**: 총 금액
    """
    # Validate CELL payment
    cell = None
    if order_data.payType == "CELL":
        if not order_data.cellId:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "success": False,
                    "error": {
                        "code": "MISSING_CELL_ID",
                        "message": "셀 결제시 cellId가 필요합니다"
                    }
                }
            )

        cell = db.query(Cell).filter(Cell.id == order_data.cellId).first()
        if not cell:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={
                    "success": False,
                    "error": {
                        "code": "CELL_NOT_FOUND",
                        "message": "셀 정보를 찾을 수 없습니다"
                    }
                }
            )

        # Check balance
        if cell.balance < order_data.totalAmount:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "success": False,
                    "error": {
                        "code": "INSUFFICIENT_BALANCE",
                        "message": f"포인트가 부족합니다 (잔액: {cell.balance:,}원)"
                    }
                }
            )

    try:
        # Generate order ID and daily number
        order_id = generate_order_id()
        daily_num = get_next_daily_num(db)

        # Create order
        order = Order(
            order_id=order_id,
            daily_num=daily_num,
            pay_type=PayType.CELL if order_data.payType == "CELL" else PayType.PERSONAL,
            cell_id=cell.id if cell else None,
            total_amount=order_data.totalAmount,
            status=OrderStatus.PENDING
        )
        db.add(order)
        db.flush()  # Get order.id

        # Create order items and options
        response_items = []
        for item_data in order_data.items:
            # Calculate total price for this item
            option_total = sum(
                opt_item.price
                for opt_group in item_data.selectedOptions
                for opt_item in opt_group.items
            )
            item_total = (item_data.menuPrice + option_total) * item_data.quantity

            # Create order item
            order_item = OrderItem(
                order_id=order.id,
                menu_id=item_data.menuId,
                menu_name=item_data.menuName,
                menu_price=item_data.menuPrice,
                quantity=item_data.quantity,
                total_price=item_total
            )
            db.add(order_item)
            db.flush()

            # Create order item options
            for option_group in item_data.selectedOptions:
                for option_item in option_group.items:
                    order_item_option = OrderItemOption(
                        order_item_id=order_item.id,
                        option_group_name=option_group.groupName,
                        option_item_name=option_item.name,
                        option_item_price=option_item.price
                    )
                    db.add(order_item_option)

            response_items.append(OrderItemResponse(
                menuName=item_data.menuName,
                menuPrice=item_data.menuPrice,
                quantity=item_data.quantity,
                selectedOptions=[
                    OrderItemOptionGroup(
                        groupName=og.groupName,
                        items=og.items
                    ) for og in item_data.selectedOptions
                ],
                totalPrice=item_total
            ))

        # Deduct balance if CELL payment
        if cell:
            cell.balance -= order_data.totalAmount

            # Create point transaction
            transaction = PointTransaction(
                cell_id=cell.id,
                type=TransactionType.USE,
                amount=-order_data.totalAmount,
                balance_after=cell.balance,
                order_id=order.id,
                memo=None
            )
            db.add(transaction)

        db.commit()
        db.refresh(order)

        # Prepare response
        cell_info = None
        if cell:
            cell_info = CellInfoResponse(
                id=cell.id,
                name=cell.name,
                balance=cell.balance
            )

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

    except Exception as e:
        db.rollback()
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": {
                    "code": "ORDER_CREATION_FAILED",
                    "message": f"주문 생성 중 오류가 발생했습니다: {str(e)}"
                }
            }
        )


@router.get("", response_model=dict)
def get_orders(
    status: Optional[str] = Query(None, pattern="^(PENDING|MAKING|COMPLETED|CANCELLED)$"),
    payType: Optional[str] = Query(None, pattern="^(PERSONAL|CELL)$"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    주문 목록 조회

    - **status**: 주문 상태 필터 (PENDING, MAKING, COMPLETED, CANCELLED)
    - **payType**: 결제 타입 필터 (PERSONAL, CELL)
    - **limit**: 페이지 크기 (기본: 100)
    - **offset**: 페이지 오프셋 (기본: 0)
    """
    from sqlalchemy.orm import joinedload

    # Build query
    query = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.options)
    )

    # Apply filters
    if status:
        query = query.filter(Order.status == OrderStatus[status])

    if payType:
        query = query.filter(Order.pay_type == PayType[payType])

    # Get total count
    total = query.count()

    # Apply pagination and sorting
    orders = query.order_by(Order.created_at.desc()).offset(offset).limit(limit).all()

    # Build response
    order_list = []
    for order in orders:
        # Get cell info if CELL payment
        cell_info = None
        if order.cell_id:
            cell = db.query(Cell).filter(Cell.id == order.cell_id).first()
            if cell:
                cell_info = CellInfoResponse(
                    id=cell.id,
                    name=cell.name
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
                        for item in items
                    ]
                )
                for group_name, items in option_groups_dict.items()
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
    db: Session = Depends(get_db)
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
    # Find order
    order = db.query(Order).filter(Order.order_id == order_id).first()
    
    if not order:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "success": False,
                "error": {
                    "code": "ORDER_NOT_FOUND",
                    "message": "주문을 찾을 수 없습니다"
                }
            }
        )
    
    # Update status
    new_status = OrderStatus[status_update.status]
    order.status = new_status
    
    # Update completed_at if COMPLETED
    if new_status == OrderStatus.COMPLETED:
        order.completed_at = datetime.now()
    
    # Update cancelled_at if CANCELLED
    if new_status == OrderStatus.CANCELLED:
        order.cancelled_at = datetime.now()
    
    db.commit()
    db.refresh(order)
    
    return {
        "success": True,
        "data": {
            "orderId": order.order_id,
            "status": order.status.value,
            "updatedAt": datetime.now().isoformat()
        }
    }
