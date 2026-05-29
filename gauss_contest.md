# Math Coach – Waterloo Gauss Contest Module

## Project Overview

Math Coach is an AI-powered learning and practice platform that helps students prepare for mathematics contests through:

* Adaptive question generation
* Socratic coaching
* Performance tracking
* Contest simulation
* Weak-area identification
* Reasoning-focused learning

The first supported contest is:

**Waterloo Gauss Contest (Grade 7)**

The system is designed to support future programs such as:

* Waterloo Pascal
* Waterloo Cayley
* Waterloo Fermat
* AMC
* UKMT
* Other mathematics competitions

---

# Educational Philosophy

Traditional quiz systems focus on:

* Question
* Answer

Math Coach focuses on:

* Reasoning
* Misconceptions
* Coaching
* Pattern recognition

The objective is to help students develop contest problem-solving skills rather than memorize answers.

---

# Current Architecture

```text
Program
    ↓
Primary Topic
    ↓
Secondary Topic
    ↓
Archetype
    ↓
Blueprint
    ↓
Generated Question
    ↓
Student Response
    ↓
Socratic Coaching
```

---

# Waterloo Gauss Topic Taxonomy

The Waterloo Gauss Contest uses the following primary topics:

1. Algebra and Equations
2. Counting and Probability
3. Geometry and Measurement
4. Number Sense
5. Data Analysis
6. Other

Each primary topic contains multiple secondary topics.

---

# Educational Ontology

The system uses two independent classification systems.

## Curriculum Taxonomy

Used for:

* Student navigation
* Topic practice
* Curriculum alignment
* Reporting

Structure:

```text
Primary Topic
    ↓
Secondary Topic
```

Example:

```text
Number Sense
    ↓
Prime Numbers
```

---

## Reasoning Taxonomy (Archetypes)

Used for:

* AI generation
* Coaching
* Misconception detection
* Adaptive learning

Current archetypes:

### Integer Deconstruction

Reasoning involving:

* Prime factorization
* Divisibility
* GCF
* LCM
* Factor counting

### Periodic State Prediction

Reasoning involving:

* Repeating sequences
* Cycles
* Modular thinking

### Dynamic State Transformation

Reasoning involving:

* Percentages
* Ratios
* Rates
* State changes

### Combinatorial Probability

Reasoning involving:

* Outcome spaces
* Counting methods
* Probability

### Exhaustive Case Analysis

Reasoning involving:

* Systematic listing
* Logical constraints
* Enumeration

### Arithmetic Cryptography

Reasoning involving:

* Hidden digits
* Digit substitution
* Operational constraints

### Geometric Relation Scaling

Reasoning involving:

* Perimeter
* Area
* Volume
* Scaling relationships

### Quantitative Anchoring

Reasoning involving:

* Ordering
* Comparing values
* Distance from benchmarks
* Number sense estimation

---

# Database Tables

Current tables:

## mathcoach_archetypes

Stores reasoning archetypes.

Purpose:

* Educational ontology
* AI generation
* Coaching

---

## mathcoach_primary_topics

Stores Waterloo primary topics.

---

## mathcoach_secondary_topics

Stores Waterloo secondary topics.

---

## mathcoach_question_metadata

Stores classified Waterloo questions.

Fields include:

* Year
* Grade
* Question Number
* Part
* Primary Topic
* Secondary Topic
* Archetype
* Confidence

Purpose:

* Question classification
* Ontology validation
* Blueprint discovery

---

## mathcoach_question_blueprints

Stores reusable question-generation blueprints.

Blueprints represent:

* Reasoning patterns
* Misconceptions
* Coaching strategies
* Generation templates

Blueprints do NOT store actual questions.

---

# Blueprint Philosophy

A blueprint is:

```text
One reusable question family
```

A blueprint is NOT:

```text
One question
```

Example:

Blueprint:

Prime Factor Reasoning

Can generate:

* Sum of prime factors
* Product of prime factors
* Count of prime factors
* Prime-factor constraint questions

while maintaining the same reasoning structure.

---

# Blueprint #1

## Prime Factor Reasoning

### Primary Topic

Number Sense

### Secondary Topic

Prime Numbers

### Archetype

Integer Deconstruction

### Reasoning Goal

Students decompose a composite number into prime factors and use those prime factors to satisfy a secondary condition.

### Common Misconceptions

* Treating 1 as prime
* Confusing factors with prime factors
* Using composite factors
* Prime misidentification
* Ignoring parity properties

### Coaching Entry

"What are the smallest whole-number building blocks of this number?"

### Visual Requirement

None

---

# Visual System Strategy

The platform will support both:

## Text-only Questions

Examples:

* Prime numbers
* Divisibility
* Ratios
* Percentages
* Probability

## Visual Questions

Examples:

* Geometry diagrams
* Coordinate grids
* Bar graphs
* Number lines
* Fraction area models
* Balance scales

Visuals will be generated from structured specifications rather than stored images.

Example:

```json
{
  "type": "coordinate_grid",
  "points": [
    {"label": "A", "x": 2, "y": 3}
  ]
}
```

This allows unlimited generation and rendering.

---

# Current Development Status

Completed:

* Contest taxonomy design
* Archetype taxonomy design
* Question classification workflow
* Supabase schema creation
* Question metadata import
* Blueprint table design
* Blueprint #1 creation

In Progress:

* Blueprint discovery workflow
* Blueprint validation workflow
* Question generation engine design

Future:

* AI question generation
* Visual generation system
* Contest simulation mode
* Adaptive learning engine
* Student analytics dashboard
* Multi-program support
* Performance tracking
* Weak-area recommendations

```
```
