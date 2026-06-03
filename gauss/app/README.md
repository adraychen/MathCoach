# Gauss AI Coach MVP

A production-oriented React/Vite + Supabase app for Grade 7 Waterloo Gauss practice. The current MVP focuses on helping students practise a CEMC Problem Set Generator paper, submit answers, save progress, and receive coaching only when mapped source-solution content is available.

This document reflects the project status up to the current build stage.

## Current Product Direction

The app no longer generates questions. Instead, it uses Waterloo/CEMC Problem Set Generator question papers and solution metadata as the practice source.

Current MVP principle:

> Display the original PDF question paper. Use the app for answer submission, progress tracking, coaching, and teacher/admin analytics.

This means students see the original Waterloo-style paper while the app handles checking, session state, and coaching availability.

## Current MVP Status

Completed so far:

- `G7gauss1` practice set inserted into Supabase.
- 25 practice questions inserted with source-year mapping.
- 25 PSG solution records inserted.
- Frontend can display the scrollable question PDF.
- Compact answer card works.
- Students can answer A/B/C/D/E.
- Correct answers auto-advance.
- Wrong answers stay on the same question and show a cross on the selected wrong letter.
- Wrong answers do not reveal the correct answer.
- Skip and Flag auto-advance.
- Coaching panel opens from the lightbulb icon or wrong answer.
- Coaching availability is controlled by `gauss_solutions.coaching_available`.
- Student practice sessions and attempts are saved to Supabase.
- Admin account was bootstrapped.
- Admin portal is accessible.
- Admin can create teacher accounts.
- Admin can create student accounts and assign them to a teacher.
- Students can log in and access the practice paper.
- `profiles` and `student_teacher_assignments` tables are created for role-based access.
- `gauss_source_questions` is used as the source-question / detailed-solution table.

## Roles and Access Model

No one can self-sign up.

### Admin

Admin can:

- Create teacher accounts.
- Create student accounts.
- Assign students to any teacher.
- Reassign students later.
- View all teachers.
- View all students.
- View student profiles and statistics.
- Reset accounts according to the password rules.

### Teacher

Teacher can:

- Create student accounts.
- Assign students only to themselves.
- View only their assigned students.
- View their students' profiles and statistics.
- Reset passwords only for students who have a real email login.

Teacher cannot reset passwords for username/internal-email students. Those resets are admin-only.

### Student

Student can:

- Log in using either real email or username.
- Access their assigned Gauss level/practice content.
- Practise questions.
- Save progress and attempts.

## Login and Password Model

Students may be created with either:

| Login type | Student sees | Internal auth identifier | Password reset |
|---|---|---|---|
| Email | Email + password | Real email | Supabase email reset or admin/teacher action |
| Username | Username + password | `username@student.gauss.local` | Admin reset only |

Forgot-password behavior:

- If the login identifier looks like an email, use Supabase password reset email.
- If the login identifier is a username/name, show a message telling the student to contact the teacher or administrator.
- Do not reveal whether an account exists.

## Practice Screen Layout

The current student practice screen uses a full PDF viewer instead of cropped question images.

```text
+--------------------------------------------------+--------------------+
|                                                  |                    |
|              Scrollable PDF Viewer               |  Coaching Panel    |
|              G7gauss1-question.pdf               |  shorter right     |
|                                                  |  side panel        |
+--------------------------------------------------+                    |
| Q7 / 25        A  B  C  D  E        Skip  Flag   |                    |
+--------------------------------------------------+--------------------+
```

### Answer Card Behavior

Preferred compact layout:

```text
Q7 / 25        A  B  C  D  E        Skip   Flag
```

| Action | Behavior |
|---|---|
| Correct answer | Save attempt and auto-advance to next question |
| Wrong answer | Stay on same question, show cross on selected wrong letter, open coaching panel |
| Skip | Save skipped status and auto-advance |
| Flag | Save flagged status and auto-advance |
| Previous / Next | Navigate without submitting |

Wrong answers must not reveal the correct answer.

## Coaching Rules

The app identifies coaching availability from:

```text
gauss_solutions.coaching_available
```

The relationship is:

```text
gauss_questions.id → gauss_solutions.question_id
```

If `coaching_available = true`, the coaching panel can show:

- `hint_1`
- `hint_2`
- `guided_steps`
- `detailed_solution_text`
- `psg_solution_text`

If `coaching_available = false`, show:

```text
Coaching is not available for this question yet.
```

The current strategy is to enable coaching for practice questions whose source question exists in `gauss_source_questions`, especially for source years 2016–2025.

## Source Question Mapping

Each practice question stores original Waterloo source information:

```text
source_year
source_grade
source_question_number
```

Example:

```text
G7gauss1 practice Q11
→ source_year = 2022
→ source_grade = 7
→ source_question_number = 11
```

The detailed/source-solution table is:

```text
gauss_source_questions
```

Matching keys:

```text
gauss_questions.source_year = gauss_source_questions.year
gauss_questions.source_grade = gauss_source_questions.grade
gauss_questions.source_question_number = gauss_source_questions.question_number
```

The first coaching test was Q11, mapped to `waterloo_gauss_g7_2022_q11`.

## Database Tables

### Practice content

| Table | Purpose |
|---|---|
| `gauss_practice_sets` | Practice set metadata, including set code and PDF filename |
| `gauss_questions` | Question metadata, source mapping, topics, correct answer |
| `gauss_solutions` | PSG solution, detailed solution, coaching fields, coaching availability |
| `gauss_source_questions` | Source Waterloo/CEMC questions and official solutions |

### Student progress

| Table | Purpose |
|---|---|
| `gauss_practice_sessions` | One student's session for one practice set |
| `gauss_attempts` | Student answer, status, wrong answers, skip/flag state, timing |

### Roles and accounts

| Table | Purpose |
|---|---|
| `profiles` | Role, display name, login type, active status, approval status |
| `student_teacher_assignments` | Active student-to-teacher assignment |

## Important Fields

### `gauss_questions`

Still important:

- `practice_set_id`
- `practice_question_number`
- `source_year`
- `source_grade`
- `source_question_number`
- `primary_topics`
- `secondary_topics`
- `correct_answer`
- `short_problem_summary`
- `difficulty_band`

Deprecated for current MVP display method, but kept for possible future cropped-question mode:

- `question_image_url`
- `question_pdf_page`
- `crop_x`
- `crop_y`
- `crop_width`
- `crop_height`

### `gauss_solutions`

Key coaching fields:

- `coaching_available`
- `detailed_solution_status`
- `detailed_solution_text`
- `key_strategy`
- `hint_1`
- `hint_2`
- `guided_steps`
- `common_mistake`
- `reflection_question`
- `psg_solution_text`

### `gauss_attempts`

Progress and analytics fields:

- `session_id`
- `user_id`
- `question_id`
- `selected_answer`
- `is_correct`
- `status`
- `wrong_answers`
- `flagged`
- `skipped`
- `time_spent_seconds`
- `attempted_at`

## Topic Performance Tracking

Student performance should be calculated by joining:

```text
gauss_attempts
→ gauss_questions
→ primary_topics / secondary_topics
```

This supports future analytics by:

- Primary topic
- Secondary topic
- Accuracy
- Wrong count
- Skipped count
- Flagged count
- Time spent

Do not duplicate topic fields into attempts unless needed later for denormalized reporting.

## Environment Variables

### Frontend variables

Stored in Netlify and local `.env`:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

These are public-safe frontend variables.

### Backend Netlify Function variables

Stored only in Netlify environment variables:

```text
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Never prefix the service role key with `VITE_` and never expose it to browser code.

## Netlify Functions

Backend functions are used for secure account-management actions.

Current or planned functions:

| Function | Purpose |
|---|---|
| `create-teacher-account` | Admin creates a teacher account |
| `create-student-account` | Admin creates a student and assigns a teacher |
| `reset-user-password` | Admin/teacher password reset logic, with role restrictions |
| `reassign-student-teacher` | Admin reassigns a student to another teacher |

A separate Render backend is not needed for the current MVP. Netlify Functions are enough for account creation, password reset, assignment, and future lightweight coaching endpoints.

## Current Project Structure

Approximate current structure:

```text
guass/
├── app/
│   ├── netlify/
│   │   └── functions/
│   │       ├── create-teacher-account.js
│   │       └── create-student-account.js
│   ├── public/
│   │   └── pdfs/
│   │       └── G7gauss1-question.pdf
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnswerCard.tsx
│   │   │   ├── CoachingPanel.tsx
│   │   │   ├── PDFViewer.tsx
│   │   │   └── PracticeScreen.tsx
│   │   ├── pages/
│   │   │   ├── AdminPortal.jsx
│   │   │   ├── TeacherPortal.jsx
│   │   │   └── StudentPracticePortal.jsx
│   │   ├── lib/
│   │   │   └── supabase.ts
│   │   ├── types/
│   │   │   └── database.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── extracted-data/
│   ├── G7gauss1-psg-metadata-raw.md
│   └── G7gauss1-psg-metadata.json
├── source-pdfs/
│   ├── G7gauss1-question.pdf
│   └── G7gauss1-solution.pdf
└── sql/
    ├── 001_create_gauss_mvp_schema.sql
    ├── 002_seed_G7gauss1_metadata.sql
    ├── 004_create_gauss_practice_sessions.sql
    ├── 005_create_profiles_and_assignments.sql
    └── 008_enable_coaching_for_2016_2025_sources.sql
```

## Data Import Workflow

For new practice sets:

1. Download or create the CEMC Problem Set Generator question PDF and solution PDF.
2. Name files consistently, for example:

```text
G7gauss2-question.pdf
G7gauss2-solution.pdf
G7gauss2-psg-metadata-raw.md
G7gauss2-psg-metadata.json
```

3. Use NotebookLM to extract metadata from the PSG solution PDF.
4. ChatGPT reviews NotebookLM output before Claude Code creates JSON.
5. Claude Code converts reviewed metadata to JSON/SQL.
6. Insert practice set, questions, and PSG solutions into Supabase.
7. Match source questions by year/grade/question number against `gauss_source_questions`.
8. Enable coaching only where source solution content exists.

## Tech Stack

- React
- Vite
- TypeScript / JavaScript mixed frontend components
- Tailwind CSS
- React PDF or PDF viewer component
- lucide-react icons
- Supabase Auth
- Supabase PostgreSQL
- Supabase Row Level Security later
- Netlify hosting
- Netlify Functions for secure admin actions

## Next Planned Steps

Likely next work items:

1. Complete bulk coaching update for 2016–2025 questions using `gauss_source_questions`.
2. Verify the coaching panel correctly displays available coaching only for enabled questions.
3. Improve coaching fields beyond generic hints.
4. Add teacher portal student statistics.
5. Add admin portal teacher/student list and statistics.
6. Add RLS policies for production security.
7. Add password reset backend function with role rules.
8. Add topic-performance views for primary and secondary topics.

## Notes and Decisions

- The root folder name is intentionally `guass`.
- The app currently uses full PDF display, not cropped individual question images.
- `question_image_url` and crop fields are kept but not used in the MVP display.
- Correct answers should not be revealed after a wrong answer.
- Coaching should only appear when `gauss_solutions.coaching_available = true`.
- Teachers cannot reset username/internal-email student passwords.
- Students must always be assigned to a teacher when created.
