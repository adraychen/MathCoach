"""
Streamlit UI for testing MathCoach question generation with Groq + Supabase.

Recommended repo path:
  generators/question_generation_ui.py

Expected adjacent/existing files:
  generators/mathcoach_generate_visual_data_questions_groq.py
  utils/visual_preview.py

This UI stores generated questions as development/draft rows only.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Dict, List

import streamlit as st
from dotenv import load_dotenv

try:
    from generators.mathcoach_generate_visual_data_questions_groq import (
        DEFAULT_MODEL,
        PROMPT_VERSION,
        build_generation_prompt,
        build_insert_row,
        call_groq,
        deterministic_checks,
        fetch_blueprint,
        get_supabase,
        insert_question,
        load_schema,
        schema_errors,
    )
except Exception:  # local fallback when file is placed in same folder during testing
    from mathcoach_generate_visual_data_questions_groq import (  # type: ignore
        DEFAULT_MODEL,
        PROMPT_VERSION,
        build_generation_prompt,
        build_insert_row,
        call_groq,
        deterministic_checks,
        fetch_blueprint,
        get_supabase,
        insert_question,
        load_schema,
        schema_errors,
    )

try:
    from utils.visual_preview import render_visual_preview
except Exception:
    try:
        from mathcoach_streamlit_visual_preview import render_visual_preview  # type: ignore
    except Exception:
        render_visual_preview = None  # type: ignore


DEFAULT_SCHEMA_PATHS = [
    "schema/mathcoach_question_schema_v2_generated_question.json",
    "mathcoach_question_schema_v2_generated_question.json",
]


def _find_schema_path() -> str:
    env_path = os.getenv("QUESTION_SCHEMA_PATH")
    if env_path and Path(env_path).exists():
        return env_path
    for path in DEFAULT_SCHEMA_PATHS:
        if Path(path).exists():
            return path
    return DEFAULT_SCHEMA_PATHS[-1]


def _list_blueprints(supabase) -> List[str]:
    result = (
        supabase.table("mathcoach_question_blueprints")
        .select("blueprint_code,validation_status,is_active")
        .eq("program_name", "Waterloo Gauss")
        .eq("is_active", True)
        .order("blueprint_code")
        .execute()
    )
    return [row["blueprint_code"] for row in (result.data or [])]


def _render_question_preview(question: Dict[str, Any], validation_issues: List[str]) -> None:
    st.markdown(f"### {question.get('id', 'Generated Question')}")
    st.write(question.get("question_text", ""))

    visual = question.get("visual", {}) or {}
    if render_visual_preview and visual.get("required"):
        render_visual_preview(visual.get("type"), visual.get("spec"))
    elif visual.get("required"):
        st.json(visual)

    options = question.get("options", {}) or {}
    st.markdown("**Answer choices**")
    for label in ["A", "B", "C", "D", "E"]:
        marker = "✅" if question.get("correct_answer") == label else ""
        st.write(f"{label}. {options.get(label, '')} {marker}")

    if validation_issues:
        st.error(f"Validation issues: {len(validation_issues)}")
        for issue in validation_issues[:12]:
            st.write(f"- {issue}")
    else:
        st.success("Schema and starter deterministic validation passed.")

    with st.expander("Full generated JSON"):
        st.json(question)


def run_question_generation_mode() -> None:
    """Run Streamlit mode for generating and optionally storing draft questions."""
    st.title("AI Question Generation Test")
    st.caption("Development workflow: generate → validate → preview → store as dev/draft or dev/validated.")
    st.warning("Do not use this mode for production question banks yet. Generated rows should stay environment='dev'.")

    load_dotenv()

    try:
        supabase = get_supabase()
    except Exception as exc:
        st.error(f"Supabase connection failed: {exc}")
        st.stop()

    schema_path = st.text_input("Question schema path", value=_find_schema_path())
    try:
        schema = load_schema(schema_path)
    except Exception as exc:
        st.error(f"Could not load schema: {exc}")
        st.stop()

    blueprints = _list_blueprints(supabase)
    if not blueprints:
        st.error("No active Waterloo Gauss blueprints found in Supabase.")
        st.stop()

    default_index = blueprints.index("visual_data_extraction") if "visual_data_extraction" in blueprints else 0
    blueprint_code = st.selectbox("Blueprint", blueprints, index=default_index)
    count = st.number_input("Number of candidates", min_value=1, max_value=10, value=2, step=1)
    model = st.text_input("Groq model", value=os.getenv("GROQ_MODEL", DEFAULT_MODEL))
    store_in_supabase = st.checkbox("Store generated questions in Supabase", value=False)

    if st.button("Generate and validate", type="primary"):
        try:
            blueprint = fetch_blueprint(supabase, blueprint_code)
        except Exception as exc:
            st.error(f"Could not load blueprint: {exc}")
            st.stop()

        st.info(f"Loaded blueprint: {blueprint.get('blueprint_name')} ({blueprint_code})")
        generated_rows = []

        for i in range(1, int(count) + 1):
            with st.spinner(f"Generating candidate {i}/{count}..."):
                prompt = build_generation_prompt(blueprint, i)
                try:
                    question = call_groq(prompt, model=model)
                except Exception as exc:
                    st.error(f"Groq generation failed for candidate {i}: {exc}")
                    continue

                s_errors = schema_errors(question, schema)
                d_errors = deterministic_checks(question)
                all_issues = s_errors + d_errors
                row = build_insert_row(
                    question,
                    blueprint,
                    schema_valid=not s_errors,
                    validation_issues=all_issues,
                )
                row["environment"] = "dev"

                if store_in_supabase:
                    try:
                        insert_question(supabase, row)
                        st.success(f"Stored {row['question_uid']} as {row['review_status']} / dev")
                    except Exception as exc:
                        st.error(f"Insert failed for {row.get('question_uid')}: {exc}")

                generated_rows.append(row)
                _render_question_preview(question, all_issues)

        if generated_rows:
            st.subheader("Generation summary")
            st.dataframe(
                [
                    {
                        "question_uid": row["question_uid"],
                        "review_status": row["review_status"],
                        "environment": row.get("environment", "dev"),
                        "issue_count": len(row.get("validation_result", {}).get("deterministic_issues", [])),
                    }
                    for row in generated_rows
                ],
                use_container_width=True,
            )
            st.caption(f"Prompt version: {PROMPT_VERSION}")
