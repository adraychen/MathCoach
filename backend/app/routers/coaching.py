"""
Socratic coaching endpoints.
"""

from fastapi import APIRouter

from ..models.coaching import (
    CoachingRequest,
    CoachingResponse,
    MisconceptionRequest,
    FollowupRequest,
)
from ..services.coaching import (
    get_starting_coaching,
    get_misconception_coaching,
    get_followup_coaching,
)

router = APIRouter(prefix="/api/coaching", tags=["coaching"])


@router.post("/start", response_model=CoachingResponse)
async def start_coaching(request: CoachingRequest):
    """Get initial coaching hint when student is stuck."""
    message = await get_starting_coaching(
        question_text=request.question_text,
        options=request.options,
        coaching_hints=request.coaching_hints,
    )

    return CoachingResponse(
        message=message,
        question_id=request.question_id,
    )


@router.post("/misconception", response_model=CoachingResponse)
async def misconception_coaching(request: MisconceptionRequest):
    """Get coaching for a specific misconception after wrong answer."""
    message = await get_misconception_coaching(
        question_text=request.question_text,
        options=request.options,
        correct_answer=request.correct_answer,
        selected_answer=request.selected_answer,
        misconceptions=request.misconceptions,
        distractor_rationale=request.distractor_rationale,
        key_insight=request.key_insight,
    )

    return CoachingResponse(
        message=message,
        question_id=request.question_id,
    )


@router.post("/followup", response_model=CoachingResponse)
async def followup_coaching(request: FollowupRequest):
    """Continue coaching conversation based on student response."""
    message = await get_followup_coaching(
        question_text=request.question_text,
        correct_answer=request.correct_answer,
        coaching_hints=request.coaching_hints,
        key_insight=request.key_insight,
        conversation_history=request.conversation_history,
    )

    return CoachingResponse(
        message=message,
        question_id=request.question_id,
    )
