"""
Settlement API routes
Based on docs/backend/08-settlement-api.md
"""
from datetime import datetime, date
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.settlement import DailySettlement
from app.models.order import Order, PayType
from app.models.user import User
from app.dependencies.auth import get_current_user, get_current_super_user

router = APIRouter(prefix="/api/v1/settlements", tags=["Settlements"])


@router.get("", response_model=dict)
def get_settlements(
    startDate: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    endDate: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    isConfirmed: Optional[bool] = Query(None, description="Filter by confirmation status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    정산 목록 조회 (관리자)
    """
    query = db.query(DailySettlement)

    # Filter by date range
    if startDate:
        try:
            start = datetime.strptime(startDate, "%Y-%m-%d").date()
            query = query.filter(DailySettlement.date >= start)
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
            end = datetime.strptime(endDate, "%Y-%m-%d").date()
            query = query.filter(DailySettlement.date <= end)
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

    # Filter by confirmation status
    if isConfirmed is not None:
        query = query.filter(DailySettlement.is_confirmed == isConfirmed)

    # Order by date descending
    settlements = query.order_by(DailySettlement.date.desc()).all()

    # Build response
    settlement_list = []
    for settlement in settlements:
        settlement_data = {
            "id": settlement.id,
            "date": settlement.date.isoformat(),
            "totalOrders": settlement.total_orders,
            "totalRevenue": settlement.total_revenue,
            "personalOrders": settlement.personal_orders,
            "personalRevenue": settlement.personal_revenue,
            "cellOrders": settlement.cell_orders,
            "cellRevenue": settlement.cell_revenue,
            "isConfirmed": settlement.is_confirmed,
            "confirmedAt": settlement.confirmed_at.isoformat() if settlement.confirmed_at else None,
            "notes": settlement.notes
        }

        # Add confirmed_by info if exists
        if settlement.confirmed_by:
            confirmer = db.query(User).filter(User.id == settlement.confirmed_by).first()
            if confirmer:
                settlement_data["confirmedBy"] = {
                    "id": confirmer.id,
                    "name": confirmer.name
                }

        settlement_list.append(settlement_data)

    return {
        "success": True,
        "data": settlement_list
    }


@router.post("/{date}/confirm", response_model=dict)
def confirm_settlement(
    date: str,
    current_user: User = Depends(get_current_super_user),
    db: Session = Depends(get_db)
):
    """
    정산 확정 (SUPER 관리자만)
    """
    # Parse date
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
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

    # Check if settlement exists
    settlement = db.query(DailySettlement).filter(DailySettlement.date == target_date).first()

    # If not exists, create it
    if not settlement:
        # Calculate statistics for the date
        from datetime import timedelta
        start_datetime = datetime.combine(target_date, datetime.min.time())
        end_datetime = datetime.combine(target_date, datetime.max.time())

        orders = db.query(Order).filter(
            Order.created_at >= start_datetime,
            Order.created_at <= end_datetime
        ).all()

        total_orders = len(orders)
        total_revenue = sum(order.total_amount for order in orders)

        personal_orders_list = [o for o in orders if o.pay_type == PayType.PERSONAL]
        cell_orders_list = [o for o in orders if o.pay_type == PayType.CELL]

        personal_orders = len(personal_orders_list)
        personal_revenue = sum(o.total_amount for o in personal_orders_list)
        cell_orders = len(cell_orders_list)
        cell_revenue = sum(o.total_amount for o in cell_orders_list)

        settlement = DailySettlement(
            date=target_date,
            total_orders=total_orders,
            total_revenue=total_revenue,
            personal_orders=personal_orders,
            personal_revenue=personal_revenue,
            cell_orders=cell_orders,
            cell_revenue=cell_revenue,
            is_confirmed=False
        )
        db.add(settlement)
        db.flush()

    # Check if already confirmed
    if settlement.is_confirmed:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={
                "success": False,
                "error": {
                    "code": "ALREADY_CONFIRMED",
                    "message": "이미 확정된 정산입니다"
                }
            }
        )

    # Confirm settlement
    settlement.is_confirmed = True
    settlement.confirmed_by = current_user.id
    settlement.confirmed_at = datetime.now()

    db.commit()
    db.refresh(settlement)

    return {
        "success": True,
        "data": {
            "id": settlement.id,
            "date": settlement.date.isoformat(),
            "isConfirmed": settlement.is_confirmed,
            "confirmedAt": settlement.confirmed_at.isoformat() if settlement.confirmed_at else None,
            "confirmedBy": {
                "id": current_user.id,
                "name": current_user.name
            }
        }
    }
