"""
AI-powered Question Parser for MathCoach.
Uses Llama 3.2 90B Vision to parse PDFs including diagrams and graphs.
"""

import os
import json
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Vision model for image-based extraction
VISION_MODEL = "llama-3.2-90b-vision-preview"

# Text model for text-only tasks
TEXT_MODEL = "llama-3.3-70b-versatile"


def parse_questions_from_image(
    image_base64: str,
    page_num: int,
    source_info: str = ""
) -> list[dict]:
    """
    Use vision model to parse questions from a PDF page image.

    Args:
        image_base64: Base64-encoded PNG image of the page
        page_num: Page number for reference
        source_info: Source information (e.g., "Waterloo Gauss 2023")

    Returns:
        List of parsed question dicts with:
            - question_number
            - question_text
            - options (A-E)
            - has_diagram
            - diagram_description (if applicable)
    """

    prompt = f"""You are a math competition paper parser. Extract all multiple-choice questions from this page image.

Source: {source_info}
Page: {page_num}

For each question on this page, extract:
1. question_number: The question number (1, 2, 3, etc.)
2. question_text: The complete question stem. Preserve all mathematical notation.
3. options: The answer choices as a dict with keys A, B, C, D, E
4. has_diagram: true if the question includes a figure, graph, or diagram
5. diagram_description: If has_diagram is true, describe the diagram in detail:
   - For geometry: describe shapes, labels, measurements, angles
   - For graphs: describe axes, scale, plotted points/lines, labels
   - For tables: describe rows, columns, values
   - For other figures: describe what is shown

Important:
- Extract EVERY question visible on this page
- Preserve mathematical notation exactly (fractions, exponents, etc.)
- For diagrams, be precise and detailed in your description
- Include all labels, measurements, and values shown in diagrams
- If a question continues from or to another page, note it

Return a JSON array of question objects. Only return valid JSON, no other text.

Return format:
[
  {{
    "question_number": 1,
    "question_text": "...",
    "options": {{"A": "...", "B": "...", "C": "...", "D": "...", "E": "..."}},
    "has_diagram": true,
    "diagram_description": "A triangle ABC with right angle at B. Side AB = 3 cm, side BC = 4 cm. Angle A is marked."
  }}
]"""

    response = client.chat.completions.create(
        model=VISION_MODEL,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{image_base64}"
                        }
                    }
                ]
            }
        ],
        temperature=0.1,
        max_tokens=4096
    )

    content = response.choices[0].message.content

    try:
        # Handle markdown code blocks
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]

        questions = json.loads(content)

        # Add page number to each question
        for q in questions:
            q["source_page"] = page_num

        return questions

    except json.JSONDecodeError as e:
        return [{
            "error": f"Failed to parse JSON: {e}",
            "raw_response": content,
            "source_page": page_num
        }]


def identify_paper_structure_from_image(image_base64: str) -> dict:
    """
    Analyze the structure of a competition paper from the first page image.

    Args:
        image_base64: Base64-encoded PNG image of the first page

    Returns:
        dict with program, year, grade_level, sections, etc.
    """

    prompt = """Analyze this math competition paper cover/first page and identify its structure.

Extract:
1. program: The competition name (e.g., "Waterloo Gauss", "AMC 8", "Pascal", "Cayley")
2. year: The year of the competition
3. grade_level: Target grade level (e.g., "Grade 7", "Grade 8")
4. sections: List of sections with their question ranges and point values
5. total_questions: Total number of questions
6. time_limit: Time limit in minutes
7. scoring_info: Any scoring information mentioned

Return only valid JSON.

Return format:
{
  "program": "Gauss",
  "year": 2023,
  "grade_level": "Grade 7",
  "sections": [
    {"name": "Part A", "questions": "1-10", "points_each": 5},
    {"name": "Part B", "questions": "11-20", "points_each": 6},
    {"name": "Part C", "questions": "21-25", "points_each": 8}
  ],
  "total_questions": 25,
  "time_limit": 60,
  "scoring_info": "Part A: 5 points each, Part B: 6 points each, Part C: 8 points each"
}"""

    response = client.chat.completions.create(
        model=VISION_MODEL,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{image_base64}"
                        }
                    }
                ]
            }
        ],
        temperature=0.1,
        max_tokens=1024
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
