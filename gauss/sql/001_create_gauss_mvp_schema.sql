-- Gauss AI Coach MVP Schema
-- Run this in Supabase SQL Editor to create the core tables

-- ============================================
-- 1. Practice Sets
-- ============================================
CREATE TABLE gauss_practice_sets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    set_code text UNIQUE NOT NULL,
    title text NOT NULL,
    grade int NOT NULL,
    source_type text,
    question_pdf_filename text,
    solution_pdf_filename text,
    description text,
    created_at timestamptz DEFAULT now()
);

-- ============================================
-- 2. Questions
-- ============================================
CREATE TABLE gauss_questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    practice_set_id uuid REFERENCES gauss_practice_sets(id) ON DELETE CASCADE,
    practice_question_number int NOT NULL,
    source_year int,
    source_grade int,
    source_question_number int,
    primary_topics text[] DEFAULT '{}',
    secondary_topics text[] DEFAULT '{}',
    correct_answer text NOT NULL,
    short_problem_summary text,
    question_image_url text,
    question_pdf_page int,
    crop_x numeric,
    crop_y numeric,
    crop_width numeric,
    crop_height numeric,
    difficulty_band text,
    created_at timestamptz DEFAULT now(),

    -- Constraints
    CONSTRAINT gauss_questions_practice_set_question_unique
        UNIQUE (practice_set_id, practice_question_number),
    CONSTRAINT gauss_questions_correct_answer_check
        CHECK (correct_answer IN ('A', 'B', 'C', 'D', 'E')),
    CONSTRAINT gauss_questions_difficulty_band_check
        CHECK (difficulty_band IS NULL OR difficulty_band IN ('Easy', 'Medium', 'Hard'))
);

-- ============================================
-- 3. Solutions
-- ============================================
CREATE TABLE gauss_solutions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id uuid REFERENCES gauss_questions(id) ON DELETE CASCADE,
    psg_solution_text text,
    psg_solution_summary text,
    psg_solution_image_url text,
    detailed_solution_text text,
    detailed_solution_image_url text,
    detailed_solution_source_pdf text,
    detailed_solution_page int,
    detailed_solution_status text DEFAULT 'not_available',
    coaching_available boolean DEFAULT false,
    key_strategy text,
    hint_1 text,
    hint_2 text,
    guided_steps jsonb,
    common_mistake text,
    reflection_question text,
    created_at timestamptz DEFAULT now(),

    -- Constraints
    CONSTRAINT gauss_solutions_question_unique UNIQUE (question_id)
);

-- ============================================
-- 4. Attempts
-- ============================================
CREATE TABLE gauss_attempts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    question_id uuid REFERENCES gauss_questions(id) ON DELETE CASCADE,
    selected_answer text,
    is_correct boolean,
    time_spent_seconds int,
    used_hint boolean DEFAULT false,
    used_guided_solution boolean DEFAULT false,
    viewed_psg_solution boolean DEFAULT false,
    viewed_detailed_solution boolean DEFAULT false,
    attempted_at timestamptz DEFAULT now()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_gauss_questions_practice_set_id
    ON gauss_questions(practice_set_id);

CREATE INDEX idx_gauss_questions_source
    ON gauss_questions(source_year, source_grade, source_question_number);

CREATE INDEX idx_gauss_attempts_user_id
    ON gauss_attempts(user_id);

CREATE INDEX idx_gauss_attempts_question_id
    ON gauss_attempts(question_id);
