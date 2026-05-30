"""
Migrate the existing local questions/arithmetic_v2.json into Supabase as DEV generated questions.

Use this to verify that the old JSON schema can be stored and served by the new database.
These rows should be marked environment='dev' and can be deleted before production.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
from typing import Any, Dict

from supabase import create_client


def part_from_difficulty(difficulty: str) -> str:
    mapping = {"part_a": "A", "part_b": "B", "part_c": "C"}
    return mapping.get(difficulty, "A")


def hash_question(text: str, options: Dict[str, Any]) -> str:
    raw = json.dumps({"question_text": text, "options": options}, sort_keys=True)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", default="questions/arithmetic_v2.json")
    parser.add_argument("--review-status", default="approved", choices=["draft", "validated", "approved", "needs_revision", "rejected"])
    parser.add_argument("--environment", default="dev", choices=["dev", "staging", "production"])
    args = parser.parse_args()

    supabase = create_client(
        os.environ["SUPABASE_URL"],
        os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ["SUPABASE_ANON_KEY"],
    )

    path = Path(args.file)
    questions = json.loads(path.read_text(encoding="utf-8"))

    inserted = 0
    for q in questions:
        part = part_from_difficulty(q.get("difficulty", "part_a"))
        payload = {
            "question_uid": q["id"],
            "program_name": "Waterloo Gauss" if q.get("program") == "waterloo_gauss" else q.get("program", "Unknown"),
            "grade": 7,
            "part": part,
            "blueprint_code": q.get("archetype", "legacy_archetype"),
            "primary_topic": q.get("topic", "unknown"),
            "secondary_topic": q.get("subtopic", "unknown"),
            "archetype": q.get("archetype", "unknown"),
            "question_text": q["question_text"],
            "answer_choices": q["options"],
            "correct_answer": q["correct_answer"],
            "solution_steps": q.get("solution", {}).get("steps", []),
            "distractor_rationales": q.get("distractor_rationale", {}),
            "reasoning_skills": q.get("reasoning_skills", []),
            "misconceptions": q.get("misconceptions", []),
            "coaching_hints": q.get("coaching_hints", []),
            "wrong_answer_coaching": {},
            "visual_required": q.get("metadata", {}).get("diagram_required", False),
            "visual_type": "none",
            "visual_spec": None,
            "question_json": q,
            "question_hash": hash_question(q["question_text"], q["options"]),
            "similarity_check_status": "not_checked",
            "generation_model": "legacy_local_json",
            "generation_prompt_version": "legacy_arithmetic_v2_migration",
            "validation_result": {"source": "local arithmetic_v2 migration"},
            "review_status": args.review_status,
            "environment": args.environment,
            "is_active": True,
        }

        supabase.table("mathcoach_generated_questions").upsert(payload, on_conflict="question_uid").execute()
        inserted += 1

    print(f"Migrated {inserted} questions from {path} into mathcoach_generated_questions.")


if __name__ == "__main__":
    main()
