# MathCoach

## Overview

MathCoach is an AI-powered adaptive learning platform that teaches various math programs. The platform provides guided practice with Socratic coaching.

## Math Programs

Users see and access math programs on the MathCoach app:

| Program | Description | Status |
|---------|-------------|--------|
| Gauss | Waterloo Gauss Contest (Grade 7/8) | Active |
| AMC | AMC 8/10 Competition | Planned |
| Pascal | Waterloo Pascal Contest | Planned |

Currently, only the Gauss program is available.

## Architecture

Internally, MathCoach is organized into **modules**:

```
MathCoach/
├── gauss/          # Gauss module (active)
├── frontend/       # Generator frontend (React + Vite)
├── backend/        # Generator backend (FastAPI)
├── docs/           # Documentation (style guides, etc.)
```

### Gauss Module

The gauss module (`/gauss`) contains the codebase for the Gauss program, including:
- React frontend for student practice
- Netlify Functions for API
- SQL migrations for Supabase

### Generator Module

The generator module (`/frontend` + `/backend`) creates adaptive practice questions targeting student weak areas. Rather than using static past papers, it generates new questions from blueprints based on reasoning archetypes.

| Aspect | Details |
|--------|---------|
| Frontend | `/frontend` - React + Vite + TypeScript |
| Backend | `/backend` - FastAPI + OpenRouter API |
| Initial Target | Gauss program |
| Approach | Blueprint-based question generation |

**Strategy**: The generator is being developed **Gauss-first**. Other programs may require their own dedicated generators due to differences in question style, difficulty progression, and reasoning patterns.

### Documentation

The `/docs` folder contains reference materials:
- `gauss_blueprint_manual.md` - Blueprint development workflow for Gauss program
- `waterloo_gauss_style_guide.md` - Question writing style for Gauss program

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React + Vite + TypeScript |
| Styling | TailwindCSS |
| Backend | Netlify Functions |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| AI Coaching | Groq API (Llama 3.3 70B) |
| Hosting | Netlify |

### Shared Tables

Tables prefixed with `mathcoach_` are shared across all programs:

| Table | Purpose |
|-------|---------|
| `mathcoach_programs` | Available programs (G7gauss, G8gauss, etc.) |
| `student_program_assignments` | Which students have which programs |

### Program-Specific Tables

Each program has its own tables. For the Gauss program:

| Table | Purpose |
|-------|---------|
| `gauss_contests` | Contest metadata |
| `gauss_questions` | Contest questions |
| `gauss_solutions` | PSG solution text |
| `gauss_source_questions` | Source questions with official solutions |
| `gauss_coaching_plans` | Adaptive coaching plans |
| `gauss_contest_sessions` | Student session tracking |
| `gauss_attempts` | Student answer attempts |

## Student Flow

```
Login
→ Program Selection (skip if only 1 program assigned)
→ Program Dashboard (filtered by grade)
→ Contest/Practice Selection
→ Practice Screen (PDF + Answer Card + Coaching)
```

## Roles

| Role | Capabilities |
|------|--------------|
| Admin | Create teachers/students, assign programs, manage all |
| Teacher | Create students, view assigned students |
| Student | Access assigned programs, practice, use coaching |

## Module Documentation

- [Gauss Module](/gauss/app/README.md) - Detailed documentation for the Gauss module

## Educational Philosophy

MathCoach emphasizes:

- Reasoning over memorization
- Socratic coaching (guiding questions, not answers)
- Productive struggle
- Misconception-aware guidance
- Step-by-step problem solving

The coach asks one question at a time and never reveals the final answer until the student reaches it.

## Live Demo

- **App**: https://mathcoach.netlify.app

## Local Development

See the module-specific README for development instructions:

- [Gauss Development](/gauss/app/README.md#local-development)
