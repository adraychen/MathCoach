"""
Supabase database client for MathCoach.
"""

from functools import lru_cache
from supabase import create_client, Client

from .config import get_settings


@lru_cache
def get_supabase() -> Client:
    """Get cached Supabase client instance."""
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_key)


def get_db() -> Client:
    """Dependency for FastAPI routes."""
    return get_supabase()
