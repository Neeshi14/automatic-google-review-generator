from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import OperationalError

from app.config import get_settings
from app.database import Base, engine
from app.routers.businesses import dashboard_router, router as businesses_router
from app.routers.review_sessions import router as review_sessions_router


settings = get_settings()

app = FastAPI(
    title="AI Google Review QR Generator",
    description="Generate compliant Google Review QR sessions with AI-assisted review drafting.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="app/static"), name="static")
app.include_router(businesses_router)
app.include_router(dashboard_router)
app.include_router(review_sessions_router)


@app.on_event("startup")
def create_tables() -> None:
    Base.metadata.create_all(bind=engine)


@app.exception_handler(OperationalError)
async def database_connection_error(_request: Request, _exc: OperationalError) -> JSONResponse:
    return JSONResponse(
        status_code=503,
        content={
            "detail": (
                "Database connection failed. Check that PostgreSQL is running and that DATABASE_URL "
                "in backend/.env uses the correct username, password, host, port, and database name."
            )
        },
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
