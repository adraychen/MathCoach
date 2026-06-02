-- Gauss AI Coach: Topic Performance Views
-- Migration 006: Create views to track student performance by topic
-- Run this in Supabase SQL Editor after 001-005

-- ============================================
-- 1. Student Primary Topic Performance View
-- ============================================
--
-- Purpose:
--   Aggregates student attempt data by primary topic.
--   Since questions can have multiple primary topics (stored as text[]),
--   this view unnests the array so each question contributes to each
--   of its primary topics separately.
--
-- Use cases:
--   - Identify which topics a student struggles with
--   - Generate topic-based progress reports
--   - Recommend practice areas based on weak topics
--
-- Example query:
--   SELECT * FROM gauss_student_primary_topic_performance
--   WHERE user_id = 'some-uuid' AND set_code = 'G7gauss1'
--   ORDER BY accuracy_rate ASC;
--

CREATE OR REPLACE VIEW gauss_student_primary_topic_performance AS
SELECT
    ps.user_id,
    ps.practice_set_id,
    pset.set_code,
    topic AS primary_topic,

    -- Counts
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

    -- Accuracy rate (avoid division by zero)
    ROUND(
        CASE
            WHEN COUNT(*) FILTER (WHERE a.status IS NOT NULL AND a.status != 'unanswered') = 0 THEN 0
            ELSE COUNT(*) FILTER (WHERE a.status = 'correct')::numeric /
                 COUNT(*) FILTER (WHERE a.status IS NOT NULL AND a.status != 'unanswered')
        END,
        2
    ) AS accuracy_rate,

    -- Average time spent (ignore nulls)
    ROUND(
        AVG(a.time_spent_seconds) FILTER (WHERE a.time_spent_seconds IS NOT NULL),
        2
    ) AS average_time_spent_seconds

FROM gauss_practice_sessions ps
JOIN gauss_attempts a ON a.session_id = ps.id
JOIN gauss_questions q ON q.id = a.question_id
JOIN gauss_practice_sets pset ON pset.id = ps.practice_set_id
CROSS JOIN LATERAL unnest(q.primary_topics) AS topic

GROUP BY
    ps.user_id,
    ps.practice_set_id,
    pset.set_code,
    topic;


-- ============================================
-- 2. Student Secondary Topic Performance View
-- ============================================
--
-- Purpose:
--   Aggregates student attempt data by secondary topic.
--   Since questions can have multiple secondary topics (stored as text[]),
--   this view unnests the array so each question contributes to each
--   of its secondary topics separately.
--
-- Use cases:
--   - Drill down into sub-topic performance
--   - Identify specific skill gaps within a broader topic
--   - Fine-tune practice recommendations
--
-- Example query:
--   SELECT * FROM gauss_student_secondary_topic_performance
--   WHERE user_id = 'some-uuid' AND accuracy_rate < 0.5
--   ORDER BY attempted_count DESC;
--

CREATE OR REPLACE VIEW gauss_student_secondary_topic_performance AS
SELECT
    ps.user_id,
    ps.practice_set_id,
    pset.set_code,
    topic AS secondary_topic,

    -- Counts
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

    -- Accuracy rate (avoid division by zero)
    ROUND(
        CASE
            WHEN COUNT(*) FILTER (WHERE a.status IS NOT NULL AND a.status != 'unanswered') = 0 THEN 0
            ELSE COUNT(*) FILTER (WHERE a.status = 'correct')::numeric /
                 COUNT(*) FILTER (WHERE a.status IS NOT NULL AND a.status != 'unanswered')
        END,
        2
    ) AS accuracy_rate,

    -- Average time spent (ignore nulls)
    ROUND(
        AVG(a.time_spent_seconds) FILTER (WHERE a.time_spent_seconds IS NOT NULL),
        2
    ) AS average_time_spent_seconds

FROM gauss_practice_sessions ps
JOIN gauss_attempts a ON a.session_id = ps.id
JOIN gauss_questions q ON q.id = a.question_id
JOIN gauss_practice_sets pset ON pset.id = ps.practice_set_id
CROSS JOIN LATERAL unnest(q.secondary_topics) AS topic

GROUP BY
    ps.user_id,
    ps.practice_set_id,
    pset.set_code,
    topic;


-- ============================================
-- Notes
-- ============================================
--
-- These views join:
--   gauss_practice_sessions -> gauss_attempts -> gauss_questions -> gauss_practice_sets
--
-- The CROSS JOIN LATERAL unnest() expands each topic array element into
-- a separate row, so a question with primary_topics = ['Geometry', 'Measurement']
-- will contribute to both topics independently.
--
-- Questions with empty topic arrays will not appear in the corresponding view.
--
-- Performance consideration:
--   For large datasets, consider creating materialized views with periodic refresh,
--   or add appropriate indexes on the joined columns.
