"""
AI-Powered Cyber Crime Complaint & Assistance System
FastAPI Application Entrypoint
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import logging

from app.core.config import settings
from app.core.database import create_tables
import app.models  # noqa: F401
from app.api import auth, chat, evidence, complaint, models_comparison

# Configure logging
logging.basicConfig(level=logging.INFO if settings.DEBUG else logging.WARNING)
logger = logging.getLogger(__name__)

# ─── Application ──────────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "AI-powered cybercrime complaint analysis system using NLP, ML classification, "
        "OCR evidence processing, and structured complaint generation."
    ),
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────

origins = settings.allowed_origins_list
has_wildcard = any("*" in o for o in origins)

if has_wildcard:
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=r"^https?://.*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# ─── Routers ──────────────────────────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(evidence.router)
app.include_router(complaint.router)
app.include_router(models_comparison.router)

# ─── Startup Events ───────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")

    # Create database tables
    try:
        await create_tables()
        logger.info("✓ Database tables created/verified")
    except Exception as e:
        logger.warning(f"Database connection warning on startup: {e}")

    # Ensure upload directory exists
    Path(settings.UPLOAD_DIR).mkdir(exist_ok=True)
    logger.info(f"✓ Upload directory ready: {settings.UPLOAD_DIR}")

    # Pre-load ML models
    from app.ml.classifier import get_classifier
    classifier = get_classifier()
    logger.info("✓ Crime classifier ready")


@app.on_event("shutdown")
async def shutdown():
    logger.info("Shutting down application...")


# ─── Global Exception Handler ───────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global unhandled error on {request.url.path}: {exc}", exc_info=True)
    err_str = str(exc)
    if "Network is unreachable" in err_str or "101" in err_str or "asyncpg" in err_str:
        return JSONResponse(
            status_code=503,
            content={
                "detail": (
                    "Database unreachable: Please ensure DATABASE_URL in Render environment variables "
                    "uses Supabase's IPv4 Pooler URL (aws-0-ap-south-1.pooler.supabase.com) rather than direct IPv6 host."
                )
            },
        )
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {err_str}"},
    )


# ─── Health Check ─────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


@app.get("/")
async def root():
    return {
        "message": "AI-Powered Cyber Crime Complaint & Assistance System API",
        "docs": "/api/docs",
        "version": settings.APP_VERSION,
    }
