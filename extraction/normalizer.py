"""
Question Normalizer for MathCoach.
Maps parsed questions to the structured schema format.
"""

import os
import json
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODEL_NAME = "llama-3.3-70b-versatile"

# Valid values from schema
VALID_TOPICS = [
    "number_sense",
    "arithmetic_operations",
    "fractions_decimals_percents",
    "factors_multiples_primes",
    "patterns_sequences",
    "algebra_equations",
    "geometry_measurement",
    "counting_probability",
    "logic_reasoning",
    "word_problems",
]

VALID_SUBTOPICS = {
    "number_sense": ["ordering_comparing", "place_value", "rounding_estimation", "number_properties"],
    "arithmetic_operations": ["addition_subtraction", "multiplication_division", "order_of_operations", "mental_math"],
    "fractions_decimals_percents": ["fraction_operations", "decimal_operations", "percent_calculations", "conversions"],
    "factors_multiples_primes": ["factors", "multiples", "prime_numbers", "gcd_lcm"],
    "patterns_sequences": ["arithmetic_sequences", "geometric_sequences", "pattern_recognition"],
    "algebra_equations": ["expressions", "linear_equations", "word_problems_algebra"],
    "geometry_measurement": ["perimeter_area", "angles", "shapes_properties", "units_conversion", "volume_surface_area"],
    "counting_probability": ["systematic_counting", "combinations_permutations", "basic_probability"],
    "logic_reasoning": ["deductive_reasoning", "process_of_elimination", "working_backwards"],
    "word_problems": ["rate_problems", "age_problems", "money_problems"],
}

VALID_ARCHETYPES = [
    "find_extremum_with_constraint",
    "identify_property",
    "ordering_ranking",
    "consecutive_sum_product",
    "percent_change",
    "factor_counting",
    "prime_factorization_application",
    "pattern_continuation",
    "operation_result",
    "word_problem_translation",
    "area_perimeter_calculation",
    "counting_arrangements",
    "working_backwards",
]

VALID_REASONING_SKILLS = [
    "direct_computation",
    "elimination",
    "estimation",
    "pattern_recognition",
    "working_backwards",
    "case_analysis",
    "systematic_listing",
    "logical_deduction",
    "visualization",
    "translation",
    "proportional_reasoning",
    "strategic_guessing",
    "constraint_satisfaction",
    "algebraic_manipulation",
    "number_sense_intuition",
]

VALID_MISCONCEPTIONS = [
    "boundary_confusion",
    "off_by_one",
    "percent_base_confusion",
    "order_of_operations",
    "fraction_operation_error",
    "negative_number_confusion",
    "unit_conversion_error",
    "factor_multiple_confusion",
    "prime_composite_confusion",
    "consecutive_integer_error",
    "area_perimeter_confusion",
    "misread_question",
    "decimal_place_error",
    "average_sum_confusion",
    "probability_complementary",
]


def classify_question(question: dict, paper_info: dict = None) -> dict:
    """
    Classify a parsed question into schema categories.

    Args:
        question: Parsed question dict with question_text, options, etc.
        paper_info: Optional paper metadata (program, year, section)

    Returns:
        Classification dict with topic, subtopic, archetype, etc.
    """

    question_text = question.get("question_text", "")
    options = question.get("options", {})
    question_number = question.get("question_number", 0)

    # Determine difficulty from section/question number
    difficulty = "part_a"
    if paper_info:
        sections = paper_info.get("sections", []) or []
        for section in sections:
            q_range = section.get("questions", "")
            # Ensure q_range is a string
            if q_range and isinstance(q_range, str) and "-" in q_range:
                try:
                    start, end = map(int, q_range.split("-"))
                    if start <= question_number <= end:
                        name = section.get("name", "").lower()
                        if "a" in name:
                            difficulty = "part_a"
                        elif "b" in name:
                            difficulty = "part_b"
                        elif "c" in name:
                            difficulty = "part_c"
                        break
                except ValueError:
                    continue

    prompt = f"""
Classify this math competition question.

Question: {question_text}

Options:
A: {options.get('A', '')}
B: {options.get('B', '')}
C: {options.get('C', '')}
D: {options.get('D', '')}
E: {options.get('E', '')}

Classify into these categories (use ONLY these exact values):

1. topic (choose ONE):
{json.dumps(VALID_TOPICS, indent=2)}

2. subtopic (choose ONE matching the topic):
{json.dumps(VALID_SUBTOPICS, indent=2)}

3. archetype (choose ONE):
{json.dumps(VALID_ARCHETYPES, indent=2)}

4. reasoning_skills (choose 1-3):
{json.dumps(VALID_REASONING_SKILLS, indent=2)}

5. misconceptions (choose 1-3 likely student errors):
{json.dumps(VALID_MISCONCEPTIONS, indent=2)}

6. correct_answer: Which option (A/B/C/D/E) is correct? Solve the problem.

7. solution: Provide step-by-step solution with:
   - steps: array of solution steps
   - key_insight: the main conceptual insight needed

8. distractor_rationale: For each WRONG answer, explain why a student might choose it.

Return only valid JSON.

Format:
{{
  "topic": "...",
  "subtopic": "...",
  "archetype": "...",
  "reasoning_skills": ["...", "..."],
  "misconceptions": ["..."],
  "correct_answer": "B",
  "solution": {{
    "steps": ["...", "..."],
    "key_insight": "..."
  }},
  "distractor_rationale": {{
    "A": "why wrong",
    "B": null,
    "C": "why wrong",
    "D": "why wrong",
    "E": "why wrong"
  }},
  "coaching_hints": ["hint 1", "hint 2", "hint 3"]
}}
"""

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": "You are a math education expert. Classify questions accurately. Return only valid JSON."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2,
    )

    content = response.choices[0].message.content

    try:
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]

        classification = json.loads(content)

        # Add difficulty
        classification["difficulty"] = difficulty

        return classification

    except json.JSONDecodeError:
        return {
            "error": "Classification failed",
            "raw_response": content
        }


def normalize_to_schema(
    parsed_question: dict,
    classification: dict,
    paper_info: dict,
    program_id: str = "waterloo_gauss"
) -> dict:
    """
    Combine parsed question and classification into full schema format.

    Args:
        parsed_question: Raw parsed question
        classification: AI classification results
        paper_info: Paper metadata
        program_id: Program identifier

    Returns:
        Question in full schema format
    """

    question_number = parsed_question.get("question_number", 0)
    topic = classification.get("topic", "number_sense")
    difficulty = classification.get("difficulty", "part_a")

    # Generate ID
    question_id = f"{program_id}_{topic}_{difficulty}_{question_number:04d}"

    # Build source reference
    year = paper_info.get("year", "")
    source_ref = f"{paper_info.get('program', 'Unknown')} {year} Q{question_number}".strip()

    # Handle diagram description
    has_diagram = parsed_question.get("has_diagram", False)
    diagram_description = parsed_question.get("diagram_description", "")

    # If there's a diagram, append description to question text
    question_text = parsed_question.get("question_text", "")
    if has_diagram and diagram_description:
        question_text = f"{question_text}\n\n[Diagram: {diagram_description}]"

    return {
        "id": question_id,
        "program": program_id,
        "topic": classification.get("topic", "number_sense"),
        "subtopic": classification.get("subtopic", ""),
        "difficulty": classification.get("difficulty", "part_a"),
        "archetype": classification.get("archetype", ""),
        "question_text": question_text,
        "options": parsed_question.get("options", {}),
        "correct_answer": classification.get("correct_answer", ""),
        "reasoning_skills": classification.get("reasoning_skills", []),
        "misconceptions": classification.get("misconceptions", []),
        "distractor_rationale": classification.get("distractor_rationale", {}),
        "solution": classification.get("solution", {"steps": [], "key_insight": ""}),
        "coaching_hints": classification.get("coaching_hints", []),
        "metadata": {
            "source": "extracted",
            "source_reference": source_ref,
            "has_diagram": has_diagram,
            "diagram_description": diagram_description if has_diagram else None,
            "estimated_time_seconds": 60 if difficulty == "part_a" else 120 if difficulty == "part_b" else 180,
            "cognitive_load": "low" if difficulty == "part_a" else "medium" if difficulty == "part_b" else "high",
            "computation_required": "simple",
            "diagram_required": has_diagram,
            "validated": False,
            "validation_notes": "Pending human review"
        },
        "extraction_metadata": {
            "original_question_number": question_number,
            "source_page": parsed_question.get("source_page"),
            "raw_section": parsed_question.get("raw_section", ""),
            "paper_info": paper_info
        }
    }
