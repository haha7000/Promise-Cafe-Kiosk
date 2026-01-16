"""
Authentication API tests
Based on docs/backend/01-auth-api.md
"""
import pytest


class TestAuthLogin:
    """Test POST /api/v1/auth/login"""

    def test_login_success(self, client, sample_admin_user):
        """Test successful login with correct credentials"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "username": "admin",
                "password": "admin123"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "access_token" in data["data"]
        assert data["data"]["token_type"] == "bearer"
        assert "user" in data["data"]
        assert data["data"]["user"]["username"] == "admin"
        assert data["data"]["user"]["role"] == "SUPER"

    def test_login_wrong_password(self, client, sample_admin_user):
        """Test login with wrong password"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "username": "admin",
                "password": "wrongpassword"
            }
        )
        assert response.status_code == 401
        data = response.json()
        assert data["success"] is False
        assert data["error"]["code"] == "INVALID_CREDENTIALS"

    def test_login_user_not_found(self, client):
        """Test login with non-existent user"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "username": "nonexistent",
                "password": "password"
            }
        )
        assert response.status_code == 401
        data = response.json()
        assert data["success"] is False
        assert data["error"]["code"] == "INVALID_CREDENTIALS"

    def test_login_missing_fields(self, client):
        """Test login with missing fields"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "username": "admin"
            }
        )
        assert response.status_code == 422  # Validation error


class TestAuthVerify:
    """Test GET /api/v1/auth/verify"""

    def test_verify_valid_token(self, client, sample_admin_user):
        """Test token verification with valid token"""
        # First login to get token
        login_response = client.post(
            "/api/v1/auth/login",
            json={
                "username": "admin",
                "password": "admin123"
            }
        )
        token = login_response.json()["data"]["access_token"]

        # Verify token
        response = client.get(
            "/api/v1/auth/verify",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["username"] == "admin"
        assert data["data"]["role"] == "SUPER"

    def test_verify_no_token(self, client):
        """Test verification without token"""
        response = client.get("/api/v1/auth/verify")
        assert response.status_code == 401

    def test_verify_invalid_token(self, client):
        """Test verification with invalid token"""
        response = client.get(
            "/api/v1/auth/verify",
            headers={"Authorization": "Bearer invalid_token"}
        )
        assert response.status_code == 401
