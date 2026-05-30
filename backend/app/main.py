"""
MathCoach FastAPI Backend
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .routers import questions_router, quiz_router, coaching_router, generation_router

settings = get_settings()

app = FastAPI(
    title="MathCoach API",
    description="AI-powered adaptive math learning platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(questions_router)
app.include_router(quiz_router)
app.include_router(coaching_router)
app.include_router(generation_router)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "app": "MathCoach API",
        "version": "1.0.0",
    }


@app.get("/health")
async def health():
    """Health check for deployment."""
    return {"status": "healthy"}
