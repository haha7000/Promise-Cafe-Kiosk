"""
Category API tests
Based on docs/backend/03-category-api.md
"""
import pytest


class TestCategoryList:
    """Test GET /api/v1/categories"""

    def test_get_categories_with_data(self, client, sample_categories):
        """Test getting categories with sample data"""
        response = client.get("/api/v1/categories")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["data"]) == 4
        assert data["data"][0]["code"] == "COFFEE"
        assert data["data"][0]["name"] == "커피"
        assert data["data"][0]["isActive"] is True

    def test_get_categories_sorted_by_display_order(self, client, sample_categories):
        """Test categories are sorted by displayOrder"""
        response = client.get("/api/v1/categories")
        assert response.status_code == 200
        data = response.json()
        # Check if sorted by display_order
        for i in range(len(data["data"]) - 1):
            assert data["data"][i]["displayOrder"] <= data["data"][i + 1]["displayOrder"]

    def test_get_categories_exclude_inactive_by_default(self, client, sample_categories, db_session):
        """Test that inactive categories are excluded by default"""
        from app.models.menu import Category

        # Make one category inactive
        category = db_session.query(Category).first()
        category.is_active = False
        db_session.commit()

        response = client.get("/api/v1/categories")
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) == 3  # One is inactive

    def test_get_categories_include_inactive(self, client, sample_categories, db_session):
        """Test including inactive categories"""
        from app.models.menu import Category

        # Make one category inactive
        category = db_session.query(Category).first()
        category.is_active = False
        db_session.commit()

        response = client.get("/api/v1/categories?includeInactive=true")
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) == 4  # All categories
