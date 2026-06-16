-- Seed Grade 8 Contests
-- Creates two Grade 8 contests: 2024 and 2025

-- ============================================
-- 1. Insert Grade 8 Contest 2024
-- ============================================
INSERT INTO gauss_contests (
    contest_code,
    title,
    grade,
    question_pdf_filename,
    description,
    display_order
) VALUES (
    'G8gauss2024',
    'Grade 8 Contest 2024',
    8,
    'gauss_g8_2024.pdf',
    'Waterloo Gauss Grade 8 Contest 2024',
    1
)
ON CONFLICT (contest_code) DO UPDATE SET
    title = EXCLUDED.title,
    grade = EXCLUDED.grade,
    question_pdf_filename = EXCLUDED.question_pdf_filename,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order;

-- ============================================
-- 2. Insert Grade 8 Contest 2025
-- ============================================
INSERT INTO gauss_contests (
    contest_code,
    title,
    grade,
    question_pdf_filename,
    description,
    display_order
) VALUES (
    'G8gauss2025',
    'Grade 8 Contest 2025',
    8,
    'gauss_g8_2025.pdf',
    'Waterloo Gauss Grade 8 Contest 2025',
    2
)
ON CONFLICT (contest_code) DO UPDATE SET
    title = EXCLUDED.title,
    grade = EXCLUDED.grade,
    question_pdf_filename = EXCLUDED.question_pdf_filename,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order;

-- ============================================
-- 3. Insert Questions for G8gauss2024
-- ============================================
WITH contest AS (
    SELECT id FROM gauss_contests WHERE contest_code = 'G8gauss2024'
),
source AS (
    SELECT
        question_number,
        correct_answer,
        CASE
            WHEN question_number <= 10 THEN 'Easy'
            WHEN question_number <= 20 THEN 'Medium'
            ELSE 'Hard'
        END AS difficulty_band
    FROM gauss_source_questions
    WHERE year = 2024 AND grade = 8
)
INSERT INTO gauss_questions (
    contest_id,
    contest_question_number,
    source_year,
    source_grade,
    source_question_number,
    correct_answer,
    difficulty_band
)
SELECT
    contest.id,
    source.question_number,
    2024,
    8,
    source.question_number,
    source.correct_answer,
    source.difficulty_band
FROM contest, source
ON CONFLICT (contest_id, contest_question_number) DO UPDATE SET
    source_year = EXCLUDED.source_year,
    source_grade = EXCLUDED.source_grade,
    source_question_number = EXCLUDED.source_question_number,
    correct_answer = EXCLUDED.correct_answer,
    difficulty_band = EXCLUDED.difficulty_band;

-- ============================================
-- 4. Insert Questions for G8gauss2025
-- ============================================
WITH contest AS (
    SELECT id FROM gauss_contests WHERE contest_code = 'G8gauss2025'
),
source AS (
    SELECT
        question_number,
        correct_answer,
        CASE
            WHEN question_number <= 10 THEN 'Easy'
            WHEN question_number <= 20 THEN 'Medium'
            ELSE 'Hard'
        END AS difficulty_band
    FROM gauss_source_questions
    WHERE year = 2025 AND grade = 8
)
INSERT INTO gauss_questions (
    contest_id,
    contest_question_number,
    source_year,
    source_grade,
    source_question_number,
    correct_answer,
    difficulty_band
)
SELECT
    contest.id,
    source.question_number,
    2025,
    8,
    source.question_number,
    source.correct_answer,
    source.difficulty_band
FROM contest, source
ON CONFLICT (contest_id, contest_question_number) DO UPDATE SET
    source_year = EXCLUDED.source_year,
    source_grade = EXCLUDED.source_grade,
    source_question_number = EXCLUDED.source_question_number,
    correct_answer = EXCLUDED.correct_answer,
    difficulty_band = EXCLUDED.difficulty_band;

-- ============================================
-- 5. Verify
-- ============================================
SELECT
    c.contest_code,
    c.title,
    c.grade,
    c.display_order,
    COUNT(q.id) AS question_count
FROM gauss_contests c
LEFT JOIN gauss_questions q ON q.contest_id = c.id
WHERE c.grade = 8
GROUP BY c.id, c.contest_code, c.title, c.grade, c.display_order
ORDER BY c.display_order;
