import streamlit as st
import json
from pathlib import Path

# ---------------------------------------------------
# PAGE CONFIG
# ---------------------------------------------------

st.set_page_config(
    page_title="Waterloo Gauss Simulator",
    page_icon="🧠",
    layout="centered"
)

# ---------------------------------------------------
# APP TITLE
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

    start_button = st.button("Start Practice")

# ---------------------------------------------------
# LOAD QUESTIONS
# ---------------------------------------------------

QUESTIONS_PATH = Path("questions/arithmetic.json")

def load_questions():
    if not QUESTIONS_PATH.exists():
        st.error("Question file not found.")
        return []

    with open(QUESTIONS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

questions = load_questions()

# ---------------------------------------------------
# START PRACTICE
# ---------------------------------------------------

if start_button:

    filtered_questions = questions

    if topic != "All Topics":
        filtered_questions = [
            q for q in questions
            if q["topic"] == topic
        ]

    filtered_questions = [
        q for q in filtered_questions
        if q["difficulty"] == difficulty
    ]

    if len(filtered_questions) == 0:
        st.warning("No questions found.")
    else:
        question = filtered_questions[0]

        st.divider()

        st.subheader("Question")

        st.write(question["question"])

        st.radio(
            "Choose your answer:",
            options=list(question["options"].keys()),
            format_func=lambda x: f"{x}. {question['options'][x]}",
            key="selected_answer"
        )

        st.info(
            f"Topic: {question['topic']} | Difficulty: {question['difficulty']}"
        )

# ---------------------------------------------------
# DEFAULT HOME SCREEN
# ---------------------------------------------------

if not start_button:
    st.markdown("""
    ## Welcome

    This simulator helps students prepare for the
    Waterloo Gauss Grade 7 Contest.

    Topics include:
    - Arithmetic
    - Number Sense
    - Factors and Multiples
    - Prime Numbers
    - Fractions and Percents
    - Logical Reasoning

    Click **Start Practice** to begin.
    """)