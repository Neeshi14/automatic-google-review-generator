from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text
from sqlalchemy.exc import OperationalError

from app.config import get_settings
from app.database import Base, engine
from app.routers.auth import router as auth_router
from app.routers.businesses import dashboard_router, router as businesses_router
from app.routers.review_sessions import router as review_sessions_router


settings = get_settings()

APP_DIR = Path(__file__).resolve().parent
STATIC_DIR = APP_DIR / "static"
QR_CODE_DIR = STATIC_DIR / "qrcodes"

STATIC_DIR.mkdir(parents=True, exist_ok=True)
QR_CODE_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="AI Google Review QR Generator",
    description="Generate compliant Google Review QR sessions with AI-assisted review drafting.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origins=[
        "https://automatic-google-review-generator.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
app.include_router(auth_router)
app.include_router(businesses_router)
app.include_router(dashboard_router)
app.include_router(review_sessions_router)


@app.on_event("startup")
def create_tables() -> None:
    Base.metadata.create_all(bind=engine)
    ensure_existing_schema()


def ensure_existing_schema() -> None:
    inspector = inspect(engine)
    if "businesses" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("businesses")}
    if "owner_user_id" in columns:
        return

    with engine.begin() as connection:
        if engine.dialect.name == "postgresql":
            connection.execute(text("ALTER TABLE businesses ADD COLUMN owner_user_id UUID REFERENCES users(id)"))
            connection.execute(text("CREATE INDEX IF NOT EXISTS ix_businesses_owner_user_id ON businesses (owner_user_id)"))
        else:
            connection.execute(text("ALTER TABLE businesses ADD COLUMN owner_user_id CHAR(32)"))


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
