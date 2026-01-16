"""
Authentication API routes
Based on docs/backend/01-auth-api.md
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, LoginResponse, UserResponse
from app.utils.auth import verify_password, create_access_token
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post("/login", response_model=dict)
def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    관리자 로그인

    - **username**: 사용자 아이디
    - **password**: 비밀번호
    """
    # Find user
    user = db.query(User).filter(User.username == credentials.username).first()

    # Verify credentials
    if not user or not verify_password(credentials.password, user.password_hash):
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "success": False,
                "error": {
                    "code": "INVALID_CREDENTIALS",
                    "message": "아이디 또는 비밀번호가 올바르지 않습니다"
                }
            }
        )

    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()

    # Create access token
    access_token = create_access_token(
        data={
            "user_id": user.id,
            "username": user.username,
            "role": user.role.value
        }
    )

    # Prepare user response
    user_data = UserResponse(
        id=user.id,
        username=user.username,
        name=user.name,
        role=user.role.value,
        last_login=user.last_login
    )

    return {
        "success": True,
        "data": {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_data.model_dump()
        }
    }


@router.get("/verify", response_model=dict)
def verify_token(current_user: User = Depends(get_current_user)):
    """
    토큰 검증

    현재 로그인된 사용자 정보 반환
    """
    user_data = UserResponse(
        id=current_user.id,
        username=current_user.username,
        name=current_user.name,
        role=current_user.role.value,
        last_login=current_user.last_login
    )

    return {
        "success": True,
        "data": user_data.model_dump()
    }
