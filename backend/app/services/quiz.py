"""
Quiz management service.
Reused from utils/quiz_manager.py and utils/scoring.py
"""

import random
from supabase import Client

from ..models.question import Question
from ..models.quiz import QuizQuestionState

TABLE_NAME = "mathcoach_questions"


async def generate_quiz(
    db: Client,
    program: str,
    topic: str,
    difficulty: str,
    num_questions: int = 5,
) -> list[Question]:
    """
    Generate a quiz by selecting questions from the database.

    Args:
        db: Supabase client
        program: Program ID (e.g., "waterloo_gauss")
        topic: Topic ID or "all"
        difficulty: Difficulty ID (e.g., "part_a")
        num_questions: Number of questions to include

    Returns:
        List of Question objects
    """
    query = db.table(TABLE_NAME).select("*")

    # Filter by program
    query = query.eq("program", program)

    # Filter by topic (skip if "all")
    if topic != "all":
        query = query.eq("topic", topic)

    # Filter by difficulty
    query = query.eq("difficulty", difficulty)

    # Get questions
    result = query.execute()

    if not result.data:
        return []

    # Convert to Question objects
    questions = [Question(**q) for q in result.data]

    # Randomly sample
    if len(questions) > num_questions:
        questions = random.sample(questions, num_questions)

    return questions


def calculate_score(
    questions: list[Question],
    question_states: dict[str, QuizQuestionState],
) -> dict:
    """
    Calculate quiz score using Waterloo Gauss scoring rules.

    Scoring:
    - Part A correct = 5 points
    - Part B correct = 6 points
    - Part C correct = 8 points
    - Blank = 2 points each (max 10 blanks)

    Returns:
        dict with score, correct, incorrect, blank, blank_bonus, total_possible
    """
    score = 0
    correct_count = 0
    incorrect_count = 0
    blank_count = 0
    total_possible = 0

    for question in questions:
        state = question_states.get(question.id)

        # Calculate total possible
        if question.difficulty == "part_a":
            total_possible += 5
        elif question.difficulty == "part_b":
            total_possible += 6
        elif question.difficulty == "part_c":
            total_possible += 8

        if not state or state.selected_answer is None:
            # Blank
            blank_count += 1
            continue

        if state.is_correct:
            # Correct
            if question.difficulty == "part_a":
                score += 5
            elif question.difficulty == "part_b":
                score += 6
            elif question.difficulty == "part_c":
                score += 8

            correct_count += 1
        else:
            # Incorrect
            incorrect_count += 1

    # Waterloo blank bonus (max 10 blanks)
    blank_bonus = min(blank_count, 10) * 2
    score += blank_bonus

    return {
        "score": score,
        "correct": correct_count,
        "incorrect": incorrect_count,
        "blank": blank_count,
        "blank_bonus": blank_bonus,
        "total_possible": total_possible,
    }
