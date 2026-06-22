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

- Set `year = YYYY`.
- Use this id format:
  - Grade 8: `waterloo_gauss_g8_YYYY_q01`, `waterloo_gauss_g8_YYYY_q02`, etc.
  - Grade 7: `waterloo_gauss_g7_YYYY_q01`, `waterloo_gauss_g7_YYYY_q02`, etc.
- `correct_answer` must be exactly one of:
  - `A`
  - `B`
  - `C`
  - `D`
  - `E`
- Do not return:
  - `Option D`
  - `(D)`
  - `Answer: (D)`
  - `75°`
  - `16`
- Return only the answer letter in `correct_answer`.

## Official Solution Rules

- `official_solution` must preserve the official solution document as closely as possible.
- Do not summarize `official_solution`.
- Do not paraphrase `official_solution`.
- Do not rewrite the solution in your own style.
- Do not simplify explanations.
- Do not compress multi-step reasoning.
- Preserve the structure and sequence of the official solution.
- Preserve all intermediate calculations.
- Preserve all case analysis.
- Preserve all alternate solutions.
- Preserve all tables and structured counting arguments.
- Preserve all explanatory notes.
- Do not include the final `Answer: (X)`, `ANSWER: (X)`, or similar answer line in `official_solution`.
- Extract the answer letter from the final answer line and store it only in `correct_answer`.
- `official_solution` should end with the reasoning before the final answer line, not with `Answer: (X)`.

## Multiple Solution Rules

- Preserve section headings exactly as written.
- Preserve:
  - `Solution 1`
  - `Solution 2`
  - `Alternate Solution`
  - `Method 1`
  - `Method 2`
- Do not merge multiple solutions into a single solution.
- Do not remove a second solution even if the first solution is enough to answer the question.

## Diagram, Figure, and Visual Reasoning Rules

Many official solutions use diagrams, figures, grids, tables, long multiplication layouts, nets, or labelled constructions. These visuals must not be ignored.

When a solution refers to a diagram, figure, grid, table, layout, or labelled construction:

- Keep the original official text as much as possible.
- Add a concise text description of the visual directly into `official_solution` at the point where the visual appears in the official document.
- Put added visual descriptions in parentheses, or introduce them with a short label such as `The diagram shows:` or `The table is:`.
- Do not put all visual descriptions at the beginning unless the official solution itself uses the diagram only at the beginning.
- Describe each visual when the solution reaches that visual, following the order of the official document.
- Preserve figure labels such as:
  - `Figure 1`
  - `Figure 2`
  - `Figure 3`
  - `Case 1a`
  - `Case 2b`
- Preserve labels on points, vertices, shapes, circles, bins, rows, columns, and regions.
- Preserve the meaning of arrows, tick marks, equal lengths, parallel lines, shaded regions, and highlighted paths.
- If the visual contains a grid, table, multiplication layout, or case table, convert it into clear text, a markdown-style table, or a readable aligned layout inside `official_solution`.
- If a visual is complex, describe only the details needed to follow the official reasoning. Do not over-describe irrelevant visual decoration.

## How to Embed Diagram Descriptions

Use this style when the official solution says “as shown”, “in the diagram”, “the figure below”, “the table below”, or similar.

### Example: Geometry diagram

Original official text:
```text
We begin by splitting ABCD into three equilateral triangles, as shown.
```

Improved extraction:
```text
We begin by splitting ABCD into three equilateral triangles, as shown. (The solution diagram shows quadrilateral ABCD split into three equilateral triangles. The middle equilateral triangle shares one full side with the left equilateral triangle and one full side with the right equilateral triangle. The outside perimeter of ABCD consists of 5 equal triangle side lengths. Segment AB is one of these equal side lengths.)
```

### Example: Branching path diagram

If the official solution uses a branching path diagram with labelled split points and bins, describe the structure before the probability reasoning that depends on it.

Good extraction:
```text
The solution diagram is a branching path diagram with six split points labelled 1 through 6 and three bottom bins labelled A, B, and C. A ball starts at the top split, labelled 1. At each split, the ball travels down-left or down-right with probability 1/2. Bin A is reached only by going left at splits 1, 2, and 3. Bin C can be reached by three paths: right at split 1, right at split 4, and right at split 6; right at split 1, left at split 4, right at split 5, and right at split 6; or left at split 1, right at split 2, right at split 5, and right at split 6. Bin B receives all remaining paths.
```

### Example: Surface net or 3D diagram

If the official solution uses several diagrams in sequence, describe each diagram where it appears.

Good extraction:
```text
In the figures below, we show a straight line path whose distance is closest to 6.40 from each of the two perspectives. (The figures show the same cube structure from two different perspectives. In each perspective, a path is drawn on the outside surface of the figure from P to Q. The path travels across exposed faces of the cubes rather than through the solid.)

To help see this path more clearly, we strip away all but the 5 cubes that the ant walks on, below. (The next figures show only the 5 cubes used by this surface path. The cubes are labelled 1, 2, 3, 4, and 5. The labels identify the cubes whose faces are included in the flattened net that follows.)

To see that this path is along a straight line from P to Q, we draw a partial net of the previous diagrams. This partial net includes each face that the ant walks on. (The partial net shows the relevant cube faces unfolded into a flat surface. The path from P to Q is now represented as a straight line across the unfolded faces.)
```

## Table and Grid Extraction Rules

If the official solution contains a table, grid, multiplication table, case table, or structured count:

- Do not replace it with a summary.
- Convert it into a readable text table inside `official_solution`.
- Preserve all row labels, column labels, and cell values.
- Preserve totals and intermediate rows.
- If exact table formatting is difficult, use a markdown-style table.
- Do not write “the table below summarizes...” without including the table.

### Example: Multiplication table for dice products

Good extraction:
```text
In the grid shown, the first column and first row show the possible numbers that may appear on the top faces of the two dice.

(The grid is a 6 by 6 multiplication table. The top row is labelled 1, 2, 3, 4, 5, 6, representing the possible result of one die. The first column is labelled 1, 2, 3, 4, 5, 6, representing the possible result of the other die. Each inside cell shows the product of its row label and column label. The inside products are:

| × | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 1 | 2 | 3 | 4 | 5 | 6 |
| 2 | 2 | 4 | 6 | 8 | 10 | 12 |
| 3 | 3 | 6 | 9 | 12 | 15 | 18 |
| 4 | 4 | 8 | 12 | 16 | 20 | 24 |
| 5 | 5 | 10 | 15 | 20 | 25 | 30 |
| 6 | 6 | 12 | 18 | 24 | 30 | 36 |)

The inside of the grid shows the product of the corresponding two numbers.
```

### Example: Case table

Good extraction:
```text
In the table below, we determine the value of S for each of the 7 cases.

| Case | Sum S |
|---|---|
| Case 1a | S = 5a + 6d |
| Case 1b | S = 5a + 2d |
| Case 1c | S = 5a + 4d |
| Case 2a | S = 5a − 2d |
| Case 2b | S = 5a − 6d |
| Case 2c | S = 5a − 4d |
| Case 3a | S = 5a |
```

## Long Multiplication and Column Work Rules

Some official solutions show long multiplication layouts. Do not use fragile ASCII diagrams if the digits do not align clearly.

When the long multiplication layout is simple and clear, you may show it in monospaced-style text.

When unknown digits make the layout hard to align, keep the official wording and replace the visual layout with a clear column-focused explanation.

### Example: Column-focused multiplication

Good extraction:
```text
The units digit of the product 2013 × n is equal to the units digit of 3 × c.

Multiplication setup:

2013 × abc = ...2025

This means that the product must have units digit 5, tens digit 2, hundreds digit 0, and thousands digit 2.

Since the units digit of the product 2013 × n is 5, then the units digit of 3 × c is 5, and so c = 5.
```

Good extraction:
```text
Continuing the long multiplication, the tens digit of n is b, and so the tens digit of 2013 × n is equal to the units digit of 6 + 3b, as shown.

Column focus for the tens digit:

From 2013 × 5 = 10 065, the carry into the tens column is 6.

The tens digit b contributes the units digit of 3b to the tens column.

Therefore, the tens digit of 2013 × n is the units digit of 6 + 3b.
```

Good extraction:
```text
The multiplication completed to this point is shown below.

2013 × 25 = 50 325
```

## Number Formatting Rules

- Remove spaces used as thousands separators inside numbers.
- Examples:
  - `10 000` → `10000`
  - `111 000` → `111000`
  - `1 862 025` → `1862025`
- Do not remove spaces between separate numbers or between numbers and units.
- Keep units readable, for example `10 cm`, `5 minutes`, and `$60`.

## Math Formatting Rules

- Preserve mathematical meaning exactly.
- Prefer clear mathematical symbols where possible:
  - `×` for multiplication
  - `−` for subtraction/minus
  - `≤`, `≥`, `≠` where appropriate
  - `π`
  - `√`
  - `°`
- Convert exponents to superscripts where possible:
  - `m^2` → `m²`
  - `3^4 × 5^2` → `3⁴ × 5²`
  - `cm^3` → `cm³`
- Preserve variable names exactly.
- Preserve fractions exactly. Use either readable slash notation such as `1/8` or source-style stacked fraction converted to plain text.
- Do not corrupt multiplication as the letter `x`.
- Do not convert degree symbols into unrelated characters.
- Keep mathematical notation readable for AI and students.

## OCR Validation Rules

Before returning JSON:

- Verify mathematical symbols are preserved.
- Verify variable names are preserved.
- Verify exponents are preserved.
- Verify fractions are preserved.
- Verify degree symbols appear only where they appear in the source.
- Verify multiplication symbols have not been converted incorrectly.
- Verify equations have not been corrupted.
- Verify tables and grids are included if the official solution uses them.
- Verify diagrams referenced by the official solution are either described inline or converted to a readable text layout.
- Verify the final `Answer: (X)` / `ANSWER: (X)` line has been removed from `official_solution` and stored only as `correct_answer`.
- Verify numbers do not contain thousands-separator spaces such as `10 000`, `111 000`, or `1 862 025`.
- Correct obvious OCR spacing errors.

## Confidence Rules

- Use `High` if extraction is clear and complete.
- Use `Medium` if minor OCR ambiguity exists.
- Use `Low` if part of the solution is unclear, partially unreadable, or requires human review.

If the output schema does not include a confidence field, do not include confidence in the JSON. Use this rule only for internal quality checking unless a confidence field is requested.

## Output Rules

- Return valid JSON only.
- Do not include commentary.
- Do not include markdown outside JSON.
- Do not include explanations before or after the JSON.
- Escape line breaks as `\n` inside JSON strings if returning compact JSON.
- Ensure the final output can be parsed by standard JSON parsers.
