"""
Menu API tests
Based on docs/backend/02-menu-api.md
"""
import pytest


class TestMenusList:
    """Test GET /api/v1/menus - Public endpoint"""

    def test_get_menus_empty(self, client):
        """Test getting menus when database is empty"""
        response = client.get("/api/v1/menus")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)
        assert len(data["data"]) == 0

    def test_get_menus_with_data(self, client, sample_categories, db_session):
        """Test getting menus with sample data"""
        from app.models.menu import Menu

        # Create sample menu
        menu = Menu(
            name="아메리카노",
            eng_name="Americano",
            price=3000,
            category_id=sample_categories[0].id,  # COFFEE
            is_sold_out=False,
            is_active=True,
            display_order=1
        )
        db_session.add(menu)
        db_session.commit()

        response = client.get("/api/v1/menus")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["data"]) == 1
        assert data["data"][0]["name"] == "아메리카노"
        assert data["data"][0]["price"] == 3000

    def test_get_menus_filter_by_category(self, client, sample_categories, db_session):
        """Test filtering menus by category"""
        from app.models.menu import Menu

        # Create menus in different categories
        coffee_menu = Menu(name="아메리카노", price=3000, category_id=sample_categories[0].id)
        dessert_menu = Menu(name="쿠키", price=2000, category_id=sample_categories[2].id)
        db_session.add_all([coffee_menu, dessert_menu])
        db_session.commit()

        # Filter by COFFEE category
        response = client.get(f"/api/v1/menus?category_id={sample_categories[0].id}")
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) == 1
        assert data["data"][0]["name"] == "아메리카노"

    def test_get_menus_hide_inactive(self, client, sample_categories, db_session):
        """Test that inactive menus are hidden by default"""
        from app.models.menu import Menu

        # Create active and inactive menus
        active_menu = Menu(name="아메리카노", price=3000, category_id=sample_categories[0].id, is_active=True)
        inactive_menu = Menu(name="단종메뉴", price=3000, category_id=sample_categories[0].id, is_active=False)
        db_session.add_all([active_menu, inactive_menu])
        db_session.commit()

        response = client.get("/api/v1/menus")
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) == 1
        assert data["data"][0]["name"] == "아메리카노"


class TestMenuDetail:
    """Test GET /api/v1/menus/{id}"""

    def test_get_menu_detail(self, client, sample_categories, sample_option_groups, db_session):
        """Test getting menu detail with options"""
        from app.models.menu import Menu, MenuOptionGroup

        # Create menu
        menu = Menu(
            name="아메리카노",
            eng_name="Americano",
            price=3000,
            category_id=sample_categories[0].id
        )
        db_session.add(menu)
        db_session.commit()
        db_session.refresh(menu)

        # Link option group
        menu_option = MenuOptionGroup(
            menu_id=menu.id,
            option_group_id=sample_option_groups[0].id,
            display_order=1
        )
        db_session.add(menu_option)
        db_session.commit()

        response = client.get(f"/api/v1/menus/{menu.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["name"] == "아메리카노"
        assert data["data"]["price"] == 3000
        assert "option_groups" in data["data"]
        assert len(data["data"]["option_groups"]) == 1
        assert data["data"]["option_groups"][0]["name"] == "온도 선택"

    def test_get_menu_not_found(self, client):
        """Test getting non-existent menu"""
        response = client.get("/api/v1/menus/999")
        assert response.status_code == 404
        data = response.json()
        assert data["success"] is False
        assert data["error"]["code"] == "MENU_NOT_FOUND"
