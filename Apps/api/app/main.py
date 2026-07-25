from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import Base, SessionLocal, engine, get_db
from app.models import SystemInfo
from app.schemas import HealthResponse, SystemInfoResponse

settings = get_settings()


def seed_system_info() -> None:
    with SessionLocal() as database:
        existing = database.scalar(
            select(SystemInfo).where(SystemInfo.name == "application")
        )
        if existing is None:
            database.add(
                SystemInfo(
                    name="application",
                    value="Esports Market Intelligence",
                )
            )
            database.commit()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_system_info()
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/")
def root() -> dict[str, str]:
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
    }


@app.get("/health", response_model=HealthResponse)
def health(database: Session = Depends(get_db)) -> HealthResponse:
    try:
        database.execute(text("SELECT 1"))
    except SQLAlchemyError as error:
        raise HTTPException(
            status_code=503,
            detail="Database is unavailable",
        ) from error

    return HealthResponse(
        status="healthy",
        database="connected",
        version=settings.app_version,
        environment=settings.app_env,
    )


@app.get("/version")
def version() -> dict[str, str]:
    return {"version": settings.app_version}


@app.get("/system-info", response_model=list[SystemInfoResponse])
def system_info(
    database: Session = Depends(get_db),
) -> list[SystemInfo]:
    return list(database.scalars(select(SystemInfo).order_by(SystemInfo.name)))
