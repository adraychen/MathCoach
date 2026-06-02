"""
Convert G7gauss1-psg-metadata-raw.md markdown table to clean JSON.
"""

import json
import re
from pathlib import Path


def parse_markdown_table(content: str) -> list[dict]:
    """Parse markdown table into list of dictionaries."""
    lines = content.strip().split('\n')

    # Find header line and data lines
    header_line = None
    data_lines = []

    for line in lines:
        line = line.strip()
        if not line:
            continue
        if line.startswith('|') and header_line is None:
            header_line = line
        elif line.startswith('|') and ':---' in line:
            # Skip separator line
            continue
        elif line.startswith('|'):
            data_lines.append(line)

    if not header_line:
        raise ValueError("No header line found")

    # Parse header
    headers = [h.strip() for h in header_line.split('|')[1:-1]]

    # Parse data rows
    rows = []
    for line in data_lines:
        # Replace escaped pipes with a placeholder before splitting
        placeholder = '\x00PIPE\x00'
        line_escaped = line.replace('\\|', placeholder)
        cells = [c.strip().replace(placeholder, '|') for c in line_escaped.split('|')[1:-1]]
        if len(cells) == len(headers):
            row = dict(zip(headers, cells))
            rows.append(row)

    return rows


def convert_to_typed(row: dict) -> dict:
    """Convert a raw row dict to properly typed fields."""
    def to_int(val: str) -> int:
        return int(val.strip()) if val.strip() else 0

    def to_bool(val: str) -> bool:
        return val.strip().lower() == 'true'

    def to_string_or_null(val: str) -> str | None:
        val = val.strip()
        return val if val else None

    def to_string_array(val: str) -> list[str]:
        val = val.strip()
        if not val:
            return []
        # Split on pipe character and trim each part
        parts = [p.strip() for p in val.split('|')]
        return [p for p in parts if p]

    return {
        "practice_question_number": to_int(row.get("practice_question_number", "")),
        "source_year": to_int(row.get("source_year", "")),
        "source_grade": to_int(row.get("source_grade", "")),
        "source_question_number": to_int(row.get("source_question_number", "")),
        "primary_topics": to_string_array(row.get("primary_topics", "")),
        "secondary_topics": to_string_array(row.get("secondary_topics", "")),
        "correct_answer": to_string_or_null(row.get("correct_answer", "")) or "",
        "short_problem_summary": to_string_or_null(row.get("short_problem_summary", "")) or "",
        "psg_solution_text": to_string_or_null(row.get("psg_solution_text", "")) or "",
        "psg_solution_summary": to_string_or_null(row.get("psg_solution_summary", "")) or "",
        "detailed_solution_status": to_string_or_null(row.get("detailed_solution_status", "")) or "",
        "coaching_available": to_bool(row.get("coaching_available", "")),
        "key_strategy": to_string_or_null(row.get("key_strategy", "")),
        "possible_hint_1": to_string_or_null(row.get("possible_hint_1", "")),
        "possible_hint_2": to_string_or_null(row.get("possible_hint_2", "")),
        "common_mistake": to_string_or_null(row.get("common_mistake", "")),
        "difficulty_band": to_string_or_null(row.get("difficulty_band", "")) or "",
    }


def validate_data(data: list[dict]) -> None:
    """Validate the converted data."""
    # Check row count
    if len(data) != 25:
        raise ValueError(f"Expected 25 rows, got {len(data)}")

    # Check practice_question_number sequence
    for i, row in enumerate(data, start=1):
        if row["practice_question_number"] != i:
            raise ValueError(
                f"Row {i}: expected practice_question_number={i}, "
                f"got {row['practice_question_number']}"
            )

    print(f"Validation passed: {len(data)} rows, practice_question_number 1-25")


def main():
    # Set up paths
    script_dir = Path(__file__).parent
    base_dir = script_dir.parent
    input_file = base_dir / "extracted-data" / "G7gauss1-psg-metadata-raw.md"
    output_file = base_dir / "extracted-data" / "G7gauss1-psg-metadata.json"

    # Read input
    print(f"Reading: {input_file}")
    content = input_file.read_text(encoding="utf-8")

    # Parse markdown table
    raw_rows = parse_markdown_table(content)
    print(f"Parsed {len(raw_rows)} rows from markdown table")

    # Convert to typed data
    data = [convert_to_typed(row) for row in raw_rows]

    # Validate
    validate_data(data)

    # Write output
    output_file.write_text(
        json.dumps(data, indent=2, ensure_ascii=False),
        encoding="utf-8"
    )
    print(f"Saved: {output_file}")
    print("Success!")


if __name__ == "__main__":
    main()
