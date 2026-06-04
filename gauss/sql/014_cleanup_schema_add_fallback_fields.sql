-- Gauss AI Coach: Schema Cleanup and Fallback Fields
-- Migration 014
-- Run this in Supabase SQL Editor
--
-- This migration:
-- 1. Removes source_type from gauss_contests
-- 2. Adds active, updated_at, contest_number to gauss_contests
-- 3. Adds question_text, options to gauss_questions for fallback coaching

-- ============================================
-- 1. Clean up gauss_contests
-- ============================================

-- Remove source_type if it exists
ALTER TABLE gauss_contests
DROP COLUMN IF EXISTS source_type;

-- Add active column if not exists
ALTER TABLE gauss_contests
ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;

-- Add updated_at column if not exists
ALTER TABLE gauss_contests
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add contest_number for display ordering (smaller = first)
ALTER TABLE gauss_contests
ADD COLUMN IF NOT EXISTS contest_number int DEFAULT 0;

-- Create index for contest_number sorting
CREATE INDEX IF NOT EXISTS idx_gauss_contests_contest_number
ON gauss_contests(contest_number);

-- ============================================
-- 2. Add fallback fields to gauss_questions
-- ============================================

-- Add question_text for pre-2016 or questions without source records
ALTER TABLE gauss_questions
ADD COLUMN IF NOT EXISTS question_text text;

-- Add options jsonb for answer choices when no source question exists
ALTER TABLE gauss_questions
ADD COLUMN IF NOT EXISTS options jsonb;

-- ============================================
-- 3. Update existing contests
-- ============================================

-- Set contest_number for existing contests
UPDATE gauss_contests SET contest_number = 1 WHERE contest_code = 'G7gauss1';
UPDATE gauss_contests SET contest_number = 2 WHERE contest_code = 'G7gauss2025';

-- Update question_pdf_filename if not set
UPDATE gauss_contests
SET question_pdf_filename = 'G7gauss1-question.pdf'
WHERE contest_code = 'G7gauss1' AND question_pdf_filename IS NULL;

UPDATE gauss_contests
SET question_pdf_filename = 'G7gauss2025-question.pdf'
WHERE contest_code = 'G7gauss2025' AND question_pdf_filename IS NULL;

-- ============================================
-- 4. Verify the changes
-- ============================================

SELECT
  'gauss_contests columns' AS check_type,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'gauss_contests'
ORDER BY ordinal_position;

SELECT
  'gauss_questions new columns' AS check_type,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'gauss_questions'
AND column_name IN ('question_text', 'options')
ORDER BY ordinal_position;

SELECT
  'contests data' AS check_type,
  contest_code,
  title,
  contest_number,
  question_pdf_filename,
  active
FROM gauss_contests
ORDER BY contest_number;
