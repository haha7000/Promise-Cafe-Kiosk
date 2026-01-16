"""
Statistics API routes
Based on docs/backend/07-statistics-api.md
"""
from datetime import datetime, date
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.order import Order, OrderItem, OrderStatus, PayType
from app.models.user import User
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/api/v1/statistics", tags=["Statistics"])


@router.get("/dashboard", response_model=dict)
def get_dashboard_statistics(
    date_param: Optional[str] = Query(None, alias="date", description="Date (YYYY-MM-DD), default: today"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    대시보드 통계 조회 (관리자)

    - 오늘의 주문 수/매출
    - 결제 타입별 집계
    - 상태별 주문 수
    """
    # Parse date
    if date_param:
        try:
            target_date = datetime.strptime(date_param, "%Y-%m-%d").date()
        except ValueError:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "success": False,
                    "error": {
                        "code": "INVALID_DATE_FORMAT",
                        "message": "날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)"
                    }
                }
            )
    else:
        target_date = date.today()

    # Get start and end datetime for the date
    from datetime import timedelta
    start_datetime = datetime.combine(target_date, datetime.min.time())
    end_datetime = datetime.combine(target_date, datetime.max.time())

    # Get all orders for the date
    orders = db.query(Order).filter(
        Order.created_at >= start_datetime,
        Order.created_at <= end_datetime
    ).all()

    # Calculate statistics
    total_orders = len(orders)
    total_revenue = sum(order.total_amount for order in orders)

    # Filter by payment type
    personal_orders = [o for o in orders if o.pay_type == PayType.PERSONAL]
    cell_orders = [o for o in orders if o.pay_type == PayType.CELL]

    personal_count = len(personal_orders)
    personal_revenue = sum(o.total_amount for o in personal_orders)
    cell_count = len(cell_orders)
    cell_revenue = sum(o.total_amount for o in cell_orders)

    # Filter by status
    pending_orders = [o for o in orders if o.status == OrderStatus.PENDING]
    making_orders = [o for o in orders if o.status == OrderStatus.MAKING]
    completed_orders = [o for o in orders if o.status == OrderStatus.COMPLETED]

    pending_count = len(pending_orders)
    making_count = len(making_orders)
    completed_count = len(completed_orders)

    return {
        "success": True,
        "data": {
            "date": target_date.isoformat(),
            "totalOrders": total_orders,
            "totalRevenue": total_revenue,
            "personalOrders": personal_count,
            "personalRevenue": personal_revenue,
            "cellOrders": cell_count,
            "cellRevenue": cell_revenue,
            "pendingOrders": pending_count,
            "makingOrders": making_count,
            "completedOrders": completed_count
        }
    }


@router.get("/menus", response_model=dict)
def get_menu_statistics(
    startDate: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    endDate: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    categoryId: Optional[int] = Query(None, description="Filter by category ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    메뉴별 판매 통계 (관리자)
    """
    # Build query
    query = db.query(
        OrderItem.menu_name,
        func.sum(OrderItem.quantity).label('total_quantity'),
        func.sum(OrderItem.total_price).label('total_revenue')
    ).join(Order)

    # Filter by date range
    if startDate:
        try:
            start = datetime.strptime(startDate, "%Y-%m-%d")
            query = query.filter(Order.created_at >= start)
        except ValueError:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "success": False,
                    "error": {
                        "code": "INVALID_DATE_FORMAT",
                        "message": "날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)"
                    }
                }
            )

    if endDate:
        try:
            end = datetime.strptime(endDate, "%Y-%m-%d")
            from datetime import timedelta
            end = end + timedelta(days=1)
            query = query.filter(Order.created_at < end)
        except ValueError:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "success": False,
                    "error": {
                        "code": "INVALID_DATE_FORMAT",
                        "message": "날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)"
                    }
                }
            )

    # Group by menu name
    query = query.group_by(OrderItem.menu_name).order_by(func.sum(OrderItem.total_price).desc())

    results = query.all()

    # Build response
    menu_stats = []
    for result in results:
        menu_stats.append({
            "menuName": result.menu_name,
            "quantity": int(result.total_quantity),
            "revenue": int(result.total_revenue)
        })

    return {
        "success": True,
        "data": menu_stats
    }


@router.get("/daily", response_model=dict)
def get_daily_statistics(
    startDate: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    endDate: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    일별 매출 통계 (관리자)
    """
    # Build query
    query = db.query(
        func.date(Order.created_at).label('date'),
        func.count(Order.id).label('total_orders'),
        func.sum(Order.total_amount).label('total_revenue')
    )

    # Filter by date range
    if startDate:
        try:
            start = datetime.strptime(startDate, "%Y-%m-%d")
            query = query.filter(Order.created_at >= start)
        except ValueError:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "success": False,
                    "error": {
                        "code": "INVALID_DATE_FORMAT",
                        "message": "날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)"
                    }
                }
            )

    if endDate:
        try:
            end = datetime.strptime(endDate, "%Y-%m-%d")
            from datetime import timedelta
            end = end + timedelta(days=1)
            query = query.filter(Order.created_at < end)
        except ValueError:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "success": False,
                    "error": {
                        "code": "INVALID_DATE_FORMAT",
                        "message": "날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)"
                    }
                }
            )

    # Group by date
    query = query.group_by(func.date(Order.created_at)).order_by(func.date(Order.created_at))

    results = query.all()

    # Build response
    daily_stats = []
    for result in results:
        daily_stats.append({
            "date": result.date.isoformat() if result.date else None,
            "totalOrders": int(result.total_orders),
            "totalRevenue": int(result.total_revenue) if result.total_revenue else 0
        })

    return {
        "success": True,
        "data": daily_stats
    }
