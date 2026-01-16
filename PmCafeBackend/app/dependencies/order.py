"""
Order service dependency injection
"""
from app.services.order_service import OrderService


def get_order_service() -> OrderService:
    """Get OrderService instance for dependency injection"""
    return OrderService()
