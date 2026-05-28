import streamlit as st
import json
from pathlib import Path

from utils.quiz_manager import generate_quiz
from utils.scoring import calculate_score

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

if "quiz_started" not in st.session_state:
    st.session_state.quiz_started = False

if "quiz_submitted" not in st.session_state:
    st.session_state.quiz_submitted = False

if "quiz_questions" not in st.session_state:
    st.session_state.quiz_questions = []

if "current_index" not in st.session_state:
    st.session_state.current_index = 0

if "answers" not in st.session_state:
    st.session_state.answers = {}

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

        st.session_state.quiz_questions = quiz_questions
        st.session_state.current_index = 0
        st.session_state.answers = {}
        st.session_state.quiz_started = True
        st.session_state.quiz_submitted = False

        st.rerun()

# ---------------------------------------------------
# QUIZ SCREEN
# ---------------------------------------------------

if st.session_state.quiz_started and not st.session_state.quiz_submitted:

    quiz_questions = st.session_state.quiz_questions
    current_index = st.session_state.current_index

    question = quiz_questions[current_index]

    st.divider()

    st.subheader(
        f"Question {current_index + 1} of {len(quiz_questions)}"
    )

    st.write(question["question"])

    qid = question["id"]

    previous_answer = st.session_state.answers.get(qid)

    selected = st.radio(
        "Choose your answer:",
        options=["A", "B", "C", "D", "E"],
        format_func=lambda x: f"{x}. {question['options'][x]}",
        index=None if previous_answer is None else ["A", "B", "C", "D", "E"].index(previous_answer),
        key=f"radio_{qid}"
    )

    # Save answer
    st.session_state.answers[qid] = selected

    st.info(
        f"Topic: {question['topic']} | Difficulty: {question['difficulty']}"
    )

    # ---------------------------------------------------
    # NAVIGATION BUTTONS
    # ---------------------------------------------------

    col1, col2, col3 = st.columns(3)

    with col1:

        if current_index > 0:
            if st.button("⬅ Previous"):
                st.session_state.current_index -= 1
                st.rerun()

    with col2:

        if current_index < len(quiz_questions) - 1:
            if st.button("Next ➡"):
                st.session_state.current_index += 1
                st.rerun()

    with col3:

        if current_index == len(quiz_questions) - 1:
            if st.button("Submit Quiz"):

                st.session_state.quiz_submitted = True
                st.rerun()

# ---------------------------------------------------
# RESULTS SCREEN
# ---------------------------------------------------

if st.session_state.quiz_submitted:

    results = calculate_score(
        st.session_state.quiz_questions,
        st.session_state.answers
    )

    st.divider()

    st.header("📊 Quiz Results")

    st.metric("Final Score", results["score"])

    col1, col2, col3 = st.columns(3)

    col1.metric("Correct", results["correct"])
    col2.metric("Incorrect", results["incorrect"])
    col3.metric("Blank", results["blank"])

    st.info(
        f"Blank Question Bonus: {results['blank_bonus']} points"
    )

    if st.button("Start New Quiz"):

        st.session_state.quiz_started = False
        st.session_state.quiz_submitted = False
        st.session_state.quiz_questions = []
        st.session_state.answers = {}
        st.session_state.current_index = 0

        st.rerun()

# ---------------------------------------------------
# HOME SCREEN
# ---------------------------------------------------

if not st.session_state.quiz_started:

    st.markdown("""
    ## Welcome

    Practice Waterloo Gauss Grade 7 arithmetic
    and number sense questions.

    Features:
    - Multiple-choice practice
    - Waterloo scoring rules
    - Contest-style quiz flow
    - Progressive difficulty

    Choose settings in the sidebar to begin.
    """)