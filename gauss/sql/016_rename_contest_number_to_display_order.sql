-- Gauss AI Coach: Rename contest_number to display_order
-- Migration 016
-- Run this in Supabase SQL Editor
--
-- This migration renames contest_number to display_order for clarity.
-- display_order represents the order within each grade.

-- ============================================
-- 1. Rename column
-- ============================================

ALTER TABLE gauss_contests
RENAME COLUMN contest_number TO display_order;

-- ============================================
-- 2. Rename index
-- ============================================

DROP INDEX IF EXISTS idx_gauss_contests_contest_number;

CREATE INDEX IF NOT EXISTS idx_gauss_contests_display_order
ON gauss_contests(display_order);

-- ============================================
-- 3. Verify
-- ============================================

SELECT
  contest_code,
  title,
  grade,
  display_order
FROM gauss_contests
ORDER BY grade, display_order;
