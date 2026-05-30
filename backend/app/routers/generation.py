"""
Question generation endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..services.generation import (
    get_blueprints,
    generate_question,
    save_question_to_db,
)

router = APIRouter(prefix="/api/generation", tags=["generation"])


class BlueprintSummary(BaseModel):
    id: str
    blueprint_code: str
    blueprint_name: str
    primary_topic: str | None
    difficulty_level: str | None
    visual_required: bool | None


class BlueprintListResponse(BaseModel):
    blueprints: list[BlueprintSummary]


class GenerateRequest(BaseModel):
    blueprint_code: str
    count: int = 1
    save_to_db: bool = False


class GeneratedQuestion(BaseModel):
    id: str | None
    question_text: str | None
    options: dict[str, str] | None
    correct_answer: str | None
    coaching_hints: list[str] | None
    validation_issues: list[str]
    saved: bool = False


class GenerateResponse(BaseModel):
    questions: list[GeneratedQuestion]
    blueprint_code: str
    count: int


@router.get("/blueprints", response_model=BlueprintListResponse)
async def list_blueprints(db: Session = Depends(get_db)):
    """Get all active blueprints for question generation."""
    blueprints = get_blueprints(db)
    return BlueprintListResponse(
        blueprints=[BlueprintSummary(**b) for b in blueprints]
    )


@router.post("/generate", response_model=GenerateResponse)
async def generate_questions(
    request: GenerateRequest,
    db: Session = Depends(get_db),
):
    """Generate questions from a blueprint."""
    questions = []

    for i in range(1, request.count + 1):
        try:
            question = generate_question(db, request.blueprint_code, index=i)

            saved = False
            if request.save_to_db and not question.get("_validation_issues"):
                try:
                    save_question_to_db(db, question)
                    saved = True
                except Exception as e:
                    question["_validation_issues"] = question.get("_validation_issues", []) + [f"Save error: {str(e)}"]

            questions.append(GeneratedQuestion(
                id=question.get("id"),
                question_text=question.get("question_text"),
                options=question.get("options"),
                correct_answer=question.get("correct_answer"),
                coaching_hints=question.get("coaching_hints"),
                validation_issues=question.get("_validation_issues", []),
                saved=saved,
            ))
        except Exception as e:
            questions.append(GeneratedQuestion(
                id=None,
                question_text=None,
                options=None,
                correct_answer=None,
                coaching_hints=None,
                validation_issues=[str(e)],
                saved=False,
            ))

    return GenerateResponse(
        questions=questions,
        blueprint_code=request.blueprint_code,
        count=len(questions),
    )
