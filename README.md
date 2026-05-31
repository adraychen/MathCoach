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
* Groq API with `qwen/qwen3-32b` model
* Used for question generation and Socratic coaching

---

# Features

## Practice Mode
Students can:
* Select topic and difficulty (Part A/B/C)
* Answer multiple-choice questions
* Receive Socratic coaching when stuck
* View results with score breakdown

## Question Generation (Admin)
* Select from blueprint templates
* AI generates new questions matching the blueprint style
* Validate and save to database
* Uses `qwen/qwen3-32b` for math-focused generation

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
POST   /api/generation/generate     # Generate new questions
```

---

# Environment Variables

### Backend (Render)
```
SUPABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
GROQ_API_KEY=your-groq-key
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
- topic, difficulty, archetype
- coaching_hints, misconceptions
- solution steps

### mathcoach_question_blueprints
Templates for AI question generation with:
- blueprint_code, blueprint_name
- primary_topic, difficulty_level
- generation_pattern, distractor_strategy
- common_misconceptions, coaching_entry

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
- [x] Socratic coaching integration
- [x] AI question generation from blueprints

**In progress:**
- [ ] KaTeX/MathJax math rendering
- [ ] PDF extraction workflow
- [ ] Student analytics dashboard
- [ ] Diagram/graph rendering

See [MIGRATION_PLAN.md](MIGRATION_PLAN.md) for detailed progress.
