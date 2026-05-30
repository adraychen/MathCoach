# Migration Plan: Streamlit → FastAPI + React

**Created:** 2026-05-30
**Status:** In Progress

## Overview

Migrating MathCoach from Streamlit prototype to production stack:
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui → Netlify
- **Backend**: FastAPI + Python AI services → Render
- **Database**: Supabase PostgreSQL

## Strategy

**New files alongside existing** - Keep Streamlit working during transition.

---

## Folder Structure

```
MathCoach/
├── backend/                    # NEW - FastAPI
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI app entry
│   │   ├── config.py           # Environment variables
│   │   ├── database.py         # Supabase client
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── questions.py    # Question CRUD endpoints
│   │   │   ├── quiz.py         # Quiz session endpoints
│   │   │   ├── coaching.py     # Socratic coaching endpoints
│   │   │   ├── extraction.py   # PDF extraction endpoints
│   │   │   └── generation.py   # Question generation endpoints
│   │   ├── services/           # Business logic (reuse existing)
│   │   │   ├── __init__.py
│   │   │   ├── coaching.py     # From coaching/socratic_coach.py
│   │   │   ├── extraction.py   # From extraction/
│   │   │   ├── generation.py   # From generators/
│   │   │   └── quiz.py         # From utils/quiz_manager.py
│   │   └── models/             # Pydantic models
│   │       ├── __init__.py
│   │       ├── question.py
│   │       ├── quiz.py
│   │       └── coaching.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── render.yaml             # Render deployment config
│
├── frontend/                   # NEW - React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   ├── Quiz/
│   │   │   ├── Admin/
│   │   │   └── Diagram/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   │   └── api.ts          # API client
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── netlify.toml
│
├── schema/                     # KEEP - shared schemas
├── app.py                      # KEEP - deprecated after migration
└── MIGRATION_PLAN.md           # This file
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

### Extraction (Admin)
```
POST   /api/extraction/upload       # Upload PDF
POST   /api/extraction/analyze      # Analyze paper structure
POST   /api/extraction/parse        # Parse questions from pages
POST   /api/extraction/classify     # Classify parsed questions
POST   /api/extraction/save         # Save to database
```

### Generation (Admin)
```
GET    /api/generation/blueprints   # List available blueprints
POST   /api/generation/generate     # Generate new question
POST   /api/generation/validate     # Validate generated question
```

---

## Migration Phases

### Phase 1: Backend Setup
- [x] Create MIGRATION_PLAN.md
- [x] Create backend folder structure
- [x] FastAPI app scaffold (main.py, config.py)
- [x] Supabase database connection (database.py)
- [x] Question models (Pydantic) - models/question.py
- [x] Quiz models - models/quiz.py
- [x] Coaching models - models/coaching.py
- [x] Question CRUD endpoints - routers/questions.py
- [x] Quiz endpoints - routers/quiz.py
- [x] Coaching endpoints - routers/coaching.py
- [x] Coaching service - services/coaching.py
- [x] Quiz service - services/quiz.py
- [x] Render deployment config (render.yaml)
- [x] Backend requirements.txt
- [x] .env.example

### Phase 2: Core API
- [ ] Quiz session endpoints
- [ ] Coaching endpoints (reuse socratic_coach.py logic)
- [ ] Scoring logic
- [ ] Session state management

### Phase 3: Frontend Setup
- [ ] React + Vite project initialization
- [ ] TailwindCSS configuration
- [ ] shadcn/ui setup
- [ ] API client service
- [ ] Routing setup
- [ ] Netlify deployment config

### Phase 4: Practice UI
- [ ] Home page
- [ ] Quiz settings (topic, difficulty)
- [ ] Question display component
- [ ] Options list with selection
- [ ] Coaching panel (chat interface)
- [ ] Results page
- [ ] KaTeX/MathJax integration

### Phase 5: Admin UI
- [ ] PDF upload interface
- [ ] Extraction workflow steps
- [ ] Question review/edit interface
- [ ] Question generation interface
- [ ] Validation workflow

### Phase 6: Deploy
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Netlify
- [ ] Configure environment variables
- [ ] Set up CORS
- [ ] Test end-to-end

### Phase 7: Cleanup
- [ ] Remove Streamlit files (app.py, app_extract.py)
- [ ] Remove appV01.py
- [ ] Update README.md
- [ ] Archive old code if needed

---

## File Mapping (Old → New)

| Streamlit File | FastAPI Location | Notes |
|----------------|------------------|-------|
| `coaching/socratic_coach.py` | `backend/app/services/coaching.py` | Reuse logic |
| `extraction/pdf_extractor.py` | `backend/app/services/extraction.py` | Reuse logic |
| `extraction/question_parser.py` | `backend/app/services/extraction.py` | Reuse logic |
| `extraction/normalizer.py` | `backend/app/services/extraction.py` | Reuse logic |
| `generators/*.py` | `backend/app/services/generation.py` | Reuse logic |
| `utils/quiz_manager.py` | `backend/app/services/quiz.py` | Reuse logic |
| `utils/scoring.py` | `backend/app/services/quiz.py` | Reuse logic |
| `utils/schema_loader.py` | `backend/app/services/schema.py` | Reuse logic |
| `schema/*.json` | `backend/app/schemas/` | Copy files |

---

## Environment Variables

### Backend (Render)
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-anon-key
GROQ_API_KEY=your-groq-key
ENVIRONMENT=production
```

### Frontend (Netlify)
```
VITE_API_URL=https://mathcoach-api.onrender.com
```

---

## Progress Log

### 2026-05-30
- Created MIGRATION_PLAN.md
- Completed Phase 1: Backend Setup
  - Created backend/ folder structure
  - FastAPI app with CORS, health checks
  - Pydantic models for Question, Quiz, Coaching
  - Routers: /api/questions, /api/quiz, /api/coaching
  - Services: coaching.py (Groq AI), quiz.py (scoring)
  - Render deployment config
- **Next:** Phase 2 (test backend locally) or Phase 3 (Frontend setup)

