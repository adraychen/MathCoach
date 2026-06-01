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
                p.difficulty_level,
                p.evidence_level,
                p.dev_generation_target,
                p.requires_visual,
                p.priority,
                p.notes,
                COALESCE(COUNT(q.id), 0) AS generated_count
            FROM mathcoach_blueprint_generation_plan p
            LEFT JOIN mathcoach_questions q
                ON q.blueprint_code = p.blueprint_code
            WHERE p.program_name = 'Waterloo Gauss'
              AND p.grade = 7
              AND p.is_active = true
            GROUP BY p.id, p.blueprint_code, p.difficulty_level,
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
                how_to_generate_distractor
            FROM mathcoach_blueprint_distractor_patterns
            WHERE blueprint_code = :code AND is_active = true
        """),
        {"code": blueprint_code}
    )
    return [dict(row._mapping) for row in result]


def get_blueprint_specific_rules(blueprint_code: str) -> str:
    """Return blueprint-specific generation rules."""
    rules = {
        "angle_deduction_fundamentals": """
GEOMETRY CONSISTENCY RULES (CRITICAL):
- The text, visual spec, and solution must describe the SAME diagram.
- Do NOT label an angle formed by three collinear points as anything other than 180°.
- If D lies on the extension of BC beyond C, then B, C, D are collinear and angle BCD is exactly 180°.
- Do NOT say "angle BCD = 120°" if B, C, and D are collinear on a straight line.
- If using an exterior angle, name it with non-collinear rays (e.g., angle ACD), not the straight-line angle.
- Every named angle must be geometrically possible from the described points.
- Avoid unnecessary point extensions unless the target angle requires them.
- Prefer simple valid structures: triangle angle sum, straight-line supplementary angles, isosceles base angles.
- Before finalizing, verify that the diagram description, labels, correct answer, and solution do not contradict each other.

ALLOWED FIRST-ROUND ANGLE TEMPLATES:
1. Triangle with two known interior angles; ask for third interior angle.
2. Triangle with two known interior angles; side extended at one vertex; ask for exterior angle.
3. Isosceles triangle with vertex angle known; ask for base angle.
4. Isosceles triangle with base angle known; ask for exterior angle at a base vertex.
""",
        "arithmetic_progression_membership": """
SEQUENCE CONSISTENCY RULES (CRITICAL):
- State the complete repeating cycle clearly in the question.
- Identify cycle_length explicitly in your solution.
- Choose term_position and compute term_position ÷ cycle_length.
- If remainder = 0, the correct value is the LAST item in the cycle.
- If remainder != 0, the correct value is the item at that 1-based remainder position.
- The correct_answer, distractor_rationale, and solution MUST agree.
- Do NOT include self-correction language like "but wait" or "this contradicts."
- Double-check: cycle length, term position, division, remainder, and final answer must all be consistent.
""",
        "visual_data_extraction": """
VISUAL DATA RULES:
- Start the question with "In the graph," or "Based on the bar graph shown,".
- The visual spec values and x_labels must match what the question asks about.
- The correct answer must be directly readable from the visual data.
- Do NOT require calculations beyond simple comparison or reading values.
""",
    }
    return rules.get(blueprint_code, "")


def format_distractor_patterns(patterns: list[dict[str, Any]]) -> str:
    """Format distractor patterns for inclusion in the prompt."""
    if not patterns:
        return ""

    lines = ["\nDISTRACTOR PATTERNS (use these to create plausible wrong answers):"]
    for p in patterns:
        lines.append(f"""
Pattern: {p.get('distractor_pattern_name')}
- Wrong answer logic: {p.get('wrong_answer_logic')}
- Misconception targeted: {p.get('misconception_targeted')}
- How to generate: {p.get('how_to_generate_distractor')}""")

    return "\n".join(lines)


def build_generation_prompt(
    blueprint: dict[str, Any],
    index: int,
    distractor_patterns: list[dict[str, Any]] | None = None,
) -> str:
    part_letter, difficulty_id = normalize_part(blueprint.get("difficulty_level"))
    created_at = now_iso()
    blueprint_code = blueprint.get('blueprint_code', '')
    blueprint_rules = get_blueprint_specific_rules(blueprint_code)
    distractor_section = format_distractor_patterns(distractor_patterns or [])

    return f"""
You are generating one original Waterloo Gauss Grade 7 multiple-choice math question.
Return JSON only. No Markdown. No explanation outside JSON.

WATERLOO GAUSS STYLE (MANDATORY):
- Write in formal, concise contest style. Every word must serve the mathematical setup.
- Use direct setup structure: "If...", "Suppose...", "A list of...", or "In the diagram,".
- Follow with specific question: "What is...", "How many...", "Which of the following...".
- Part A: 1 sentence. Part B: 2 sentences. Part C: 3-4 concise sentences.
- Neutral tone. No instructional fluff like "Let's explore," "Help Dan," "Remember that...".
- Use Grade 7 technical terms (integer, prime, mean, sum, product) without explanation.
- Order all numerical answer choices from LEAST to GREATEST.
- If a visual is required, start the question with "In the diagram," or "Based on the graph shown,".

DISTRACTOR RULES (MANDATORY):
- Each wrong answer must represent a PLAUSIBLE student error (not arbitrary).
- The correct answer MUST have distractor_rationale = null (not an explanation of why it's correct).
- Wrong answer rationales explain the mistake that leads to choosing that answer.
{distractor_section}
SOLUTION RULES (MANDATORY):
- The solution steps must be mathematically correct.
- The solution must agree with correct_answer.
- Do NOT include self-doubt language like "but wait" or "let me check again".
{blueprint_rules}
Blueprint:
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
- distractor_strategy: {blueprint.get('distractor_strategy')}
- visual_required: {blueprint.get('visual_required')}
- visual_type: {blueprint.get('visual_type')}

Return JSON with these keys:
- id: use format waterloo_gauss_{blueprint_code}_{difficulty_id}_{index:04d}
- program: "waterloo_gauss"
- topic: primary topic slug
- subtopic: secondary topic slug or null
- difficulty: "{difficulty_id}"
- archetype: "{blueprint.get('archetype')}"
- question_text: the question (Waterloo style, concise)
- options: {{"A": "...", "B": "...", "C": "...", "D": "...", "E": "..."}} (ordered least to greatest)
- correct_answer: one of A-E
- reasoning_skills: array of skills
- misconceptions: array of common mistakes
- distractor_rationale: {{"A": "why wrong or null if correct", "B": "...", ...}} (null for correct answer!)
- solution: {{"steps": ["step1", "step2"], "key_insight": "main idea"}}
- coaching_hints: ["hint1", "hint2", "hint3"]
- visual: {{"required": {str(blueprint.get('visual_required', False)).lower()}, "type": "{blueprint.get('visual_type', 'none')}", "spec": {{...data for rendering...}}}}
- metadata: {{"source": "ai_generated", "blueprint_code": "{blueprint_code}", "created_at": "{created_at}"}}

For visual.spec based on visual_type:
- bar_graph: {{"title": "...", "x_labels": ["A", "B", "C"], "values": [10, 20, 30], "y_axis_label": "..."}}
- line_graph: {{"title": "...", "x_labels": ["A", "B", "C"], "values": [10, 20, 30], "y_axis_label": "..."}}
- geometry_diagram: {{"description": "...", "shapes": [...], "labels": [...], "angles": [...]}}
- coordinate_grid: {{"points": [{{"x": 1, "y": 2, "label": "A"}}], "x_range": [-5, 5], "y_range": [-5, 5]}}
- table: {{"headers": ["Col1", "Col2"], "rows": [["a", "b"], ["c", "d"]]}}
- fraction_area: {{"total_parts": 8, "shaded_parts": 3, "shape": "rectangle"}}
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
    question = call_groq(prompt, model)

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
