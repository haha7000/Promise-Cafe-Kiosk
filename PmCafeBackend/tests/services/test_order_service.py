"""
Unit tests for OrderService
"""
import pytest
from sqlalchemy.orm import Session

from app.services.order_service import OrderService
from app.schemas.order import CreateOrderRequest, OrderItemRequest, OrderItemOptionGroup
from app.models.order import OrderStatus, PayType
from app.models.cell import Cell
from app.exceptions import (
    MissingCellIdError,
    CellNotFoundError,
    InsufficientBalanceError,
    OrderNotFoundError
)


class TestOrderServiceCreate:
    """Test order creation"""

    def test_create_order_personal_payment_success(self, db_session: Session, test_menu):
        """Test creating order with PERSONAL payment"""
        service = OrderService()

        order_data = CreateOrderRequest(
            payType="PERSONAL",
            cellId=None,
            items=[
                OrderItemRequest(
                    menuId=test_menu.id,
                    menuName=test_menu.name,
                    menuPrice=test_menu.price,
                    quantity=2,
                    selectedOptions=[]
                )
            ],
            totalAmount=test_menu.price * 2
        )

        order = service.create_order(db_session, order_data)

        assert order.order_id.startswith("ORD-")
        assert order.pay_type == PayType.PERSONAL
        assert order.cell_id is None
        assert order.total_amount == test_menu.price * 2
        assert order.status == OrderStatus.PENDING
        assert len(order.items) == 1
        assert order.items[0].menu_name == test_menu.name
        assert order.items[0].quantity == 2

    def test_create_order_cell_payment_success(self, db_session: Session, test_menu, test_cell):
        """Test creating order with CELL payment"""
        service = OrderService()
        initial_balance = test_cell.balance

        order_data = CreateOrderRequest(
            payType="CELL",
            cellId=test_cell.id,
            items=[
                OrderItemRequest(
                    menuId=test_menu.id,
                    menuName=test_menu.name,
                    menuPrice=test_menu.price,
                    quantity=1,
                    selectedOptions=[]
                )
            ],
            totalAmount=test_menu.price
        )

        order = service.create_order(db_session, order_data)

        # Refresh cell to get updated balance
        db_session.refresh(test_cell)

        assert order.pay_type == PayType.CELL
        assert order.cell_id == test_cell.id
        assert test_cell.balance == initial_balance - test_menu.price

        # Check transaction created
        from app.models.transaction import PointTransaction
        transaction = db_session.query(PointTransaction).filter(
            PointTransaction.order_id == order.id
        ).first()
        assert transaction is not None
        assert transaction.amount == -test_menu.price
        assert transaction.balance_after == test_cell.balance

    def test_create_order_with_options(self, db_session: Session, test_menu, test_option_item):
        """Test creating order with options"""
        service = OrderService()

        order_data = CreateOrderRequest(
            payType="PERSONAL",
            cellId=None,
            items=[
                OrderItemRequest(
                    menuId=test_menu.id,
                    menuName=test_menu.name,
                    menuPrice=test_menu.price,
                    quantity=1,
                    selectedOptions=[
                        OrderItemOptionGroup(
                            groupName="온도",
                            items=[{"name": "HOT", "price": 0}]
                        ),
                        OrderItemOptionGroup(
                            groupName="사이즈",
                            items=[{"name": "Grande", "price": 500}]
                        )
                    ]
                )
            ],
            totalAmount=test_menu.price + 500
        )

        order = service.create_order(db_session, order_data)

        assert order.items[0].total_price == test_menu.price + 500
        assert len(order.items[0].options) == 2

    def test_create_order_missing_cell_id(self, db_session: Session, test_menu):
        """Test creating CELL order without cellId"""
        service = OrderService()

        order_data = CreateOrderRequest(
            payType="CELL",
            cellId=None,  # Missing!
            items=[
                OrderItemRequest(
                    menuId=test_menu.id,
                    menuName=test_menu.name,
                    menuPrice=test_menu.price,
                    quantity=1,
                    selectedOptions=[]
                )
            ],
            totalAmount=test_menu.price
        )

        with pytest.raises(MissingCellIdError):
            service.create_order(db_session, order_data)

    def test_create_order_cell_not_found(self, db_session: Session, test_menu):
        """Test creating order with non-existent cell"""
        service = OrderService()

        order_data = CreateOrderRequest(
            payType="CELL",
            cellId=99999,  # Not exists
            items=[
                OrderItemRequest(
                    menuId=test_menu.id,
                    menuName=test_menu.name,
                    menuPrice=test_menu.price,
                    quantity=1,
                    selectedOptions=[]
                )
            ],
            totalAmount=test_menu.price
        )

        with pytest.raises(CellNotFoundError):
            service.create_order(db_session, order_data)

    def test_create_order_insufficient_balance(self, db_session: Session, test_menu):
        """Test creating order with insufficient cell balance"""
        service = OrderService()

        # Create cell with low balance
        cell = Cell(
            name="저잔액셀",
            leader="저잔액리더",
            phone_last4="5678",
            balance=1000  # Low balance
        )
        db_session.add(cell)
        db_session.commit()

        order_data = CreateOrderRequest(
            payType="CELL",
            cellId=cell.id,
            items=[
                OrderItemRequest(
                    menuId=test_menu.id,
                    menuName=test_menu.name,
                    menuPrice=test_menu.price,  # 5000 (from fixture)
                    quantity=1,
                    selectedOptions=[]
                )
            ],
            totalAmount=test_menu.price
        )

        with pytest.raises(InsufficientBalanceError) as exc_info:
            service.create_order(db_session, order_data)

        assert exc_info.value.balance == 1000
        assert exc_info.value.required == test_menu.price


class TestOrderServiceGet:
    """Test order retrieval"""

    def test_get_orders_all(self, db_session: Session, test_order):
        """Test getting all orders"""
        service = OrderService()

        orders, total = service.get_orders(db_session)

        assert total >= 1
        assert len(orders) >= 1
        assert any(o.order_id == test_order.order_id for o in orders)

    def test_get_orders_filter_by_status(self, db_session: Session, test_order):
        """Test filtering orders by status"""
        service = OrderService()

        orders, total = service.get_orders(db_session, status=OrderStatus.PENDING)

        assert all(o.status == OrderStatus.PENDING for o in orders)

    def test_get_orders_filter_by_pay_type(self, db_session: Session, test_order):
        """Test filtering orders by payment type"""
        service = OrderService()

        orders, total = service.get_orders(db_session, pay_type=PayType.PERSONAL)

        assert all(o.pay_type == PayType.PERSONAL for o in orders)

    def test_get_orders_pagination(self, db_session: Session, test_order):
        """Test order pagination"""
        service = OrderService()

        orders, total = service.get_orders(db_session, limit=1, offset=0)

        assert len(orders) <= 1

    def test_get_order_by_id_success(self, db_session: Session, test_order):
        """Test getting order by ID"""
        service = OrderService()

        order = service.get_order_by_id(db_session, test_order.order_id)

        assert order.order_id == test_order.order_id
        assert order.items is not None  # Eager loaded

    def test_get_order_by_id_not_found(self, db_session: Session):
        """Test getting non-existent order"""
        service = OrderService()

        with pytest.raises(OrderNotFoundError):
            service.get_order_by_id(db_session, "ORD-notexist-123456")


class TestOrderServiceUpdate:
    """Test order status update"""

    def test_update_order_status_to_making(self, db_session: Session, test_order):
        """Test updating order status to MAKING"""
        service = OrderService()

        updated_order = service.update_order_status(
            db_session,
            test_order.order_id,
            OrderStatus.MAKING
        )

        assert updated_order.status == OrderStatus.MAKING
        assert updated_order.completed_at is None

    def test_update_order_status_to_completed(self, db_session: Session, test_order):
        """Test updating order status to COMPLETED"""
        service = OrderService()

        updated_order = service.update_order_status(
            db_session,
            test_order.order_id,
            OrderStatus.COMPLETED
        )

        assert updated_order.status == OrderStatus.COMPLETED
        assert updated_order.completed_at is not None

    def test_update_order_status_to_cancelled(self, db_session: Session, test_order):
        """Test updating order status to CANCELLED"""
        service = OrderService()

        updated_order = service.update_order_status(
            db_session,
            test_order.order_id,
            OrderStatus.CANCELLED
        )

        assert updated_order.status == OrderStatus.CANCELLED
        assert updated_order.cancelled_at is not None

    def test_update_order_status_not_found(self, db_session: Session):
        """Test updating non-existent order"""
        service = OrderService()

        with pytest.raises(OrderNotFoundError):
            service.update_order_status(db_session, "ORD-notexist-123456", OrderStatus.MAKING)
