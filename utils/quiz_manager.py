import random
import streamlit as st


def generate_quiz(questions, topic, difficulty, num_questions=5):

    filtered = []

    for q in questions:

        if topic != "All Topics" and q["topic"] != topic:
            continue

        if q["difficulty"] != difficulty:
            continue

        filtered.append(q)

    used_ids = st.session_state.get("used_question_ids", [])

    available = [
        q for q in filtered
        if q["id"] not in used_ids
    ]

    # reset if exhausted
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