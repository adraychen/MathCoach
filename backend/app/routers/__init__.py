from .questions import router as questions_router
from .quiz import router as quiz_router
from .coaching import router as coaching_router
from .generation import router as generation_router

__all__ = [
    "questions_router",
    "quiz_router",
    "coaching_router",
    "generation_router",
]
