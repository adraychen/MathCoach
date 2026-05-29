"""
Schema loader utilities for MathCoach.
Loads and provides lookup functions for schema metadata.
"""

import json
from pathlib import Path

SCHEMA_DIR = Path(__file__).parent.parent / "schema"


def load_schema(name: str) -> dict:
    """Load a schema JSON file by name."""
    path = SCHEMA_DIR / f"{name}.json"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_programs() -> dict:
    """Load programs and return as id -> program dict."""
    data = load_schema("programs")
    return {p["id"]: p for p in data["programs"]}


def get_topics() -> dict:
    """Load topics and return as id -> topic dict."""
    data = load_schema("topics")
    return {t["id"]: t for t in data["topics"]}


def get_difficulty_levels() -> dict:
    """Load difficulty levels and return as id -> level dict."""
    data = load_schema("difficulty_levels")
    return {d["id"]: d for d in data["difficulty_levels"]}


def get_misconceptions() -> dict:
    """Load misconceptions and return as id -> misconception dict."""
    data = load_schema("misconceptions")
    return {m["id"]: m for m in data["misconceptions"]}


def get_reasoning_skills() -> dict:
    """Load reasoning skills and return as id -> skill dict."""
    data = load_schema("reasoning_skills")
    return {s["id"]: s for s in data["reasoning_skills"]}


def get_archetypes() -> dict:
    """Load archetypes and return as id -> archetype dict."""
    data = load_schema("archetypes")
    return {a["id"]: a for a in data["archetypes"]}


# Topic ID to display name mapping
TOPIC_DISPLAY_NAMES = {
    "number_sense": "Number Sense",
    "arithmetic_operations": "Arithmetic Operations",
    "fractions_decimals_percents": "Fractions, Decimals & Percents",
    "factors_multiples_primes": "Factors, Multiples & Primes",
    "patterns_sequences": "Patterns & Sequences",
    "algebra_equations": "Algebra & Equations",
    "geometry_measurement": "Geometry & Measurement",
    "counting_probability": "Counting & Probability",
    "logic_reasoning": "Logic & Reasoning",
    "word_problems": "Word Problems",
    "model_method": "Model Method",
}

# Difficulty ID to display name mapping
DIFFICULTY_DISPLAY_NAMES = {
    "part_a": "Part A",
    "part_b": "Part B",
    "part_c": "Part C",
    "easy": "Easy",
    "medium": "Medium",
    "hard": "Hard",
    "foundation": "Foundation",
    "standard": "Standard",
    "challenge": "Challenge",
}


def get_topic_display_name(topic_id: str) -> str:
    """Get display name for a topic ID."""
    return TOPIC_DISPLAY_NAMES.get(topic_id, topic_id)


def get_difficulty_display_name(difficulty_id: str) -> str:
    """Get display name for a difficulty ID."""
    return DIFFICULTY_DISPLAY_NAMES.get(difficulty_id, difficulty_id)


def get_topics_for_program(program_id: str) -> list:
    """Get list of topic IDs for a program."""
    programs = get_programs()
    if program_id in programs:
        return programs[program_id].get("topics", [])
    return []


def get_difficulties_for_program(program_id: str) -> list:
    """Get list of difficulty IDs for a program."""
    programs = get_programs()
    if program_id in programs:
        return programs[program_id].get("difficulty_levels", [])
    return []
