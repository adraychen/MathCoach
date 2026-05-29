"""
AI-powered Question Parser for MathCoach.
Uses Llama 3.2 90B Vision to parse PDFs including diagrams and graphs.
"""

import os
import json
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Vision models on Groq have been decommissioned
# Falling back to text-based extraction
USE_VISION = False

# Text model for all tasks
TEXT_MODEL = "llama-3.3-70b-versatile"


def parse_questions_from_image(
    image_base64: str,
    page_num: int,
    source_info: str = "",
    page_text: str = ""
) -> list[dict]:
    """
    Parse questions from a PDF page.
    Uses text extraction since Groq vision models are decommissioned.

    Args:
        image_base64: Base64-encoded PNG image (kept for compatibility)
        page_num: Page number for reference
        source_info: Source information (e.g., "Waterloo Gauss 2023")
        page_text: Extracted text from the page

    Returns:
        List of parsed question dicts
    """
    # Use text-based parsing
    questions = parse_questions_from_text(page_text, source_info)

    # Add page number to each question
    for q in questions:
        if "error" not in q:
            q["source_page"] = page_num

    return questions


def identify_paper_structure_from_image(image_base64: str, page_text: str = "") -> dict:
    """
    Analyze the structure of a competition paper from the first page.
    Uses text extraction since Groq vision models are decommissioned.

    Args:
        image_base64: Base64-encoded PNG image (kept for compatibility)
        page_text: Extracted text from the page

    Returns:
        dict with program, year, grade_level, sections, etc.
    """
    # Use text-based analysis
    return identify_paper_structure(page_text)


# Keep text-based functions as fallback
def parse_questions_from_text(raw_text: str, source_info: str = "") -> list[dict]:
    """
    Fallback: Use text model to parse raw text into questions.
    Use this for PDFs without diagrams or as a backup.
    """

    prompt = f"""
You are a math competition paper parser. Extract all multiple-choice questions from the following text.

Source: {source_info}

For each question, extract:
1. question_number: The question number (1, 2, 3, etc.)
2. question_text: The complete question stem (preserve math notation)
3. options: The answer choices as a dict with keys A, B, C, D, E
4. has_diagram: true if the question references a figure/diagram
5. raw_section: The exact original text for this question

Return a JSON array of question objects. Only return valid JSON, no other text.

Text to parse:
---
{raw_text}
---

Return format:
[
  {{
    "question_number": 1,
    "question_text": "...",
    "options": {{"A": "...", "B": "...", "C": "...", "D": "...", "E": "..."}},
    "has_diagram": false,
    "raw_section": "..."
  }}
]
"""

    response = client.chat.completions.create(
        model=TEXT_MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are a precise document parser. Return only valid JSON."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.1,
    )

    content = response.choices[0].message.content

    try:
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]

        questions = json.loads(content)
        return questions

    except json.JSONDecodeError as e:
        return [{
            "error": f"Failed to parse JSON: {e}",
            "raw_response": content
        }]


def identify_paper_structure(raw_text: str) -> dict:
    """
    Fallback: Analyze paper structure from text only.
    """

    prompt = f"""
Analyze this math competition paper and identify its structure.

Extract:
1. program: The competition name (e.g., "Waterloo Gauss", "AMC 8", "Pascal")
2. year: The year of the competition (if mentioned)
3. grade_level: Target grade level (if mentioned)
4. sections: List of sections with their question ranges
5. total_questions: Total number of questions
6. time_limit: Time limit in minutes (if mentioned)
7. scoring_info: Any scoring information mentioned

Return only valid JSON.

Text:
---
{raw_text[:3000]}
---

Return format:
{{
  "program": "...",
  "year": null,
  "grade_level": null,
  "sections": [
    {{"name": "Part A", "questions": "1-10", "points_each": 5}}
  ],
  "total_questions": 25,
  "time_limit": null,
  "scoring_info": "..."
}}
"""

    response = client.chat.completions.create(
        model=TEXT_MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are a document analyzer. Return only valid JSON."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.1,
    )

    content = response.choices[0].message.content

    try:
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]

        return json.loads(content)

    except json.JSONDecodeError:
        return {
            "program": "Unknown",
            "year": None,
            "grade_level": None,
            "sections": [],
            "total_questions": None,
            "time_limit": None,
            "error": "Could not parse structure"
        }
