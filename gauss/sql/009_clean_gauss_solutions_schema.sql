-- Clean up gauss_solutions schema
-- Purpose: Use gauss_source_questions as the single source of truth for Socratic coaching
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Add unique constraint on gauss_source_questions
-- ============================================

-- First, check for duplicates. If this returns rows, clean them up before proceeding.
-- SELECT year, grade, question_number, COUNT(*)
-- FROM gauss_source_questions
-- GROUP BY year, grade, question_number
-- HAVING COUNT(*) > 1;

-- Create unique index if it doesn't exist (safer than constraint)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_gauss_source_questions_unique_source'
    ) THEN
        CREATE UNIQUE INDEX idx_gauss_source_questions_unique_source
        ON gauss_source_questions(year, grade, question_number);
    END IF;
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Duplicates exist in gauss_source_questions. Clean up duplicates before adding unique constraint.';
        RAISE NOTICE 'Run: SELECT year, grade, question_number, COUNT(*) FROM gauss_source_questions GROUP BY year, grade, question_number HAVING COUNT(*) > 1;';
END $$;

-- ============================================
-- 2. Add new columns to gauss_solutions
-- ============================================

-- Note: coaching_source_id is text to match gauss_source_questions.id type
ALTER TABLE gauss_solutions
    ADD COLUMN IF NOT EXISTS coaching_source_id text;

ALTER TABLE gauss_solutions
    ADD COLUMN IF NOT EXISTS coaching_mode text DEFAULT 'none';

ALTER TABLE gauss_solutions
    ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- ============================================
-- 3. Add foreign key constraint
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'gauss_solutions_coaching_source_id_fkey'
        AND table_name = 'gauss_solutions'
    ) THEN
        ALTER TABLE gauss_solutions
            ADD CONSTRAINT gauss_solutions_coaching_source_id_fkey
            FOREIGN KEY (coaching_source_id) REFERENCES gauss_source_questions(id)
            ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================
-- 4. Add coaching_mode constraint
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'gauss_solutions_coaching_mode_check'
        AND table_name = 'gauss_solutions'
    ) THEN
        ALTER TABLE gauss_solutions
            ADD CONSTRAINT gauss_solutions_coaching_mode_check
            CHECK (coaching_mode IN ('none', 'static', 'socratic'));
    END IF;
END $$;

-- ============================================
-- 5. Populate coaching_source_id for matching questions
-- ============================================

-- Update matched questions with official_solution
UPDATE gauss_solutions sol
SET
    coaching_source_id = src.id,
    coaching_available = true,
    coaching_mode = 'socratic',
    updated_at = now()
FROM gauss_questions q
JOIN gauss_source_questions src ON
    src.year = q.source_year
    AND src.grade = q.source_grade
    AND src.question_number = q.source_question_number
WHERE sol.question_id = q.id
    AND src.official_solution IS NOT NULL;

-- Update unmatched questions (ensure they have default values)
UPDATE gauss_solutions sol
SET
    coaching_mode = 'none',
    updated_at = now()
WHERE coaching_source_id IS NULL
    AND coaching_mode IS NULL;

-- ============================================
-- 6. Drop old duplicate/static coaching columns
-- ============================================

ALTER TABLE gauss_solutions
    DROP COLUMN IF EXISTS official_solution_image_url;

ALTER TABLE gauss_solutions
    DROP COLUMN IF EXISTS detailed_solution_text;

ALTER TABLE gauss_solutions
    DROP COLUMN IF EXISTS detailed_solution_json;

ALTER TABLE gauss_solutions
    DROP COLUMN IF EXISTS detailed_solution_image_url;

ALTER TABLE gauss_solutions
    DROP COLUMN IF EXISTS detailed_solution_source_pdf;

ALTER TABLE gauss_solutions
    DROP COLUMN IF EXISTS detailed_solution_page;

ALTER TABLE gauss_solutions
    DROP COLUMN IF EXISTS detailed_solution_status;

ALTER TABLE gauss_solutions
    DROP COLUMN IF EXISTS key_strategy;

ALTER TABLE gauss_solutions
    DROP COLUMN IF EXISTS hint_1;

ALTER TABLE gauss_solutions
    DROP COLUMN IF EXISTS hint_2;

ALTER TABLE gauss_solutions
    DROP COLUMN IF EXISTS guided_steps;

ALTER TABLE gauss_solutions
    DROP COLUMN IF EXISTS common_mistake;

ALTER TABLE gauss_solutions
    DROP COLUMN IF EXISTS reflection_question;

-- ============================================
-- 7. Keep these columns (no action needed):
-- - id
-- - question_id
-- - psg_solution_text
-- - psg_solution_summary
-- - psg_solution_image_url
-- - coaching_available
-- - coaching_source_id
-- - coaching_mode
-- - created_at
-- - updated_at
-- ============================================

-- ============================================
-- 9. Add indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_gauss_solutions_question_id
    ON gauss_solutions(question_id);

CREATE INDEX IF NOT EXISTS idx_gauss_solutions_coaching_source_id
    ON gauss_solutions(coaching_source_id);

CREATE INDEX IF NOT EXISTS idx_gauss_solutions_coaching_available
    ON gauss_solutions(coaching_available);

CREATE INDEX IF NOT EXISTS idx_gauss_solutions_coaching_mode
    ON gauss_solutions(coaching_mode);

-- ============================================
-- Add trigger for updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_gauss_solutions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_gauss_solutions_updated_at ON gauss_solutions;
CREATE TRIGGER trigger_gauss_solutions_updated_at
    BEFORE UPDATE ON gauss_solutions
    FOR EACH ROW
    EXECUTE FUNCTION update_gauss_solutions_updated_at();

-- ============================================
-- Summary: Show updated schema
-- ============================================

SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'gauss_solutions'
ORDER BY ordinal_position;
