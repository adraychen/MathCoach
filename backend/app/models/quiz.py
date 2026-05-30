"""
Pydantic models for quiz sessions.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel

from .question import Question


class QuizStart(BaseModel):
    """Request to start a new quiz."""
    program: str = "waterloo_gauss"
    topic: str = "all"
    difficulty: str = "part_a"
    num_questions: int = 5


class QuizQuestionState(BaseModel):
    """State for a single question in a quiz."""
    question_id: str
    start_time: datetime
    time_to_correct: Optional[float] = None
    is_correct: bool = False
    attempts: int = 0
    selected_answer: Optional[str] = None


class QuizSession(BaseModel):
    """Quiz session state."""
    session_id: str
    questions: list[Question]
    current_index: int = 0
    question_states: dict[str, QuizQuestionState]
    created_at: datetime
    completed: bool = False


class QuizAnswer(BaseModel):
    """Submit an answer to a question."""
    question_id: str
    selected_answer: str


class QuizAnswerResult(BaseModel):
    """Result of submitting an answer."""
    correct: bool
    correct_answer: Optional[str] = None  # Only revealed after correct
    attempts: int
    time_elapsed: float
    coaching_message: Optional[str] = None


class QuizScoreBreakdown(BaseModel):
    """Score breakdown by difficulty."""
    part_a_correct: int = 0
    part_a_total: int = 0
    part_b_correct: int = 0
    part_b_total: int = 0
    part_c_correct: int = 0
    part_c_total: int = 0


class QuizResults(BaseModel):
    """Final quiz results."""
    session_id: str
    score: int
    total_possible: int
    correct_count: int
    incorrect_count: int
    blank_count: int
    blank_bonus: int
    average_time_seconds: float
    breakdown: QuizScoreBreakdown
    question_results: list[QuizQuestionState]
