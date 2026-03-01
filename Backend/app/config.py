"""Typed settings using pydantic-settings.

All backend configuration comes from env/.env, validated once and
cached via get_settings().
"""
from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str = Field(alias="SUPABASE_URL")
    supabase_service_role_key: str = Field(alias="SUPABASE_SERVICE_ROLE_KEY")
    supabase_anon_key: str | None = Field(default=None, alias="SUPABASE_ANON_KEY")
    supabase_jwt_secret: str = Field(alias="SUPABASE_JWT_SECRET")
    openai_api_key: str | None = Field(default=None, alias="OPENAI_API_KEY")
    # Optional: Groq API key for future LLM + vision usage.
    groq_api_key: str | None = Field(default=None, alias="GROQ_API_KEY")
    # OCR engine selector; see app.ocr.factory.get_ocr_engine for options.
    ocr_engine: str = Field(default="tesseract", alias="OCR_ENGINE")
    # Accept a simple comma-separated string in .env and expose a parsed list.
    cors_origins_raw: str = Field(default="http://localhost:3000", alias="CORS_ORIGINS")

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.cors_origins_raw.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()  # type: ignore[arg-type]

