import streamlit as st
import json
import time
from pathlib import Path
from datetime import datetime

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

from extraction.pdf_extractor import (
    render_pdf_pages_as_images,
    get_pdf_page_count,
    render_pdf_page_from_bytes
)
from extraction.question_parser import (
    parse_questions_from_image,
    identify_paper_structure_from_image
)
from extraction.normalizer import (
    classify_question,
    normalize_to_schema,
    VALID_TOPICS,
    VALID_ARCHETYPES,
    VALID_REASONING_SKILLS,
    VALID_MISCONCEPTIONS,
)

# ---------------------------------------------------
# PAGE CONFIG
# ---------------------------------------------------

st.set_page_config(
    page_title="MathCoach",
    page_icon="🧠",
    layout="wide"
)

# ---------------------------------------------------
# LOAD QUESTIONS
# ---------------------------------------------------

QUESTIONS_PATH = Path("questions/arithmetic_v2.json")
EXTRACTED_DIR = Path("extracted")
EXTRACTED_DIR.mkdir(exist_ok=True)


def load_questions():
    with open(QUESTIONS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


questions = load_questions()

# ---------------------------------------------------
# SESSION STATE
# ---------------------------------------------------

# App mode
if "app_mode" not in st.session_state:
    st.session_state.app_mode = "practice"

# Practice mode state
practice_defaults = {
    "quiz_started": False,
    "quiz_questions": [],
    "current_index": 0,
    "answers": {},
    "question_state": {},
    "coaching_history": {},
    "test_history": [],
    "used_question_ids": [],
}

for key, value in practice_defaults.items():
    if key not in st.session_state:
        st.session_state[key] = value

# Extraction mode state
extraction_defaults = {
    "pdf_bytes": None,
    "pdf_filename": None,
    "paper_info": None,
    "parsed_questions": [],
    "classified_questions": [],
    "current_review_index": 0,
    "extraction_step": "upload",
}

for key, value in extraction_defaults.items():
    if key not in st.session_state:
        st.session_state[key] = value

# ---------------------------------------------------
# MODE SWITCH IN SIDEBAR
# ---------------------------------------------------

with st.sidebar:
    st.title("MathCoach")

    mode = st.radio(
        "Mode",
        ["Practice", "Extract Questions"],
        index=0 if st.session_state.app_mode == "practice" else 1,
        horizontal=True
    )

    if mode == "Practice" and st.session_state.app_mode != "practice":
        st.session_state.app_mode = "practice"
        st.rerun()
    elif mode == "Extract Questions" and st.session_state.app_mode != "extract":
        st.session_state.app_mode = "extract"
        st.rerun()

    st.divider()

# ===================================================
# PRACTICE MODE
# ===================================================

if st.session_state.app_mode == "practice":

    # ---------------------------------------------------
    # PRACTICE SIDEBAR
    # ---------------------------------------------------

    with st.sidebar:

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
    # PRACTICE HEADER
    # ---------------------------------------------------

    st.title("Waterloo Gauss Math Simulator")
    st.caption("Grade 7 - Arithmetic & Number Sense")

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

# ===================================================
# EXTRACTION MODE
# ===================================================

elif st.session_state.app_mode == "extract":

    st.title("Question Extraction")
    st.caption("Upload past papers and extract questions using Llama 3.2 90B Vision")

    # Progress indicator
    steps = ["upload", "parse", "classify", "review", "save"]
    current_step = st.session_state.extraction_step
    step_index = steps.index(current_step)

    cols = st.columns(5)
    step_labels = ["1. Upload", "2. Parse", "3. Classify", "4. Review", "5. Save"]

    for i, (col, label) in enumerate(zip(cols, step_labels)):
        if i < step_index:
            col.success(label)
        elif i == step_index:
            col.info(label)
        else:
            col.write(label)

    st.divider()

    # ---------------------------------------------------
    # STEP 1: UPLOAD
    # ---------------------------------------------------

    if st.session_state.extraction_step == "upload":

        st.header("Step 1: Upload Past Paper")

        uploaded_file = st.file_uploader(
            "Upload a PDF of a past competition paper",
            type=["pdf"],
            help="Supported: Waterloo Gauss, Pascal, AMC 8, etc."
        )

        if uploaded_file:

            st.write(f"**File:** {uploaded_file.name}")
            st.write(f"**Size:** {uploaded_file.size / 1024:.1f} KB")

            if st.button("Process PDF", type="primary"):

                with st.spinner("Rendering PDF pages as images..."):

                    pdf_bytes = uploaded_file.read()
                    num_pages = get_pdf_page_count(pdf_bytes)

                    st.session_state.pdf_bytes = pdf_bytes
                    st.session_state.pdf_filename = uploaded_file.name

                st.success(f"PDF loaded: {num_pages} pages")
                st.session_state.extraction_step = "parse"
                st.rerun()

    # ---------------------------------------------------
    # STEP 2: PARSE
    # ---------------------------------------------------

    elif st.session_state.extraction_step == "parse":

        st.header("Step 2: Parse Paper Structure")

        pdf_bytes = st.session_state.pdf_bytes
        filename = st.session_state.pdf_filename
        num_pages = get_pdf_page_count(pdf_bytes)

        st.write(f"**Source:** {filename} ({num_pages} pages)")

        col_preview, col_actions = st.columns([2, 1])

        with col_preview:
            first_page = render_pdf_page_from_bytes(pdf_bytes, 1)
            st.image(first_page["image_bytes"], caption="Page 1", use_container_width=True)

        with col_actions:

            if st.button("Analyze Structure", type="primary"):

                with st.spinner("Using vision AI to analyze..."):
                    first_page = render_pdf_page_from_bytes(pdf_bytes, 1)
                    paper_info = identify_paper_structure_from_image(first_page["image_base64"])
                    st.session_state.paper_info = paper_info

                st.rerun()

            if st.button("Back to Upload"):
                st.session_state.extraction_step = "upload"
                st.session_state.pdf_bytes = None
                st.rerun()

        if st.session_state.paper_info:

            info = st.session_state.paper_info

            st.subheader("Detected Structure")

            col1, col2, col3 = st.columns(3)
            with col1:
                st.write(f"**Program:** {info.get('program', 'Unknown')}")
                st.write(f"**Year:** {info.get('year', 'Unknown')}")
            with col2:
                st.write(f"**Grade:** {info.get('grade_level', 'Unknown')}")
                st.write(f"**Questions:** {info.get('total_questions', 'Unknown')}")
            with col3:
                st.write(f"**Time:** {info.get('time_limit', 'Unknown')} min")

            st.divider()

            col1, col2 = st.columns(2)
            with col1:
                start_page = st.number_input("Start Page", min_value=1, max_value=num_pages, value=1)
            with col2:
                end_page = st.number_input("End Page", min_value=1, max_value=num_pages, value=num_pages)

            if st.button("Extract Questions", type="primary"):

                all_questions = []
                progress = st.progress(0)
                status = st.empty()

                source_info = f"{info.get('program', '')} {info.get('year', '')}"

                for page_num in range(start_page, end_page + 1):

                    status.write(f"Extracting from page {page_num}...")
                    page_data = render_pdf_page_from_bytes(pdf_bytes, page_num)
                    page_questions = parse_questions_from_image(
                        page_data["image_base64"],
                        page_num,
                        source_info
                    )

                    valid_questions = [q for q in page_questions if "error" not in q]
                    all_questions.extend(valid_questions)

                    progress.progress((page_num - start_page + 1) / (end_page - start_page + 1))
                    time.sleep(1)

                st.session_state.parsed_questions = all_questions
                status.success(f"Extracted {len(all_questions)} questions")

                if all_questions:
                    st.session_state.extraction_step = "classify"
                    st.rerun()

    # ---------------------------------------------------
    # STEP 3: CLASSIFY
    # ---------------------------------------------------

    elif st.session_state.extraction_step == "classify":

        st.header("Step 3: Classify Questions")

        questions_to_classify = st.session_state.parsed_questions
        paper_info = st.session_state.paper_info

        st.write(f"**Questions to classify:** {len(questions_to_classify)}")

        col1, col2 = st.columns(2)

        with col1:
            if st.button("Classify All", type="primary"):

                progress = st.progress(0)
                status = st.empty()
                classified = []

                for i, q in enumerate(questions_to_classify):

                    status.write(f"Classifying question {i+1}...")
                    classification = classify_question(q, paper_info)
                    normalized = normalize_to_schema(q, classification, paper_info)
                    classified.append(normalized)

                    progress.progress((i + 1) / len(questions_to_classify))
                    time.sleep(0.5)

                st.session_state.classified_questions = classified
                status.success("Classification complete!")

                st.session_state.extraction_step = "review"
                st.rerun()

        with col2:
            if st.button("Back to Parse"):
                st.session_state.extraction_step = "parse"
                st.rerun()

    # ---------------------------------------------------
    # STEP 4: REVIEW
    # ---------------------------------------------------

    elif st.session_state.extraction_step == "review":

        st.header("Step 4: Review & Edit")

        classified = st.session_state.classified_questions

        if not classified:
            st.warning("No questions to review")
            st.session_state.extraction_step = "classify"
            st.rerun()

        # Navigation
        col1, col2, col3 = st.columns([1, 2, 1])

        with col1:
            if st.button("Previous") and st.session_state.current_review_index > 0:
                st.session_state.current_review_index -= 1
                st.rerun()

        with col2:
            st.write(f"**Question {st.session_state.current_review_index + 1} of {len(classified)}**")

        with col3:
            if st.button("Next") and st.session_state.current_review_index < len(classified) - 1:
                st.session_state.current_review_index += 1
                st.rerun()

        idx = st.session_state.current_review_index
        q = classified[idx]

        col_preview, col_edit = st.columns(2)

        with col_preview:
            st.subheader("Preview")

            has_diagram = q.get("metadata", {}).get("has_diagram", False)
            if has_diagram:
                st.warning("This question has a diagram")

            st.info(q.get("question_text", ""))

            st.write("**Options:**")
            for opt, val in q.get("options", {}).items():
                marker = " [correct]" if opt == q.get("correct_answer") else ""
                st.write(f"{opt}. {val}{marker}")

        with col_edit:
            st.subheader("Edit Classification")

            new_topic = st.selectbox("Topic", VALID_TOPICS, index=VALID_TOPICS.index(q.get("topic", VALID_TOPICS[0])) if q.get("topic") in VALID_TOPICS else 0, key=f"topic_{idx}")

            difficulties = ["part_a", "part_b", "part_c"]
            new_diff = st.selectbox("Difficulty", difficulties, index=difficulties.index(q.get("difficulty", "part_a")), key=f"diff_{idx}")

            new_correct = st.selectbox("Correct Answer", ["A", "B", "C", "D", "E"], index=["A", "B", "C", "D", "E"].index(q.get("correct_answer", "A")), key=f"correct_{idx}")

            is_validated = st.checkbox("Mark as Validated", value=q.get("metadata", {}).get("validated", False), key=f"valid_{idx}")

            if st.button("Save Edits", key=f"save_{idx}"):
                q["topic"] = new_topic
                q["difficulty"] = new_diff
                q["correct_answer"] = new_correct
                q["metadata"]["validated"] = is_validated
                st.success("Saved!")
                st.rerun()

        st.divider()

        col1, col2 = st.columns(2)

        with col1:
            if st.button("Back to Classify"):
                st.session_state.extraction_step = "classify"
                st.rerun()

        with col2:
            validated_count = sum(1 for q in classified if q.get("metadata", {}).get("validated", False))
            st.write(f"**Validated:** {validated_count} / {len(classified)}")

            if st.button("Proceed to Save", type="primary"):
                st.session_state.extraction_step = "save"
                st.rerun()

    # ---------------------------------------------------
    # STEP 5: SAVE
    # ---------------------------------------------------

    elif st.session_state.extraction_step == "save":

        st.header("Step 5: Save Questions")

        classified = st.session_state.classified_questions
        validated = [q for q in classified if q.get("metadata", {}).get("validated", False)]

        st.write(f"**Total:** {len(classified)} | **Validated:** {len(validated)}")

        save_option = st.radio("Save", ["Only validated", "All questions"])
        to_save = validated if save_option == "Only validated" else classified

        paper_info = st.session_state.paper_info or {}
        program = paper_info.get("program", "unknown").lower().replace(" ", "_")
        year = paper_info.get("year", "")
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        filename = st.text_input("Filename", value=f"extracted_{program}_{year}_{timestamp}.json")

        if st.button("Save to Question Bank", type="primary"):

            if to_save:
                clean = [{k: v for k, v in q.items() if k != "extraction_metadata"} for q in to_save]

                save_path = EXTRACTED_DIR / filename
                with open(save_path, "w", encoding="utf-8") as f:
                    json.dump(clean, f, indent=2)

                st.success(f"Saved {len(clean)} questions to `{save_path}`")
            else:
                st.error("No questions to save")

        st.divider()

        if st.button("Start New Extraction"):
            for key in extraction_defaults:
                st.session_state[key] = extraction_defaults[key]
            st.rerun()

        if st.button("Back to Review"):
            st.session_state.extraction_step = "review"
            st.rerun()