"""
Question generation service using Groq AI.
Adapted from generators/mathcoach_generate_visual_data_questions_groq.py
"""

import hashlib
import json
import os
import re
from datetime import datetime, timezone
from typing import Any

import requests
from sqlalchemy.orm import Session
from sqlalchemy import text

from ..config import get_settings

PROMPT_VERSION = "gauss_g7_dev_v1"
DEFAULT_MODEL = os.getenv("GROQ_MODEL", "qwen/qwen3-32b")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "_", text)
    return re.sub(r"_+", "_", text).strip("_")


def normalize_part(difficulty_level: str | None) -> tuple[str, str]:
    """Return (contest_part_letter, schema_difficulty_id)."""
    value = (difficulty_level or "Part A").strip()
    mapping = {
        "Part A": ("A", "part_a"),
        "Part B": ("B", "part_b"),
        "Part C": ("C", "part_c"),
        "Mixed": ("A", "part_a"),
    }
    return mapping.get(value, ("A", "part_a"))


def get_blueprints(db: Session) -> list[dict[str, Any]]:
    """Get all active blueprints."""
    result = db.execute(
        text("""
            SELECT id, blueprint_code, blueprint_name, primary_topic,
                   difficulty_level, visual_required
            FROM mathcoach_question_blueprints
            WHERE program_name = 'Waterloo Gauss' AND is_active = true
            ORDER BY blueprint_code
        """)
    )
    return [dict(row._mapping) for row in result]


def get_blueprint(db: Session, blueprint_code: str) -> dict[str, Any] | None:
    """Get a single blueprint by code."""
    result = db.execute(
        text("""
            SELECT * FROM mathcoach_question_blueprints
            WHERE program_name = 'Waterloo Gauss' AND blueprint_code = :code
            LIMIT 1
        """),
        {"code": blueprint_code}
    )
    row = result.fetchone()
    return dict(row._mapping) if row else None


def build_generation_prompt(blueprint: dict[str, Any], index: int) -> str:
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

Question requirements:
1. Create an original question. Do not copy any past question wording.
2. Use five answer choices A-E.
3. Exactly one answer must be correct.
4. Include distractor_rationale for every wrong answer.
5. Include coaching_hints with 2-4 progressive hints.
6. Keep language appropriate for Grade 7.

Return JSON with these keys:
- id: use format waterloo_gauss_{blueprint.get('blueprint_code')}_{difficulty_id}_{index:04d}
- program: "waterloo_gauss"
- topic: primary topic slug
- subtopic: secondary topic slug or null
- difficulty: "{difficulty_id}"
- archetype: "{blueprint.get('archetype')}"
- question_text: the question
- options: {{"A": "...", "B": "...", "C": "...", "D": "...", "E": "..."}}
- correct_answer: one of A-E
- reasoning_skills: array of skills
- misconceptions: array of common mistakes
- distractor_rationale: {{"A": "why wrong or null if correct", ...}}
- solution: {{"steps": ["step1", "step2"], "key_insight": "main idea"}}
- coaching_hints: ["hint1", "hint2", "hint3"]
- metadata: {{"source": "ai_generated", "blueprint_code": "{blueprint.get('blueprint_code')}", "created_at": "{created_at}"}}
""".strip()


def call_groq(prompt: str, model: str = DEFAULT_MODEL) -> dict[str, Any]:
    """Call Groq API to generate a question."""
    settings = get_settings()

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
        headers={
            "Authorization": f"Bearer {settings.groq_api_key}",
            "Content-Type": "application/json"
        },
        json=payload,
        timeout=90,
    )

    if response.status_code >= 400:
        raise RuntimeError(f"Groq API error {response.status_code}: {response.text[:500]}")

    content = response.json()["choices"][0]["message"]["content"]

    try:
        return json.loads(content)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Groq returned invalid JSON: {content[:500]}") from exc


def validate_question(question: dict[str, Any]) -> list[str]:
    """Basic validation of generated question."""
    issues = []

    options = question.get("options", {})
    correct = question.get("correct_answer")

    if set(options.keys()) != {"A", "B", "C", "D", "E"}:
        issues.append("options must contain exactly A, B, C, D, E")
    if correct not in options:
        issues.append("correct_answer must be one of A-E")
    if not question.get("question_text"):
        issues.append("question_text is required")
    if not question.get("coaching_hints"):
        issues.append("coaching_hints are required")

    return issues


def compute_hash(question: dict[str, Any]) -> str:
    canonical = json.dumps(
        {
            "question_text": question.get("question_text", ""),
            "options": question.get("options", {}),
        },
        sort_keys=True,
        ensure_ascii=False,
    )
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def generate_question(
    db: Session,
    blueprint_code: str,
    index: int = 1,
    model: str = DEFAULT_MODEL,
) -> dict[str, Any]:
    """Generate a single question from a blueprint."""
    blueprint = get_blueprint(db, blueprint_code)
    if not blueprint:
        raise ValueError(f"Blueprint not found: {blueprint_code}")

    prompt = build_generation_prompt(blueprint, index)
    question = call_groq(prompt, model)

    # Validate
    issues = validate_question(question)
    question["_validation_issues"] = issues
    question["_blueprint"] = blueprint_code
    question["_hash"] = compute_hash(question)

    return question


def save_question_to_db(db: Session, question: dict[str, Any]) -> str:
    """Save generated question to mathcoach_questions table."""
    from ..database import QuestionModel

    # Remove internal fields
    q = {k: v for k, v in question.items() if not k.startswith("_")}

    db_question = QuestionModel(
        id=q.get("id"),
        program=q.get("program", "waterloo_gauss"),
        topic=q.get("topic", ""),
        subtopic=q.get("subtopic"),
        difficulty=q.get("difficulty", "part_a"),
        archetype=q.get("archetype"),
        question_text=q.get("question_text", ""),
        options=q.get("options", {}),
        correct_answer=q.get("correct_answer", "A"),
        reasoning_skills=q.get("reasoning_skills", []),
        misconceptions=q.get("misconceptions", []),
        distractor_rationale=q.get("distractor_rationale"),
        solution=q.get("solution"),
        coaching_hints=q.get("coaching_hints", []),
        question_metadata=q.get("metadata"),
    )

    db.add(db_question)
    db.commit()

    return db_question.id
