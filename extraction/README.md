# Question Extraction Module

This module extracts questions from past competition papers (PDFs) and normalizes them to the MathCoach question schema.

**Uses Llama 3.2 90B Vision** for accurate extraction of diagrams, graphs, and figures.

## Workflow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────────┐
│  Upload PDF │ --> │ Vision Parse │ --> │  Classify   │ --> │   Review    │
└─────────────┘     └──────────────┘     └─────────────┘     └─────────────┘
       │                   │                                        │
       v                   v                                        v
   [Render as         [Llama 3.2 90B                         ┌─────────────┐
    Images]            Vision Model]                         │    Save     │
                                                             └─────────────┘
```

## Components

### `pdf_extractor.py`

Renders PDF pages as images for vision model processing.

```python
from extraction.pdf_extractor import render_pdf_pages_as_images, get_pdf_page_count

# Get page count
num_pages = get_pdf_page_count(pdf_bytes)

# Render all pages as images
result = render_pdf_pages_as_images(pdf_bytes, "paper.pdf", dpi=150)
# Returns: {filename, num_pages, pages: [{page_num, image_base64, text}]}
```

### `question_parser.py`

Uses Llama 3.2 90B Vision to parse questions including diagrams.

```python
from extraction.question_parser import parse_questions_from_image, identify_paper_structure_from_image

# Analyze paper structure from cover page
paper_info = identify_paper_structure_from_image(image_base64)
# Returns: {program, year, grade_level, sections[], total_questions}

# Parse questions from a page image
questions = parse_questions_from_image(image_base64, page_num, "Gauss 2023")
# Returns: [{question_number, question_text, options, has_diagram, diagram_description}]
```

### Diagram Handling

For questions with diagrams, the vision model extracts:
- **Geometry**: shapes, labels, measurements, angles
- **Graphs**: axes, scale, plotted points/lines
- **Tables**: rows, columns, values
- **Figures**: detailed descriptions

### `normalizer.py`

Classifies questions and normalizes to schema format.

```python
from extraction.normalizer import classify_question, normalize_to_schema

# Classify a parsed question
classification = classify_question(parsed_question, paper_info)
# Returns: {topic, subtopic, archetype, reasoning_skills, misconceptions, solution}

# Normalize to full schema
normalized = normalize_to_schema(parsed_question, classification, paper_info)
# Returns: Full question object matching question_schema.json
```

## Usage

### Admin Interface

Run the extraction admin app:

```bash
streamlit run app_extract.py
```

### Programmatic Usage

```python
from extraction.pdf_extractor import extract_text_from_pdf
from extraction.question_parser import parse_questions_from_text, identify_paper_structure
from extraction.normalizer import classify_question, normalize_to_schema

# 1. Extract text
pdf_result = extract_text_from_pdf("gauss_2023.pdf")

# 2. Identify structure
paper_info = identify_paper_structure(pdf_result["full_text"])

# 3. Parse questions
parsed = parse_questions_from_text(pdf_result["full_text"], f"{paper_info['program']} {paper_info['year']}")

# 4. Classify and normalize
for q in parsed:
    classification = classify_question(q, paper_info)
    normalized = normalize_to_schema(q, classification, paper_info)
    # Save or review normalized question
```

## Output

Extracted questions are saved to `extracted/` directory in schema format.

Example output:
```json
{
  "id": "waterloo_gauss_factors_multiples_primes_part_a_0001",
  "program": "waterloo_gauss",
  "topic": "factors_multiples_primes",
  "difficulty": "part_a",
  "question_text": "...",
  "options": {"A": "...", "B": "...", "C": "...", "D": "...", "E": "..."},
  "correct_answer": "B",
  "reasoning_skills": ["elimination", "number_sense_intuition"],
  "misconceptions": ["boundary_confusion"],
  "solution": {
    "steps": ["..."],
    "key_insight": "..."
  },
  "metadata": {
    "source": "extracted",
    "source_reference": "Waterloo Gauss 2023 Q1",
    "validated": true
  }
}
```

## Manual Review

The extraction workflow includes a manual review step where you can:

1. Verify/correct the AI classification
2. Edit topic, difficulty, archetype
3. Fix correct answer if needed
4. Add/remove reasoning skills and misconceptions
5. Mark as validated before saving

**Important:** Questions should be validated by a human before being added to the production question bank.
