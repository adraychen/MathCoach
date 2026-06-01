"""
MathCoach Groq Question Generator - Starter Pipeline

Purpose:
  Generate draft Waterloo Gauss Grade 7 questions from one Supabase blueprint,
  validate the generated JSON shape, perform basic deterministic visual checks,
  then store draft questions in public.mathcoach_generated_questions.

Recommended first blueprint:
  visual_data_extraction

Required environment variables:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY   (server-side only; do not expose in frontend)
  GROQ_API_KEY
  GROQ_MODEL                  (optional; default: qwen/qwen3-32b)

Install:
  pip install requests supabase jsonschema python-dotenv

Run:
  python mathcoach_generate_visual_data_questions_groq.py --blueprint visual_data_extraction --count 5
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

import requests
from dotenv import load_dotenv
from jsonschema import Draft7Validator
from supabase import create_client, Client

PROMPT_VERSION = "gauss_g7_dev_visual_data_v1"
DEFAULT_MODEL = os.getenv("GROQ_MODEL", "qwen/qwen3-32b")
SCHEMA_PATH = os.getenv("QUESTION_SCHEMA_PATH", "mathcoach_question_schema_v2_generated_question.json")

ALLOWED_VISUAL_TYPES = {
    "none", "coordinate_grid", "geometry_diagram", "bar_graph", "line_graph", "table",
    "balance_scale", "fraction_area", "number_line", "shape_pattern", "net_3d",
}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def load_schema(schema_path: str) -> Dict[str, Any]:
    with open(schema_path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_KEY")
    if not url or not key:
        raise RuntimeError("Missing SUPABASE_URL and SUPABASE_KEY (or SUPABASE_ANON_KEY) in environment.")
    return create_client(url, key)


def fetch_blueprint(supabase: Client, blueprint_code: str) -> Dict[str, Any]:
    result = (
        supabase.table("mathcoach_question_blueprints")
        .select("*")
        .eq("program_name", "Waterloo Gauss")
        .eq("blueprint_code", blueprint_code)
        .limit(1)
        .execute()
    )
    if not result.data:
        raise RuntimeError(f"Blueprint not found: {blueprint_code}")
    return result.data[0]


def normalize_part(difficulty_level: Optional[str]) -> Tuple[str, str]:
    """Return (contest_part_letter, schema_difficulty_id)."""
    value = (difficulty_level or "Part A").strip()
    mapping = {
        "Part A": ("A", "part_a"),
        "Part B": ("B", "part_b"),
        "Part C": ("C", "part_c"),
        "Mixed": ("A", "part_a"),  # default for this starter; use assembly rules later
    }
    return mapping.get(value, ("A", "part_a"))


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "_", text)
    return re.sub(r"_+", "_", text).strip("_")


def build_generation_prompt(blueprint: Dict[str, Any], index: int) -> str:
    part_letter, difficulty_id = normalize_part(blueprint.get("difficulty_level"))
    created_at = now_iso()

    return f"""
You are generating one original Waterloo Gauss Grade 7 multiple-choice math question.
Return JSON only. No Markdown. No explanation outside JSON.

Blueprint:
- blueprint_code: {blueprint.get('blueprint_code')}
- blueprint_name: {blueprint.get('blueprint_name')}
- program_name: Waterloo Gauss
- grade: 7
- target contest_part: {part_letter}
- difficulty id: {difficulty_id}
- primary_topic: {blueprint.get('primary_topic')}
- secondary_topic: {blueprint.get('secondary_topic')}
- archetype: {blueprint.get('archetype')}
- reasoning_goal: {blueprint.get('reasoning_goal')}
- generation_pattern: {blueprint.get('generation_pattern')}
- common_misconceptions: {blueprint.get('common_misconceptions')}
- coaching_entry: {blueprint.get('coaching_entry')}
- difficulty_drivers: {blueprint.get('difficulty_drivers')}
- distractor_strategy: {blueprint.get('distractor_strategy')}
- visual_required: {blueprint.get('visual_required')}
- visual_type: {blueprint.get('visual_type')}
- visual_generation_notes: {blueprint.get('visual_generation_notes')}

Question requirements:
1. Create an original question. Do not copy any past question wording or context.
2. Use five answer choices A-E.
3. Exactly one answer must be correct.
4. Include useful distractor_rationale for every wrong answer.
5. Include coaching.need_coaching_entry and 2-5 progressive hints.
6. Include coaching.wrong_answer_strategy for each wrong option.
7. If visual_required is true, create a structured visual spec, not an image.
8. For visual_data_extraction, prefer a bar_graph or line_graph with clear labels and integer values.
9. The correct answer must be directly supported by the visual data.
10. Keep language appropriate for Grade 7 Waterloo Gauss.

Return JSON with exactly these top-level keys:
id, program, grade, topic, subtopic, difficulty, contest_part, blueprint_code, archetype,
question_text, options, correct_answer, reasoning_skills, misconceptions,
distractor_rationale, solution, coaching, visual, validation, metadata, generation_params, analytics

Use these fixed values where appropriate:
- program: waterloo_gauss
- grade: 7
- difficulty: {difficulty_id}
- contest_part: {part_letter}
- blueprint_code: {blueprint.get('blueprint_code')}
- archetype: {blueprint.get('archetype')}
- metadata.source: ai_generated
- metadata.generation_model: {DEFAULT_MODEL}
- metadata.generation_prompt_version: {PROMPT_VERSION}
- metadata.created_at: {created_at}
- validation.review_status: draft
- validation.similarity_check_status: not_checked

For id, use this format:
waterloo_gauss_{slugify(str(blueprint.get('blueprint_code')))}_{difficulty_id}_{index:04d}
""".strip()


def call_groq(prompt: str, model: str = DEFAULT_MODEL) -> Dict[str, Any]:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("Missing GROQ_API_KEY in environment.")

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You generate valid JSON only. No Markdown."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.7,
        "max_tokens": 3000,
        "response_format": {"type": "json_object"},
    }
    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json=payload,
        timeout=90,
    )
    if response.status_code >= 400:
        raise RuntimeError(f"Groq API error {response.status_code}: {response.text[:1000]}")
    content = response.json()["choices"][0]["message"]["content"]
    try:
        return json.loads(content)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Groq returned invalid JSON: {content[:1000]}") from exc


def schema_errors(question: Dict[str, Any], schema: Dict[str, Any]) -> List[str]:
    validator = Draft7Validator(schema)
    errors = sorted(validator.iter_errors(question), key=lambda e: e.path)
    return [f"{list(e.path)}: {e.message}" for e in errors]


def deterministic_checks(question: Dict[str, Any]) -> List[str]:
    issues: List[str] = []
    options = question.get("options", {})
    correct = question.get("correct_answer")
    if set(options.keys()) != {"A", "B", "C", "D", "E"}:
        issues.append("options must contain exactly A, B, C, D, E")
    if correct not in options:
        issues.append("correct_answer must be one of A-E")

    visual = question.get("visual", {}) or {}
    visual_type = visual.get("type", "none")
    visual_required = bool(visual.get("required", False))
    if visual_type not in ALLOWED_VISUAL_TYPES:
        issues.append(f"invalid visual.type: {visual_type}")
    if visual_required and visual_type == "none":
        issues.append("visual.required is true but visual.type is none")
    if not visual_required and visual_type != "none":
        issues.append("visual.required is false but visual.type is not none")

    # Basic graph checks. These do not prove the math, but catch malformed specs.
    spec = visual.get("spec")
    if visual_type in {"bar_graph", "line_graph"}:
        if not isinstance(spec, dict):
            issues.append("graph visual.spec must be an object")
        else:
            labels = spec.get("x_labels") or spec.get("labels")
            values = spec.get("values")
            if not isinstance(labels, list) or not isinstance(values, list):
                issues.append("graph spec needs x_labels/labels and values arrays")
            elif len(labels) != len(values) or len(labels) < 3:
                issues.append("graph labels and values must have same length and at least 3 items")
            elif len(set(values)) != len(values):
                issues.append("graph values should be distinct in this starter validator to avoid ties")

    # Distractor rationales and wrong answer coaching should not be empty for wrong options.
    rationales = question.get("distractor_rationale", {}) or {}
    wrong_strategy = (question.get("coaching", {}) or {}).get("wrong_answer_strategy", {}) or {}
    for label in ["A", "B", "C", "D", "E"]:
        if label == correct:
            continue
        if not rationales.get(label):
            issues.append(f"missing distractor_rationale for wrong option {label}")
        if not wrong_strategy.get(label):
            issues.append(f"missing wrong_answer_strategy for wrong option {label}")

    return issues


def compute_hash(question: Dict[str, Any]) -> str:
    canonical = json.dumps(
        {
            "question_text": question.get("question_text", ""),
            "options": question.get("options", {}),
            "visual": question.get("visual", {}),
        },
        sort_keys=True,
        ensure_ascii=False,
    )
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def build_insert_row(question: Dict[str, Any], blueprint: Dict[str, Any], schema_valid: bool, validation_issues: List[str]) -> Dict[str, Any]:
    part_letter = question.get("contest_part") or normalize_part(blueprint.get("difficulty_level"))[0]
    visual = question.get("visual", {}) or {}
    validation = question.get("validation", {}) or {}
    validation.update({
        "schema_valid": schema_valid,
        "deterministic_issues": validation_issues,
        "review_status": "draft" if validation_issues else "validated",
        "similarity_check_status": validation.get("similarity_check_status", "not_checked"),
    })

    return {
        "question_uid": question.get("id"),
        "program_name": "Waterloo Gauss",
        "grade": int(question.get("grade", 7)),
        "part": part_letter,
        "blueprint_id": blueprint.get("id"),
        "blueprint_code": blueprint.get("blueprint_code"),
        "primary_topic": blueprint.get("primary_topic"),
        "secondary_topic": blueprint.get("secondary_topic"),
        "archetype": blueprint.get("archetype"),
        "question_text": question.get("question_text"),
        "answer_choices": question.get("options"),
        "correct_answer": question.get("correct_answer"),
        "solution_steps": question.get("solution", {}).get("steps", []),
        "distractor_rationales": question.get("distractor_rationale", {}),
        "reasoning_skills": question.get("reasoning_skills", []),
        "misconceptions": question.get("misconceptions", []),
        "coaching_hints": question.get("coaching", {}).get("progressive_hints", []),
        "wrong_answer_coaching": question.get("coaching", {}).get("wrong_answer_strategy", {}),
        "visual_required": bool(visual.get("required", False)),
        "visual_type": visual.get("type", "none"),
        "visual_spec": visual.get("spec"),
        "question_json": question,
        "question_hash": compute_hash(question),
        "similarity_check_status": validation.get("similarity_check_status", "not_checked"),
        "generation_model": question.get("metadata", {}).get("generation_model", DEFAULT_MODEL),
        "generation_prompt_version": PROMPT_VERSION,
        "validation_result": validation,
        "review_status": validation["review_status"],
        "is_active": True,
    }


def insert_question(supabase: Client, row: Dict[str, Any]) -> None:
    # Upsert by question_uid so rerunning the same generated id updates the draft row.
    supabase.table("mathcoach_generated_questions").upsert(row, on_conflict="question_uid").execute()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--blueprint", default="visual_data_extraction")
    parser.add_argument("--count", type=int, default=5)
    parser.add_argument("--schema", default=SCHEMA_PATH)
    parser.add_argument("--model", default=DEFAULT_MODEL)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    load_dotenv()
    schema = load_schema(args.schema)
    supabase = get_supabase()
    blueprint = fetch_blueprint(supabase, args.blueprint)
    print(f"Loaded blueprint: {blueprint['blueprint_code']} ({blueprint.get('blueprint_name')})")

    summary = []
    for i in range(1, args.count + 1):
        print(f"\nGenerating candidate {i}/{args.count}...")
        prompt = build_generation_prompt(blueprint, i)
        question = call_groq(prompt, args.model)

        s_errors = schema_errors(question, schema)
        d_errors = deterministic_checks(question)
        all_issues = s_errors + d_errors
        row = build_insert_row(question, blueprint, schema_valid=not s_errors, validation_issues=all_issues)

        print(f"question_uid: {row['question_uid']}")
        print(f"review_status: {row['review_status']}")
        if all_issues:
            print("issues:")
            for issue in all_issues[:10]:
                print(f" - {issue}")

        if not args.dry_run:
            insert_question(supabase, row)
            print("stored in Supabase")
        else:
            out_path = f"dry_run_{row['question_uid']}.json"
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(question, f, indent=2, ensure_ascii=False)
            print(f"dry run saved: {out_path}")

        summary.append({"question_uid": row["question_uid"], "review_status": row["review_status"], "issue_count": len(all_issues)})

    print("\nSummary:")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
