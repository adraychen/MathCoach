"""
Supabase-backed quiz/test utilities for MathCoach.

This does not replace the existing Streamlit `utils/quiz_manager.py` immediately.
It ports the same idea to Supabase:
- load stored test papers
- fetch approved generated questions
- avoid repeats for a student
- preserve stable Test 1-10 paper assignments
"""

from __future__ import annotations

import os
from typing import Any, Dict, List, Optional
from supabase import create_client, Client


def get_supabase_client() -> Client:
    url = os.environ["SUPABASE_URL"]
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ["SUPABASE_ANON_KEY"]
    return create_client(url, key)


def load_test_paper(
    supabase: Client,
    *,
    program_name: str = "Waterloo Gauss",
    grade: int = 7,
    test_number: int,
) -> Dict[str, Any]:
    """Load one stored test paper and its 25 assigned generated questions."""
    paper_resp = (
        supabase.table("mathcoach_test_papers")
        .select("*")
        .eq("program_name", program_name)
        .eq("grade", grade)
        .eq("test_number", test_number)
        .single()
        .execute()
    )
    paper = paper_resp.data
    if not paper:
        raise ValueError(f"No test paper found: {program_name} grade={grade} test={test_number}")

    questions_resp = (
        supabase.table("mathcoach_test_paper_questions")
        .select("question_order, part, blueprint_code, generated_question_id, mathcoach_generated_questions(*)")
        .eq("test_paper_id", paper["id"])
        .order("question_order")
        .execute()
    )

    rows = questions_resp.data or []
    return {"paper": paper, "questions": rows}


def get_student_seen_question_ids(supabase: Client, student_id: str) -> List[str]:
    """Return generated_question_id values already assigned/attempted by a student."""
    assigned = (
        supabase.table("mathcoach_student_attempts")
        .select("generated_question_id")
        .eq("student_id", student_id)
        .execute()
    )
    return [row["generated_question_id"] for row in (assigned.data or []) if row.get("generated_question_id")]


def fetch_unseen_approved_questions(
    supabase: Client,
    *,
    student_id: str,
    program_name: str = "Waterloo Gauss",
    grade: int = 7,
    part: str,
    limit: int,
    blueprint_codes: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    """Fetch approved questions a student has not seen yet."""
    seen_ids = set(get_student_seen_question_ids(supabase, student_id))

    query = (
        supabase.table("mathcoach_generated_questions")
        .select("*")
        .eq("program_name", program_name)
        .eq("grade", grade)
        .eq("part", part)
        .eq("review_status", "approved")
        .eq("is_active", True)
        .limit(max(limit * 3, limit))
    )

    if blueprint_codes:
        query = query.in_("blueprint_code", blueprint_codes)

    resp = query.execute()
    candidates = [q for q in (resp.data or []) if q["id"] not in seen_ids]
    return candidates[:limit]


def record_student_attempt(
    supabase: Client,
    *,
    student_id: str,
    test_paper_id: str,
    generated_question_id: str,
    selected_answer: Optional[str],
    correct_answer: str,
    attempt_number: int = 1,
    used_need_coaching: bool = False,
    used_wrong_answer_coaching: bool = False,
    coach_messages: Optional[List[Dict[str, Any]]] = None,
    time_spent_seconds: Optional[int] = None,
) -> Dict[str, Any]:
    """Store one student attempt."""
    is_correct = selected_answer == correct_answer if selected_answer else False
    payload = {
        "student_id": student_id,
        "test_paper_id": test_paper_id,
        "generated_question_id": generated_question_id,
        "selected_answer": selected_answer,
        "is_correct": is_correct,
        "attempt_number": attempt_number,
        "used_need_coaching": used_need_coaching,
        "used_wrong_answer_coaching": used_wrong_answer_coaching,
        "coach_messages": coach_messages or [],
        "time_spent_seconds": time_spent_seconds,
    }
    return supabase.table("mathcoach_student_attempts").insert(payload).execute().data[0]
