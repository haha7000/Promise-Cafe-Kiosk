"""
Cell API tests
Based on docs/backend/05-cell-api.md
"""
import pytest


class TestCellAuth:
    """Test POST /api/v1/cells/auth"""

    def test_cell_auth_success(self, client, sample_cell):
        """Test successful cell authentication"""
        response = client.post(
            "/api/v1/cells/auth",
            json={"phoneLast4": "1234"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["id"] == sample_cell.id
        assert data["data"]["name"] == "청년부"
        assert data["data"]["leader"] == "김셀장"
        assert data["data"]["balance"] == 10000

    def test_cell_auth_not_found(self, client):
        """Test cell authentication with non-existent phone number"""
        response = client.post(
            "/api/v1/cells/auth",
            json={"phoneLast4": "9999"}
        )
        assert response.status_code == 404
        data = response.json()
        assert data["success"] is False
        assert data["error"]["code"] == "CELL_NOT_FOUND"
        assert data["error"]["message"] == "등록된 셀 정보가 없습니다"

    def test_cell_auth_invalid_format(self, client):
        """Test cell authentication with invalid phone number format"""
        response = client.post(
            "/api/v1/cells/auth",
            json={"phoneLast4": "abc"}
        )
        assert response.status_code == 422  # Validation error

    def test_cell_auth_missing_field(self, client):
        """Test cell authentication with missing phoneLast4"""
        response = client.post(
            "/api/v1/cells/auth",
            json={}
        )
        assert response.status_code == 422  # Validation error
