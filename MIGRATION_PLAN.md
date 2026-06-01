# Migration Plan: Streamlit → FastAPI + React

**Created:** 2026-05-30
**Status:** Deployed

## Overview

Migrating MathCoach from Streamlit prototype to production stack:
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui → **Netlify** (https://mathcoach.netlify.app)
- **Backend**: FastAPI + Python AI services → **Render** (https://mathcoach.onrender.com)
- **Database**: Supabase PostgreSQL (Transaction Pooler)

## Strategy

**New files alongside existing** - Streamlit files kept for reference but deprecated.

---

## Folder Structure

```
MathCoach/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI app entry
│   │   ├── config.py           # Environment variables
│   │   ├── database.py         # SQLAlchemy + PostgreSQL
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── questions.py    # Question CRUD endpoints
│   │   │   ├── quiz.py         # Quiz session endpoints
│   │   │   ├── coaching.py     # Socratic coaching endpoints
│   │   │   └── generation.py   # Question generation endpoints
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── coaching.py     # Groq AI coaching
│   │   │   ├── generation.py   # AI question generation
│   │   │   └── quiz.py         # Quiz logic & scoring
│   │   └── models/
│   │       ├── __init__.py
│   │       ├── question.py
│   │       ├── quiz.py
│   │       └── coaching.py
│   ├── requirements.txt
│   ├── runtime.txt             # Python 3.11.4
│   ├── render.yaml
│   └── .env.example
│
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   └── ui/             # shadcn/ui components
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Practice.tsx
│   │   │   ├── Quiz.tsx
│   │   │   ├── Results.tsx
│   │   │   └── Generate.tsx    # Question generation UI
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── netlify.toml
│   └── .env.example
│
├── schema/                     # Question schemas
├── generators/                 # Legacy Streamlit generators (deprecated)
├── app.py                      # Legacy Streamlit app (deprecated)
└── MIGRATION_PLAN.md
```

---

## API Endpoints

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
POST   /api/questions               # Create question (admin)
PUT    /api/questions/{id}          # Update question (admin)
DELETE /api/questions/{id}          # Delete question (admin)
```

### Generation
```
GET    /api/generation/blueprints   # List available blueprints
POST   /api/generation/generate     # Generate new questions from blueprint
```

---

## Migration Phases

### Phase 1: Backend Setup ✅
- [x] Create MIGRATION_PLAN.md
- [x] Create backend folder structure
- [x] FastAPI app scaffold (main.py, config.py)
- [x] PostgreSQL database connection (SQLAlchemy + psycopg2)
- [x] Question models (Pydantic)
- [x] Quiz models
- [x] Coaching models
- [x] Question CRUD endpoints
- [x] Quiz endpoints
- [x] Coaching endpoints
- [x] Coaching service (Groq AI)
- [x] Quiz service (scoring)
- [x] Render deployment config
- [x] Backend requirements.txt

### Phase 2: Core API ✅
- [x] Quiz session endpoints
- [x] Coaching endpoints
- [x] Scoring logic
- [x] Session state management

### Phase 3: Frontend Setup ✅
- [x] React + Vite project initialization
- [x] TailwindCSS configuration
- [x] shadcn/ui setup (button, card, radio-group, label)
- [x] API client service (src/services/api.ts)
- [x] Routing setup (react-router-dom)
- [x] Netlify deployment config (netlify.toml)

### Phase 4: Practice UI ✅
- [x] Home page (src/pages/Home.tsx)
- [x] Quiz settings (src/pages/Practice.tsx)
- [x] Question display component (src/pages/Quiz.tsx)
- [x] Options list with selection
- [x] Coaching panel (chat interface)
- [x] Results page (src/pages/Results.tsx)
- [ ] KaTeX/MathJax integration

### Phase 5: Admin UI (Partial)
- [ ] PDF upload interface
- [ ] Extraction workflow steps
- [ ] Question review/edit interface
- [x] Question generation interface (src/pages/Generate.tsx)
- [ ] Validation workflow

### Phase 6: Deploy ✅
- [x] Deploy backend to Render
- [x] Deploy frontend to Netlify
- [x] Configure environment variables
- [x] Set up CORS
- [x] Test end-to-end

### Phase 7: Cleanup
- [ ] Remove Streamlit files (app.py, app_extract.py)
- [ ] Remove appV01.py
- [x] Update README.md
- [ ] Archive old code if needed

---

## Environment Variables

### Backend (Render)
```
SUPABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
GROQ_API_KEY=your-groq-key           # For Socratic coaching
OPENROUTER_API_KEY=your-openrouter-key # For question generation
CORS_ORIGINS=https://mathcoach.netlify.app
ENVIRONMENT=production
```

### Frontend (Netlify)
```
VITE_API_URL=https://mathcoach.onrender.com
```

### Database Connection
Using **PostgreSQL direct connection via Supabase Transaction Pooler** (SQLAlchemy + psycopg2).
- Port: 6543 (Transaction Pooler)
- Driver: psycopg2-binary
- ORM: SQLAlchemy 2.0

---

## AI Models

### Question Generation
- Model: `qwen/qwen3-32b` via **OpenRouter API**
- Good for math problems and structured JSON output
- 4-layer prompt: style rules, schema, distractor patterns, safety rules
- Rate limit: 2 seconds between questions (paid tier)

### Socratic Coaching
- Model: `llama-3.3-70b-versatile` via **Groq API**
- Used for coaching hints and misconception feedback

---

## Progress Log

### 2026-05-30
- Created MIGRATION_PLAN.md
- Completed Phase 1: Backend Setup
- Completed Phase 2: Core API
- Completed Phase 3: Frontend Setup
- Completed Phase 4: Practice UI
- Completed Phase 6: Deploy
  - Backend live on Render
  - Frontend live on Netlify
  - CORS configured
  - Database connected via Transaction Pooler
- Added Question Generation feature
  - /api/generation/blueprints endpoint
  - /api/generation/generate endpoint
  - Generate page in frontend
  - Using qwen/qwen3-32b model

### 2026-05-31
- Added 4-layer prompt structure for question generation
  - Layer A: Global style rules (Waterloo Gauss)
  - Layer B: Schema rules (JSON format)
  - Layer C: Distractor patterns (from database)
  - Layer D: Blueprint-specific safety rules
- Added plan-based generation
  - /api/generation/plan endpoint
  - /api/generation/generate-next endpoint
  - Priority-based blueprint selection
- Added SVG visual rendering
  - GeometryDiagram component (6 templates)
  - BarGraph component
  - VisualRenderer router
- Added database tables
  - mathcoach_blueprint_distractor_patterns
  - mathcoach_blueprint_generation_plan
  - Extended mathcoach_questions with blueprint_code, visual, environment, review_status

### 2026-06-01
- Switched question generation from Groq to OpenRouter
  - Removed Groq rate limit issues (6000 TPM)
  - OpenRouter paid tier has no platform limits
  - Reduced delay from 45s to 2s between questions
- Fixed geometry diagram templates
  - right_angle_with_ray: D on ray dividing 90° angle
  - Added template selection guidance in Layer D

### Key Fixes Applied
- Python version pinned to 3.11.4 (render.yaml, runtime.txt)
- Renamed `metadata` to `question_metadata` (SQLAlchemy reserved word)
- CORS_ORIGINS changed from list to comma-separated string
- UUID to string conversion for blueprint IDs
- Timestamp-based question IDs to avoid duplicates
- max_tokens increased to 4500 for complex questions

---

## Next Steps

1. **Complete question generation** - Generate questions for all blueprints in plan
2. **KaTeX integration** - Render math formulas in questions
3. **Additional visual types** - Line graph, coordinate grid, table, fraction area
4. **PDF extraction** - Port extraction workflow from Streamlit
5. **Student analytics** - Track scores and progress over time
