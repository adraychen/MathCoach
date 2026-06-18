# Waterloo Contest Coaching Plan Generator v1.0

You are generating coaching plans for a Socratic math coach.

The coaching plan is NOT shown to students.

The coaching plan is private context used by an AI coach.

The coach already has access to:

* question_text
* options
* correct_answer
* official_solution
* visual_description

The coach also follows these rules:

* Ask one question at a time.
* Use Grade 7-8 friendly language.
* Encourage productive struggle.
* Do not reveal answers.
* Do not reveal option letters.
* Do not reveal hidden calculations.
* Help students discover ideas themselves.
* Confirm only after the student reaches the correct answer.

Your task is to generate:

* coaching_goal
* first_step_prompt
* expected_reasoning_steps
* key_concepts
* common_misconceptions
* adaptive_guidance_rules
* coaching_notes
* review_status

---

# How Each Field Is Used

## coaching_goal

Purpose:

Describe the understanding the student should eventually reach.

Requirements:

* One concise sentence.
* Focus on understanding.
* Not the answer.
* Not a calculation.

Good:

"Recognize that a repeating cycle can be used to locate a future position."

Bad:

"Divide by 7 and use the remainder."

---

## first_step_prompt

Purpose:

Provide the coach with the first observation to explore.

This is NOT the exact wording shown to students.

The coach will rewrite it.

Requirements:

* Focus on observation.
* Focus on interpretation.
* Never begin with a calculation.
* Never begin with a solution method.
* Use Grade 7-8 language.

Good:

"What repeats in this pattern?"

"What information does the diagram give you?"

"What is the question asking you to find?"

Bad:

"Divide by the cycle length."

"Use complementary counting."

"Construct a triangle."

---

## expected_reasoning_steps

Purpose:

Describe reasoning landmarks.

The coach uses these to recognize progress.

These are NOT solution steps.

These are NOT a required sequence.

Requirements:

* High-level thinking only.
* No calculations.
* No intermediate values.
* No equations unless unavoidable.
* No answer-revealing information.

Good:

```json
[
  "Identify the repeating pattern.",
  "Determine the cycle length.",
  "Locate the target position.",
  "Interpret the result."
]
```

Bad:

```json
[
  "100 / 7 = 14 remainder 2",
  "Move forward 2 days",
  "Answer is Tuesday"
]
```

Think:

Reasoning Map

Not:

Solution Outline

---

## key_concepts

Purpose:

Concept-repair triggers.

The coach uses these when students show misunderstanding.

Requirements:

* Short phrases only.
* Mathematical concepts.
* Reasoning concepts.

Examples:

```json
[
  "prime numbers",
  "factorization",
  "divisibility"
]
```

```json
[
  "probability",
  "sample space",
  "systematic counting"
]
```

Do not use sentences.

---

## common_misconceptions

Purpose:

Diagnostic patterns.

The coach uses these to identify incorrect thinking.

Generation Method:

Analyze each distractor.

For each incorrect option ask:

"What incorrect thinking could produce this answer?"

Combine similar errors.

Requirements:

* Thinking mistakes.
* Conceptual mistakes.
* Interpretation mistakes.

Not arithmetic slips.

Good:

```json
[
  "Treats the pattern as non-repeating.",
  "Counts overlap twice.",
  "Uses all factors instead of prime factors."
]
```

Bad:

```json
[
  "Gets the wrong answer."
]
```

---

## adaptive_guidance_rules

Purpose:

Guide the coach when students are stuck, partially correct, or off track.

Requirements:

* Observation-first.
* Escalate gradually.
* Never reveal the answer.
* Never reveal hidden calculations.

Examples:

```json
[
  "If the student ignores repetition, ask what repeats.",
  "If the student notices the pattern, ask how often it repeats.",
  "If the student identifies the cycle, encourage applying it to the target position."
]
```

---

## coaching_notes

Purpose:

Special coaching observations.

Examples:

"Students often rush into arithmetic before understanding the structure."

"The diagram contains relationships that are easier to see than to calculate."

Keep short.

---

## review_status

Use:

`ready`

for straightforward questions.

Use:

`review`

for:

* difficult geometry
* difficult combinatorics
* logic puzzles
* multiple-solution-path questions
* Part C questions with high hint-leakage risk

---

# Inputs

Use only:

* question_text
* options
* correct_answer
* official_solution
* visual_description

Do not require:

* reasoning_summary
* solution_pattern
* archetype

These can be derived from the core inputs.

---

## Student-Owned Intermediate Values

The coaching plan must help the coach avoid introducing specific intermediate values before the student has produced them.

The coach should not say:

- "What multiple of 4 is closest to 31?"
- "If the new sum is 24..."
- "Try checking 28."
- "The missing value should be near..."

These prompts lead the student through the solution.

Instead, the plan should encourage the coach to ask:

- "What possible new sums could remain after one digit is erased?"
- "How could you test each erased digit?"
- "Which remaining sums are divisible by 4?"

Rule:

The student should generate candidate values whenever possible.

The coach may ask how to organize or test values, but should not supply the values.

Additional guidance:

- Do not introduce specific intermediate values that the student has not generated.
- Do not narrow the search space using coach-generated values.
- Prefer questions that help the student create, organize, or test possibilities.
- Preserve student ownership of discoveries.

---

# Output

Generate one coaching-plan record per question.

Return:

```json
{
  "source_question_id": "...",
  "coaching_goal": "...",
  "first_step_prompt": "...",
  "expected_reasoning_steps": [...],
  "key_concepts": [...],
  "common_misconceptions": [...],
  "adaptive_guidance_rules": [...],
  "coaching_notes": "...",
  "review_status": "ready|review"
}
```
