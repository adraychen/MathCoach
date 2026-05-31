"""
Question CRUD endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db, QuestionModel
from ..models.question import (
    Question,
    QuestionCreate,
    QuestionUpdate,
    QuestionList,
)

router = APIRouter(prefix="/api/questions", tags=["questions"])


def model_to_question(db_question: QuestionModel) -> Question:
    """Convert SQLAlchemy model to Pydantic model."""
    return Question(
        id=db_question.id,
        program=db_question.program,
        topic=db_question.topic,
        subtopic=db_question.subtopic,
        difficulty=db_question.difficulty,
        archetype=db_question.archetype,
        question_text=db_question.question_text,
        options=db_question.options,
        correct_answer=db_question.correct_answer,
        reasoning_skills=db_question.reasoning_skills or [],
        misconceptions=db_question.misconceptions or [],
        distractor_rationale=db_question.distractor_rationale,
        solution=db_question.solution,
        coaching_hints=db_question.coaching_hints or [],
        visual=db_question.visual,
        metadata=db_question.question_metadata,
    )


@router.get("", response_model=QuestionList)
async def list_questions(
    program: str | None = None,
    topic: str | None = None,
    difficulty: str | None = None,
    archetype: str | None = None,
    validated: bool | None = None,
    limit: int = Query(default=50, le=100),
    offset: int = 0,
    db: Session = Depends(get_db),
):
    """List questions with optional filters."""
    query = db.query(QuestionModel)

    if program:
        query = query.filter(QuestionModel.program == program)
    if topic:
        query = query.filter(QuestionModel.topic == topic)
    if difficulty:
        query = query.filter(QuestionModel.difficulty == difficulty)
    if archetype:
        query = query.filter(QuestionModel.archetype == archetype)
    if validated is not None:
        # Filter by metadata->validated JSON field
        query = query.filter(
            QuestionModel.question_metadata["validated"].astext == str(validated).lower()
        )

    # Get total count
    total = query.count()

    # Apply pagination
    results = query.offset(offset).limit(limit).all()

    return QuestionList(
        questions=[model_to_question(q) for q in results],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/{question_id}", response_model=Question)
async def get_question(
    question_id: str,
    db: Session = Depends(get_db),
):
    """Get a single question by ID."""
    result = db.query(QuestionModel).filter(QuestionModel.id == question_id).first()

    if not result:
        raise HTTPException(status_code=404, detail="Question not found")

    return model_to_question(result)


@router.post("", response_model=Question, status_code=201)
async def create_question(
    question: QuestionCreate,
    db: Session = Depends(get_db),
):
    """Create a new question."""
    # Generate ID
    question_id = f"{question.program}_{question.topic}_{question.difficulty}_{_next_sequence(db, question.program, question.topic, question.difficulty)}"

    db_question = QuestionModel(
        id=question_id,
        program=question.program,
        topic=question.topic,
        subtopic=question.subtopic,
        difficulty=question.difficulty,
        archetype=question.archetype,
        question_text=question.question_text,
        options=question.options.model_dump(),
        correct_answer=question.correct_answer,
        reasoning_skills=question.reasoning_skills,
        misconceptions=question.misconceptions,
        distractor_rationale=question.distractor_rationale,
        solution=question.solution.model_dump() if question.solution else None,
        coaching_hints=question.coaching_hints,
        visual=question.visual.model_dump() if question.visual else None,
        question_metadata=question.metadata.model_dump() if question.metadata else None,
    )

    db.add(db_question)
    db.commit()
    db.refresh(db_question)

    return model_to_question(db_question)


@router.put("/{question_id}", response_model=Question)
async def update_question(
    question_id: str,
    question: QuestionUpdate,
    db: Session = Depends(get_db),
):
    """Update a question."""
    db_question = db.query(QuestionModel).filter(QuestionModel.id == question_id).first()

    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")

    # Update only provided fields
    update_data = question.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        if value is not None:
            # Handle nested Pydantic models
            if hasattr(value, "model_dump"):
                value = value.model_dump()
            # Map 'metadata' to 'question_metadata' (reserved name in SQLAlchemy)
            db_field = "question_metadata" if field == "metadata" else field
            setattr(db_question, db_field, value)

    db.commit()
    db.refresh(db_question)

    return model_to_question(db_question)


@router.delete("/{question_id}", status_code=204)
async def delete_question(
    question_id: str,
    db: Session = Depends(get_db),
):
    """Delete a question."""
    db_question = db.query(QuestionModel).filter(QuestionModel.id == question_id).first()

    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")

    db.delete(db_question)
    db.commit()


def _next_sequence(db: Session, program: str, topic: str, difficulty: str) -> str:
    """Get next sequence number for question ID."""
    prefix = f"{program}_{topic}_{difficulty}_"

    result = (
        db.query(QuestionModel.id)
        .filter(QuestionModel.id.like(f"{prefix}%"))
        .order_by(QuestionModel.id.desc())
        .first()
    )

    if result:
        last_id = result[0]
        last_seq = int(last_id.split("_")[-1])
        return f"{last_seq + 1:04d}"

    return "0001"
