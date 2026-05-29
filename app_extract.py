"""
Question Extraction Admin Interface.
Upload past papers, extract questions using vision AI, review and normalize to schema.
Uses Llama 3.2 90B Vision for accurate diagram/graph extraction.
"""

import streamlit as st
import json
import time
from pathlib import Path
from datetime import datetime

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
    page_title="Question Extraction - MathCoach",
    page_icon="📄",
    layout="wide"
)

# ---------------------------------------------------
# SESSION STATE
# ---------------------------------------------------

defaults = {
    "pdf_bytes": None,
    "pdf_filename": None,
    "pdf_pages": None,
    "paper_info": None,
    "parsed_questions": [],
    "classified_questions": [],
    "current_review_index": 0,
    "extraction_step": "upload",  # upload, parse, classify, review, save
}

for key, value in defaults.items():
    if key not in st.session_state:
        st.session_state[key] = value

# ---------------------------------------------------
# DIRECTORIES
# ---------------------------------------------------

EXTRACTED_DIR = Path("extracted")
EXTRACTED_DIR.mkdir(exist_ok=True)

QUESTIONS_DIR = Path("questions")
QUESTIONS_DIR.mkdir(exist_ok=True)

# ---------------------------------------------------
# HEADER
# ---------------------------------------------------

st.title("📄 Question Extraction Workflow")
st.caption("Upload past papers → Extract → Review → Save")

# ---------------------------------------------------
# PROGRESS INDICATOR
# ---------------------------------------------------

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

    st.info("Using **Llama 3.2 90B Vision** for accurate diagram and graph extraction.")

    uploaded_file = st.file_uploader(
        "Upload a PDF of a past competition paper",
        type=["pdf"],
        help="Supported: Waterloo Gauss, Pascal, AMC 8, etc. Diagrams and graphs will be extracted."
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

            # Show first page preview
            with st.expander("Preview First Page"):
                first_page = render_pdf_page_from_bytes(pdf_bytes, 1)
                st.image(first_page["image_bytes"], caption="Page 1", use_container_width=True)

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

    st.write(f"**Source:** {filename}")
    st.write(f"**Pages:** {num_pages}")

    # Show first page
    col_preview, col_actions = st.columns([2, 1])

    with col_preview:
        first_page = render_pdf_page_from_bytes(pdf_bytes, 1)
        st.image(first_page["image_bytes"], caption="Page 1 (Cover)", use_container_width=True)

    with col_actions:

        if st.button("Analyze Paper Structure", type="primary"):

            with st.spinner("Using vision AI to analyze paper structure..."):

                first_page = render_pdf_page_from_bytes(pdf_bytes, 1)
                paper_info = identify_paper_structure_from_image(first_page["image_base64"])
                st.session_state.paper_info = paper_info

            st.rerun()

        if st.button("← Back to Upload"):
            st.session_state.extraction_step = "upload"
            st.session_state.pdf_bytes = None
            st.session_state.pdf_filename = None
            st.rerun()

    # Show paper info if analyzed
    if st.session_state.paper_info:

        info = st.session_state.paper_info

        st.subheader("Detected Structure")

        col1, col2, col3 = st.columns(3)

        with col1:
            st.write(f"**Program:** {info.get('program', 'Unknown')}")
            st.write(f"**Year:** {info.get('year', 'Unknown')}")

        with col2:
            st.write(f"**Grade:** {info.get('grade_level', 'Unknown')}")
            st.write(f"**Total Questions:** {info.get('total_questions', 'Unknown')}")

        with col3:
            st.write(f"**Time Limit:** {info.get('time_limit', 'Unknown')} min")

        st.write("**Sections:**")
        for section in info.get("sections", []):
            st.write(f"- {section.get('name')}: Questions {section.get('questions')} ({section.get('points_each', '?')} pts each)")

        st.divider()

        # Page range selection for extraction
        st.subheader("Select Pages to Extract")

        col1, col2 = st.columns(2)
        with col1:
            start_page = st.number_input("Start Page", min_value=1, max_value=num_pages, value=1)
        with col2:
            end_page = st.number_input("End Page", min_value=1, max_value=num_pages, value=num_pages)

        if st.button("Extract Questions from Pages", type="primary"):

            all_questions = []
            progress = st.progress(0)
            status = st.empty()

            source_info = f"{info.get('program', '')} {info.get('year', '')}"

            for page_num in range(start_page, end_page + 1):

                status.write(f"Extracting questions from page {page_num}...")

                # Render page as image
                page_data = render_pdf_page_from_bytes(pdf_bytes, page_num)

                # Parse questions using vision model
                page_questions = parse_questions_from_image(
                    page_data["image_base64"],
                    page_num,
                    source_info
                )

                # Filter out error responses
                valid_questions = [q for q in page_questions if "error" not in q]
                all_questions.extend(valid_questions)

                progress.progress((page_num - start_page + 1) / (end_page - start_page + 1))

                # Rate limiting - avoid overwhelming the API
                time.sleep(1)

            st.session_state.parsed_questions = all_questions
            status.success(f"Extracted {len(all_questions)} questions from {end_page - start_page + 1} pages")

            if all_questions:
                st.session_state.extraction_step = "classify"
                st.rerun()
            else:
                st.error("No questions extracted. Check the PDF format.")

# ---------------------------------------------------
# STEP 3: CLASSIFY
# ---------------------------------------------------

elif st.session_state.extraction_step == "classify":

    st.header("Step 3: Classify Questions")

    questions = st.session_state.parsed_questions
    paper_info = st.session_state.paper_info

    st.write(f"**Questions to classify:** {len(questions)}")

    # Show parsed questions preview
    with st.expander("Preview Parsed Questions"):
        for q in questions:
            st.write(f"**Q{q.get('question_number', '?')}:** {q.get('question_text', '')[:100]}...")

    col1, col2 = st.columns(2)

    with col1:

        if st.button("Classify All Questions", type="primary"):

            progress = st.progress(0)
            status = st.empty()

            classified = []

            for i, q in enumerate(questions):

                status.write(f"Classifying question {i+1} of {len(questions)}...")

                classification = classify_question(q, paper_info)

                normalized = normalize_to_schema(
                    q,
                    classification,
                    paper_info,
                    program_id="waterloo_gauss"
                )

                classified.append(normalized)

                progress.progress((i + 1) / len(questions))

                # Small delay to avoid rate limiting
                time.sleep(0.5)

            st.session_state.classified_questions = classified
            status.success("Classification complete!")

            st.session_state.extraction_step = "review"
            st.rerun()

    with col2:

        if st.button("← Back to Parse"):
            st.session_state.extraction_step = "parse"
            st.session_state.parsed_questions = []
            st.rerun()

# ---------------------------------------------------
# STEP 4: REVIEW
# ---------------------------------------------------

elif st.session_state.extraction_step == "review":

    st.header("Step 4: Review & Edit")

    questions = st.session_state.classified_questions

    if not questions:
        st.warning("No questions to review")
        st.session_state.extraction_step = "classify"
        st.rerun()

    # Navigation
    col1, col2, col3 = st.columns([1, 2, 1])

    with col1:
        if st.button("← Previous") and st.session_state.current_review_index > 0:
            st.session_state.current_review_index -= 1
            st.rerun()

    with col2:
        st.write(f"**Question {st.session_state.current_review_index + 1} of {len(questions)}**")

    with col3:
        if st.button("Next →") and st.session_state.current_review_index < len(questions) - 1:
            st.session_state.current_review_index += 1
            st.rerun()

    st.divider()

    # Current question
    idx = st.session_state.current_review_index
    q = questions[idx]

    # Two columns: preview and edit
    col_preview, col_edit = st.columns(2)

    with col_preview:

        st.subheader("Question Preview")

        st.write(f"**ID:** `{q.get('id', '')}`")

        # Show diagram indicator
        has_diagram = q.get("metadata", {}).get("has_diagram", False)
        if has_diagram:
            st.warning("📊 This question includes a diagram")
            diagram_desc = q.get("metadata", {}).get("diagram_description", "")
            if diagram_desc:
                st.caption(f"Diagram: {diagram_desc}")

        st.write(f"**Question:**")
        st.info(q.get("question_text", ""))

        st.write("**Options:**")
        for opt, val in q.get("options", {}).items():
            marker = "✓" if opt == q.get("correct_answer") else ""
            st.write(f"  {opt}. {val} {marker}")

        st.write("**Solution:**")
        solution = q.get("solution", {})
        for step in solution.get("steps", []):
            st.write(f"  - {step}")

        st.write(f"**Key Insight:** {solution.get('key_insight', '')}")

    with col_edit:

        st.subheader("Classification (Edit)")

        # Topic
        current_topic = q.get("topic", VALID_TOPICS[0])
        topic_idx = VALID_TOPICS.index(current_topic) if current_topic in VALID_TOPICS else 0

        new_topic = st.selectbox(
            "Topic",
            VALID_TOPICS,
            index=topic_idx,
            key=f"topic_{idx}"
        )

        # Difficulty
        difficulties = ["part_a", "part_b", "part_c"]
        current_diff = q.get("difficulty", "part_a")
        diff_idx = difficulties.index(current_diff) if current_diff in difficulties else 0

        new_difficulty = st.selectbox(
            "Difficulty",
            difficulties,
            index=diff_idx,
            format_func=lambda x: x.replace("_", " ").title(),
            key=f"diff_{idx}"
        )

        # Archetype
        current_arch = q.get("archetype", VALID_ARCHETYPES[0])
        arch_idx = VALID_ARCHETYPES.index(current_arch) if current_arch in VALID_ARCHETYPES else 0

        new_archetype = st.selectbox(
            "Archetype",
            VALID_ARCHETYPES,
            index=arch_idx,
            key=f"arch_{idx}"
        )

        # Correct answer
        new_correct = st.selectbox(
            "Correct Answer",
            ["A", "B", "C", "D", "E"],
            index=["A", "B", "C", "D", "E"].index(q.get("correct_answer", "A")),
            key=f"correct_{idx}"
        )

        # Reasoning skills
        new_skills = st.multiselect(
            "Reasoning Skills",
            VALID_REASONING_SKILLS,
            default=q.get("reasoning_skills", []),
            key=f"skills_{idx}"
        )

        # Misconceptions
        new_misconceptions = st.multiselect(
            "Misconceptions",
            VALID_MISCONCEPTIONS,
            default=q.get("misconceptions", []),
            key=f"misc_{idx}"
        )

        # Validated checkbox
        is_validated = st.checkbox(
            "Mark as Validated",
            value=q.get("metadata", {}).get("validated", False),
            key=f"validated_{idx}"
        )

        # Save edits
        if st.button("Save Edits", key=f"save_{idx}"):

            q["topic"] = new_topic
            q["difficulty"] = new_difficulty
            q["archetype"] = new_archetype
            q["correct_answer"] = new_correct
            q["reasoning_skills"] = new_skills
            q["misconceptions"] = new_misconceptions
            q["metadata"]["validated"] = is_validated

            # Update ID based on new classification
            q["id"] = f"waterloo_gauss_{new_topic}_{new_difficulty}_{q['extraction_metadata']['original_question_number']:04d}"

            st.success("Saved!")
            st.rerun()

    st.divider()

    # Actions
    col1, col2 = st.columns(2)

    with col1:
        if st.button("← Back to Classify"):
            st.session_state.extraction_step = "classify"
            st.rerun()

    with col2:
        validated_count = sum(1 for q in questions if q.get("metadata", {}).get("validated", False))
        st.write(f"**Validated:** {validated_count} / {len(questions)}")

        if st.button("Proceed to Save →", type="primary"):
            st.session_state.extraction_step = "save"
            st.rerun()

# ---------------------------------------------------
# STEP 5: SAVE
# ---------------------------------------------------

elif st.session_state.extraction_step == "save":

    st.header("Step 5: Save Questions")

    questions = st.session_state.classified_questions
    validated = [q for q in questions if q.get("metadata", {}).get("validated", False)]

    st.write(f"**Total extracted:** {len(questions)}")
    st.write(f"**Validated:** {len(validated)}")

    col1, col2 = st.columns(2)

    with col1:

        save_option = st.radio(
            "What to save?",
            ["Only validated questions", "All questions"]
        )

        to_save = validated if save_option == "Only validated questions" else questions

    with col2:

        # Generate filename
        paper_info = st.session_state.paper_info or {}
        program = paper_info.get("program", "unknown").lower().replace(" ", "_")
        year = paper_info.get("year", "")
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        default_filename = f"extracted_{program}_{year}_{timestamp}.json"

        filename = st.text_input("Filename", value=default_filename)

    st.divider()

    if st.button("Save to Question Bank", type="primary"):

        if not to_save:
            st.error("No questions to save")
        else:
            # Remove extraction_metadata before saving
            clean_questions = []
            for q in to_save:
                clean_q = {k: v for k, v in q.items() if k != "extraction_metadata"}
                clean_questions.append(clean_q)

            # Save to extracted directory
            save_path = EXTRACTED_DIR / filename
            with open(save_path, "w", encoding="utf-8") as f:
                json.dump(clean_questions, f, indent=2)

            st.success(f"Saved {len(clean_questions)} questions to `{save_path}`")

            # Show saved questions
            with st.expander("View Saved Questions"):
                st.json(clean_questions)

    st.divider()

    if st.button("Start New Extraction"):
        # Reset all state
        st.session_state.pdf_bytes = None
        st.session_state.pdf_filename = None
        st.session_state.pdf_pages = None
        st.session_state.paper_info = None
        st.session_state.parsed_questions = []
        st.session_state.classified_questions = []
        st.session_state.current_review_index = 0
        st.session_state.extraction_step = "upload"
        st.rerun()

    if st.button("← Back to Review"):
        st.session_state.extraction_step = "review"
        st.rerun()
