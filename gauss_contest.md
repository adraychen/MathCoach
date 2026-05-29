# Math Coach – Contest Knowledge Extraction & Blueprint Development Manual

## Purpose

This document defines the official workflow for adding new contest programs, new contest papers, new topics, new archetypes, and new blueprints to the Math Coach platform.

This document is the operational guide for maintaining and expanding the educational knowledge base.

---

# Core Philosophy

Math Coach does not generate questions directly from past papers.

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

Questions are generated from blueprints, not from copied contest questions.

---

# Current Database Structure

## mathcoach_primary_topics

Stores official contest topic categories.

Example:

* Number Sense
* Counting and Probability
* Geometry and Measurement
* Algebra and Equations
* Data Analysis
* Other

---

## mathcoach_secondary_topics

Stores contest-specific topic breakdowns.

Example:

* Prime Numbers
* Divisibility
* Percentages
* Probability
* Counting
* Area

---

## mathcoach_archetypes

Stores reasoning archetypes.

Examples:

* Integer Deconstruction
* Dynamic State Transformation
* Periodic State Prediction
* Combinatorial Probability
* Arithmetic Cryptography
* Geometric Relation Scaling
* Quantitative Anchoring
* Exhaustive Case Analysis

---

## mathcoach_question_metadata

Stores classified contest questions.

Each row represents one contest question.

Fields:

* Program
* Year
* Grade
* Question Number
* Part
* Primary Topic
* Secondary Topic
* Archetype
* Confidence

---

## mathcoach_question_blueprints

Stores reusable generation blueprints.

Blueprints contain:

* Reasoning goals
* Misconceptions
* Coaching strategies
* Generation patterns
* Visual requirements

Blueprints do not contain actual questions.

---

# Workflow for Adding New Contest Papers

## Step 1 – Collect Source Material

Required:

* Contest paper PDF
* Official solutions (if available)

Store source files in project storage.

Example:

```text
Waterloo Gauss 2026
Waterloo Gauss 2027
```

---

## Step 2 – Upload to NotebookLM

Upload:

* Contest papers
* Official solutions
* Current archetype taxonomy
* Current blueprint definitions

NotebookLM becomes the analysis engine.

---

# Workflow A – Question Classification

## Objective

Classify every contest question.

NotebookLM Output:

| year | grade | question_number | part | primary_topic | secondary_topic | archetype | confidence |

Store results in:

```text
mathcoach_question_metadata
```

---

## Human Validation

Review:

* Medium confidence
* Low confidence
* New reasoning patterns

Correct errors before database insertion.

---

# Workflow B – Archetype Discovery

## Objective

Identify new reasoning patterns.

Prompt NotebookLM:

```text
Identify recurring reasoning structures.
```

Questions:

* Does a new archetype exist?
* Is an existing archetype sufficient?

If existing archetypes cover the questions:

```text
No new archetype required.
```

Otherwise:

```text
Create candidate archetype.
```

---

## Archetype Approval Checklist

Create a new archetype only if:

* Reasoning process is unique.
* Coaching strategy differs.
* Misconceptions differ.
* Generation pattern differs.

Otherwise reuse an existing archetype.

---

# Workflow C – Topic Mapping

## Objective

Connect archetypes to curriculum topics.

NotebookLM Output:

| archetype | primary_topic | secondary_topic |

Validate before acceptance.

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
```

A blueprint does NOT represent one question.

---

## Blueprint Discovery Prompt

Use NotebookLM to identify:

* Blueprint name
* Reasoning goal
* Common misconceptions
* Coaching entry
* Generation pattern
* Difficulty drivers
* Visual requirements

---

# Blueprint Approval Criteria

A blueprint is approved when:

AI can:

* Generate questions
* Generate distractors
* Generate Socratic coaching
* Identify visual requirements

from the blueprint definition.

---

# Workflow E – Blueprint Validation

## Objective

Validate blueprint quality.

For each blueprint:

Generate:

```text
10 questions
```

Compare against source contest questions.

Review:

* Style similarity
* Difficulty alignment
* Reasoning alignment
* Distractor quality
* Coaching quality

---

## Validation Outcomes

### Pass

Blueprint stored as Approved.

### Fail

Blueprint refined and retested.

---

# Visual Question Workflow

## Philosophy

Visual questions are generated from specifications, not images.

Example:

```json
{
  "type": "coordinate_grid",
  "points": [
    {"label":"A","x":2,"y":3}
  ]
}
```

---

## Supported Visual Types

Current list:

* none
* coordinate_grid
* geometry_diagram
* bar_graph
* line_graph
* table
* balance_scale
* fraction_area
* number_line
* shape_pattern
* net_3d

---

# Blueprint Creation Rules

A new blueprint is required when:

Any of the following changes:

* reasoning goal
* misconception profile
* coaching strategy
* generation pattern

A new blueprint is NOT required when only:

* numbers change
* wording changes
* context changes

---

# How Many Blueprints Exist?

The number is discovered from the data.

Procedure:

1. Classify questions.
2. Group by topic + archetype.
3. Analyze reasoning patterns.
4. Split groups when generation patterns differ.
5. Create blueprint families.

Expected:

```text
80 Waterloo Gauss Arithmetic & Number Sense Questions
→ approximately 20–30 blueprints
```

Actual number determined by analysis.

---

# Human Review Policy

NotebookLM may suggest:

* archetypes
* mappings
* blueprints

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

# Future Expansion

This workflow is reusable for:

* Waterloo Pascal
* Waterloo Cayley
* Waterloo Fermat
* AMC
* UKMT
* SAT Math

No architectural changes required.

Only:

* new papers
* new classifications
* new blueprints

are added.
