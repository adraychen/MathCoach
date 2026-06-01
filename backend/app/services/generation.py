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


def generate_unique_id(blueprint_code: str, difficulty_id: str) -> str:
    """Generate unique question ID using timestamp."""
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S%f")[:18]
    return f"waterloo_gauss_{blueprint_code}_{difficulty_id}_{timestamp}"


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


def get_generation_plan(db: Session) -> list[dict[str, Any]]:
    """Get generation plan with current progress."""
    result = db.execute(
        text("""
            SELECT
                p.id,
                p.blueprint_code,
                b.blueprint_name,
                p.difficulty_level,
                p.evidence_level,
                p.dev_generation_target,
                p.requires_visual,
                p.priority,
                p.notes,
                COALESCE(COUNT(q.id), 0) AS generated_count
            FROM mathcoach_blueprint_generation_plan p
            LEFT JOIN mathcoach_question_blueprints b
                ON b.blueprint_code = p.blueprint_code
            LEFT JOIN mathcoach_questions q
                ON q.blueprint_code = p.blueprint_code
            WHERE p.program_name = 'Waterloo Gauss'
              AND p.grade = 7
              AND p.is_active = true
            GROUP BY p.id, p.blueprint_code, b.blueprint_name, p.difficulty_level,
                     p.evidence_level, p.dev_generation_target,
                     p.requires_visual, p.priority, p.notes
            ORDER BY p.priority, p.blueprint_code
        """)
    )
    return [dict(row._mapping) for row in result]


def get_next_blueprint_to_generate(db: Session) -> dict[str, Any] | None:
    """Get the next blueprint that needs questions generated."""
    result = db.execute(
        text("""
            SELECT
                p.blueprint_code,
                p.dev_generation_target,
                p.requires_visual,
                p.priority,
                COALESCE(COUNT(q.id), 0) AS generated_count
            FROM mathcoach_blueprint_generation_plan p
            LEFT JOIN mathcoach_questions q
                ON q.blueprint_code = p.blueprint_code
            WHERE p.program_name = 'Waterloo Gauss'
              AND p.grade = 7
              AND p.is_active = true
            GROUP BY p.id, p.blueprint_code, p.dev_generation_target,
                     p.requires_visual, p.priority
            HAVING COALESCE(COUNT(q.id), 0) < p.dev_generation_target
            ORDER BY p.priority, p.blueprint_code
            LIMIT 1
        """)
    )
    row = result.fetchone()
    return dict(row._mapping) if row else None


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


def get_distractor_patterns(db: Session, blueprint_code: str) -> list[dict[str, Any]]:
    """Get distractor patterns for a blueprint."""
    result = db.execute(
        text("""
            SELECT
                distractor_pattern_name,
                wrong_answer_logic,
                misconception_targeted,
                how_to_generate_distractor,
                wrong_answer_coaching_strategy
            FROM mathcoach_blueprint_distractor_patterns
            WHERE blueprint_code = :code AND is_active = true
        """),
        {"code": blueprint_code}
    )
    return [dict(row._mapping) for row in result]


def get_layer_d_safety_rules(blueprint_code: str) -> str:
    """Return Layer D: blueprint-specific safety rules."""
    rules = {
        "angle_deduction_fundamentals": """
LAYER D — BLUEPRINT SAFETY RULES (geometry):
GEOMETRY CONSTRAINTS:
- Text, visual spec, and solution must describe the same diagram.
- Do not assign a non-180° angle to three collinear points.
- If D lies on the extension of BC beyond C, then B, C, and D are collinear and ∠BCD = 180°.
- If asking for an exterior angle at C, use ∠ACD, not ∠BCD.
- Every named angle must be geometrically possible from the point positions.
- Prefer simple valid structures: triangle angle sum, straight-line supplementary angle, isosceles base angles.

WORDING TEMPLATES (use only these patterns):
Allowed:
- "∠ABC is a right angle."
- "A, B, and C lie on a straight line."
- "Point D lies on the extension of BC beyond C."
- "In triangle ABC, ∠A = __° and ∠B = __°."
- "What is the measure of ∠___?"
Forbidden:
- "angle ABD forms a right angle with ray BD"
- "ray forms an angle with an angle"
- "CD is a straight line" (use "C, D, and E lie on a straight line")
- "angle DBC is a straight line"
Rule: Every angle must be named using three points, with the vertex as the middle letter.

VISUAL TEMPLATE SELECTION:
- For "find the missing angle in a triangle" → use triangle_angles
- For "exterior angle of a triangle" → use triangle_exterior
- For "isosceles triangle with exterior angle" → use isosceles_triangle
- For "two intersecting lines, vertical angles" → use intersecting_lines
- For "right angle divided by a ray" (∠ABC = 90°, find ∠ABD or ∠DBC) → use right_angle_with_ray
- For "right triangle with point D on a side" (triangle ABC with D on BC) → use right_triangle_with_point
""",
        "arithmetic_progression_membership": """
LAYER D — BLUEPRINT SAFETY RULES (repeating cycles):
CYCLE RULES:
- State the full cycle clearly.
- Use 1-based indexing.
- If term_position mod cycle_length = 0, the answer is the last item in the cycle.
- If remainder is not 0, the answer is the item at that remainder position.

ANSWER-KEY VERIFICATION (required before output):
1. Compute the correct answer two ways:
   - Formula method: position mod cycle_length
   - Direct check: list terms up to position (for small n) or verify formula (for large n)
2. Confirm the computed value matches the option labeled as correct_answer.
3. Confirm solution.steps produce the same value as correct_answer.
4. If any mismatch occurs, fix before output.
Rule: Do not output a question if the correct_answer letter and solution value disagree.
Example check: If solution says "answer is 53" but correct_answer is "C" and options.C is "57", this is INVALID.
""",
        "visual_data_extraction": """
LAYER D — BLUEPRINT SAFETY RULES (visual data):
- Start the question with "In the graph," or "Based on the bar graph shown,".
- The visual spec values and x_labels must match what the question asks about.
- The correct answer must be directly readable from the visual data.
""",
    }
    return rules.get(blueprint_code, "")


def format_layer_c_distractor_patterns(patterns: list[dict[str, Any]]) -> str:
    """Format Layer C: distractor patterns from database."""
    if not patterns:
        return ""

    lines = ["\nLAYER C — DISTRACTOR PATTERNS:"]
    for p in patterns:
        lines.append(f"""
Use this distractor pattern:
Pattern name: {p.get('distractor_pattern_name')}
Wrong-answer logic: {p.get('wrong_answer_logic')}
Misconception: {p.get('misconception_targeted')}
How to generate: {p.get('how_to_generate_distractor')}
Coaching strategy: {p.get('wrong_answer_coaching_strategy', '')}""")

    return "\n".join(lines)


def build_generation_prompt(
    blueprint: dict[str, Any],
    index: int,
    distractor_patterns: list[dict[str, Any]] | None = None,
) -> str:
    part_letter, difficulty_id = normalize_part(blueprint.get("difficulty_level"))
    created_at = now_iso()
    blueprint_code = blueprint.get('blueprint_code', '')
    layer_c = format_layer_c_distractor_patterns(distractor_patterns or [])
    layer_d = get_layer_d_safety_rules(blueprint_code)

    return f"""
You are generating one original Waterloo Gauss Grade 7 multiple-choice math question.

LAYER A — GLOBAL STYLE RULES:
Write in Waterloo Gauss Grade 7 style:
- Concise, neutral, and contest-like
- Clear for Grade 7 students
- No lesson-like wording
- No unnecessary story details
- No hints embedded in the question text
- No explanation of the method in the question text
- Answer choices should be clean and similar in format
- Order numerical answer choices from least to greatest

LAYER B — SCHEMA RULES:
- Return valid JSON only. No Markdown. No explanation outside JSON.
- Use A–E answer choices.
- Exactly one correct_answer.
- The correct answer must have distractor_rationale = null.
- Each wrong answer must have a specific misconception-based rationale.
- The solution must agree with correct_answer.
- No self-correction wording such as "but wait" or "this contradicts."
{layer_c}
{layer_d}
BLUEPRINT CONTEXT:
- blueprint_code: {blueprint_code}
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
- visual_required: {blueprint.get('visual_required')}
- visual_type: {blueprint.get('visual_type')}

JSON SCHEMA:
Return JSON with these keys:
- id: use format waterloo_gauss_{blueprint_code}_{difficulty_id}_{index:04d}
- program: "waterloo_gauss"
- topic: primary topic slug
- subtopic: secondary topic slug or null
- difficulty: "{difficulty_id}"
- archetype: "{blueprint.get('archetype')}"
- question_text: the question (Waterloo style, concise)
- options: {{"A": "...", "B": "...", "C": "...", "D": "...", "E": "..."}}
- correct_answer: one of A-E
- reasoning_skills: array of skills
- misconceptions: array of common mistakes
- distractor_rationale: {{"A": "why wrong or null if correct", "B": "...", ...}}
- solution: {{"steps": ["step1", "step2"], "key_insight": "main idea"}}
- coaching_hints: ["hint1", "hint2", "hint3"]
- visual: {{"required": {str(blueprint.get('visual_required', False)).lower()}, "type": "{blueprint.get('visual_type', 'none')}", "spec": {{...}}}}
- metadata: {{"source": "ai_generated", "blueprint_code": "{blueprint_code}", "created_at": "{created_at}"}}

VISUAL SPEC FORMATS:
- bar_graph: {{"title": "...", "x_labels": [...], "values": [...], "y_axis_label": "..."}}
- line_graph: {{"title": "...", "x_labels": [...], "values": [...], "y_axis_label": "..."}}
- geometry_diagram: Use one of these templates:
  * triangle_angles: {{"diagram_type": "triangle_angles", "angle_a": 60, "angle_b": 50, "angle_c": 70, "target_angle": "C"}}
  * triangle_exterior: {{"diagram_type": "triangle_exterior", "angle_a": 60, "angle_b": 50, "angle_c": 70, "exterior_angle": 110, "target_angle": "ACD"}}
  * isosceles_triangle: {{"diagram_type": "isosceles_triangle", "vertex_angle": 40, "base_angle": 70, "target_angle": "ACD"}}
  * intersecting_lines: {{"diagram_type": "intersecting_lines", "angle_1": 35, "angle_2": 55, "target_angle": "2"}}
  * right_angle_with_ray: {{"diagram_type": "right_angle_with_ray", "angle_abd": 35, "angle_dbc": 55, "target_angle": "DBC"}} (right angle at B, ray BD divides the 90° angle into ∠ABD and ∠DBC)
  Use target_angle to indicate which angle is the unknown (shown as "?")
- coordinate_grid: {{"points": [{{"x": 1, "y": 2, "label": "A"}}], "x_range": [-5, 5], "y_range": [-5, 5]}}
- table: {{"headers": [...], "rows": [[...], [...]]}}
- fraction_area: {{"total_parts": 8, "shaded_parts": 3, "shape": "rectangle"}}
""".strip()


def call_llm(prompt: str, model: str = DEFAULT_MODEL) -> dict[str, Any]:
    """Call OpenRouter API to generate a question."""
    settings = get_settings()

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You generate valid JSON only. No Markdown."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.7,
        "max_tokens": 4500,
        "response_format": {"type": "json_object"},
    }

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {settings.openrouter_api_key}",
            "Content-Type": "application/json"
        },
        json=payload,
        timeout=90,
    )

    if response.status_code >= 400:
        raise RuntimeError(f"OpenRouter API error {response.status_code}: {response.text[:500]}")

    content = response.json()["choices"][0]["message"]["content"]

    try:
        return json.loads(content)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Groq returned invalid JSON: {content[:500]}") from exc


def validate_question(question: dict[str, Any], blueprint: dict[str, Any] | None = None) -> list[str]:
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

    # Validate visual if blueprint requires it
    if blueprint and blueprint.get("visual_required"):
        visual = question.get("visual")
        if not visual:
            issues.append("visual is required for this blueprint")
        elif not isinstance(visual, dict):
            issues.append("visual must be an object")
        else:
            if not visual.get("required"):
                issues.append("visual.required must be true")
            if not visual.get("type") or visual.get("type") == "none":
                issues.append("visual.type must be specified")
            if not visual.get("spec"):
                issues.append("visual.spec must contain rendering data")
            else:
                spec = visual.get("spec", {})
                visual_type = visual.get("type")
                # Validate spec based on type
                if visual_type == "bar_graph" or visual_type == "line_graph":
                    if not spec.get("x_labels"):
                        issues.append(f"{visual_type} requires x_labels")
                    if not spec.get("values"):
                        issues.append(f"{visual_type} requires values")
                    elif spec.get("x_labels") and len(spec.get("x_labels", [])) != len(spec.get("values", [])):
                        issues.append(f"{visual_type} x_labels and values must have same length")

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

    # Fetch distractor patterns for this blueprint
    distractor_patterns = get_distractor_patterns(db, blueprint_code)

    prompt = build_generation_prompt(blueprint, index, distractor_patterns)
    question = call_llm(prompt, model)

    # Override ID with unique timestamp-based ID
    _, difficulty_id = normalize_part(blueprint.get("difficulty_level"))
    question["id"] = generate_unique_id(blueprint_code, difficulty_id)

    # Validate (pass blueprint to check visual requirements)
    issues = validate_question(question, blueprint)
    question["_validation_issues"] = issues
    question["_blueprint"] = blueprint_code
    question["_hash"] = compute_hash(question)

    return question


def save_question_to_db(db: Session, question: dict[str, Any]) -> str:
    """Save generated question to mathcoach_questions table."""
    from ..database import QuestionModel

    # Remove internal fields
    q = {k: v for k, v in question.items() if not k.startswith("_")}

    # Extract visual info
    visual = q.get("visual") or {}
    visual_required = visual.get("required", False) if isinstance(visual, dict) else False
    visual_type = visual.get("type") if isinstance(visual, dict) else None

    # Extract blueprint_code from metadata
    metadata = q.get("metadata") or {}
    blueprint_code = metadata.get("blueprint_code") if isinstance(metadata, dict) else None

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
        visual=q.get("visual"),
        question_metadata=q.get("metadata"),
        # New direct lookup fields
        blueprint_code=blueprint_code,
        environment="dev",
        review_status="draft",
        is_active=True,
        visual_required=visual_required,
        visual_type=visual_type if visual_type and visual_type != "none" else None,
    )

    db.add(db_question)
    db.commit()

    return db_question.id
