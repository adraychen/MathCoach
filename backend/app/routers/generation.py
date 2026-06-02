"""
Question generation endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..services.generation import (
    get_blueprints,
    get_generation_plan,
    get_next_blueprint_to_generate,
    generate_question,
    save_question_to_db,
    get_topic_taxonomy,
)

router = APIRouter(prefix="/api/generation", tags=["generation"])


class BlueprintSummary(BaseModel):
    id: str
    blueprint_code: str
    blueprint_name: str
    primary_topic: str | None
    secondary_topic: str | None
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
    visual: dict | None = None
    validation_issues: list[str]
    saved: bool = False


class GenerateResponse(BaseModel):
    questions: list[GeneratedQuestion]
    blueprint_code: str
    count: int


class PlanItem(BaseModel):
    id: str
    blueprint_code: str
    blueprint_name: str | None
    difficulty_level: str
    evidence_level: str
    dev_generation_target: int
    requires_visual: bool
    priority: int
    notes: str | None
    generated_count: int


class PlanStatusResponse(BaseModel):
    plan: list[PlanItem]
    total_target: int
    total_generated: int
    completed: bool


class GenerateNextResponse(BaseModel):
    question: GeneratedQuestion | None
    blueprint_code: str | None
    remaining: int
    completed: bool


class TopicItem(BaseModel):
    primary_topic: str
    secondary_topic: str
    blueprint_code: str | None
    blueprint_name: str | None
    blueprint_id: str | None
    has_blueprint: bool


class TopicGroup(BaseModel):
    primary_topic: str
    items: list[TopicItem]


class TopicTaxonomyResponse(BaseModel):
    groups: list[TopicGroup]


@router.get("/blueprints", response_model=BlueprintListResponse)
async def list_blueprints(db: Session = Depends(get_db)):
    """Get all active blueprints for question generation."""
    blueprints = get_blueprints(db)
    return BlueprintListResponse(
        blueprints=[BlueprintSummary(**{**b, "id": str(b["id"])}) for b in blueprints]
    )


@router.get("/topics", response_model=TopicTaxonomyResponse)
async def list_topics(db: Session = Depends(get_db)):
    """Get all topics grouped by primary topic with blueprint availability."""
    topics = get_topic_taxonomy(db)

    # Group by primary_topic
    groups_dict: dict[str, list[TopicItem]] = {}
    for t in topics:
        primary = t["primary_topic"]
        if primary not in groups_dict:
            groups_dict[primary] = []

        groups_dict[primary].append(TopicItem(
            primary_topic=t["primary_topic"],
            secondary_topic=t["secondary_topic"],
            blueprint_code=t["blueprint_code"],
            blueprint_name=t["blueprint_name"],
            blueprint_id=str(t["blueprint_id"]) if t["blueprint_id"] else None,
            has_blueprint=t["blueprint_code"] is not None,
        ))

    # Convert to list of groups
    groups = [
        TopicGroup(primary_topic=primary, items=items)
        for primary, items in sorted(groups_dict.items())
    ]

    return TopicTaxonomyResponse(groups=groups)


@router.post("/generate", response_model=GenerateResponse)
async def generate_questions(
    request: GenerateRequest,
    db: Session = Depends(get_db),
):
    """Generate questions from a blueprint."""
    import asyncio

    questions = []
    RATE_LIMIT_DELAY = 2  # seconds between questions (OpenRouter paid has no rate limits)

    for i in range(1, request.count + 1):
        # Add delay between questions (not before the first one)
        if i > 1:
            await asyncio.sleep(RATE_LIMIT_DELAY)

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
                visual=question.get("visual"),
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
                visual=None,
                validation_issues=[str(e)],
                saved=False,
            ))

    return GenerateResponse(
        questions=questions,
        blueprint_code=request.blueprint_code,
        count=len(questions),
    )


@router.get("/plan", response_model=PlanStatusResponse)
async def get_plan_status(db: Session = Depends(get_db)):
    """Get generation plan with current progress."""
    plan = get_generation_plan(db)

    plan_items = [
        PlanItem(**{**p, "id": str(p["id"])})
        for p in plan
    ]

    total_target = sum(p.dev_generation_target for p in plan_items)
    total_generated = sum(p.generated_count for p in plan_items)

    return PlanStatusResponse(
        plan=plan_items,
        total_target=total_target,
        total_generated=total_generated,
        completed=total_generated >= total_target,
    )


@router.post("/generate-next", response_model=GenerateNextResponse)
async def generate_next_question(db: Session = Depends(get_db)):
    """Generate the next question according to the plan."""
    next_bp = get_next_blueprint_to_generate(db)

    if not next_bp:
        return GenerateNextResponse(
            question=None,
            blueprint_code=None,
            remaining=0,
            completed=True,
        )

    blueprint_code = next_bp["blueprint_code"]
    generated_count = next_bp["generated_count"]
    target = next_bp["dev_generation_target"]

    # Calculate remaining across all blueprints
    plan = get_generation_plan(db)
    total_target = sum(p["dev_generation_target"] for p in plan)
    total_generated = sum(p["generated_count"] for p in plan)
    remaining = total_target - total_generated

    try:
        # Use generated_count + 1 as index for unique IDs
        question = generate_question(db, blueprint_code, index=generated_count + 1)

        saved = False
        if not question.get("_validation_issues"):
            try:
                save_question_to_db(db, question)
                saved = True
                remaining -= 1  # We just saved one
            except Exception as e:
                question["_validation_issues"] = question.get("_validation_issues", []) + [f"Save error: {str(e)}"]

        return GenerateNextResponse(
            question=GeneratedQuestion(
                id=question.get("id"),
                question_text=question.get("question_text"),
                options=question.get("options"),
                correct_answer=question.get("correct_answer"),
                coaching_hints=question.get("coaching_hints"),
                visual=question.get("visual"),
                validation_issues=question.get("_validation_issues", []),
                saved=saved,
            ),
            blueprint_code=blueprint_code,
            remaining=remaining,
            completed=remaining <= 0,
        )
    except Exception as e:
        return GenerateNextResponse(
            question=GeneratedQuestion(
                id=None,
                question_text=None,
                options=None,
                correct_answer=None,
                coaching_hints=None,
                visual=None,
                validation_issues=[str(e)],
                saved=False,
            ),
            blueprint_code=blueprint_code,
            remaining=remaining,
            completed=False,
        )
