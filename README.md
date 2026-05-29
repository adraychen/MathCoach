# Math Coach

## Overview

Math Coach is an AI-powered adaptive learning platform that simulates real academic and competition-style math programs through guided practice and Socratic coaching.

The platform allows educators or administrators to upload sample questions from programs such as:

* Waterloo Gauss
* Waterloo Pascal
* AMC 8
* School curriculum assessments
* Singapore Math
* Olympiad-style contests

Math Coach analyzes these reference questions to learn:

* question structures
* reasoning patterns
* difficulty progression
* distractor styles
* common misconceptions

The system then generates new practice questions while preserving the style and reasoning depth of the original program.

Students receive:

* adaptive practice
* step-by-step Socratic coaching
* misconception-aware guidance
* timing analytics
* progress tracking

The platform is designed to help students learn how to think rather than simply memorize answers.

---

# Vision

Traditional learning platforms focus on:

* answer checking
* static hints
* repetitive drills

Math Coach focuses on:

* reasoning development
* productive struggle
* guided discovery
* contest-style thinking
* misconception correction

The long-term goal is to create an AI-native learning system capable of supporting multiple educational programs and teaching styles through uploaded reference material.

---

# Core Features

## Program-Based Learning

Students can select a learning program such as:

* Waterloo Gauss Competition
* AMC 8
* School Curriculum
* Custom Uploaded Programs

Each program maintains its own:

* style
* difficulty
* coaching approach
* reasoning patterns

---

## AI Question Generation

The system generates new questions based on:

* uploaded sample papers
* extracted reasoning archetypes
* topic structures
* difficulty levels
* misconception patterns

Generated questions are:

* multiple choice
* contest-style
* misconception-aware
* reusable
* scalable

---

## Socratic Coaching

Instead of giving direct answers, Math Coach:

* asks guiding questions
* detects misconceptions
* encourages reasoning
* controls hint depth
* supports productive struggle

The coaching system is designed to:

* reveal minimal information
* guide one step at a time
* adapt to student thinking

---

## Student Analytics

The platform tracks:

* score history
* time-to-correct-answer
* weak topics
* misconception trends
* coaching usage

These analytics support:

* adaptive practice
* personalized learning
* progress monitoring

---

# System Workflow

## 1. Upload Reference Material

Administrators upload:

* PDFs
* worksheets
* contest papers
* question banks

---

## 2. AI Pattern Extraction

The system analyzes:

* wording style
* reasoning structures
* distractor strategies
* cognitive skills
* topic taxonomy

---

## 3. Question Archetype Creation

The platform builds reusable question blueprints such as:

* divisibility elimination
* percent traps
* ordering and comparison
* consecutive integer reasoning

---

## 4. AI Question Generation

The AI generates:

* new numerical variations
* new contexts
* controlled distractors
* coaching metadata

while preserving the original program style.

---

## 5. Validation and Storage

Questions are:

* reviewed
* validated
* deduplicated
* stored in Supabase

---

## 6. Student Practice

Students:

* choose a program
* select topics and difficulty
* practice generated questions
* receive Socratic coaching
* track progress over time

---

# Architecture

## Current Prototype

* Streamlit
* Python
* Groq API
* Local JSON question bank

---

## Planned Production Stack

### Frontend

* React + Vite
* TailwindCSS
* shadcn/ui

### Backend

* FastAPI

### Database

* Supabase PostgreSQL

### AI Services

* Groq / OpenAI / Claude

### Rendering

* SVG diagrams
* KaTeX / MathJax

---

# Educational Philosophy

Math Coach emphasizes:

* reasoning over memorization
* minimal-answer coaching
* guided discovery
* productive struggle
* misconception-aware learning

The system is designed to coach students toward understanding rather than simply producing answers.

---

# Current Status

Prototype Phase:

* Waterloo Gauss Grade 7 Arithmetic & Number Sense
* Socratic coaching
* timing analytics
* rotating question bank
* adaptive tutoring workflow

Planned Next Steps:

* AI question generation
* Supabase integration
* program upload workflow
* reasoning archetype extraction
* adaptive recommendation engine
* diagram and graph support
