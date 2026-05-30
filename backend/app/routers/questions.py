"""
Question CRUD endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client

from ..database import get_db
from ..models.question import (
    Question,
    QuestionCreate,
    QuestionUpdate,
    QuestionList,
)

router = APIRouter(prefix="/api/questions", tags=["questions"])

# Table name in Supabase
TABLE_NAME = "mathcoach_questions"


@router.get("", response_model=QuestionList)
async def list_questions(
    program: str | None = None,
    topic: str | None = None,
    difficulty: str | None = None,
    archetype: str | None = None,
    validated: bool | None = None,
    limit: int = Query(default=50, le=100),
    offset: int = 0,
    db: Client = Depends(get_db),
):
    """List questions with optional filters."""
    query = db.table(TABLE_NAME).select("*", count="exact")

    if program:
        query = query.eq("program", program)
    if topic:
        query = query.eq("topic", topic)
    if difficulty:
        query = query.eq("difficulty", difficulty)
    if archetype:
        query = query.eq("archetype", archetype)
    if validated is not None:
        query = query.eq("metadata->>validated", str(validated).lower())

    query = query.range(offset, offset + limit - 1)

    result = query.execute()

    return QuestionList(
        questions=[Question(**q) for q in result.data],
        total=result.count or len(result.data),
        limit=limit,
        offset=offset,
    )


@router.get("/{question_id}", response_model=Question)
async def get_question(
    question_id: str,
    db: Client = Depends(get_db),
):
    """Get a single question by ID."""
    result = db.table(TABLE_NAME).select("*").eq("id", question_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Question not found")

    return Question(**result.data[0])


@router.post("", response_model=Question, status_code=201)
async def create_question(
    question: QuestionCreate,
    db: Client = Depends(get_db),
):
    """Create a new question."""
    # Generate ID
    question_id = f"{question.program}_{question.topic}_{question.difficulty}_{_next_sequence(db, question.program, question.topic, question.difficulty)}"

    data = question.model_dump()
    data["id"] = question_id

    result = db.table(TABLE_NAME).insert(data).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create question")

    return Question(**result.data[0])


@router.put("/{question_id}", response_model=Question)
async def update_question(
    question_id: str,
    question: QuestionUpdate,
    db: Client = Depends(get_db),
):
    """Update a question."""
    # Filter out None values
    update_data = {k: v for k, v in question.model_dump().items() if v is not None}

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = db.table(TABLE_NAME).update(update_data).eq("id", question_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Question not found")

    return Question(**result.data[0])


@router.delete("/{question_id}", status_code=204)
async def delete_question(
    question_id: str,
    db: Client = Depends(get_db),
):
    """Delete a question."""
    result = db.table(TABLE_NAME).delete().eq("id", question_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Question not found")


def _next_sequence(db: Client, program: str, topic: str, difficulty: str) -> str:
    """Get next sequence number for question ID."""
    prefix = f"{program}_{topic}_{difficulty}_"

    result = (
        db.table(TABLE_NAME)
        .select("id")
        .like("id", f"{prefix}%")
        .order("id", desc=True)
        .limit(1)
        .execute()
    )

    if result.data:
        last_id = result.data[0]["id"]
        last_seq = int(last_id.split("_")[-1])
        return f"{last_seq + 1:04d}"

    return "0001"
