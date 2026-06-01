"""
Question generation service using Groq AI.
Adapted from generators/mathcoach_generate_visual_data_questions_groq.py
"""

import hashlib
import json
import os
import random
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
LAYER D — BLUEPRINT SAFETY RULES (arithmetic sequences):
REQUIRED: Include calculation_data object with these exact fields:
{
  "calculation_data": {
    "first_term": <integer>,
    "common_difference": <integer>,
    "term_number": <integer>
  }
}

FORMULA: a_n = first_term + (term_number - 1) × common_difference
Example: first_term=4, common_difference=7, term_number=100
  → 4 + (100-1) × 7 = 4 + 99 × 7 = 4 + 693 = 697

CRITICAL: The backend will verify your math. If calculation_data values don't match computed_answer_value, the question will be rejected.
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


def generate_arithmetic_sequence_data() -> dict[str, Any]:
    """Generate math data for arithmetic sequence questions.

    Backend controls the math, LLM only writes the prose.
    """
    # Generate reasonable values for Grade 7
    first_term = random.randint(2, 15)
    common_difference = random.randint(3, 12)
    term_number = random.choice([8, 10, 12, 15, 20, 25, 50, 100])

    # Compute correct answer: a_n = a + (n-1) * d
    computed_answer = first_term + (term_number - 1) * common_difference

    # Generate distractors based on known misconceptions
    distractors = [
        term_number * common_difference,                           # pure_multiple_trap (no offset)
        first_term + (term_number - 2) * common_difference,        # off_by_one_low
        first_term + term_number * common_difference,              # off_by_one_high
        (term_number - 1) * common_difference,                     # missing_offset (no first_term)
    ]

    # Remove any distractors that equal the correct answer
    distractors = [d for d in distractors if d != computed_answer]

    # Add more distractors if needed (close values)
    while len(distractors) < 4:
        offset = random.choice([-3, -2, 2, 3, 5, -5])
        new_distractor = computed_answer + offset
        if new_distractor > 0 and new_distractor not in distractors and new_distractor != computed_answer:
            distractors.append(new_distractor)

    # Take exactly 4 distractors
    distractors = distractors[:4]

    # Create all options and shuffle
    all_values = [computed_answer] + distractors
    random.shuffle(all_values)

    # Assign to A-E and sort by value (Waterloo style)
    all_values.sort()
    options = {chr(65 + i): str(v) for i, v in enumerate(all_values)}

    # Find correct answer letter
    correct_answer = None
    for letter, value in options.items():
        if int(value) == computed_answer:
            correct_answer = letter
            break

    return {
        "calculation_data": {
            "first_term": first_term,
            "common_difference": common_difference,
            "term_number": term_number,
            "formula": "first_term + (term_number - 1) * common_difference",
        },
        "computed_answer_value": str(computed_answer),
        "options": options,
        "correct_answer": correct_answer,
    }


def build_arithmetic_sequence_prompt(
    blueprint: dict[str, Any],
    math_data: dict[str, Any],
    distractor_patterns: list[dict[str, Any]] | None = None,
) -> str:
    """Build prompt for arithmetic sequence with pre-computed math."""
    part_letter, difficulty_id = normalize_part(blueprint.get("difficulty_level"))
    created_at = now_iso()
    blueprint_code = blueprint.get('blueprint_code', '')

    calc = math_data["calculation_data"]
    options_str = json.dumps(math_data["options"], indent=2)

    # Format distractor pattern info
    distractor_info = ""
    if distractor_patterns:
        for p in distractor_patterns:
            distractor_info += f"\n- {p.get('distractor_pattern_name')}: {p.get('misconception_targeted')}"

    return f"""
You are writing one Waterloo Gauss Grade 7 arithmetic sequence question.

THE MATH IS ALREADY COMPUTED — DO NOT CHANGE IT:
- First term: {calc['first_term']}
- Common difference: {calc['common_difference']}
- Term number: {calc['term_number']}
- Correct answer: {math_data['computed_answer_value']}
- Options (fixed): {options_str}
- Correct answer letter: {math_data['correct_answer']}

YOUR TASK: Write the question text and explanations. Do not change the math values.

STYLE RULES:
- Waterloo Gauss Grade 7 style: concise, neutral, contest-like
- Start with "A sequence begins..." or "The first term of a sequence is..."
- Show first 3-4 terms to establish the pattern
- Ask for the {calc['term_number']}th term
- No hints, no lesson-like wording

DISTRACTOR MISCONCEPTIONS:{distractor_info}
- pure_multiple_trap: student multiplies term_number × common_difference (forgets first_term)
- off_by_one: student uses wrong formula (n instead of n-1, or n-2)
- missing_offset: student computes (n-1) × d but forgets to add first_term

Return valid JSON with these keys:
- question_text: the question (Waterloo style)
- solution: {{"steps": ["step1", "step2", ...], "key_insight": "..."}}
- distractor_rationale: {{"A": "why wrong or null", "B": "...", "C": "...", "D": "...", "E": "..."}}
- coaching_hints: ["hint1", "hint2", "hint3"]

CRITICAL: Set distractor_rationale["{math_data['correct_answer']}"] = null (this is the correct answer)

Example question_text:
"A sequence begins 4, 11, 18, 25, ... What is the 100th term of this sequence?"

Example solution:
{{"steps": ["The sequence has first term 4 and common difference 7.", "Using a_n = a + (n-1)d: a_100 = 4 + (100-1)(7) = 4 + 693 = 697"], "key_insight": "Apply the arithmetic sequence formula with n=100"}}
""".strip()


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
- Use A–E answer choices (all five required).
- Exactly one correct_answer (a letter A-E).
- The correct answer must have distractor_rationale = null.
- Each wrong answer must have a specific misconception-based rationale.
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
- computed_answer_value: the exact final answer value (e.g., "53" or "120°")
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

LAYER E — COMPUTED ANSWER (required):
- Set computed_answer_value to the exact final answer from your solution.
- This value must appear exactly once in options A-E.
- Example: If the answer is 53, set "computed_answer_value": "53" and include "53" in one option.
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
        timeout=60,
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


def verify_arithmetic_sequence(question: dict[str, Any], blueprint_code: str) -> dict[str, Any]:
    """Programmatically verify arithmetic sequence calculations."""
    if blueprint_code != "arithmetic_progression_membership":
        return question

    calc_data = question.get("calculation_data")
    if not calc_data or not isinstance(calc_data, dict):
        question["_arithmetic_issue"] = "missing calculation_data"
        return question

    try:
        first_term = int(calc_data.get("first_term", 0))
        common_diff = int(calc_data.get("common_difference", 0))
        term_num = int(calc_data.get("term_number", 0))

        # Compute correct answer: a_n = a + (n-1) * d
        correct_value = first_term + (term_num - 1) * common_diff

        # Check if model's computed_answer_value matches
        model_value = question.get("computed_answer_value", "")
        try:
            model_int = int(str(model_value).strip())
        except (ValueError, TypeError):
            model_int = None

        if model_int != correct_value:
            question["_arithmetic_fixed"] = f"model said {model_value}, correct is {correct_value}"
            question["computed_answer_value"] = str(correct_value)

            # Also check if correct value is in options, if not replace one
            options = question.get("options", {})
            correct_str = str(correct_value)
            if correct_str not in [str(v) for v in options.values()]:
                # Replace option E with correct value
                options["E"] = correct_str
                question["_option_replaced"] = f"E (was {options.get('E', 'unknown')})"

    except (ValueError, TypeError) as e:
        question["_arithmetic_issue"] = f"invalid calculation_data: {e}"

    return question


def fix_answer_key(question: dict[str, Any]) -> dict[str, Any]:
    """Fix answer key based on computed_answer_value."""
    computed = str(question.get("computed_answer_value", "")).strip()
    if not computed:
        return question

    options = question.get("options", {})

    # Normalize for comparison (handle "120°" vs "120" etc.)
    def normalize(val: str) -> str:
        return str(val).strip().replace("°", "").replace("$", "").replace(",", "")

    computed_norm = normalize(computed)

    matching_letters = [
        letter for letter, value in options.items()
        if normalize(str(value)) == computed_norm
    ]

    if len(matching_letters) == 1:
        # Fix correct_answer to match the option containing computed value
        question["correct_answer"] = matching_letters[0]
        # Fix distractor_rationale
        if "distractor_rationale" in question:
            question["distractor_rationale"][matching_letters[0]] = None
        question["_answer_key_fixed"] = True
        return question

    if len(matching_letters) == 0:
        # Computed answer not in options - replace option E
        options["E"] = computed
        question["correct_answer"] = "E"
        if "distractor_rationale" in question:
            question["distractor_rationale"]["E"] = None
        question["_answer_key_fixed"] = True
        question["_option_replaced"] = "E"
        return question

    # Multiple options contain the same value - mark for review
    question["_answer_key_issue"] = f"computed_answer_value '{computed}' appears in multiple options: {matching_letters}"
    return question


def generate_arithmetic_sequence_question(
    db: Session,
    blueprint: dict[str, Any],
    distractor_patterns: list[dict[str, Any]],
    model: str = DEFAULT_MODEL,
    max_retries: int = 2,
) -> dict[str, Any]:
    """Template-assisted generation for arithmetic sequence questions.

    Backend computes the math, LLM only writes the prose.
    """
    blueprint_code = blueprint.get("blueprint_code", "")
    _, difficulty_id = normalize_part(blueprint.get("difficulty_level"))

    last_issues = []
    for attempt in range(max_retries):
        try:
            # Step 1: Backend generates math data
            math_data = generate_arithmetic_sequence_data()

            # Step 2: Build prompt with fixed math values
            prompt = build_arithmetic_sequence_prompt(blueprint, math_data, distractor_patterns)

            # Step 3: LLM writes only the prose
            llm_response = call_llm(prompt, model)

            # Step 4: Merge LLM prose with backend math
            question = {
                "id": generate_unique_id(blueprint_code, difficulty_id),
                "program": "waterloo_gauss",
                "topic": blueprint.get("primary_topic", ""),
                "subtopic": blueprint.get("secondary_topic"),
                "difficulty": difficulty_id,
                "archetype": blueprint.get("archetype", ""),
                "question_text": llm_response.get("question_text", ""),
                "options": math_data["options"],  # From backend, not LLM
                "correct_answer": math_data["correct_answer"],  # From backend
                "computed_answer_value": math_data["computed_answer_value"],  # From backend
                "calculation_data": math_data["calculation_data"],  # From backend
                "reasoning_skills": ["pattern_recognition", "formula_application"],
                "misconceptions": ["off_by_one", "pure_multiple_trap"],
                "distractor_rationale": llm_response.get("distractor_rationale", {}),
                "solution": llm_response.get("solution", {}),
                "coaching_hints": llm_response.get("coaching_hints", []),
                "visual": {"required": False, "type": "none", "spec": {}},
                "metadata": {
                    "source": "ai_generated_template_assisted",
                    "blueprint_code": blueprint_code,
                    "created_at": now_iso(),
                },
            }

            # Step 5: Verify answer key consistency
            correct_letter = math_data["correct_answer"]
            correct_value = math_data["computed_answer_value"]

            # Ensure distractor_rationale[correct_answer] is null
            if "distractor_rationale" in question:
                question["distractor_rationale"][correct_letter] = None

            # Verify options[correct_answer] == computed_answer_value
            if question["options"].get(correct_letter) != correct_value:
                raise ValueError(f"Option mismatch: {correct_letter}={question['options'].get(correct_letter)} != {correct_value}")

            # Validate
            issues = validate_question(question, blueprint)
            critical_issues = [i for i in issues if any(x in i for x in [
                "options must contain", "correct_answer must be",
                "question_text is required", "coaching_hints are required"
            ])]

            if not critical_issues:
                question["_validation_issues"] = issues
                question["_blueprint"] = blueprint_code
                question["_hash"] = compute_hash(question)
                question["_template_assisted"] = True
                if attempt > 0:
                    question["_retries"] = attempt
                return question

            last_issues = issues
        except Exception as e:
            last_issues = [str(e)]

    # All retries failed
    return {
        "id": generate_unique_id(blueprint_code, difficulty_id),
        "_validation_issues": last_issues + [f"Failed after {max_retries} retries"],
        "_blueprint": blueprint_code,
        "_hash": "",
    }


def generate_question(
    db: Session,
    blueprint_code: str,
    index: int = 1,
    model: str = DEFAULT_MODEL,
    max_retries: int = 2,
) -> dict[str, Any]:
    """Generate a single question from a blueprint with automatic retry."""
    blueprint = get_blueprint(db, blueprint_code)
    if not blueprint:
        raise ValueError(f"Blueprint not found: {blueprint_code}")

    # Fetch distractor patterns for this blueprint
    distractor_patterns = get_distractor_patterns(db, blueprint_code)

    # Template-assisted generation for arithmetic sequences
    if blueprint_code == "arithmetic_progression_membership":
        return generate_arithmetic_sequence_question(
            db, blueprint, distractor_patterns, model, max_retries
        )

    # Standard generation for other blueprints
    prompt = build_generation_prompt(blueprint, index, distractor_patterns)

    last_issues = []
    question = {}
    for attempt in range(max_retries):
        try:
            question = call_llm(prompt, model)

            # Fix answer key based on computed_answer_value
            question = fix_answer_key(question)

            # Override ID with unique timestamp-based ID
            _, difficulty_id = normalize_part(blueprint.get("difficulty_level"))
            question["id"] = generate_unique_id(blueprint_code, difficulty_id)

            # Validate (pass blueprint to check visual requirements)
            issues = validate_question(question, blueprint)

            # If no critical issues, return
            critical_issues = [i for i in issues if any(x in i for x in [
                "options must contain", "correct_answer must be",
                "question_text is required", "coaching_hints are required",
                "visual is required"
            ])]

            if not critical_issues:
                question["_validation_issues"] = issues
                question["_blueprint"] = blueprint_code
                question["_hash"] = compute_hash(question)
                if attempt > 0:
                    question["_retries"] = attempt
                return question

            last_issues = issues
        except Exception as e:
            last_issues = [str(e)]

    # All retries failed, return last attempt with issues
    question["_validation_issues"] = last_issues + [f"Failed after {max_retries} retries"]
    question["_blueprint"] = blueprint_code
    question["_hash"] = compute_hash(question) if question.get("question_text") else ""
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
