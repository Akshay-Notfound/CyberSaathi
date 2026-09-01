from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    # App
    APP_NAME: str = "AI-Powered Cyber Crime Complaint & Assistance System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://cybercrime_user:cybercrime_pass@localhost:5432/cybercrime_db"
    SYNC_DATABASE_URL: str = "postgresql://cybercrime_user:cybercrime_pass@localhost:5432/cybercrime_db"

    # Google Gemini
    GEMINI_API_KEY: str = ""

    # JWT
    SECRET_KEY: str = "dev-secret-key-change-in-production-must-be-long-enough"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # File uploads
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    # OCR
    TESSERACT_CMD: str = "tesseract"

    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
