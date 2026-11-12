"""NEXUM API entrypoint.

Run from the backend folder:
    uvicorn app.main:app --reload --port 8000
Docs: http://localhost:8000/docs
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import ALLOWED_ORIGINS, UPLOAD_DIR
from .database import init_db
from .routes import analysis, conflicts, health, projects, reports, sources, workspace
from .utils.errors import AppError, app_error_handler


@asynccontextmanager
async def lifespan(_app: FastAPI):
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    init_db()
    yield


app = FastAPI(
    title="NEXUM API",
    version="1.0.0",
    description=(
        "Project-continuity backend: uploads, page-aware chunking, evidence-verified AI "
        "analysis, conflicts and handover reports."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(AppError, app_error_handler)


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    first = exc.errors()[0] if exc.errors() else {}
    field = ".".join(str(part) for part in first.get("loc", []) if part != "body")
    message = first.get("msg", "Invalid request.")
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "validation_error",
                "message": f"{field}: {message}" if field else message,
            }
        },
    )


@app.get("/", include_in_schema=False)
def root() -> dict:
    return {"name": "NEXUM API", "docs": "/docs", "health": "/api/health"}


for router in (
    health.router,
    projects.router,
    sources.router,
    analysis.router,
    conflicts.router,
    reports.router,
    workspace.router,
):
    app.include_router(router, prefix="/api")
