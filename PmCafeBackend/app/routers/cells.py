"""
Cell API routes
Based on docs/backend/05-cell-api.md
"""
from fastapi import APIRouter, Depends, status, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from datetime import datetime
from typing import Optional

from app.database import get_db
from app.models.cell import Cell
from app.models.transaction import PointTransaction, TransactionType
from app.models.order import Order
from app.models.user import User
from app.schemas.cell import (
    CellAuthRequest, CellAuthResponse, CellResponse,
    CellCreateRequest, CellChargeRequest, TransactionResponse,
    TransactionCreatorResponse, TransactionOrderResponse
)
from app.dependencies.auth import get_current_user, get_current_super_user

router = APIRouter(prefix="/api/v1/cells", tags=["Cells"])


@router.post("/auth", response_model=dict)
def authenticate_cell(
    credentials: CellAuthRequest,
    db: Session = Depends(get_db)
):
    """
    셀 인증 (휴대폰 뒷 4자리)

    - **phoneLast4**: 휴대폰 뒷 4자리 (숫자)
    """
    # Find cell by phone_last4
    cell = db.query(Cell).filter(
        Cell.phone_last4 == credentials.phoneLast4,
        Cell.is_active == True
    ).first()

    if not cell:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "success": False,
                "error": {
                    "code": "CELL_NOT_FOUND",
                    "message": "등록된 셀 정보가 없습니다"
                }
            }
        )

    cell_data = CellAuthResponse(
        id=cell.id,
        name=cell.name,
        leader=cell.leader,
        balance=cell.balance
    )

    return {
        "success": True,
        "data": cell_data.model_dump()
    }


@router.get("", response_model=dict)
def get_cells(
    includeInactive: bool = Query(False, description="Include inactive cells"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    셀 목록 조회 (관리자)
    """
    query = db.query(Cell)

    if not includeInactive:
        query = query.filter(Cell.is_active == True)

    cells = query.order_by(Cell.name).all()

    cell_list = []
    for cell in cells:
        cell_data = CellResponse(
            id=cell.id,
            name=cell.name,
            leader=cell.leader,
            phoneLast4=cell.phone_last4,
            balance=cell.balance,
            isActive=cell.is_active,
            createdAt=cell.created_at,
            updatedAt=cell.updated_at
        )
        cell_list.append(cell_data.model_dump())

    return {
        "success": True,
        "data": cell_list
    }


@router.post("", response_model=dict)
def create_cell(
    cell_data: CellCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    셀 생성 (관리자)
    """
    # Check for duplicate phone_last4
    existing_cell = db.query(Cell).filter(Cell.phone_last4 == cell_data.phoneLast4).first()
    if existing_cell:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={
                "success": False,
                "error": {
                    "code": "DUPLICATE_PHONE",
                    "message": "이미 등록된 휴대폰 번호입니다"
                }
            }
        )

    # Create new cell
    new_cell = Cell(
        name=cell_data.name,
        leader=cell_data.leader,
        phone_last4=cell_data.phoneLast4,
        balance=0,
        is_active=True
    )

    db.add(new_cell)
    db.commit()
    db.refresh(new_cell)

    return {
        "success": True,
        "data": {
            "id": new_cell.id,
            "name": new_cell.name,
            "leader": new_cell.leader,
            "balance": new_cell.balance
        }
    }


@router.post("/{cell_id}/charge", response_model=dict)
def charge_points(
    cell_id: int,
    charge_data: CellChargeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    포인트 충전 (관리자)
    """
    cell = db.query(Cell).filter(Cell.id == cell_id).first()
    if not cell:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "success": False,
                "error": {
                    "code": "CELL_NOT_FOUND",
                    "message": "셀을 찾을 수 없습니다"
                }
            }
        )

    # Calculate bonus
    bonus_amount = int(charge_data.amount * charge_data.bonusRate / 100)
    total_amount = charge_data.amount + bonus_amount

    # Update balance
    cell.balance += total_amount

    # Create transaction record
    transaction = PointTransaction(
        cell_id=cell_id,
        type=TransactionType.CHARGE,
        amount=total_amount,
        balance_after=cell.balance,
        memo=charge_data.memo,
        created_by=current_user.id
    )

    db.add(transaction)
    db.commit()

    return {
        "success": True,
        "data": {
            "cellId": cell.id,
            "cellName": cell.name,
            "chargeAmount": charge_data.amount,
            "bonusAmount": bonus_amount,
            "totalAmount": total_amount,
            "balanceAfter": cell.balance
        }
    }


@router.get("/{cell_id}/transactions", response_model=dict)
def get_cell_transactions(
    cell_id: int,
    startDate: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    endDate: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    type: Optional[str] = Query(None, description="Transaction type (CHARGE, USE, REFUND)"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    셀 거래 내역 조회 (관리자)
    """
    # Check if cell exists
    cell = db.query(Cell).filter(Cell.id == cell_id).first()
    if not cell:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "success": False,
                "error": {
                    "code": "CELL_NOT_FOUND",
                    "message": "셀을 찾을 수 없습니다"
                }
            }
        )

    # Build query
    query = db.query(PointTransaction).filter(PointTransaction.cell_id == cell_id)

    # Filter by date range
    if startDate:
        try:
            start = datetime.strptime(startDate, "%Y-%m-%d")
            query = query.filter(PointTransaction.created_at >= start)
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
            # Add 1 day to include the end date
            from datetime import timedelta
            end = end + timedelta(days=1)
            query = query.filter(PointTransaction.created_at < end)
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

    # Filter by type
    if type:
        try:
            transaction_type = TransactionType[type]
            query = query.filter(PointTransaction.type == transaction_type)
        except KeyError:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "success": False,
                    "error": {
                        "code": "INVALID_TRANSACTION_TYPE",
                        "message": "유효하지 않은 거래 타입입니다"
                    }
                }
            )

    # Get total count
    total = query.count()

    # Apply pagination and ordering
    transactions = query.order_by(PointTransaction.created_at.desc()).limit(limit).offset(offset).all()

    # Build response
    transaction_list = []
    for txn in transactions:
        txn_data = {
            "id": txn.id,
            "type": txn.type.value,
            "amount": txn.amount,
            "balanceAfter": txn.balance_after,
            "memo": txn.memo,
            "createdAt": txn.created_at
        }

        # Add creator info if exists
        if txn.created_by:
            creator = db.query(User).filter(User.id == txn.created_by).first()
            if creator:
                txn_data["createdBy"] = {
                    "id": creator.id,
                    "name": creator.name
                }

        # Add order info if exists
        if txn.order_id:
            order = db.query(Order).filter(Order.id == txn.order_id).first()
            if order:
                txn_data["order"] = {
                    "orderId": order.order_id,
                    "dailyNum": order.daily_num
                }

        transaction_list.append(txn_data)

    return {
        "success": True,
        "data": {
            "transactions": transaction_list,
            "total": total,
            "limit": limit,
            "offset": offset
        }
    }
