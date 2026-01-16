"""
Order API tests
Based on docs/backend/06-order-api.md
"""
import pytest


class TestOrderCreate:
    """Test POST /api/v1/orders"""

    def test_create_order_cell_payment_success(self, client, sample_cell, sample_categories, db_session):
        """Test successful order creation with cell payment"""
        from app.models.menu import Menu

        # Create a menu
        menu = Menu(
            name="아메리카노",
            eng_name="Americano",
            price=3500,
            category_id=sample_categories[0].id
        )
        db_session.add(menu)
        db_session.commit()
        db_session.refresh(menu)

        order_data = {
            "payType": "CELL",
            "cellId": sample_cell.id,
            "items": [
                {
                    "menuId": menu.id,
                    "menuName": "아메리카노",
                    "menuPrice": 3500,
                    "quantity": 2,
                    "selectedOptions": [
                        {
                            "groupName": "온도 선택",
                            "items": [{"name": "HOT", "price": 0}]
                        }
                    ]
                }
            ],
            "totalAmount": 7000
        }

        response = client.post("/api/v1/orders", json=order_data)
        if response.status_code != 201:
            print(f"\nError: {response.json()}")
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "orderId" in data["data"]
        assert data["data"]["dailyNum"] >= 1
        assert data["data"]["dailyNum"] <= 12
        assert data["data"]["payType"] == "CELL"
        assert data["data"]["cellInfo"]["id"] == sample_cell.id
        assert data["data"]["totalAmount"] == 7000
        assert data["data"]["status"] == "PENDING"

    def test_create_order_personal_payment_success(self, client, sample_categories, db_session):
        """Test successful order creation with personal payment"""
        from app.models.menu import Menu

        menu = Menu(
            name="카페라떼",
            price=4000,
            category_id=sample_categories[0].id
        )
        db_session.add(menu)
        db_session.commit()
        db_session.refresh(menu)

        order_data = {
            "payType": "PERSONAL",
            "items": [
                {
                    "menuId": menu.id,
                    "menuName": "카페라떼",
                    "menuPrice": 4000,
                    "quantity": 1,
                    "selectedOptions": []
                }
            ],
            "totalAmount": 4000
        }

        response = client.post("/api/v1/orders", json=order_data)
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["data"]["payType"] == "PERSONAL"
        assert data["data"]["cellInfo"] is None

    def test_create_order_insufficient_balance(self, client, sample_cell, sample_categories, db_session):
        """Test order creation with insufficient balance"""
        from app.models.menu import Menu

        menu = Menu(
            name="비싼메뉴",
            price=50000,
            category_id=sample_categories[0].id
        )
        db_session.add(menu)
        db_session.commit()
        db_session.refresh(menu)

        order_data = {
            "payType": "CELL",
            "cellId": sample_cell.id,
            "items": [
                {
                    "menuId": menu.id,
                    "menuName": "비싼메뉴",
                    "menuPrice": 50000,
                    "quantity": 1,
                    "selectedOptions": []
                }
            ],
            "totalAmount": 50000
        }

        response = client.post("/api/v1/orders", json=order_data)
        assert response.status_code == 400
        data = response.json()
        assert data["success"] is False
        assert data["error"]["code"] == "INSUFFICIENT_BALANCE"

    def test_create_order_cell_not_found(self, client, sample_categories, db_session):
        """Test order creation with non-existent cell"""
        from app.models.menu import Menu

        menu = Menu(
            name="아메리카노",
            price=3500,
            category_id=sample_categories[0].id
        )
        db_session.add(menu)
        db_session.commit()

        order_data = {
            "payType": "CELL",
            "cellId": 9999,
            "items": [
                {
                    "menuId": menu.id,
                    "menuName": "아메리카노",
                    "menuPrice": 3500,
                    "quantity": 1,
                    "selectedOptions": []
                }
            ],
            "totalAmount": 3500
        }

        response = client.post("/api/v1/orders", json=order_data)
        assert response.status_code == 404
        data = response.json()
        assert data["success"] is False
        assert data["error"]["code"] == "CELL_NOT_FOUND"

    def test_create_order_missing_cell_id(self, client, sample_categories, db_session):
        """Test order creation with CELL payment but missing cellId"""
        from app.models.menu import Menu

        menu = Menu(
            name="아메리카노",
            price=3500,
            category_id=sample_categories[0].id
        )
        db_session.add(menu)
        db_session.commit()

        order_data = {
            "payType": "CELL",
            "items": [
                {
                    "menuId": menu.id,
                    "menuName": "아메리카노",
                    "menuPrice": 3500,
                    "quantity": 1,
                    "selectedOptions": []
                }
            ],
            "totalAmount": 3500
        }

        response = client.post("/api/v1/orders", json=order_data)
        assert response.status_code == 400

    def test_create_order_empty_items(self, client):
        """Test order creation with empty items"""
        order_data = {
            "payType": "PERSONAL",
            "items": [],
            "totalAmount": 0
        }

        response = client.post("/api/v1/orders", json=order_data)
        assert response.status_code == 422  # Validation error


class TestOrderList:
    """Test GET /api/v1/orders"""

    def test_get_orders_empty(self, client):
        """Test getting orders when database is empty"""
        response = client.get("/api/v1/orders")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["data"]["orders"]) == 0
        assert data["data"]["total"] == 0

    def test_get_orders_with_data(self, client, sample_cell, sample_categories, db_session):
        """Test getting orders with sample data"""
        from app.models.menu import Menu
        from app.models.order import Order, OrderItem, OrderStatus, PayType

        # Create menu
        menu = Menu(name="아메리카노", price=3500, category_id=sample_categories[0].id)
        db_session.add(menu)
        db_session.commit()

        # Create order
        order = Order(
            order_id="ORD-123-test",
            daily_num=1,
            pay_type=PayType.CELL,
            cell_id=sample_cell.id,
            total_amount=7000,
            status=OrderStatus.PENDING
        )
        db_session.add(order)
        db_session.flush()

        # Create order item
        order_item = OrderItem(
            order_id=order.id,
            menu_id=menu.id,
            menu_name="아메리카노",
            menu_price=3500,
            quantity=2,
            total_price=7000
        )
        db_session.add(order_item)
        db_session.commit()

        response = client.get("/api/v1/orders")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["data"]["orders"]) == 1
        assert data["data"]["orders"][0]["orderId"] == "ORD-123-test"
        assert data["data"]["orders"][0]["dailyNum"] == 1
        assert data["data"]["total"] == 1

    def test_get_orders_filter_by_status(self, client, sample_cell, sample_categories, db_session):
        """Test filtering orders by status"""
        from app.models.menu import Menu
        from app.models.order import Order, OrderItem, OrderStatus, PayType

        menu = Menu(name="아메리카노", price=3500, category_id=sample_categories[0].id)
        db_session.add(menu)
        db_session.commit()

        # Create PENDING order
        order1 = Order(
            order_id="ORD-1",
            daily_num=1,
            pay_type=PayType.CELL,
            cell_id=sample_cell.id,
            total_amount=3500,
            status=OrderStatus.PENDING
        )
        # Create COMPLETED order
        order2 = Order(
            order_id="ORD-2",
            daily_num=2,
            pay_type=PayType.CELL,
            cell_id=sample_cell.id,
            total_amount=3500,
            status=OrderStatus.COMPLETED
        )
        db_session.add_all([order1, order2])
        db_session.commit()

        # Filter by PENDING
        response = client.get("/api/v1/orders?status=PENDING")
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]["orders"]) == 1
        assert data["data"]["orders"][0]["status"] == "PENDING"

    def test_get_orders_pagination(self, client, sample_cell, db_session):
        """Test order pagination"""
        from app.models.order import Order, OrderStatus, PayType

        # Create 5 orders
        for i in range(5):
            order = Order(
                order_id=f"ORD-{i}",
                daily_num=i+1,
                pay_type=PayType.PERSONAL,
                total_amount=3500,
                status=OrderStatus.PENDING
            )
            db_session.add(order)
        db_session.commit()

        # Get with limit 2
        response = client.get("/api/v1/orders?limit=2&offset=0")
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]["orders"]) == 2
        assert data["data"]["limit"] == 2
        assert data["data"]["offset"] == 0
        assert data["data"]["total"] == 5


class TestOrderStatusUpdate:
    """Test PATCH /api/v1/orders/:orderId/status"""

    def test_update_order_status_pending_to_making(self, client, sample_cell, db_session):
        """Test updating order status from PENDING to MAKING"""
        from app.models.order import Order, OrderStatus, PayType

        # Create PENDING order
        order = Order(
            order_id="ORD-test-1",
            daily_num=1,
            pay_type=PayType.PERSONAL,
            total_amount=3500,
            status=OrderStatus.PENDING
        )
        db_session.add(order)
        db_session.commit()

        response = client.patch(
            f"/api/v1/orders/{order.order_id}/status",
            json={"status": "MAKING"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["orderId"] == "ORD-test-1"
        assert data["data"]["status"] == "MAKING"

    def test_update_order_status_making_to_completed(self, client, db_session):
        """Test updating order status from MAKING to COMPLETED"""
        from app.models.order import Order, OrderStatus, PayType

        order = Order(
            order_id="ORD-test-2",
            daily_num=2,
            pay_type=PayType.PERSONAL,
            total_amount=3500,
            status=OrderStatus.MAKING
        )
        db_session.add(order)
        db_session.commit()

        response = client.patch(
            f"/api/v1/orders/{order.order_id}/status",
            json={"status": "COMPLETED"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["status"] == "COMPLETED"
        assert "updatedAt" in data["data"]

    def test_update_order_status_not_found(self, client):
        """Test updating non-existent order"""
        response = client.patch(
            "/api/v1/orders/ORD-nonexistent/status",
            json={"status": "MAKING"}
        )
        assert response.status_code == 404
        data = response.json()
        assert data["success"] is False
        assert data["error"]["code"] == "ORDER_NOT_FOUND"

    def test_update_order_status_invalid_status(self, client, db_session):
        """Test updating with invalid status"""
        from app.models.order import Order, OrderStatus, PayType

        order = Order(
            order_id="ORD-test-3",
            daily_num=3,
            pay_type=PayType.PERSONAL,
            total_amount=3500,
            status=OrderStatus.PENDING
        )
        db_session.add(order)
        db_session.commit()

        response = client.patch(
            f"/api/v1/orders/{order.order_id}/status",
            json={"status": "INVALID"}
        )
        assert response.status_code == 422  # Validation error
