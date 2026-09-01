"""
AI-Powered Cyber Crime Complaint & Assistance System
FastAPI Application Entrypoint
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import logging

from app.core.config import settings
from app.core.database import create_tables
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
    await create_tables()
    logger.info("✓ Database tables created/verified")

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
