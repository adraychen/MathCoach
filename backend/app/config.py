"""
Configuration management for MathCoach backend.
Loads environment variables with validation.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Environment
    environment: str = "development"
    debug: bool = False

    # Database (PostgreSQL via Supabase Transaction Pooler)
    supabase_url: str

    # Groq AI
    groq_api_key: str

    # CORS - comma-separated string
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    def get_cors_origins_list(self) -> list[str]:
        """Parse CORS origins string into list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
