# Gauss AI Coach MVP

A production-oriented React/Vite + Supabase app for Grade 7 Waterloo Gauss practice. The MVP uses Waterloo/CEMC Problem Set Generator practice papers as the student-facing question source, while the app handles answer submission, session state, role-based access, progress tracking, and interactive Socratic coaching when mapped source-solution content is available.

This document reflects the project status up to the current build stage.

## Current Product Direction

The app does **not** generate questions for the MVP. Instead, it uses CEMC Problem Set Generator question papers and solution metadata.

Current MVP principle:

> Display the original PDF question paper. Use the app for answer submission, progress tracking, interactive coaching, and teacher/admin analytics.

This keeps the Waterloo-style experience familiar for students while avoiding the complexity of generating new contest-style questions.

## Current MVP Status

Completed so far:

- `G7gauss1` practice set inserted into Supabase.
- 25 practice questions inserted with source-year/source-question mapping.
- 25 PSG solution records inserted.
- Frontend displays the scrollable PDF question paper.
- Compact answer card works.
- Students can answer A/B/C/D/E.
- Correct answers auto-advance.
- Wrong answers stay on the same question and show a cross on the selected wrong letter.
- Wrong answers do **not** reveal the correct answer.
- Skip and Flag auto-advance.
- Student practice sessions and attempts are saved to Supabase.
- Admin account was bootstrapped.
- Admin portal is accessible.
- Admin can create teacher accounts.
- Admin can create student accounts and assign them to a teacher.
- Students can log in and access the practice paper.
- `profiles` and `student_teacher_assignments` tables are created for role-based access.
- `gauss_source_questions` is used as the source-question / official-solution table.
- `gauss_solutions` was cleaned so coaching uses `coaching_available`, `coaching_mode`, and `coaching_source_id` instead of duplicated hint/detail fields.
- Stuck coaching is now implemented as interactive Socratic coaching using a Netlify Function.
- Coaching panel supports chat-style student input and follow-up responses.
- Socratic coaching does not show the full solution inside the coaching panel.
- Follow-up coaching uses the LLM to decide whether the student has reached the correct final answer, is partially correct, has concept confusion, or is off track.

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
- Use coaching only when coaching is available for the question.

## Login and Password Model

Students may be created with either real email or username login.

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

## Coaching Design

The app identifies coaching availability from:

```text
gauss_solutions.coaching_available
```

The relationship is:

```text
gauss_questions.id → gauss_solutions.question_id
```

For interactive coaching, the app uses:

```text
gauss_solutions.coaching_source_id → gauss_source_questions.id
```

If `coaching_available = false`, `coaching_mode = 'none'`, or `coaching_source_id` is null, show:

```text
Coaching is not available for this question yet.
```

### Current Coaching Scope

The current coaching focus is **stuck coaching**:

> The student clicks the lightbulb icon before submitting an answer because they do not know how to start.

The coaching panel starts a chat-style Socratic conversation. The coach asks one guiding question at a time and the student responds in an input box.

Current implemented triggers:

| Trigger | Meaning | Status |
|---|---|---|
| `stuck` | Student asks for coaching before answering | Implemented |
| `followup` | Student replies inside the coaching chat | Implemented |
| `wrong_answer` | Student submits an incorrect A/B/C/D/E choice | Planned later |

For now:

```text
stuck → followup → followup → followup
```

Later, wrong-answer coaching may use:

```text
wrong_answer → followup → followup → followup
```

### Socratic Coaching Rules

The coaching behavior is based on the old MathCoach Socratic coaching service. The current rules are:

- Maximum 2 short sentences.
- Ask only one guiding question at a time.
- Do not reveal the final answer.
- Do not give the next calculation directly.
- Do not confirm intermediate answers too early.
- Prefer another guiding question instead of validation.
- Reveal as little information as possible.
- Let the student infer the next step.
- Focus only on the current thinking step.
- Do not combine multiple reasoning steps.
- Do not solve the problem for the student.
- Keep productive struggle.

### Concept Repair Rule

A pure Socratic question is sometimes not enough when the student does not understand a prerequisite concept. The coach now supports **concept repair**:

> If the student's response shows confusion about a key word, concept, or prerequisite skill, give one short Grade 7-friendly clarification, then ask exactly one guiding question.

Example:

```text
Student: 1 and 42
Coach: A prime factor must be both a factor and a prime number. Is 42 prime?
```

The clarification must not reveal the final answer or perform the next calculation.

### Partial Progress Rule

When the student is close but incomplete, the coach should not restart with a broad strategy question. It should ask a narrow gap-finding question.

Example:

```text
Student: 3 and 7
Coach: 3 × 7 gives 21. What factor is still needed to make 42?
```

This helps the student locate the missing piece without directly giving it away.

### Final Answer Confirmation

Socratic coaching should not show the full solution, but it should confirm when the student reaches the correct final answer or correct final reasoning.

The backend now uses the LLM during follow-up to classify the student response as:

- `FINAL_CORRECT`
- `PARTIAL_CORRECT`
- `CONCEPT_CONFUSION`
- `OFF_TRACK`

If the student gives the correct final answer in text or number form, the coach should briefly confirm and summarize the key reasoning.

Example:

```text
Student: I think it is twelve.
Coach: Yes, that answers the question. You found the prime factors and added them.
```

The coach should not continue asking another guiding question after the final answer has clearly been reached.

### Full Solution Policy

The Socratic coach does **not** show the full official solution inside the coaching chat.

Removed from the current coaching flow:

- `show_full_solution`
- `can_show_solution`
- “Show full solution” button

A separate review-solution feature may be added later after a question or practice session is completed, but it should be separate from the Socratic coaching panel.

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

The source-question table is:

```text
gauss_source_questions
```

Matching keys:

```text
gauss_questions.source_year = gauss_source_questions.year
gauss_questions.source_grade = gauss_source_questions.grade
gauss_questions.source_question_number = gauss_source_questions.question_number
```

The first coaching test was Q11, mapped to:

```text
waterloo_gauss_g7_2022_q11
```

## Database Tables

### Practice content

| Table | Purpose |
|---|---|
| `gauss_practice_sets` | Practice set metadata, including set code and PDF filename |
| `gauss_questions` | Practice-set question metadata, source mapping, topics, correct answer |
| `gauss_solutions` | PSG solution plus coaching availability/link for each practice question |
| `gauss_source_questions` | Source Waterloo/CEMC questions, official answers, official solutions, reasoning metadata |

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

### Database views

| View | Purpose |
|---|---|
| `gauss_student_primary_topic_performance` | Aggregated student performance by primary topic (unnested from topic arrays) |
| `gauss_student_secondary_topic_performance` | Aggregated student performance by secondary topic (unnested from topic arrays) |

These views join `gauss_practice_sessions` → `gauss_attempts` → `gauss_questions` → `gauss_practice_sets` and unnest the topic arrays so each question contributes to each of its topics separately. Useful for identifying weak topics and generating progress reports.

## Important Fields

### `gauss_practice_sets`

Practice set fields:

- `id`
- `set_code` (unique identifier like G7gauss1)
- `title`
- `grade`
- `source_type`
- `question_pdf_filename`
- `solution_pdf_filename`
- `description`
- `created_at`

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

Current cleaned fields:

- `id`
- `question_id`
- `psg_solution_text`
- `psg_solution_summary`
- `psg_solution_image_url`
- `coaching_available`
- `coaching_source_id`
- `coaching_mode`
- `created_at`
- `updated_at`

Removed/deprecated duplicate coaching fields:

- `hint_1`
- `hint_2`
- `guided_steps`
- `key_strategy`
- `common_mistake`
- `reflection_question`
- `detailed_solution_text`
- `detailed_solution_json`
- `detailed_solution_image_url`
- `detailed_solution_source_pdf`
- `detailed_solution_page`
- `detailed_solution_status`

### `gauss_source_questions`

Useful source/coaching fields:

- `id`
- `year`
- `program_name`
- `grade`
- `question_number`
- `question_text`
- `options`
- `correct_answer`
- `official_solution`
- `reasoning_summary`
- `solution_pattern`
- `primary_topic`
- `secondary_topic`
- `archetype`
- `blueprint_code`
- `visual_required`
- `visual_description`

Current coaching uses:

- `question_text`
- `options`
- `official_solution`
- `reasoning_summary`
- `solution_pattern`
- `archetype` as optional reasoning-style context
- `visual_description` when relevant

Current coaching does **not** depend on blueprint because not all blueprints have been validated.

### `gauss_practice_sessions`

Session tracking fields:

- `id`
- `user_id`
- `practice_set_id`
- `status` (in_progress, completed, abandoned)
- `current_question_number`
- `total_questions`
- `correct_count`
- `wrong_count`
- `skipped_count`
- `flagged_count`
- `started_at`
- `completed_at`
- `updated_at`

### `gauss_attempts`

Progress and analytics fields:

- `id`
- `session_id`
- `user_id`
- `question_id`
- `selected_answer`
- `is_correct`
- `status` (unanswered, correct, wrong, skipped, flagged)
- `wrong_answers`
- `flagged`
- `skipped`
- `time_spent_seconds`
- `used_hint`
- `used_guided_solution`
- `viewed_psg_solution`
- `viewed_detailed_solution`
- `attempted_at`

### `profiles`

Account fields:

- `id` (references auth.users)
- `role` (admin, teacher, student)
- `display_name`
- `username` (for username login students)
- `email`
- `login_type` (email, username)
- `active`
- `approval_status` (approved, disabled)
- `must_change_password`
- `created_by`
- `created_at`
- `updated_at`

### `student_teacher_assignments`

Assignment tracking fields:

- `id`
- `student_id`
- `teacher_id`
- `assigned_by`
- `active`
- `assigned_at`
- `ended_at`

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
GROQ_API_KEY=
```

Never prefix the service role key or Groq key with `VITE_` and never expose either key to browser code.

## Netlify Functions

Backend functions are used for secure account-management and coaching actions.

Current or planned functions:

| Function | Purpose |
|---|---|
| `create-teacher-account` | Admin creates a teacher account |
| `create-student-account` | Admin creates a student and assigns a teacher |
| `socratic-coach` | Interactive stuck/follow-up Socratic coaching |
| `reset-user-password` | Admin/teacher password reset logic, with role restrictions |
| `reassign-student-teacher` | Admin reassigns a student to another teacher |

A separate Render backend is not needed for the current MVP. Netlify Functions are enough for account creation, password reset, assignment, and lightweight coaching endpoints.

## Current Project Structure

Approximate current structure:

```text
guass/
├── app/
│   ├── netlify/
│   │   └── functions/
│   │       ├── create-teacher-account.js
│   │       ├── create-student-account.js
│   │       └── socratic-coach.js
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
    ├── 008_enable_coaching_for_2016_2025_sources.sql
    └── 009_clean_gauss_solutions_schema.sql
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
8. Populate `gauss_solutions.coaching_source_id` from the matching `gauss_source_questions.id`.
9. Enable coaching only where source solution content exists.

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
- Netlify Functions for secure admin and coaching actions
- Groq / Llama 3.3 70B for Socratic coaching

## Next Planned Steps

Likely next work items:

1. Continue testing stuck coaching across multiple question types, especially Q8, Q11, Q15, Q16, Q18, and Q25.
2. Tune Socratic prompt behavior based on student-response examples.
3. Build wrong-answer coaching as a separate starting trigger later.
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
- Coaching should only appear when `gauss_solutions.coaching_available = true` and `coaching_source_id` is available.
- Socratic coaching does not show the full solution in the coaching panel.
- The coach may confirm when the student reaches the correct final answer or correct reasoning.
- Teachers cannot reset username/internal-email student passwords.
- Students must always be assigned to a teacher when created.
