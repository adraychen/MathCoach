-- Gauss AI Coach: Drop redundant coaching fields
-- Migration 010: Remove coaching fields that are now computed dynamically
-- Run this in Supabase SQL Editor after 009
--
-- Coaching availability is now determined by checking if a matching
-- gauss_source_questions record exists with official_solution.
-- The lookup uses: year/grade/question_number from gauss_questions.
--
-- These fields are no longer needed in gauss_solutions:
--   - coaching_available (computed dynamically)
--   - coaching_source_id (lookup by year/grade/question_number instead)
--   - coaching_mode (always 'socratic' when available)

-- ============================================
-- 1. Drop redundant columns from gauss_solutions
-- ============================================

ALTER TABLE gauss_solutions
    DROP COLUMN IF EXISTS coaching_available;

ALTER TABLE gauss_solutions
    DROP COLUMN IF EXISTS coaching_source_id;

ALTER TABLE gauss_solutions
    DROP COLUMN IF EXISTS coaching_mode;

-- ============================================
-- 2. Verify remaining columns
-- ============================================
-- Expected remaining columns in gauss_solutions:
--   - id
--   - question_id
--   - psg_solution_text
--   - psg_solution_summary
--   - psg_solution_image_url
--   - created_at
--   - updated_at

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'gauss_solutions'
ORDER BY ordinal_position;
