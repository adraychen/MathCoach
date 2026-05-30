"""
PostgreSQL database connection using SQLAlchemy.
Uses Supabase Transaction Pooler for connection management.
"""

from functools import lru_cache
from sqlalchemy import create_engine, Column, String, JSON, Text
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy.pool import QueuePool

from .config import get_settings


@lru_cache
def get_engine():
    """Create and cache database engine."""
    settings = get_settings()
    return create_engine(
        settings.supabase_url,
        poolclass=QueuePool,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,  # Verify connections before use
    )


def get_session_local():
    """Get sessionmaker bound to engine."""
    return sessionmaker(autocommit=False, autoflush=False, bind=get_engine())

Base = declarative_base()


# SQLAlchemy model for questions table
class QuestionModel(Base):
    """SQLAlchemy model for mathcoach_questions table."""
    __tablename__ = "mathcoach_questions"

    id = Column(String, primary_key=True)
    program = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    subtopic = Column(String, nullable=True)
    difficulty = Column(String, nullable=False)
    archetype = Column(String, nullable=True)
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)
    correct_answer = Column(String(1), nullable=False)
    reasoning_skills = Column(JSON, default=list)
    misconceptions = Column(JSON, default=list)
    distractor_rationale = Column(JSON, nullable=True)
    solution = Column(JSON, nullable=True)
    coaching_hints = Column(JSON, default=list)
    question_metadata = Column("metadata", JSON, nullable=True)  # 'metadata' is reserved in SQLAlchemy


def get_db() -> Session:
    """Dependency for FastAPI routes - yields database session."""
    SessionLocal = get_session_local()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables (create if not exists)."""
    Base.metadata.create_all(bind=get_engine())
