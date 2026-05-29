import streamlit as st
import json
import time
from pathlib import Path

from utils.quiz_manager import generate_quiz, get_question_text
from utils.scoring import calculate_score
from utils.schema_loader import (
    get_topic_display_name,
    get_difficulty_display_name,
    get_topics_for_program,
    get_difficulties_for_program,
)

from coaching.socratic_coach import (
    get_starting_coaching,
    get_misconception_coaching,
    get_followup_coaching
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

QUESTIONS_PATH = Path("questions/arithmetic_v2.json")


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
    "coaching_history": {},
    "test_history": [],
    "used_question_ids": [],
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

    # Admin section
    with st.expander("Admin Tools"):
        st.caption("Manage question bank")

        if st.button("Open Question Extractor", use_container_width=True):
            st.session_state.show_extractor_info = True

        if st.session_state.get("show_extractor_info"):
            st.info(
                "Run the extraction tool in a new terminal:\n\n"
                "```\nstreamlit run app_extract.py\n```"
            )
            st.caption("This opens the PDF extraction workflow for uploading past papers.")

    st.divider()

    st.header("Practice Settings")

    # Topic options for Waterloo Gauss
    TOPIC_OPTIONS = [
        ("all", "All Topics"),
        ("number_sense", "Number Sense"),
        ("factors_multiples_primes", "Factors, Multiples & Primes"),
        ("fractions_decimals_percents", "Fractions, Decimals & Percents"),
        ("patterns_sequences", "Patterns & Sequences"),
        ("geometry_measurement", "Geometry & Measurement"),
        ("counting_probability", "Counting & Probability"),
        ("logic_reasoning", "Logic & Reasoning"),
    ]

    topic = st.selectbox(
        "Choose Topic",
        options=[t[0] for t in TOPIC_OPTIONS],
        format_func=lambda x: dict(TOPIC_OPTIONS)[x]
    )

    # Difficulty options for Waterloo Gauss
    DIFFICULTY_OPTIONS = [
        ("part_a", "Part A (5 pts)"),
        ("part_b", "Part B (6 pts)"),
        ("part_c", "Part C (8 pts)"),
    ]

    difficulty = st.selectbox(
        "Choose Difficulty",
        options=[d[0] for d in DIFFICULTY_OPTIONS],
        format_func=lambda x: dict(DIFFICULTY_OPTIONS)[x]
    )

    num_questions = st.slider(
        "Number of Questions",
        min_value=3,
        max_value=15,
        value=5
    )

    if st.button("Start Practice"):

        quiz_questions = generate_quiz(
            questions=questions,
            topic=topic,
            difficulty=difficulty,
            num_questions=num_questions
        )

        question_state = {}
        coaching_history = {}

        for q in quiz_questions:

            question_state[q["id"]] = {
                "start_time": time.time(),
                "time_to_correct": None,
                "is_correct": False,
                "attempts": 0
            }

            coaching_history[q["id"]] = []

        st.session_state.quiz_questions = quiz_questions
        st.session_state.current_index = 0
        st.session_state.answers = {}
        st.session_state.question_state = question_state
        st.session_state.coaching_history = coaching_history
        st.session_state.quiz_started = True

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
    - Waterloo-style multiple choice
    - Socratic AI coaching
    - Step-by-step reasoning
    - Time tracking
    - Rotating question bank
    - Performance analytics

    Choose settings in the sidebar to begin.
    """)

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

    st.write(get_question_text(question))

    previous_answer = st.session_state.answers.get(qid)

    option_labels = ["A", "B", "C", "D", "E"]

    selected = st.radio(
        "Choose your answer:",
        options=option_labels,
        format_func=lambda x: f"{x}. {question['options'][x]}",
        index=None if previous_answer is None else option_labels.index(previous_answer),
        key=f"radio_{qid}"
    )

    st.session_state.answers[qid] = selected

    # ---------------------------------------------------
    # ACTION BUTTONS
    # ---------------------------------------------------

    col1, col2 = st.columns(2)

    with col1:

        if st.button("Need Coaching"):

            coaching = get_starting_coaching(question)

            st.session_state.coaching_history[qid].append({
                "role": "assistant",
                "content": coaching
            })

            st.rerun()

    with col2:

        if st.button("Submit"):

            if selected is None:

                st.session_state.coaching_history[qid].append({
                    "role": "assistant",
                    "content": "Choose an answer before submitting."
                })

                st.rerun()

            st.session_state.question_state[qid]["attempts"] += 1

            # -------------------------------------------
            # CORRECT ANSWER
            # -------------------------------------------

            if selected == question["correct_answer"]:

                if st.session_state.question_state[qid]["time_to_correct"] is None:

                    elapsed = (
                        time.time()
                        - st.session_state.question_state[qid]["start_time"]
                    )

                    st.session_state.question_state[qid]["time_to_correct"] = round(elapsed, 1)

                st.session_state.question_state[qid]["is_correct"] = True

                st.session_state.coaching_history[qid].append({
                    "role": "assistant",
                    "content": "Correct. Moving to the next question."
                })

                if current_index < len(quiz_questions) - 1:

                    st.session_state.current_index += 1

                st.rerun()

            # -------------------------------------------
            # INCORRECT ANSWER
            # -------------------------------------------

            else:

                coaching = get_misconception_coaching(
                    question_data=question,
                    selected_answer=selected
                )

                st.session_state.coaching_history[qid].append({
                    "role": "assistant",
                    "content": coaching
                })

                st.rerun()

    # ---------------------------------------------------
    # COACHING PANEL
    # ---------------------------------------------------

    st.divider()

    st.subheader("Coaching")

    history = st.session_state.coaching_history[qid]

    for msg in history:

        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    student_message = st.chat_input(
        "Ask a question or explain your thinking..."
    )

    if student_message:

        st.session_state.coaching_history[qid].append({
            "role": "user",
            "content": student_message
        })

        history = st.session_state.coaching_history[qid]

        coaching = get_followup_coaching(
            question_data=question,
            conversation_history=history
        )

        st.session_state.coaching_history[qid].append({
            "role": "assistant",
            "content": coaching
        })

        st.rerun()

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
    # QUIZ COMPLETION
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

        st.metric(
            "Score",
            results["score"]
        )

        # -----------------------------------------------
        # TIMING
        # -----------------------------------------------

        avg_time_values = []

        for q in quiz_questions:

            qstate = st.session_state.question_state[q["id"]]

            if qstate["time_to_correct"] is not None:
                avg_time_values.append(
                    qstate["time_to_correct"]
                )

        average_time = round(
            sum(avg_time_values) / len(avg_time_values),
            1
        ) if avg_time_values else 0

        # -----------------------------------------------
        # STORE TEST HISTORY
        # -----------------------------------------------

        st.session_state.test_history.append({
            "score": results["score"],
            "average_time": average_time
        })

        st.session_state.test_history = (
            st.session_state.test_history[-5:]
        )

        # -----------------------------------------------
        # DISPLAY TIMING
        # -----------------------------------------------

        st.subheader(
            "Time to First Correct Submission"
        )

        for q in quiz_questions:

            qstate = st.session_state.question_state[q["id"]]

            st.write(
                f"{q['id']} — {qstate['time_to_correct']} seconds"
            )

        # -----------------------------------------------
        # RECENT PERFORMANCE
        # -----------------------------------------------

        st.divider()

        st.subheader("Recent Performance")

        history = st.session_state.test_history

        if history:

            avg_score_last_5 = round(
                sum(h["score"] for h in history) / len(history),
                1
            )

            avg_time_last_5 = round(
                sum(h["average_time"] for h in history) / len(history),
                1
            )

            col1, col2 = st.columns(2)

            with col1:

                st.metric(
                    "Average Score (Last 5 Tests)",
                    avg_score_last_5
                )

            with col2:

                st.metric(
                    "Average Time (Last 5 Tests)",
                    f"{avg_time_last_5}s"
                )

        # -----------------------------------------------
        # NEW QUIZ
        # -----------------------------------------------

        if st.button("Start New Quiz"):

            st.session_state.quiz_started = False
            st.session_state.quiz_questions = []
            st.session_state.current_index = 0
            st.session_state.answers = {}
            st.session_state.question_state = {}
            st.session_state.coaching_history = {}

            st.rerun()