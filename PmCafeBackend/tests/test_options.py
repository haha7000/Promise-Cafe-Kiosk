"""
Option API tests
Based on docs/backend/04-option-api.md
"""
import pytest


class TestOptionGroupList:
    """Test GET /api/v1/option-groups"""

    def test_get_option_groups_with_items(self, client, sample_option_groups):
        """Test getting option groups with items included"""
        response = client.get("/api/v1/option-groups")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["data"]) == 1  # sample_option_groups creates 1 group
        
        # Check group structure
        group = data["data"][0]
        assert group["name"] == "온도 선택"
        assert group["type"] == "SINGLE"
        assert group["isRequired"] is True
        assert "items" in group
        assert len(group["items"]) == 2  # HOT, ICE

    def test_get_option_groups_items_sorted(self, client, sample_option_groups):
        """Test that items are sorted by displayOrder"""
        response = client.get("/api/v1/option-groups")
        assert response.status_code == 200
        data = response.json()
        
        items = data["data"][0]["items"]
        for i in range(len(items) - 1):
            assert items[i]["displayOrder"] <= items[i + 1]["displayOrder"]

    def test_get_option_groups_without_items(self, client, sample_option_groups):
        """Test getting option groups without items"""
        response = client.get("/api/v1/option-groups?includeItems=false")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        
        # Items should not be included
        group = data["data"][0]
        assert "items" not in group or len(group.get("items", [])) == 0

    def test_get_option_groups_sorted_by_display_order(self, client, db_session):
        """Test that groups are sorted by displayOrder"""
        from app.models.menu import OptionGroup, OptionType
        
        # Create multiple groups
        groups = [
            OptionGroup(name="그룹3", type=OptionType.SINGLE, is_required=False, display_order=3),
            OptionGroup(name="그룹1", type=OptionType.SINGLE, is_required=True, display_order=1),
            OptionGroup(name="그룹2", type=OptionType.MULTIPLE, is_required=False, display_order=2),
        ]
        db_session.add_all(groups)
        db_session.commit()
        
        response = client.get("/api/v1/option-groups")
        assert response.status_code == 200
        data = response.json()
        
        # Check if sorted
        assert data["data"][0]["name"] == "그룹1"
        assert data["data"][1]["name"] == "그룹2"
        assert data["data"][2]["name"] == "그룹3"
