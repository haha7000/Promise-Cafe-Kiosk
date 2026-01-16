"""
Custom business exceptions for P.M CAFE API
"""
from typing import Optional


class BusinessException(Exception):
    """Base exception for business logic errors"""

    def __init__(self, message: str, code: str):
        self.message = message
        self.code = code
        super().__init__(self.message)


# Authentication & Authorization
class AuthenticationError(BusinessException):
    """Raised when authentication fails"""

    def __init__(self, message: str = "인증에 실패했습니다"):
        super().__init__(message, "AUTHENTICATION_FAILED")


class AuthorizationError(BusinessException):
    """Raised when user lacks permission"""

    def __init__(self, message: str = "권한이 없습니다"):
        super().__init__(message, "AUTHORIZATION_FAILED")


# Resource Not Found
class ResourceNotFoundError(BusinessException):
    """Raised when requested resource is not found"""

    def __init__(self, resource: str, identifier: Optional[str] = None):
        message = f"{resource}을(를) 찾을 수 없습니다"
        if identifier:
            message = f"{resource} (ID: {identifier})을(를) 찾을 수 없습니다"
        super().__init__(message, f"{resource.upper()}_NOT_FOUND")


class CellNotFoundError(ResourceNotFoundError):
    """Raised when cell is not found"""

    def __init__(self, cell_id: Optional[str] = None):
        super().__init__("셀", cell_id)
        self.code = "CELL_NOT_FOUND"


class MenuNotFoundError(ResourceNotFoundError):
    """Raised when menu is not found"""

    def __init__(self, menu_id: Optional[str] = None):
        super().__init__("메뉴", menu_id)
        self.code = "MENU_NOT_FOUND"


class OrderNotFoundError(ResourceNotFoundError):
    """Raised when order is not found"""

    def __init__(self, order_id: Optional[str] = None):
        super().__init__("주문", order_id)
        self.code = "ORDER_NOT_FOUND"


class CategoryNotFoundError(ResourceNotFoundError):
    """Raised when category is not found"""

    def __init__(self, category_id: Optional[str] = None):
        super().__init__("카테고리", category_id)
        self.code = "CATEGORY_NOT_FOUND"


# Business Logic Errors
class InsufficientBalanceError(BusinessException):
    """Raised when cell balance is insufficient"""

    def __init__(self, balance: int, required: int):
        message = f"포인트가 부족합니다 (잔액: {balance:,}원, 필요: {required:,}원)"
        super().__init__(message, "INSUFFICIENT_BALANCE")
        self.balance = balance
        self.required = required


class MissingCellIdError(BusinessException):
    """Raised when cellId is required but not provided"""

    def __init__(self):
        super().__init__("셀 결제시 cellId가 필요합니다", "MISSING_CELL_ID")


class InvalidCellAuthError(BusinessException):
    """Raised when cell authentication fails"""

    def __init__(self):
        super().__init__("휴대폰 번호가 일치하지 않습니다", "INVALID_CELL_AUTH")


class MenuSoldOutError(BusinessException):
    """Raised when menu is sold out"""

    def __init__(self, menu_name: str):
        super().__init__(f"{menu_name}은(는) 품절되었습니다", "MENU_SOLD_OUT")


class InvalidOrderStatusTransitionError(BusinessException):
    """Raised when order status transition is invalid"""

    def __init__(self, current: str, target: str):
        super().__init__(
            f"주문 상태를 {current}에서 {target}로 변경할 수 없습니다",
            "INVALID_STATUS_TRANSITION"
        )


# Validation Errors
class ValidationError(BusinessException):
    """Raised when validation fails"""

    def __init__(self, message: str):
        super().__init__(message, "VALIDATION_ERROR")


class DuplicateResourceError(BusinessException):
    """Raised when trying to create duplicate resource"""

    def __init__(self, resource: str, field: str, value: str):
        message = f"{resource}이(가) 이미 존재합니다 ({field}: {value})"
        super().__init__(message, "DUPLICATE_RESOURCE")
