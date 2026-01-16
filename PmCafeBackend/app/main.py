from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.routers import auth, menus, cells, orders, categories, options, statistics, settlements

app = FastAPI(
    title="P.M CAFE API",
    description="교회 카페 키오스크 백엔드 API",
    version="1.0.0",
)


# Custom exception handler for HTTPException
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom handler to unwrap detail if it's a dict"""
    if isinstance(exc.detail, dict):
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.detail
        )
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

# CORS 설정 (환경변수에서 로드)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, PUT, DELETE 등 모든 메서드 허용
    allow_headers=["*"],  # Authorization, Content-Type 등 모든 헤더 허용
)

# Register routers
app.include_router(auth.router)
app.include_router(menus.router)
app.include_router(cells.router)
app.include_router(orders.router)
app.include_router(categories.router)
app.include_router(options.router)
app.include_router(statistics.router)
app.include_router(settlements.router)


@app.get("/")
async def root():
    """API 루트 엔드포인트"""
    return {
        "message": "P.M CAFE API Server",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {"status": "healthy"}
