# MathCoach

## Overview

MathCoach is an AI-powered adaptive learning platform for math competition and curriculum practice. The platform provides guided practice with Socratic coaching across multiple programs.

## Programs

MathCoach supports multiple programs. Each program is a separate folder with its own codebase.

| Program | Grade | Status | Folder |
|---------|-------|--------|--------|
| Grade 7 Gauss Contest | 7 | Active | `/gauss` |
| Grade 8 Gauss Contest | 8 | Planned | `/gauss` |
| Grade 7 Pascal Contest | 7 | Planned | TBD |
| Grade 8 Pascal Contest | 8 | Planned | TBD |

Currently, only Grade 7 Gauss is developed. More programs will be added later.

## Architecture

### Current Stack

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

Each program has its own tables. For Gauss programs:

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
→ Program Dashboard (filtered by program grade)
→ Contest Selection
→ Contest Screen (PDF + Answer Card + Coaching)
```

## Roles

| Role | Capabilities |
|------|--------------|
| Admin | Create teachers/students, assign programs, manage all |
| Teacher | Create students, view assigned students |
| Student | Access assigned programs, practice contests, use coaching |

## Program READMEs

- [Gauss Program README](/gauss/app/README.md) - Detailed documentation for Grade 7/8 Gauss

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

See the program-specific README for development instructions:

- [Gauss Development](/gauss/app/README.md#local-development)
