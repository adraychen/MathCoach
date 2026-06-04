# Gauss AI Coach MVP

A production-oriented React/Vite + Supabase app for Waterloo Gauss contests. The MVP displays contest PDFs as the student-facing question source, while the app handles contest selection, answer submission, session state, role-based access, progress tracking, dashboards, and interactive Socratic coaching when enough question context is available.

This document reflects the project status up to the current build stage.

## Current Product Direction

The app does **not** generate questions for the MVP. Instead, it uses contest PDFs, extracted question metadata, solution metadata, and curated coaching plans.

Current MVP principle:

> Display the original PDF question paper. Use the app for answer submission, progress tracking, interactive coaching, and teacher/admin analytics.

This keeps the Waterloo-style experience familiar for students while avoiding the complexity of generating new contest-style questions.

The project uses **contest** language consistently instead of **practice set** language.

## Student Flow

```text
Student Login
→ Program Selection (skip if only 1 program assigned)
→ Program Dashboard
   1. View Progress / Stats
   2. Start Contest / Continue Contest / Select Contest
→ Contest Screen
   PDF Viewer + Answer Card + Coaching Panel
```

Current programs are stored in `mathcoach_programs`:

```text
G7gauss - Grade 7 Gauss Contest
G8gauss - Grade 8 Gauss Contest
```

Program assignment:

- Admin assigns programs to students through `student_program_assignments`.
- Students see only their assigned programs.
- If one program is assigned, the app can auto-select it and go to the dashboard.
- If no program is assigned, show a “No programs assigned” message.

Current contests:

```text
Grade 7 Contest 1
Description: Random Year Contest

Grade 7 Contest 2025
Description: 2025 Contest
```

## Current MVP Status

Completed so far:

- `G7gauss1` contest inserted into Supabase.
- `Grade 7 Contest 2025` added and mapped with 25 rows in `gauss_questions`.
- Contest 2025 loads through `gauss_questions` mapping rows and source question context from `gauss_source_questions`.
- 25 contest questions for Contest 1 inserted with source-year/source-question mapping.
- PSG solution records inserted for contest questions where available.
- Frontend displays the scrollable PDF question paper.
- Compact answer card works.
- Students can answer A/B/C/D/E.
- Correct answers auto-advance.
- Wrong answers stay on the same question and show a cross on the selected wrong letter.
- Wrong answers do **not** reveal the correct answer.
- Skip and Flag auto-advance.
- Student contest sessions and attempts are saved to Supabase.
- Admin account was bootstrapped.
- Admin portal is accessible.
- Admin can create teacher accounts.
- Admin can create student accounts and assign them to a teacher.
- Students can log in and access assigned contest content.
- `profiles` and `student_teacher_assignments` tables are created for role-based access.
- `gauss_source_questions` is used as the source-question / official-solution table.
- `gauss_solutions` stores PSG solution text. It does not control answer checking.
- Stuck coaching is implemented as interactive Socratic coaching using a Netlify Function.
- Coaching panel supports chat-style student input and follow-up responses.
- Socratic coaching does not show the full solution inside the coaching panel.
- Follow-up coaching uses the LLM to classify whether the student has reached the final answer, is partially correct, has concept confusion, or is off track.
- The current coaching prompt was updated so `FINAL_CORRECT` should confirm the answer and remind the student to submit it on the answer card.

## Roles and Access Model

No one can self-sign up.

### Admin

Admin can:

- Create teacher accounts.
- Create student accounts.
- Assign students to any teacher.
- Assign programs to students.
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
- Access assigned Gauss contest content.
- Work through contest questions.
- Save progress and attempts.
- Use coaching when enough question context is available.

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

## Contest Screen Layout

The current student contest screen uses a full PDF viewer instead of cropped question images.

```text
+--------------------------------------------------+--------------------+
|                                                  | [<] User  Sign out |
|              Scrollable PDF Viewer               +--------------------+
|              (contest PDF)                       |                    |
|                                                  |  Coaching Panel    |
|                                                  |                    |
+--------------------------------------------------+                    |
| Q7 / 25        A  B  C  D  E        Skip  Flag   |                    |
+--------------------------------------------------+--------------------+
                                                   | 5/25 answered      |
                                                   | 2 skipped 1 flagged|
                                                   +--------------------+
```

Layout notes:

- Header and back button are in the right panel only.
- Back button appears left of user name when navigating from dashboard.
- Progress indicator is at the bottom of the right panel.
- PDF viewer fills the maximum available height on the left.
- Answer card is fixed at the bottom of the left panel.

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

## Single-Source Data Architecture

The project follows a single-source design:

> Store each value in one authoritative place whenever possible. The app resolves the best available value at runtime using priority rules.

### Source-backed questions

For questions that exist in `gauss_source_questions`, such as 2016–2025 Waterloo source questions:

```text
gauss_source_questions
→ question_text
→ options
→ official_solution
→ reasoning metadata
→ archetype
→ visual metadata
```

`gauss_questions` should not duplicate `question_text` or `options` for these questions. It stores contest placement and mapping.

### Contest-only questions

For pre-2016 or contest-only questions that do not have a matching source record:

```text
gauss_questions
→ question_text
→ options
→ correct_answer
```

This still follows the single-source rule because the question text and options live only in `gauss_questions` for those questions.

## Question Context Resolution

The app should use a question context resolver to build one normalized question object for display, answer checking, analytics, and coaching.

Priority rules:

```text
question_text:
1. gauss_source_questions.question_text
2. gauss_questions.question_text

options:
1. gauss_source_questions.options
2. gauss_questions.options

correct_answer:
1. gauss_questions.correct_answer
2. gauss_source_questions.correct_answer

official_solution:
1. gauss_source_questions.official_solution

fallback/review solution:
1. gauss_solutions.psg_solution_text

coaching_plan:
1. gauss_coaching_plans
```

Important notes:

- `correct_answer` exists in both `gauss_questions` and `gauss_source_questions` for some data, but the app should treat `gauss_questions.correct_answer` as the primary contest answer.
- `gauss_source_questions.official_solution` remains the authoritative detailed solution when available.
- `gauss_solutions.psg_solution_text` is review/fallback support, not the primary detailed source solution.

## Coaching Design

Current coaching availability is determined by checking whether a matching source question exists in `gauss_source_questions` with an `official_solution`.

The source mapping uses:

```text
gauss_questions.source_year = gauss_source_questions.year
gauss_questions.source_grade = gauss_source_questions.grade
gauss_questions.source_question_number = gauss_source_questions.question_number
```

Current coaching is available when:

1. The contest question has `source_year`, `source_grade`, and `source_question_number` set.
2. A matching record exists in `gauss_source_questions`.
3. That source question has `official_solution` not null.

If these conditions fail, show:

```text
Coaching is not available for this question yet.
```

Future fallback coaching may support questions with `gauss_questions.question_text`, `gauss_questions.options`, `gauss_solutions.psg_solution_text`, and `gauss_coaching_plans`, but that fallback mode should be validated separately before enabling.

### Coaching Data Hierarchy

The coach uses one validated Socratic prompt and changes only the context block based on available data.

Current primary coaching context:

```text
gauss_questions
→ contest question number
→ correct answer
→ source mapping
→ topics / difficulty

gauss_source_questions
→ question text
→ options
→ official solution
→ reasoning summary
→ solution pattern
→ archetype
→ visual description

gauss_coaching_plans
→ first step prompt
→ expected reasoning steps
→ key concepts
→ common misconceptions
→ adaptive guidance rules
```

The coach should use database context as the authority when deciding whether a student’s response is `FINAL_CORRECT`.

### Coaching Plans

When a coaching plan exists in `gauss_coaching_plans` for the source question, the coach uses it to provide more targeted guidance:

- `first_step_prompt` guides the initial stuck-coaching response.
- `expected_reasoning_steps` informs the coach about the solution path, but should not be forced in order.
- `key_concepts` and `common_misconceptions` help the coach recognize student errors.
- `adaptive_guidance_rules` provide question-specific coaching behavior.

The coaching plan is a guide, not a fixed hint sequence. The coach adapts to the student's responses.

### Current Coaching Scope

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

A pure Socratic question is sometimes not enough when the student does not understand a prerequisite concept. The coach supports concept repair:

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

### Incorrect Intermediate Step Rule

If the student states an intermediate fact that conflicts with the official solution or known mathematical facts, the coach should not continue reasoning from that incorrect statement.

The coach should briefly repair the misunderstanding and ask one small guiding question.

Example:

```text
Student: June 28 is Tuesday
Coach: Check the 7-day pattern again. June 1, 8, 15, 22, and 29 are Tuesdays. What day comes after Tuesday?
```

### Final Answer Confirmation

Socratic coaching should not show the full solution, but it should confirm when the student reaches the correct final answer or correct final reasoning.

The backend uses the LLM during follow-up to classify the student response as:

- `FINAL_CORRECT`
- `PARTIAL_CORRECT`
- `CONCEPT_CONFUSION`
- `OFF_TRACK`
- `ASKED_FOR_SOLUTION`

When deciding whether the student is `FINAL_CORRECT`, the LLM should compare the student response with the private correct answer, correct option text, official solution, and coaching plan. It should not rely only on conversation history.

If `FINAL_CORRECT`, the coach should:

- Briefly confirm that the answer is correct.
- Tell the student to select and submit the answer on the answer card.
- Not ask another coaching question.

Example:

```text
Student: Wednesday
Coach: That's correct. Please select and submit your answer on the answer card.
```

### Full Solution Policy

The Socratic coach does **not** show the full official solution inside the coaching chat.

Removed from the current coaching flow:

- `show_full_solution`
- `can_show_solution`
- “Show full solution” button

A separate review-solution feature may be added later after a question or contest session is completed, but it should be separate from the Socratic coaching panel.

## Source Question Mapping

Each source-backed contest question stores original Waterloo source information:

```text
source_year
source_grade
source_question_number
```

Example:

```text
G7gauss1 contest Q11
→ source_year = 2022
→ source_grade = 7
→ source_question_number = 11
```

The matching keys are:

```text
gauss_questions.source_year = gauss_source_questions.year
gauss_questions.source_grade = gauss_source_questions.grade
gauss_questions.source_question_number = gauss_source_questions.question_number
```

For pre-2016 or contest-only questions, a matching source record may not exist. In that case, `gauss_questions.question_text` and `gauss_questions.options` provide the question context directly.

## Database Tables

### Programs and assignments

| Table | Purpose |
|---|---|
| `mathcoach_programs` | Available programs, such as `G7gauss` and `G8gauss` |
| `student_program_assignments` | Which students have access to which programs |

### Contest content

| Table | Purpose |
|---|---|
| `gauss_contests` | Contest metadata, including contest code, title, description, PDF filename, visibility, and display order |
| `gauss_questions` | Contest question placement, source mapping, topics, correct answer, and fallback question context when no source record exists |
| `gauss_solutions` | PSG solution text for each contest question |
| `gauss_source_questions` | Source Waterloo/CEMC questions, official solutions, reasoning metadata, and visual metadata |
| `gauss_coaching_plans` | Adaptive coaching plans keyed by source question ID |

### Student progress

| Table | Purpose |
|---|---|
| `gauss_contest_sessions` | One student's session for one contest |
| `gauss_attempts` | Student answer, status, wrong answers, skip/flag state, and timing |

### Roles and accounts

| Table | Purpose |
|---|---|
| `profiles` | Role, display name, login type, active status, approval status |
| `student_teacher_assignments` | Active student-to-teacher assignment |

### Database views

| View | Purpose |
|---|---|
| `gauss_student_primary_topic_performance` | Aggregated student performance by primary topic |
| `gauss_student_secondary_topic_performance` | Aggregated student performance by secondary topic |

These views join `gauss_contest_sessions` → `gauss_attempts` → `gauss_questions` → `gauss_contests` and unnest topic arrays so each question contributes to each of its topics separately.

## Important Fields

### `gauss_contests`

Contest fields:

- `id`
- `contest_code` (unique internal identifier such as `G7gauss1` or `G7gauss2025`)
- `title` (student-facing contest name)
- `description` (student-facing subtitle, such as `Random Year Contest` or `2025 Contest`)
- `grade`
- `question_pdf_filename`
- `solution_pdf_filename`
- `active` (`true` means visible to students; `false` means hidden but kept in the database)
- `display_order`
- `created_at`
- `updated_at`

Removed / not needed:

- `source_type`
- `year`

### `gauss_questions`

Important fields:

- `id`
- `contest_id`
- `contest_question_number`
- `source_year`
- `source_grade`
- `source_question_number`
- `primary_topics`
- `secondary_topics`
- `correct_answer`
- `short_problem_summary`
- `difficulty_band`
- `question_text` (fallback only when no source record exists)
- `options` (fallback only when no source record exists)
- `created_at`
- `updated_at`

Source-backed questions should normally have `source_year`, `source_grade`, and `source_question_number` populated.

Pre-2016 or contest-only questions may have `source_year`, `source_grade`, and `source_question_number` as null. In that case, `question_text` and `options` should be populated directly in `gauss_questions`.

Deprecated for current MVP display method, but kept for possible future cropped-question mode:

- `question_image_url`
- `question_pdf_page`
- `crop_x`
- `crop_y`
- `crop_width`
- `crop_height`

### `gauss_solutions`

Stores PSG solution content for contest questions.

This table does **not** control the correct answer. Correct answer checking uses `gauss_questions.correct_answer` first.

Current fields:

- `id`
- `question_id`
- `psg_solution_text`
- `psg_solution_summary`
- `psg_solution_image_url`
- `created_at`
- `updated_at`

Current / planned usage:

- Review solution text after a question or contest.
- Fallback coaching support in future when no detailed official source solution exists.
- Not the primary coaching source when `gauss_source_questions.official_solution` is available.

Removed fields:

- `coaching_available`
- `coaching_source_id`
- `coaching_mode`
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

Source-of-truth table for Waterloo/CEMC source questions when available.

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
- `visual_type`
- `visual_description`
- `confidence`
- `is_validated`
- `notes`
- `created_at`
- `updated_at`

Current coaching uses:

- `question_text`
- `options`
- `official_solution`
- `reasoning_summary`
- `solution_pattern`
- `archetype` as optional reasoning-style context
- `visual_description` when relevant

Current coaching does **not** depend on blueprint because not all blueprints have been validated.

### `gauss_coaching_plans`

Adaptive coaching plan fields keyed by `source_question_id`:

- `id`
- `source_question_id`
- `first_step_prompt`
- `coaching_goal`
- `expected_reasoning_steps`
- `key_concepts`
- `common_misconceptions`
- `adaptive_guidance_rules`
- `coaching_notes`
- `review_status`
- `created_at`
- `updated_at`

The coaching plan enhances but does not replace the base coaching logic. It guides the coach but does not force a fixed hint sequence.

### `gauss_contest_sessions`

Session tracking fields:

- `id`
- `user_id`
- `contest_id`
- `status` (`in_progress`, `completed`, `abandoned`)
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
- `status` (`unanswered`, `correct`, `wrong`, `skipped`, `flagged`)
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
- `role` (`admin`, `teacher`, `student`)
- `display_name`
- `username` (for username login students)
- `email`
- `login_type` (`email`, `username`)
- `active`
- `approval_status` (`approved`, `disabled`)
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

This supports analytics by:

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
│   │       ├── lib/
│   │       │   └── questionContextResolver.js
│   │       └── socratic-coach.js
│   ├── public/
│   │   └── questions/
│   │       ├── G7gauss1-question.pdf
│   │       └── G7gauss2025-question.pdf
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
├── source-pdfs/
└── sql/
```

## Data Import Workflow: Adding a New Contest

This is the standard process Ray should follow when adding more contests.

### Overview

There are two possible import paths:

1. **Source-backed contest**: the questions exist in `gauss_source_questions`, usually 2016–2025 source questions.
2. **Contest-only contest**: the questions do not exist in `gauss_source_questions`, especially pre-2016 questions.

The app can support both, but the database should avoid duplicating the same values across tables.

### Step 1: Prepare files

Place the PDFs in the project with consistent names.

Recommended naming:

```text
app/public/questions/G7gauss2024-question.pdf
source-pdfs/G7gauss2024-question.pdf
source-pdfs/G7gauss2024-solution.pdf
```

For official historical contests:

```text
G7gauss2025-question.pdf
G7gauss2025-solution.pdf
G7gauss2024-question.pdf
G7gauss2024-solution.pdf
```

For random-year or custom contests:

```text
G7gauss2-question.pdf
G7gauss2-solution.pdf
```

The file in `app/public/questions/` is used by the app. The files in `source-pdfs/` are source/reference files for extraction and review.

### Step 2: Upload the question paper and solution paper to ChatGPT

Upload both:

```text
question PDF
solution PDF
```

Ask ChatGPT to:

1. Extract question metadata.
2. Cross-check answers with the solution PDF.
3. Identify whether each question is source-backed or contest-only.
4. Produce reviewed data for Supabase insert.

Recommended prompt:

```text
I am adding a new Gauss contest to the Gauss AI Coach app.

Please use the uploaded question paper and solution paper to create database-ready data.

First, extract and cross-check all 25 questions.

For each question, identify:
- contest_question_number
- source_year, source_grade, source_question_number if the question is source-backed
- question_text and options only if the question does not exist in gauss_source_questions
- correct_answer
- primary_topics
- secondary_topics
- short_problem_summary
- difficulty_band
- PSG solution text or summary from the solution paper
- visual_required, visual_type, visual_description if relevant

Follow the single-source rule:
- Do not duplicate question_text/options in gauss_questions if the question exists in gauss_source_questions.
- For source-backed questions, create gauss_questions mapping rows only.
- For contest-only questions, store question_text/options in gauss_questions.

Then provide:
1. Review notes / issues found
2. SQL for gauss_contests
3. SQL for gauss_questions
4. SQL for gauss_solutions
5. Any gauss_source_questions insert SQL if needed
6. Any coaching plan recommendations if needed
```

### Step 3: Cross-check the extraction

Before inserting data, confirm:

- There are exactly 25 questions.
- Question numbers are 1–25.
- Correct answers match the official solution PDF.
- Options A–E are complete.
- Visual descriptions are clear for questions that depend on diagrams, tables, graphs, grids, or shapes.
- Source-backed questions have correct `source_year`, `source_grade`, and `source_question_number`.
- Contest-only questions have `question_text` and `options` populated in `gauss_questions`.
- No source-backed question duplicates `question_text` or `options` into `gauss_questions`.

### Step 4: Insert or upsert the contest row

Insert a row into `gauss_contests`.

Example for an official year contest:

```sql
insert into gauss_contests (
  contest_code,
  title,
  description,
  grade,
  question_pdf_filename,
  solution_pdf_filename,
  active,
  display_order
)
values (
  'G7gauss2025',
  'Grade 7 Contest 2025',
  '2025 Contest',
  7,
  'G7gauss2025-question.pdf',
  'G7gauss2025-solution.pdf',
  true,
  2
)
on conflict (contest_code) do update
set
  title = excluded.title,
  description = excluded.description,
  grade = excluded.grade,
  question_pdf_filename = excluded.question_pdf_filename,
  solution_pdf_filename = excluded.solution_pdf_filename,
  active = excluded.active,
  display_order = excluded.display_order,
  updated_at = now();
```

Example for a random-year contest:

```sql
insert into gauss_contests (
  contest_code,
  title,
  description,
  grade,
  question_pdf_filename,
  solution_pdf_filename,
  active,
  display_order
)
values (
  'G7gauss2',
  'Grade 7 Contest 2',
  'Random Year Contest',
  7,
  'G7gauss2-question.pdf',
  'G7gauss2-solution.pdf',
  true,
  3
)
on conflict (contest_code) do update
set
  title = excluded.title,
  description = excluded.description,
  grade = excluded.grade,
  question_pdf_filename = excluded.question_pdf_filename,
  solution_pdf_filename = excluded.solution_pdf_filename,
  active = excluded.active,
  display_order = excluded.display_order,
  updated_at = now();
```

### Step 5A: Insert source-backed contest mappings

Use this when all questions already exist in `gauss_source_questions`.

Example for Grade 7 Contest 2025:

```sql
insert into gauss_questions (
  contest_id,
  contest_question_number,
  source_year,
  source_grade,
  source_question_number,
  correct_answer,
  primary_topics,
  secondary_topics,
  short_problem_summary,
  difficulty_band
)
select
  c.id,
  sq.question_number,
  sq.year,
  sq.grade,
  sq.question_number,
  sq.correct_answer,
  array_remove(array[sq.primary_topic], null),
  array_remove(array[sq.secondary_topic], null),
  sq.reasoning_summary,
  case
    when sq.question_number between 1 and 10 then 'Easy'
    when sq.question_number between 11 and 20 then 'Medium'
    else 'Hard'
  end
from gauss_contests c
join gauss_source_questions sq
  on sq.year = 2025
 and sq.grade = 7
where c.contest_code = 'G7gauss2025'
on conflict (contest_id, contest_question_number) do update
set
  source_year = excluded.source_year,
  source_grade = excluded.source_grade,
  source_question_number = excluded.source_question_number,
  correct_answer = excluded.correct_answer,
  primary_topics = excluded.primary_topics,
  secondary_topics = excluded.secondary_topics,
  short_problem_summary = excluded.short_problem_summary,
  difficulty_band = excluded.difficulty_band,
  updated_at = now();
```

For a random-year contest, generate one row per contest question. Each row maps the contest question to its original source year/grade/question number.

### Step 5B: Insert contest-only questions

Use this when questions do not exist in `gauss_source_questions`, such as pre-2016 questions.

For these rows, `source_year`, `source_grade`, and `source_question_number` may be null, and `question_text` / `options` should be stored in `gauss_questions`.

Example structure:

```sql
insert into gauss_questions (
  contest_id,
  contest_question_number,
  question_text,
  options,
  correct_answer,
  primary_topics,
  secondary_topics,
  short_problem_summary,
  difficulty_band
)
values
(
  (select id from gauss_contests where contest_code = 'G7gauss2'),
  1,
  'Question text here',
  '{"A":"...","B":"...","C":"...","D":"...","E":"..."}'::jsonb,
  'B',
  array['Number Sense'],
  array['Operations'],
  'Short summary here',
  'Easy'
)
on conflict (contest_id, contest_question_number) do update
set
  question_text = excluded.question_text,
  options = excluded.options,
  correct_answer = excluded.correct_answer,
  primary_topics = excluded.primary_topics,
  secondary_topics = excluded.secondary_topics,
  short_problem_summary = excluded.short_problem_summary,
  difficulty_band = excluded.difficulty_band,
  updated_at = now();
```

### Step 6: Insert PSG solutions

Insert one `gauss_solutions` row per `gauss_questions` row when solution text is available.

Example structure:

```sql
insert into gauss_solutions (
  question_id,
  psg_solution_text,
  psg_solution_summary,
  psg_solution_image_url
)
select
  q.id,
  v.psg_solution_text,
  v.psg_solution_summary,
  null
from (
  values
  (1, 'Full or summarized solution text for Q1', 'Short solution summary for Q1'),
  (2, 'Full or summarized solution text for Q2', 'Short solution summary for Q2')
) as v(contest_question_number, psg_solution_text, psg_solution_summary)
join gauss_contests c
  on c.contest_code = 'G7gauss2'
join gauss_questions q
  on q.contest_id = c.id
 and q.contest_question_number = v.contest_question_number
on conflict (question_id) do update
set
  psg_solution_text = excluded.psg_solution_text,
  psg_solution_summary = excluded.psg_solution_summary,
  psg_solution_image_url = excluded.psg_solution_image_url,
  updated_at = now();
```

### Step 7: Insert source questions when needed

If the contest introduces source questions that should become part of the long-term source bank, insert them into `gauss_source_questions`.

This is usually used for 2016–2025 source questions or any future year where detailed official solution metadata is available.

Do not insert partial or uncertain source data without setting `is_validated = false`.

### Step 8: Insert coaching plans when available

If coaching plans are available, insert them into `gauss_coaching_plans` keyed by `source_question_id`.

For source-backed questions:

```text
gauss_coaching_plans.source_question_id = gauss_source_questions.id
```

For contest-only questions without a source ID, coaching-plan support may require a future schema extension. Do not force this into the current source-backed coaching plan table unless the data model is updated.

### Step 9: Verify import

Run these checks after insertion.

Check contest row:

```sql
select contest_code, title, description, active, display_order
from gauss_contests
where contest_code = 'G7gauss2025';
```

Check question count:

```sql
select
  c.contest_code,
  c.title,
  count(q.id) as question_count
from gauss_contests c
left join gauss_questions q
  on q.contest_id = c.id
where c.contest_code = 'G7gauss2025'
group by c.contest_code, c.title;
```

Expected result:

```text
question_count = 25
```

Check source resolution:

```sql
select
  q.contest_question_number,
  q.source_year,
  q.source_grade,
  q.source_question_number,
  sq.question_text is not null as has_source_question_text,
  sq.official_solution is not null as has_official_solution
from gauss_questions q
join gauss_contests c
  on c.id = q.contest_id
left join gauss_source_questions sq
  on sq.year = q.source_year
 and sq.grade = q.source_grade
 and sq.question_number = q.source_question_number
where c.contest_code = 'G7gauss2025'
order by q.contest_question_number;
```

Check solution records:

```sql
select
  c.contest_code,
  count(s.id) as solution_count
from gauss_contests c
join gauss_questions q
  on q.contest_id = c.id
left join gauss_solutions s
  on s.question_id = q.id
where c.contest_code = 'G7gauss2025'
group by c.contest_code;
```

### Step 10: App test

After SQL is complete:

1. Confirm the PDF file is in `app/public/questions/`.
2. Push the PDF to GitHub if testing through Netlify.
3. Open the student app.
4. Select the program.
5. Select the contest.
6. Confirm the contest loads 25 questions.
7. Submit a few answers.
8. Test stuck coaching on questions with official solutions.
9. Confirm that correct coaching answers tell the student to submit on the answer card.

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

1. Continue testing Contest 2025 loading and coaching.
2. Continue testing stuck coaching across multiple question types.
3. Tune Socratic prompt behavior based on student-response examples.
4. Build wrong-answer coaching as a separate starting trigger later.
5. Add teacher portal student statistics.
6. Add admin portal teacher/student list and statistics.
7. Add RLS policies for production security.
8. Add password reset backend function with role rules.
9. Add or refine topic-performance views for primary and secondary topics.

## Notes and Decisions

- The root folder name is intentionally `guass`.
- The app currently uses full PDF display, not cropped individual question images.
- `question_image_url` and crop fields are kept but not used in the MVP display.
- Correct answers should not be revealed after a wrong answer.
- Current coaching availability requires `gauss_source_questions.official_solution`.
- Future fallback coaching may use `gauss_questions.question_text/options`, `gauss_solutions`, and coaching plans after separate validation.
- Socratic coaching does not show the full solution in the coaching panel.
- The coach should confirm when the student reaches the correct final answer or correct reasoning, then remind the student to submit on the answer card.
- Teachers cannot reset username/internal-email student passwords.
- Students must always be assigned to a teacher when created.
