# Math Coach – Contest Knowledge Extraction & Blueprint Development Manual

**Version:** v2 schema-aligned working manual  
**Updated:** 2026-05-30

## Purpose

This document defines the official workflow for adding new contest programs, new contest papers, new topics, new archetypes, and new blueprints to the Math Coach platform.

Math Coach is not a past-paper copying system. It is a structured contest-learning system that uses past questions as evidence to build reusable reasoning patterns and generation blueprints.

---

# Core Philosophy

Math Coach uses a layered educational architecture:

```text
Contest Program
    ↓
Topic Taxonomy
    ↓
Question Classification
    ↓
Reasoning Archetypes
    ↓
Blueprint Families
    ↓
Question Generation
    ↓
Socratic Coaching
```

Questions are generated from **blueprints**, not directly from copied contest questions.

Past contest questions are used to understand topic distribution, reasoning archetypes, difficulty drivers, blueprint families, and coaching needs.

---

# Key Schema Principle

Part A / Part B / Part C is **question-specific**, not archetype-specific.

An archetype describes how a student thinks. A contest part describes the difficulty and placement of a specific question or blueprint.

Correct separation:

```text
mathcoach_question_metadata.part
→ stores the official part for each past question

mathcoach_archetypes
→ stores reusable reasoning patterns only

mathcoach_question_blueprints.expected_part
→ stores the intended generated difficulty/contest section

mathcoach_contest_structure
→ stores the official test format
```

Example:

```text
exhaustive_case_analysis
→ may appear in Part A as simple listing
→ may appear in Part C as multi-constraint search
```

Therefore, `typical_difficulty` should not be stored in `mathcoach_archetypes`. Difficulty belongs to metadata, contest structure, and blueprints.

---

# Current Database Structure

## mathcoach_question_metadata

Stores classified past contest questions.

One row represents one real contest question.

Recommended fields:

```text
id
program_name
year
grade
question_number
part
primary_topic
secondary_topic
archetype
confidence
notes
source_type
is_validated
created_at
updated_at
```

Usage:

```text
Stores historical evidence.
Supports topic/archetype distribution analysis.
Supports blueprint discovery.
Does not directly generate questions.
```

For Waterloo Gauss Grade 7:

```text
Part A = Questions 1–10
Part B = Questions 11–20
Part C = Questions 21–25
```

---

## mathcoach_archetypes

Stores reusable reasoning patterns.

One row represents one way of thinking, not one topic and not one difficulty level.

Recommended fields:

```text
id
canonical_name
display_name
description
reasoning_goal
mental_operations
common_misconceptions
coaching_entry
difficulty_drivers
reusable_constraints
related_archetypes
generation_notes
example_question_refs
is_active
created_at
updated_at
```

Do not store Part A / Part B / Part C here.

The `difficulty_drivers` field explains why the same archetype can become easier or harder.

Approved current archetypes:

```text
integer_deconstruction
dynamic_state_transformation
periodic_state_prediction
combinatorial_probability
arithmetic_cryptography
geometric_relation_scaling
quantitative_anchoring
exhaustive_case_analysis
angle_property_deduction
visual_symmetry_analysis
geometric_formula_application
visual_data_retrieval
variable_substitution
coordinate_spatial_reasoning
coordinate_transformation
```

Rename rule:

```text
Do not use transformation_operation.
Use coordinate_transformation.
```

---

## mathcoach_primary_topics

Stores official broad contest topic categories.

Examples:

```text
number sense
geometry and measurement
counting and probability
data analysis
algebra and equations
other
```

Usage:

```text
Supports consistent primary topic classification.
Does not determine reasoning archetype.
```

---

## mathcoach_secondary_topics

Stores specific contest topic labels.

Examples:

```text
decimals
fractions/ratios
angles
area
graphs
probability
patterning/sequences/series
```

A secondary topic may appear under more than one primary topic.

Therefore, secondary topics should not be forced into a one-to-one parent relationship.

---

## mathcoach_topic_mappings

Stores allowed primary-topic and secondary-topic combinations from the Waterloo taxonomy.

Recommended fields:

```text
id
program_name
primary_topic
secondary_topic
source
is_active
created_at
updated_at
```

Usage:

```text
Validates allowed topic combinations.
Does not automatically choose the primary topic.
The dominant reasoning process still determines final classification.
```

---

## mathcoach_contest_structure

Stores the official contest layout for simulation.

Recommended fields:

```text
id
program_name
grade
part
question_number_start
question_number_end
question_count
description
is_active
created_at
updated_at
```

For Waterloo Gauss Grade 7:

| program_name | grade | part | question_number_start | question_number_end | question_count |
|---|---:|---|---:|---:|---:|
| Waterloo Gauss | 7 | Part A | 1 | 10 | 10 |
| Waterloo Gauss | 7 | Part B | 11 | 20 | 10 |
| Waterloo Gauss | 7 | Part C | 21 | 25 | 5 |

Usage:

```text
Tells the generator how many questions to create for each part.
Supports full test simulation.
Keeps official test structure separate from reasoning taxonomy.
```

---

## mathcoach_question_blueprints

Stores reusable question generation families.

One row represents a generation recipe, not a past question.

Recommended fields:

```text
id
blueprint_code
blueprint_name
program_name
grade
expected_part
primary_topic
secondary_topic
archetype
reasoning_goal
generation_pattern
difficulty_drivers
common_misconceptions
distractor_strategy
coaching_strategy
visual_type
visual_requirements
example_question_refs
validation_status
created_at
updated_at
```

`expected_part` belongs here because blueprints generate Part A, Part B, or Part C style questions.

Example:

```text
Blueprint: Direct Graph Value Retrieval
Archetype: visual_data_retrieval
Expected Part: Part A

Blueprint: Multi-Constraint Grid Search
Archetype: exhaustive_case_analysis
Expected Part: Part C
```

---

# Workflow for Adding New Contest Papers

## Step 1 – Collect Source Material

Required:

```text
Contest paper PDF
Official solutions, if available
Waterloo topic taxonomy
Current archetype taxonomy
Current blueprint definitions, if available
```

Important source rule:

```text
Use the contest paper to decide which questions belong in the metadata table.
Use official solutions only to understand reasoning.
Do not create metadata rows from solution files alone.
```

---

## Step 2 – Upload to NotebookLM

Upload:

```text
Contest papers
Official solutions
Waterloo primary and secondary topic list.csv
Current archetype taxonomy
Current metadata review files, if relevant
```

NotebookLM is the analysis engine. It does not write directly to Supabase.

---

# Workflow A – Question Classification

## Objective

Classify every contest question.

NotebookLM output:

```text
program,year,grade,question_number,part,primary_topic,secondary_topic,archetype,confidence,notes
```

Rules:

```text
One row per question.
Do not skip questions.
Do not add rows from solution-only sections.
Use exactly one primary topic when clear.
Use exactly one secondary topic when clear.
Use exactly one archetype when clear.
Leave unclear fields blank for human review.
```

Human validation is required before database insertion.

---

# Workflow B – Archetype Discovery

## Objective

Identify recurring reasoning patterns.

Create a new archetype only if:

```text
Reasoning process is unique.
Coaching strategy differs.
Misconceptions differ.
Generation pattern differs.
```

Do not create a new archetype only because:

```text
The topic is different.
The numbers are different.
The context is different.
The difficulty is different.
```

Difficulty changes should usually be handled by blueprint design, not by creating a new archetype.

---

# Workflow C – Topic Mapping

## Objective

Connect questions to official Waterloo topics.

The Waterloo topic mapping table is an allowed-reference table.

If a secondary topic appears under multiple primary topics, choose the primary topic based on dominant reasoning demand.

Example:

```text
Area + direct formula → geometry and measurement
Area + equation setup → algebra and equations
Area + counting arrangements → counting and probability
Area + graph/table interpretation → data analysis
```

---

# Workflow D – Blueprint Discovery

## Objective

Identify reusable question families.

A blueprint represents:

```text
Same reasoning goal
Same misconception pattern
Same coaching entry
Same generation pattern
Similar difficulty drivers
Expected contest part
```

A blueprint does not represent one question.

A new blueprint is required when any of these changes:

```text
reasoning goal
misconception profile
coaching strategy
generation pattern
expected part / difficulty structure
visual requirements
```

A new blueprint is not required when only these change:

```text
numbers
wording
context
student-facing story
```

---

# Workflow E – Blueprint Validation

For each blueprint, generate:

```text
10 questions
```

Compare against source contest questions.

Review:

```text
Style similarity
Difficulty alignment
Expected part alignment
Reasoning alignment
Distractor quality
Coaching quality
Visual quality
```

Outcomes:

```text
Pass → store as approved
Fail → refine and retest
```

---

# Visual Question Workflow

Visual questions are generated from specifications, not copied images.

Example:

```json
{
  "type": "coordinate_grid",
  "points": [
    {"label": "A", "x": 2, "y": 3}
  ]
}
```

Supported visual types:

```text
none
coordinate_grid
geometry_diagram
bar_graph
line_graph
table
balance_scale
fraction_area
number_line
shape_pattern
net_3d
```

---

# Test Simulation Logic

To generate a Waterloo Gauss-style Grade 7 test:

```text
1. Read mathcoach_contest_structure.
2. Generate 10 Part A questions.
3. Generate 10 Part B questions.
4. Generate 5 Part C questions.
5. Select approved blueprints by expected_part.
6. Ensure topic and archetype distribution is reasonable.
7. Generate questions from blueprints, not from past-paper text.
8. Generate Socratic coaching from the blueprint and archetype.
```

The generator should not choose questions directly from `mathcoach_question_metadata`.

`mathcoach_question_metadata` is evidence.

`mathcoach_question_blueprints` is the generation source.

---

# Human Review Policy

NotebookLM may suggest:

```text
classifications
archetypes
topic mappings
blueprints
expected parts
```

NotebookLM never writes directly to the database.

Workflow:

```text
NotebookLM
    ↓
Human Review
    ↓
Supabase
```

Human approval is mandatory.

---

# Current Grade 7 Gauss Status

Current reviewed metadata status:

```text
Program: Waterloo Gauss
Grade: 7
Years: 2021–2025
Rows: 125
Questions per year: 25
Blank primary topics: 0
Blank secondary topics: 0
Blank archetypes: 0
Remaining Medium confidence rows: 2
```

The seven approved new archetypes are:

```text
angle_property_deduction
visual_symmetry_analysis
geometric_formula_application
visual_data_retrieval
variable_substitution
coordinate_spatial_reasoning
coordinate_transformation
```

---

# Future Expansion

This workflow is reusable for:

```text
Waterloo Gauss Grade 8
Waterloo Pascal
Waterloo Cayley
Waterloo Fermat
AMC
UKMT
SAT Math
```

No architectural changes should be required.

Only these should be added:

```text
new contest papers
new classifications
new archetypes, if justified
new blueprints
new contest structure rows
```
