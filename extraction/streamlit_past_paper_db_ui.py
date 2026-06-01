"""
Streamlit UI for testing past-paper extraction and storing source evidence in Supabase.

Recommended repo path:
  extraction/past_paper_db_ui.py

This module is intentionally review-first. It extracts/parses/normalizes, shows rows,
and only inserts into mathcoach_past_questions when the user confirms.
"""

from __future__ import annotations

import json
import os
import tempfile
from typing import Any, Dict, List

import streamlit as st
from dotenv import load_dotenv
from supabase import create_client


def _get_supabase():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_KEY")
    if not url or not key:
        raise RuntimeError("Missing SUPABASE_URL and SUPABASE_KEY (or SUPABASE_ANON_KEY) in environment.")
    return create_client(url, key)


def _part_from_question_number(qn: int) -> str:
    if 1 <= qn <= 10:
        return "A"
    if 11 <= qn <= 20:
        return "B"
    return "C"


def _extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """Use PyMuPDF directly as a fallback extraction path."""
    import fitz  # PyMuPDF

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(pdf_bytes)
        tmp_path = tmp.name

    chunks: List[str] = []
    try:
        doc = fitz.open(tmp_path)
        for page_index, page in enumerate(doc, start=1):
            text = page.get_text("text")
            chunks.append(f"\n--- PAGE {page_index} ---\n{text}")
        doc.close()
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass
    return "\n".join(chunks)


def _parse_questions_with_existing_module(text: str) -> List[Dict[str, Any]]:
    """Try to call the existing extraction.question_parser if present."""
    try:
        from extraction.question_parser import parse_questions_from_text
    except Exception as exc:
        raise RuntimeError(
            "Could not import extraction.question_parser.parse_questions_from_text. "
            "Use manual JSON paste mode or check module path."
        ) from exc

    parsed = parse_questions_from_text(text)
    if isinstance(parsed, dict):
        return parsed.get("questions", []) or []
    return parsed or []


def _normalize_with_existing_module(parsed_question: Dict[str, Any], paper_info: Dict[str, Any]) -> Dict[str, Any]:
    try:
        from extraction.normalizer import classify_question, normalize_to_schema
    except Exception:
        try:
            from normalizer import classify_question, normalize_to_schema  # type: ignore
        except Exception as exc:
            raise RuntimeError("Could not import normalizer functions.") from exc

    classification = classify_question(parsed_question, paper_info)
    if classification.get("error"):
        return {"error": classification["error"], "raw": classification.get("raw_response"), "parsed": parsed_question}
    return normalize_to_schema(parsed_question, classification, paper_info, program_id="waterloo_gauss")


def _past_question_row(normalized: Dict[str, Any], year: int, grade: int) -> Dict[str, Any]:
    extraction = normalized.get("extraction_metadata", {}) or {}
    qn = int(extraction.get("original_question_number") or 0)
    metadata = normalized.get("metadata", {}) or {}

    return {
        "program_name": "Waterloo Gauss",
        "year": year,
        "grade": grade,
        "question_number": qn,
        "part": _part_from_question_number(qn),
        "primary_topic": normalized.get("topic"),
        "secondary_topic": normalized.get("subtopic"),
        "archetype": normalized.get("archetype"),
        "question_text": normalized.get("question_text"),
        "answer_choices": normalized.get("options"),
        "correct_answer": normalized.get("correct_answer") or None,
        "official_solution_text": None,
        "solution_steps": normalized.get("solution", {}).get("steps", []),
        "visual_required": bool(metadata.get("diagram_required", False)),
        "visual_type": "geometry_diagram" if metadata.get("diagram_required", False) else "none",
        "visual_spec": {"diagram_description": metadata.get("diagram_description")} if metadata.get("diagram_required", False) else None,
        "source_type": "past_paper",
        "is_student_visible": False,
        "is_active": True,
    }


def _insert_rows(supabase, rows: List[Dict[str, Any]]) -> None:
    for row in rows:
        supabase.table("mathcoach_past_questions").upsert(
            row,
            on_conflict="program_name,year,grade,question_number",
        ).execute()


def run_past_paper_extraction_db_mode() -> None:
    st.title("Past Paper Extraction → Supabase")
    st.caption("Development workflow: extract → normalize → review → store as source evidence only.")
    st.warning("Past-paper rows are stored with is_student_visible=false. They are evidence, not student practice questions.")

    load_dotenv()
    try:
        supabase = _get_supabase()
    except Exception as exc:
        st.error(f"Supabase connection failed: {exc}")
        st.stop()

    year = st.number_input("Year", min_value=2000, max_value=2100, value=2025, step=1)
    grade = st.selectbox("Grade", [7, 8], index=0)

    mode = st.radio("Input method", ["Upload PDF", "Paste normalized question JSON"], horizontal=True)
    normalized_questions: List[Dict[str, Any]] = []

    if mode == "Upload PDF":
        uploaded = st.file_uploader("Upload Waterloo Gauss paper PDF", type=["pdf"])
        if uploaded and st.button("Extract and normalize"):
            pdf_bytes = uploaded.read()
            with st.spinner("Extracting text from PDF..."):
                text = _extract_text_from_pdf_bytes(pdf_bytes)
            with st.expander("Extracted text preview"):
                st.text(text[:8000])

            paper_info = {
                "program": "Waterloo Gauss",
                "year": int(year),
                "grade": int(grade),
                "sections": [
                    {"name": "Part A", "questions": "1-10"},
                    {"name": "Part B", "questions": "11-20"},
                    {"name": "Part C", "questions": "21-25"},
                ],
            }

            with st.spinner("Parsing questions with existing extraction module..."):
                try:
                    parsed_questions = _parse_questions_with_existing_module(text)
                except Exception as exc:
                    st.error(str(exc))
                    st.stop()

            st.write(f"Parsed questions: {len(parsed_questions)}")
            with st.spinner("Normalizing parsed questions..."):
                for pq in parsed_questions:
                    normalized_questions.append(_normalize_with_existing_module(pq, paper_info))

            st.session_state["past_paper_normalized_questions"] = normalized_questions

    else:
        pasted = st.text_area("Paste a JSON array of normalized question objects", height=250)
        if st.button("Load pasted JSON"):
            try:
                data = json.loads(pasted)
                if isinstance(data, dict):
                    data = data.get("questions", [])
                if not isinstance(data, list):
                    raise ValueError("Expected a JSON array or object with questions array.")
                st.session_state["past_paper_normalized_questions"] = data
            except Exception as exc:
                st.error(f"Invalid JSON: {exc}")

    normalized_questions = st.session_state.get("past_paper_normalized_questions", [])
    if not normalized_questions:
        return

    rows = []
    errors = []
    for item in normalized_questions:
        if item.get("error"):
            errors.append(item)
            continue
        try:
            rows.append(_past_question_row(item, int(year), int(grade)))
        except Exception as exc:
            errors.append({"error": str(exc), "item": item})

    st.subheader("Review rows before insert")
    if errors:
        st.error(f"Rows with errors: {len(errors)}")
        with st.expander("Error details"):
            st.json(errors)

    st.dataframe(
        [
            {
                "year": r["year"],
                "grade": r["grade"],
                "question_number": r["question_number"],
                "part": r["part"],
                "primary_topic": r["primary_topic"],
                "secondary_topic": r["secondary_topic"],
                "archetype": r["archetype"],
                "has_answer": bool(r["correct_answer"]),
                "visual_required": r["visual_required"],
            }
            for r in rows
        ],
        use_container_width=True,
    )

    with st.expander("First row JSON"):
        if rows:
            st.json(rows[0])

    confirm = st.checkbox("I reviewed these rows and want to upsert them into mathcoach_past_questions")
    if st.button("Save reviewed rows to Supabase", disabled=not confirm or not rows):
        with st.spinner("Saving rows..."):
            try:
                _insert_rows(supabase, rows)
                st.success(f"Saved {len(rows)} rows to mathcoach_past_questions.")
            except Exception as exc:
                st.error(f"Insert failed: {exc}")
