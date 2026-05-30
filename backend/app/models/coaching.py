"""
Pydantic models for Socratic coaching.
"""

from typing import Optional
from pydantic import BaseModel


class ChatMessage(BaseModel):
    """A single message in coaching conversation."""
    role: str  # "user" or "assistant"
    content: str


class CoachingRequest(BaseModel):
    """Request for initial coaching hint."""
    question_id: str
    question_text: str
    options: dict[str, str]
    coaching_hints: list[str] = []


class MisconceptionRequest(BaseModel):
    """Request for misconception-based coaching."""
    question_id: str
    question_text: str
    options: dict[str, str]
    correct_answer: str
    selected_answer: str
    misconceptions: list[str] = []
    distractor_rationale: Optional[dict[str, Optional[str]]] = None
    key_insight: Optional[str] = None


class FollowupRequest(BaseModel):
    """Request for followup coaching."""
    question_id: str
    question_text: str
    correct_answer: str
    coaching_hints: list[str] = []
    key_insight: Optional[str] = None
    conversation_history: list[ChatMessage]


class CoachingResponse(BaseModel):
    """Coaching response from AI."""
    message: str
    question_id: str
