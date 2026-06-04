-- Gauss AI Coach: Rename "practice set" to "contest"
-- Migration 012: Align naming across database, backend, and frontend
-- Run this in Supabase SQL Editor
--
-- This migration:
-- 1. Renames gauss_practice_sets to gauss_contests
-- 2. Renames gauss_practice_sessions to gauss_contest_sessions
-- 3. Renames columns: set_code → contest_code, practice_set_id → contest_id, practice_question_number → contest_question_number
-- 4. Drops and recreates topic performance views
-- 5. Updates contest titles

-- ============================================
-- 1. Drop dependent views first
-- ============================================

DROP VIEW IF EXISTS gauss_student_primary_topic_performance;
DROP VIEW IF EXISTS gauss_student_secondary_topic_performance;

-- ============================================
-- 2. Rename gauss_practice_sets → gauss_contests
-- ============================================

ALTER TABLE IF EXISTS gauss_practice_sets
    RENAME TO gauss_contests;

-- Rename set_code → contest_code
ALTER TABLE gauss_contests
    RENAME COLUMN set_code TO contest_code;

-- ============================================
-- 3. Rename columns in gauss_questions
-- ============================================

-- Rename practice_set_id → contest_id
ALTER TABLE gauss_questions
    RENAME COLUMN practice_set_id TO contest_id;

-- Rename practice_question_number → contest_question_number
ALTER TABLE gauss_questions
    RENAME COLUMN practice_question_number TO contest_question_number;

-- ============================================
-- 4. Rename gauss_practice_sessions → gauss_contest_sessions
-- ============================================

ALTER TABLE IF EXISTS gauss_practice_sessions
    RENAME TO gauss_contest_sessions;

-- Rename practice_set_id → contest_id in sessions
ALTER TABLE gauss_contest_sessions
    RENAME COLUMN practice_set_id TO contest_id;

-- ============================================
-- 5. Update constraint names (optional but cleaner)
-- ============================================

-- Drop old constraints and indexes, create new ones
-- Note: Some constraints may have auto-generated names, so we use IF EXISTS

ALTER TABLE gauss_questions
    DROP CONSTRAINT IF EXISTS gauss_questions_practice_set_question_unique;

ALTER TABLE gauss_questions
    ADD CONSTRAINT gauss_questions_contest_question_unique
    UNIQUE (contest_id, contest_question_number);

-- ============================================
-- 6. Recreate topic performance views with new names
-- ============================================

CREATE OR REPLACE VIEW gauss_student_primary_topic_performance AS
SELECT
    cs.user_id,
    cs.contest_id,
    c.contest_code,
    topic AS primary_topic,

    COUNT(*) FILTER (
        WHERE a.status IS NOT NULL AND a.status != 'unanswered'
    ) AS attempted_count,

    COUNT(*) FILTER (
        WHERE a.status = 'correct'
    ) AS correct_count,

    COUNT(*) FILTER (
        WHERE a.status = 'wrong'
    ) AS wrong_count,

    COUNT(*) FILTER (
        WHERE a.status = 'skipped'
    ) AS skipped_count,

    COUNT(*) FILTER (
        WHERE a.flagged = true OR a.status = 'flagged'
    ) AS flagged_count,

    ROUND(
        CASE
            WHEN COUNT(*) FILTER (WHERE a.status IS NOT NULL AND a.status != 'unanswered') = 0 THEN 0
            ELSE COUNT(*) FILTER (WHERE a.status = 'correct')::numeric /
                 COUNT(*) FILTER (WHERE a.status IS NOT NULL AND a.status != 'unanswered')
        END,
        2
    ) AS accuracy_rate,

    ROUND(
        AVG(a.time_spent_seconds) FILTER (WHERE a.time_spent_seconds IS NOT NULL),
        2
    ) AS average_time_spent_seconds

FROM gauss_contest_sessions cs
JOIN gauss_attempts a ON a.session_id = cs.id
JOIN gauss_questions q ON q.id = a.question_id
JOIN gauss_contests c ON c.id = cs.contest_id
CROSS JOIN LATERAL unnest(q.primary_topics) AS topic

GROUP BY
    cs.user_id,
    cs.contest_id,
    c.contest_code,
    topic;


CREATE OR REPLACE VIEW gauss_student_secondary_topic_performance AS
SELECT
    cs.user_id,
    cs.contest_id,
    c.contest_code,
    topic AS secondary_topic,

    COUNT(*) FILTER (
        WHERE a.status IS NOT NULL AND a.status != 'unanswered'
    ) AS attempted_count,

    COUNT(*) FILTER (
        WHERE a.status = 'correct'
    ) AS correct_count,

    COUNT(*) FILTER (
        WHERE a.status = 'wrong'
    ) AS wrong_count,

    COUNT(*) FILTER (
        WHERE a.status = 'skipped'
    ) AS skipped_count,

    COUNT(*) FILTER (
        WHERE a.flagged = true OR a.status = 'flagged'
    ) AS flagged_count,

    ROUND(
        CASE
            WHEN COUNT(*) FILTER (WHERE a.status IS NOT NULL AND a.status != 'unanswered') = 0 THEN 0
            ELSE COUNT(*) FILTER (WHERE a.status = 'correct')::numeric /
                 COUNT(*) FILTER (WHERE a.status IS NOT NULL AND a.status != 'unanswered')
        END,
        2
    ) AS accuracy_rate,

    ROUND(
        AVG(a.time_spent_seconds) FILTER (WHERE a.time_spent_seconds IS NOT NULL),
        2
    ) AS average_time_spent_seconds

FROM gauss_contest_sessions cs
JOIN gauss_attempts a ON a.session_id = cs.id
JOIN gauss_questions q ON q.id = a.question_id
JOIN gauss_contests c ON c.id = cs.contest_id
CROSS JOIN LATERAL unnest(q.secondary_topics) AS topic

GROUP BY
    cs.user_id,
    cs.contest_id,
    c.contest_code,
    topic;

-- ============================================
-- 7. Add display_order column for sorting
-- ============================================

ALTER TABLE gauss_contests
    ADD COLUMN IF NOT EXISTS display_order int DEFAULT 0;

-- Set display order for existing contests
UPDATE gauss_contests SET display_order = 1 WHERE contest_code = 'G7gauss1';
UPDATE gauss_contests SET display_order = 2 WHERE contest_code = 'G7gauss2025';

CREATE INDEX IF NOT EXISTS idx_gauss_contests_display_order
    ON gauss_contests(display_order);

-- ============================================
-- 8. Update contest titles
-- ============================================

UPDATE gauss_contests
SET title = 'Grade 7 Contest 1'
WHERE contest_code = 'G7gauss1';

-- If G7gauss2025 exists, update it too
UPDATE gauss_contests
SET title = 'Grade 7 Contest 2025'
WHERE contest_code = 'G7gauss2025';

-- ============================================
-- 8. Verify the changes
-- ============================================

SELECT
    'gauss_contests' AS table_name,
    contest_code,
    title
FROM gauss_contests
ORDER BY contest_code;
