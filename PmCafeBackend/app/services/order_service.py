"""
Order Service - Business logic for order management
"""
import time
import random
import string
from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.order import Order, OrderItem, OrderItemOption, PayType, OrderStatus
from app.models.cell import Cell
from app.models.transaction import PointTransaction, TransactionType
from app.models.settlement import SystemSetting
from app.schemas.order import CreateOrderRequest, OrderItemRequest
from app.exceptions import (
    MissingCellIdError,
    CellNotFoundError,
    InsufficientBalanceError,
    OrderNotFoundError,
    InvalidOrderStatusTransitionError
)


class OrderService:
    """Service layer for order business logic"""

    def create_order(self, db: Session, order_data: CreateOrderRequest) -> Order:
        """
        Create a new order with items and options

        Args:
            db: Database session
            order_data: Order creation data

        Returns:
            Created Order object

        Raises:
            MissingCellIdError: When cellId is missing for CELL payment
            CellNotFoundError: When cell is not found
            InsufficientBalanceError: When cell balance is insufficient
        """
        # Validate cell payment
        cell = self._validate_cell_payment(db, order_data)

        # Generate order identifiers
        order_id = self._generate_order_id()
        daily_num = self._get_next_daily_num(db)

        # Create order entity
        order = self._create_order_entity(db, order_data, order_id, daily_num, cell)

        # Create order items and options
        self._create_order_items(db, order, order_data.items)

        # Process cell payment if applicable
        if cell:
            self._process_cell_payment(db, cell, order_data.totalAmount, order.id)

        db.commit()
        db.refresh(order)

        return order

    def get_orders(
        self,
        db: Session,
        status: Optional[OrderStatus] = None,
        pay_type: Optional[PayType] = None,
        limit: int = 100,
        offset: int = 0
    ) -> tuple[List[Order], int]:
        """
        Get orders with filters and pagination

        Args:
            db: Database session
            status: Filter by order status
            pay_type: Filter by payment type
            limit: Page size
            offset: Page offset

        Returns:
            Tuple of (orders list, total count)
        """
        from sqlalchemy.orm import joinedload

        # Build query with eager loading
        query = db.query(Order).options(
            joinedload(Order.items).joinedload(OrderItem.options),
            joinedload(Order.cell)
        )

        # Apply filters
        if status:
            query = query.filter(Order.status == status)

        if pay_type:
            query = query.filter(Order.pay_type == pay_type)

        # Get total count
        total = query.count()

        # Apply pagination and sorting
        orders = query.order_by(Order.created_at.desc()).offset(offset).limit(limit).all()

        return orders, total

    def get_order_by_id(self, db: Session, order_id: str) -> Order:
        """
        Get order by order_id

        Args:
            db: Database session
            order_id: Order ID

        Returns:
            Order object

        Raises:
            OrderNotFoundError: When order is not found
        """
        from sqlalchemy.orm import joinedload

        order = db.query(Order).options(
            joinedload(Order.items).joinedload(OrderItem.options),
            joinedload(Order.cell)
        ).filter(Order.order_id == order_id).first()

        if not order:
            raise OrderNotFoundError(order_id)

        return order

    def update_order_status(
        self,
        db: Session,
        order_id: str,
        new_status: OrderStatus
    ) -> Order:
        """
        Update order status

        Args:
            db: Database session
            order_id: Order ID
            new_status: New status

        Returns:
            Updated Order object

        Raises:
            OrderNotFoundError: When order is not found
        """
        order = self.get_order_by_id(db, order_id)

        # Update status
        order.status = new_status

        # Update timestamps
        if new_status == OrderStatus.COMPLETED:
            order.completed_at = datetime.now()
        elif new_status == OrderStatus.CANCELLED:
            order.cancelled_at = datetime.now()

        db.commit()
        db.refresh(order)

        return order

    # Private helper methods

    def _validate_cell_payment(
        self,
        db: Session,
        order_data: CreateOrderRequest
    ) -> Optional[Cell]:
        """
        Validate cell payment requirements

        Returns:
            Cell object if CELL payment, None if PERSONAL payment

        Raises:
            MissingCellIdError: When cellId is missing
            CellNotFoundError: When cell is not found
            InsufficientBalanceError: When balance is insufficient
        """
        if order_data.payType != "CELL":
            return None

        # Check cellId is provided
        if not order_data.cellId:
            raise MissingCellIdError()

        # Find cell
        cell = db.query(Cell).filter(Cell.id == order_data.cellId).first()
        if not cell:
            raise CellNotFoundError(str(order_data.cellId))

        # Check balance
        if cell.balance < order_data.totalAmount:
            raise InsufficientBalanceError(cell.balance, order_data.totalAmount)

        return cell

    def _generate_order_id(self) -> str:
        """Generate unique order ID: ORD-{timestamp}-{random}"""
        timestamp = int(time.time() * 1000)
        random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
        return f"ORD-{timestamp}-{random_str}"

    def _get_next_daily_num(self, db: Session) -> int:
        """
        Get next daily number (1-12 cycling)

        NOTE: This has a race condition issue with concurrent requests.
        TODO: Implement proper locking mechanism (DB lock or Redis)
        """
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

    def _create_order_entity(
        self,
        db: Session,
        order_data: CreateOrderRequest,
        order_id: str,
        daily_num: int,
        cell: Optional[Cell]
    ) -> Order:
        """Create Order entity"""
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

        return order

    def _create_order_items(
        self,
        db: Session,
        order: Order,
        items: List[OrderItemRequest]
    ) -> None:
        """Create OrderItem and OrderItemOption entities"""
        for item_data in items:
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
            self._create_order_item_options(db, order_item, item_data)

    def _create_order_item_options(
        self,
        db: Session,
        order_item: OrderItem,
        item_data: OrderItemRequest
    ) -> None:
        """Create OrderItemOption entities"""
        for option_group in item_data.selectedOptions:
            for option_item in option_group.items:
                order_item_option = OrderItemOption(
                    order_item_id=order_item.id,
                    option_group_name=option_group.groupName,
                    option_item_name=option_item.name,
                    option_item_price=option_item.price
                )
                db.add(order_item_option)

    def _process_cell_payment(
        self,
        db: Session,
        cell: Cell,
        amount: int,
        order_id: int
    ) -> None:
        """
        Process cell payment: deduct balance and create transaction

        Args:
            db: Database session
            cell: Cell object
            amount: Amount to deduct
            order_id: Order database ID (not order_id string)
        """
        # Deduct balance
        cell.balance -= amount

        # Create point transaction
        transaction = PointTransaction(
            cell_id=cell.id,
            type=TransactionType.USE,
            amount=-amount,
            balance_after=cell.balance,
            order_id=order_id,
            memo=None
        )
        db.add(transaction)
