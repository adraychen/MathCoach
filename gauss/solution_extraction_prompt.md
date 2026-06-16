# Solution Extraction Prompt

From the uploaded Waterloo Gauss official solution document, extract the correct answer and official solution for all Grades 7 & 8 questions.

Return JSON only.

Extract only from the official solution document. Do not use the contest question paper.

Use this structure:
```json
[
{
  "id": "waterloo_gauss_gx_YYYY_q01",
  "year": YYYY,
  "grade": x,
  "question_number": 1,
  "correct_answer": "",
  "official_solution": ""
}
]
```

## Rules

- Set year = YYYY.
- id format: waterloo_gauss_g8_YYYY_q01, waterloo_gauss_g8_YYYY_q02, etc for grade 8 questions. waterloo_gauss_g7_YYYY_q01, waterloo_gauss_g7_YYYY_q02, etc for grade 7 questions.
- correct_answer must be exactly one of:
  - A
  - B
  - C
  - D
  - E
- Do not return:
  - "Option D"
  - "(D)"
  - "Answer: (D)"
  - "75°"
  - "16"
- Return only the answer letter.

## Official Solution Rules

- official_solution must be copied from the official solution document.
- Do not summarize official_solution.
- Do not paraphrase official_solution.
- Do not rewrite in your own words.
- Do not simplify explanations.
- Do not compress multi-step reasoning.
- Preserve the structure and sequence of the official solution.
- Preserve all intermediate calculations.
- Preserve all case analysis.
- Preserve all alternate solutions.
- Preserve all tables and structured counting arguments.
- Preserve all explanatory notes.
- Preserve the final "Answer: (X)" statement.

## Multiple Solution Rules

- Preserve section headings exactly as written.
- Preserve:
  - Solution 1
  - Solution 2
  - Alternate Solution
  - Method 1
  - Method 2
- Do not merge multiple solutions into a single solution.

## Diagram and Figure Rules

- Preserve references to diagrams, figures, tables, cases, and labelled constructions.
- Preserve figure labels such as:
  - Figure 1
  - Figure 2
  - Figure 3
- Do not remove diagram references.
- If a solution explains how a diagram is used, preserve that explanation exactly.

## Formatting Rules

- Normalize whitespace.
- Correct obvious OCR errors.
- Convert mathematical formatting into readable plain text when necessary.
- Preserve mathematical meaning exactly.
- Examples:
  - Correct: `m^2 × n = 2025`
  - Acceptable: `m^2 * n = 2025`
  - Incorrect: `m^2 x n = 2025°`

## OCR Validation Rules

Before returning JSON:
- Verify mathematical symbols are preserved.
- Verify variable names are preserved.
- Verify exponents are preserved.
- Verify fractions are preserved.
- Verify degree symbols appear only where they appear in the source.
- Verify multiplication symbols have not been converted incorrectly.
- Verify equations have not been corrupted.
- Correct obvious OCR spacing errors.

## Confidence Rules

- Use "High" if extraction is clear and complete.
- Use "Medium" if minor OCR ambiguity exists.
- Use "Low" if part of the solution is unclear, partially unreadable, or requires human review.

## Output Rules

- Return valid JSON only.
- Do not include commentary.
- Do not include markdown.
- Do not include explanations before or after the JSON.
