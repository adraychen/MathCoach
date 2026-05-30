"""
Quiz session endpoints.
"""

import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from ..database import get_db
from ..models.question import Question
from ..models.quiz import (
    QuizStart,
    QuizSession,
    QuizQuestionState,
    QuizAnswer,
    QuizAnswerResult,
    QuizResults,
    QuizScoreBreakdown,
)
from ..services.quiz import generate_quiz, calculate_score

router = APIRouter(prefix="/api/quiz", tags=["quiz"])

# In-memory session storage (replace with Redis/DB for production)
_sessions: dict[str, QuizSession] = {}


@router.post("/start", response_model=QuizSession)
async def start_quiz(
    request: QuizStart,
    db: Client = Depends(get_db),
):
    """Start a new quiz session."""
    # Get questions from database
    questions = await generate_quiz(
        db=db,
        program=request.program,
        topic=request.topic,
        difficulty=request.difficulty,
        num_questions=request.num_questions,
    )

    if not questions:
        raise HTTPException(
            status_code=404,
            detail="No questions found for the given filters"
        )

    # Create session
    session_id = str(uuid.uuid4())
    now = datetime.utcnow()

    question_states = {
        q.id: QuizQuestionState(
            question_id=q.id,
            start_time=now,
        )
        for q in questions
    }

    session = QuizSession(
        session_id=session_id,
        questions=questions,
        current_index=0,
        question_states=question_states,
        created_at=now,
        completed=False,
    )

    _sessions[session_id] = session

    return session


@router.get("/{session_id}", response_model=QuizSession)
async def get_quiz(session_id: str):
    """Get quiz session state."""
    session = _sessions.get(session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return session


@router.post("/{session_id}/answer", response_model=QuizAnswerResult)
async def submit_answer(
    session_id: str,
    answer: QuizAnswer,
):
    """Submit an answer to a question."""
    session = _sessions.get(session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Find question
    question = next(
        (q for q in session.questions if q.id == answer.question_id),
        None
    )

    if not question:
        raise HTTPException(status_code=404, detail="Question not found in session")

    # Update state
    state = session.question_states[answer.question_id]
    state.attempts += 1
    state.selected_answer = answer.selected_answer

    now = datetime.utcnow()
    elapsed = (now - state.start_time).total_seconds()

    correct = answer.selected_answer == question.correct_answer

    if correct:
        state.is_correct = True
        if state.time_to_correct is None:
            state.time_to_correct = elapsed

        # Move to next question
        if session.current_index < len(session.questions) - 1:
            session.current_index += 1
            # Reset start time for next question
            next_q = session.questions[session.current_index]
            session.question_states[next_q.id].start_time = now

        # Check if completed
        session.completed = all(
            s.is_correct for s in session.question_states.values()
        )

    return QuizAnswerResult(
        correct=correct,
        correct_answer=question.correct_answer if correct else None,
        attempts=state.attempts,
        time_elapsed=elapsed,
        coaching_message="Correct!" if correct else None,
    )


@router.get("/{session_id}/results", response_model=QuizResults)
async def get_results(session_id: str):
    """Get quiz results."""
    session = _sessions.get(session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Calculate scores
    score_data = calculate_score(session.questions, session.question_states)

    # Calculate average time
    times = [
        s.time_to_correct
        for s in session.question_states.values()
        if s.time_to_correct is not None
    ]
    avg_time = sum(times) / len(times) if times else 0

    # Build breakdown
    breakdown = QuizScoreBreakdown()
    for q in session.questions:
        state = session.question_states[q.id]
        if q.difficulty == "part_a":
            breakdown.part_a_total += 1
            if state.is_correct:
                breakdown.part_a_correct += 1
        elif q.difficulty == "part_b":
            breakdown.part_b_total += 1
            if state.is_correct:
                breakdown.part_b_correct += 1
        elif q.difficulty == "part_c":
            breakdown.part_c_total += 1
            if state.is_correct:
                breakdown.part_c_correct += 1

    return QuizResults(
        session_id=session_id,
        score=score_data["score"],
        total_possible=score_data["total_possible"],
        correct_count=score_data["correct"],
        incorrect_count=score_data["incorrect"],
        blank_count=score_data["blank"],
        blank_bonus=score_data["blank_bonus"],
        average_time_seconds=round(avg_time, 1),
        breakdown=breakdown,
        question_results=list(session.question_states.values()),
    )
