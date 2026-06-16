# Question Extraction Prompt

This prompt is used to extract question data from Waterloo Gauss contest papers using an AI model.

## Prompt

From the uploaded Waterloo Gauss Grade 8 contest paper, extract all 25 Grade 8 questions.

Return JSON only.

Extract only from the contest question paper. Do not use the solution paper.

Use this structure:

```json
[
  {
    "id": "waterloo_gauss_g8_YYYY_q01",
    "year": YYYY,
    "program_name": "Waterloo Gauss",
    "grade": 8,
    "question_number": 1,
    "part": "A",
    "question_text": "",
    "options": {"A":"","B":"","C":"","D":"","E":""},
    "visual_required": false,
    "visual_type": "none",
    "visual_description": null
  }
]
```

## Rules

- Extract exactly 25 records.
- Set year = YYYY.
- part: Q1–Q10 = "A", Q11–Q20 = "B", Q21–Q25 = "C".
- id format: waterloo_gauss_g8_YYYY_q01, waterloo_gauss_g8_YYYY_q02, etc.
- question_number stores the question number, so do not include the question number in question_text.
- question_text must be copied exactly from the contest paper, except do not include the leading question number.
- Do not summarize question_text.
- Do not paraphrase question_text.
- Do not omit examples, conditions, bullet points, or diagram references.
- Do not output LaTeX.
- Preserve mathematical notation clearly in plain text.
- Preserve fractions as plain text, such as 3/20.
- Preserve coordinates as plain text, such as (5, 7).
- Preserve exponents as plain text, such as m^2.
- Preserve degree symbols only where they appear in the contest paper.
- Preserve triangle names as plain text, such as triangle ACE.
- options must be copied exactly from the contest paper.
- Do not include option labels inside option values.
- Use a real JSON object for options, not a string.

## Visual Rules

- visual_required = true if the question depends on a graph, diagram, table, grid, shape, number line, coordinate grid, spinner, receipt, pattern, flow diagram, or other visual.
- visual_required = false only when the question can be fully understood from the text alone.
- If visual_required = false, set visual_type = "none" and visual_description = null.

### visual_type Values

visual_type must be one of:

| Type | Use Case |
|------|----------|
| bar_graph | Bar graphs |
| line_graph | Line graphs |
| pie_chart | Pie charts |
| table | Tables |
| number_line | Number lines |
| coordinate_grid | Diagrams with x- and y-axes or plotted coordinates |
| geometry_diagram | Angle, triangle, polygon, circle, length, area, perimeter, or geometric-relation diagrams |
| grid_diagram | Square grids, rectangular grids, dot grids, lattice grids, or toothpick grids |
| shape_diagram | Shape arrangements, symmetry, transformations, cube/cube-net diagrams, spinner-like connected-circle diagrams, or composite non-measurement shapes |
| pattern_diagram | Visuals representing a repeating or growing pattern |
| flow_diagram | Operation boxes, input/output diagrams, or process diagrams |
| spinner_diagram | Circular spinners |
| other_visual | Only if no listed visual type fits |
| none | When visual_required = false |

- Prefer the most specific visual_type.

## visual_description Requirements

- The description must allow an AI tutor to understand the mathematical structure of the diagram without seeing the image.
- Describe the mathematical information contained in the visual, not just its appearance.
- Describe objects shown, labels, quantities, relationships, positions, connections, dimensions, equal-length markings, angle markings, axes, graph scales, and grid structure when present.
- Do not describe the diagram generically.

### Examples

**Bad:**
- "A geometric figure."
- "A composite figure."

**Good:**
- "A square has a triangle attached above it sharing one side."
- "A bar graph titled Favourite Season has categories Spring, Summer, Fall, Winter with bar heights 5, 15, 5, and 10."
- "A coordinate grid shows the point (5, 7) in the first quadrant, with x-axis and y-axis shown."

### Important

- visual_description must not reveal the answer.
- Do not say which option is correct.
- Do not say which shape, bar, or value is the answer unless that information is explicitly labelled in the visual and not the requested unknown.

## OCR Validation Before Returning

- Verify that axis names such as x-axis and y-axis are preserved.
- Verify that variable names are preserved.
- Verify that degree symbols appear only where they appear in the contest paper.
- Verify that equations are not corrupted.
- Verify that spacing errors are corrected, such as "c is" not "cis".
- Verify that question_text does not include the question number.
- Verify that all 25 records have options A, B, C, D, and E.

Return valid JSON only.
