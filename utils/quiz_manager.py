import random
import streamlit as st


def generate_quiz(questions, topic, difficulty, num_questions=5):
    """
    Generate a quiz from the question bank.

    Args:
        questions: List of question objects (new schema format)
        topic: Topic ID (e.g., "factors_multiples_primes") or "all"
        difficulty: Difficulty ID (e.g., "part_a")
        num_questions: Number of questions to include

    Returns:
        List of selected question objects
    """
    filtered = []

    for q in questions:
        # Filter by topic (skip if "all" selected)
        if topic != "all" and q["topic"] != topic:
            continue

        # Filter by difficulty
        if q["difficulty"] != difficulty:
            continue

        filtered.append(q)

    used_ids = st.session_state.get("used_question_ids", [])

    available = [
        q for q in filtered
        if q["id"] not in used_ids
    ]

    # Reset if exhausted
    if len(available) < num_questions:
        used_ids = []
        available = filtered

    selected = random.sample(
        available,
        min(num_questions, len(available))
    )

    used_ids.extend([q["id"] for q in selected])

    st.session_state.used_question_ids = used_ids

    return selected


def get_question_text(question):
    """
    Get the question text from a question object.
    Supports both old schema (question) and new schema (question_text).
    """
    return question.get("question_text", question.get("question", ""))