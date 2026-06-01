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

# Live Demo

- **Frontend**: https://mathcoach.netlify.app
- **Backend API**: https://mathcoach.onrender.com

---

# Architecture

## Production Stack (Current)

### Frontend
* React + Vite + TypeScript
* TailwindCSS + shadcn/ui
* Deployed on **Netlify**

### Backend
* FastAPI + Python
* SQLAlchemy + psycopg2
* Deployed on **Render**

### Database
* Supabase PostgreSQL (Transaction Pooler)

### AI Services
* **Question Generation**: OpenRouter API with `qwen/qwen3-32b` model
* **Socratic Coaching**: Groq API with `llama-3.3-70b-versatile` model

---

# Features

## Practice Mode
Students can:
* Select topic and difficulty (Part A/B/C)
* Answer multiple-choice questions
* Receive Socratic coaching when stuck
* View results with score breakdown

## Question Generation (Admin)
* Plan-based generation with blueprint priorities
* 4-layer prompt structure (style rules, schema, distractor patterns, safety rules)
* AI generates questions via OpenRouter (`qwen/qwen3-32b`)
* SVG-based visual rendering (geometry diagrams, bar graphs)
* Automatic validation and database save

## Socratic Coaching
Instead of giving direct answers, Math Coach:
* asks guiding questions
* detects misconceptions
* encourages reasoning
* controls hint depth
* supports productive struggle

---

# API Endpoints

### Quiz
```
POST   /api/quiz/start              # Start quiz session
GET    /api/quiz/{session_id}       # Get quiz state
POST   /api/quiz/{session_id}/answer # Submit answer
GET    /api/quiz/{session_id}/results # Get results
```

### Coaching
```
POST   /api/coaching/start          # Get initial coaching hint
POST   /api/coaching/misconception  # Get misconception feedback
POST   /api/coaching/followup       # Continue conversation
```

### Questions
```
GET    /api/questions               # List questions (with filters)
GET    /api/questions/{id}          # Get single question
POST   /api/questions               # Create question
PUT    /api/questions/{id}          # Update question
DELETE /api/questions/{id}          # Delete question
```

### Generation
```
GET    /api/generation/blueprints   # List available blueprints
POST   /api/generation/generate     # Generate questions from blueprint
GET    /api/generation/plan         # Get generation plan with progress
POST   /api/generation/generate-next # Generate next question per plan
```

---

# Environment Variables

### Backend (Render)
```
SUPABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
GROQ_API_KEY=your-groq-key           # For Socratic coaching (Llama)
OPENROUTER_API_KEY=your-openrouter-key # For question generation (Qwen)
CORS_ORIGINS=https://mathcoach.netlify.app
ENVIRONMENT=production
```

### Frontend (Netlify)
```
VITE_API_URL=https://mathcoach.onrender.com
```

---

# Local Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env  # Edit with your credentials
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env  # Edit with API URL
npm run dev
```

---

# Database Tables

### mathcoach_questions
Stores practice questions with:
- question_text, options (A-E), correct_answer
- topic, difficulty, archetype, blueprint_code
- coaching_hints, misconceptions
- solution steps, visual spec
- environment, review_status, is_active

### mathcoach_question_blueprints
Templates for AI question generation with:
- blueprint_code, blueprint_name
- primary_topic, difficulty_level
- generation_pattern, distractor_strategy
- common_misconceptions, coaching_entry
- visual_required, visual_type

### mathcoach_blueprint_distractor_patterns
Distractor patterns for each blueprint:
- distractor_pattern_name, wrong_answer_logic
- misconception_targeted, how_to_generate_distractor
- wrong_answer_coaching_strategy

### mathcoach_blueprint_generation_plan
Generation plan with priorities:
- blueprint_code, difficulty_level, evidence_level
- dev_generation_target, requires_visual, priority

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

# Project Status

**Deployed and functional:**
- [x] FastAPI backend on Render
- [x] React frontend on Netlify
- [x] PostgreSQL database on Supabase
- [x] Practice mode with quiz flow
- [x] Socratic coaching integration (Groq + Llama)
- [x] AI question generation from blueprints (OpenRouter + Qwen)
- [x] 4-layer prompt structure with distractor patterns
- [x] Plan-based generation with priorities
- [x] SVG geometry diagrams (triangle, exterior angle, isosceles, right angle)
- [x] SVG bar graph rendering

**In progress:**
- [ ] KaTeX/MathJax math rendering
- [ ] PDF extraction workflow
- [ ] Student analytics dashboard
- [ ] Additional visual types (line graph, coordinate grid, table)

See [MIGRATION_PLAN.md](MIGRATION_PLAN.md) for detailed progress.
