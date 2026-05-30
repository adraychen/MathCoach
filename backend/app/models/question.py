"""
Pydantic models for questions.
Based on schema/question_schema.json
"""

from typing import Optional
from pydantic import BaseModel, Field


class QuestionOptions(BaseModel):
    """Multiple choice options A-E."""
    A: str
    B: str
    C: str
    D: str
    E: str


class QuestionSolution(BaseModel):
    """Solution with steps and insights."""
    steps: list[str]
    key_insight: str
    common_approach: Optional[str] = None
    elegant_approach: Optional[str] = None


class QuestionMetadata(BaseModel):
    """Question metadata."""
    source: str = "human_authored"
    source_reference: Optional[str] = None
    has_diagram: bool = False
    diagram_description: Optional[str] = None
    estimated_time_seconds: int = 60
    cognitive_load: str = "low"
    computation_required: str = "simple"
    diagram_required: bool = False
    validated: bool = False
    validation_notes: Optional[str] = None


class Question(BaseModel):
    """Full question model."""
    id: str
    program: str
    topic: str
    subtopic: Optional[str] = None
    difficulty: str
    archetype: Optional[str] = None
    question_text: str
    options: QuestionOptions
    correct_answer: str = Field(pattern="^[A-E]$")
    reasoning_skills: list[str] = []
    misconceptions: list[str] = []
    distractor_rationale: Optional[dict[str, Optional[str]]] = None
    solution: Optional[QuestionSolution] = None
    coaching_hints: list[str] = []
    metadata: Optional[QuestionMetadata] = None


class QuestionCreate(BaseModel):
    """Model for creating a new question."""
    program: str = "waterloo_gauss"
    topic: str
    subtopic: Optional[str] = None
    difficulty: str = "part_a"
    archetype: Optional[str] = None
    question_text: str
    options: QuestionOptions
    correct_answer: str = Field(pattern="^[A-E]$")
    reasoning_skills: list[str] = []
    misconceptions: list[str] = []
    distractor_rationale: Optional[dict[str, Optional[str]]] = None
    solution: Optional[QuestionSolution] = None
    coaching_hints: list[str] = []
    metadata: Optional[QuestionMetadata] = None


class QuestionUpdate(BaseModel):
    """Model for updating a question (all fields optional)."""
    topic: Optional[str] = None
    subtopic: Optional[str] = None
    difficulty: Optional[str] = None
    archetype: Optional[str] = None
    question_text: Optional[str] = None
    options: Optional[QuestionOptions] = None
    correct_answer: Optional[str] = Field(default=None, pattern="^[A-E]$")
    reasoning_skills: Optional[list[str]] = None
    misconceptions: Optional[list[str]] = None
    distractor_rationale: Optional[dict[str, Optional[str]]] = None
    solution: Optional[QuestionSolution] = None
    coaching_hints: Optional[list[str]] = None
    metadata: Optional[QuestionMetadata] = None


class QuestionFilter(BaseModel):
    """Filters for listing questions."""
    program: Optional[str] = None
    topic: Optional[str] = None
    difficulty: Optional[str] = None
    archetype: Optional[str] = None
    validated: Optional[bool] = None
    limit: int = 50
    offset: int = 0


class QuestionList(BaseModel):
    """Paginated list of questions."""
    questions: list[Question]
    total: int
    limit: int
    offset: int
