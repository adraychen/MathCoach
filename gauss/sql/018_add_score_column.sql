-- Add score column to gauss_contest_sessions
-- Waterloo Gauss scoring:
--   Part A (Q1-10): 5 points each
--   Part B (Q11-20): 6 points each
--   Part C (Q21-25): 8 points each
--   Skipped: 2 points each, max 20 points total
--   Wrong: 0 points

ALTER TABLE gauss_contest_sessions
ADD COLUMN IF NOT EXISTS score integer DEFAULT NULL;

COMMENT ON COLUMN gauss_contest_sessions.score IS 'Final score using Waterloo Gauss scoring rules';
