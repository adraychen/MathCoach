import streamlit as st
import json
import time
from pathlib import Path

from utils.quiz_manager import generate_quiz
from utils.scoring import calculate_score

from coaching.socratic_coach import (
    get_starting_coaching,
    get_misconception_coaching
)

# ---------------------------------------------------
# PAGE CONFIG
# ---------------------------------------------------

st.set_page_config(
    page_title="Waterloo Gauss Simulator",
    page_icon="🧠",
    layout="centered"
)

# ---------------------------------------------------
# LOAD QUESTIONS
# ---------------------------------------------------

QUESTIONS_PATH = Path("questions/arithmetic.json")

def load_questions():
    with open(QUESTIONS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

questions = load_questions()

# ---------------------------------------------------
# SESSION STATE
# ---------------------------------------------------

defaults = {
    "quiz_started": False,
    "quiz_questions": [],
    "current_index": 0,
    "answers": {},
    "question_state": {},
    "chat_history": [],
}

for key, value in defaults.items():
    if key not in st.session_state:
        st.session_state[key] = value

# ---------------------------------------------------
# HEADER
# ---------------------------------------------------

st.title("🧠 Waterloo Gauss Math Simulator")
st.caption("Grade 7 • Arithmetic & Number Sense")

# ---------------------------------------------------
# SIDEBAR
# ---------------------------------------------------

with st.sidebar:

    st.header("Practice Settings")

    topic = st.selectbox(
        "Choose Topic",
        [
            "All Topics",
            "Ordering Numbers",
            "Factors and Multiples",
            "Prime Numbers",
            "Fractions Decimals Percents",
            "Consecutive Integers",
            "Special Number Properties",
            "Units and Measurement"
        ]
    )

    difficulty = st.selectbox(
        "Choose Difficulty",
        [
            "Part A",
            "Part B",
            "Part C"
        ]
    )

    if st.button("Start Practice"):

        quiz_questions = generate_quiz(
            questions,
            topic,
            difficulty
        )

        question_state = {}

        for q in quiz_questions:
            question_state[q["id"]] = {
                "start_time": time.time(),
                "time_to_correct": None,
                "is_correct": False,
                "attempts": 0
            }

        st.session_state.quiz_questions = quiz_questions
        st.session_state.current_index = 0
        st.session_state.answers = {}
        st.session_state.question_state = question_state
        st.session_state.chat_history = []
        st.session_state.quiz_started = True

        st.rerun()

# ---------------------------------------------------
# QUIZ SCREEN
# ---------------------------------------------------

if st.session_state.quiz_started:

    quiz_questions = st.session_state.quiz_questions
    current_index = st.session_state.current_index

    question = quiz_questions[current_index]

    qid = question["id"]

    st.divider()

    st.subheader(
        f"Question {current_index + 1} of {len(quiz_questions)}"
    )

    st.write(question["question"])

    previous_answer = st.session_state.answers.get(qid)

    selected = st.radio(
        "Choose your answer:",
        options=["A", "B", "C", "D", "E"],
        format_func=lambda x: f"{x}. {question['options'][x]}",
        index=None if previous_answer is None else ["A", "B", "C", "D", "E"].index(previous_answer),
        key=f"radio_{qid}"
    )

    st.session_state.answers[qid] = selected

    # ---------------------------------------------------
    # BUTTONS
    # ---------------------------------------------------

    col1, col2 = st.columns(2)

    with col1:

        if st.button("Need Coaching"):

            coaching = get_starting_coaching(question)

            st.session_state.chat_history.append({
                "role": "assistant",
                "content": coaching
            })

            st.rerun()

    with col2:

        if st.button("Submit"):

            if selected is None:

                st.session_state.chat_history.append({
                    "role": "assistant",
                    "content": "Choose an answer first before submitting."
                })

            else:

                st.session_state.question_state[qid]["attempts"] += 1

                if selected == question["correct_answer"]:

                    if st.session_state.question_state[qid]["time_to_correct"] is None:

                        elapsed = (
                            time.time()
                            - st.session_state.question_state[qid]["start_time"]
                        )

                        st.session_state.question_state[qid]["time_to_correct"] = round(elapsed, 1)

                    st.session_state.question_state[qid]["is_correct"] = True

                    st.session_state.chat_history.append({
                        "role": "assistant",
                        "content": "Good job. You got the correct answer."
                    })

                    if current_index < len(quiz_questions) - 1:

                        st.session_state.current_index += 1

                    st.rerun()

                else:

                    coaching = get_misconception_coaching(
                        question,
                        selected
                    )

                    st.session_state.chat_history.append({
                        "role": "assistant",
                        "content": coaching
                    })

                    st.rerun()

    # ---------------------------------------------------
    # CHAT PANEL
    # ---------------------------------------------------

    st.divider()

    st.subheader("Coaching")

    for msg in st.session_state.chat_history:

        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    # ---------------------------------------------------
    # NAVIGATION
    # ---------------------------------------------------

    st.divider()

    nav1, nav2 = st.columns(2)

    with nav1:

        if current_index > 0:

            if st.button("⬅ Previous"):

                st.session_state.current_index -= 1
                st.rerun()

    with nav2:

        if current_index < len(quiz_questions) - 1:

            if st.button("Next ➡"):

                st.session_state.current_index += 1
                st.rerun()

    # ---------------------------------------------------
    # RESULTS
    # ---------------------------------------------------

    completed = all(
        st.session_state.question_state[q["id"]]["is_correct"]
        for q in quiz_questions
    )

    if completed:

        st.divider()

        st.header("📊 Results")

        results = calculate_score(
            quiz_questions,
            st.session_state.answers
        )

        st.metric("Score", results["score"])

        st.subheader("Timing")

        for q in quiz_questions:

            qstate = st.session_state.question_state[q["id"]]

            st.write(
                f"{q['id']} — {qstate['time_to_correct']} seconds"
            )