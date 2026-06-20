-- Create Grade 7 2023 Contest and Questions
-- Run this in Supabase SQL Editor

-- Step 1: Create the contest
INSERT INTO gauss_contests (
  id,
  contest_code,
  title,
  description,
  grade,
  question_pdf_filename,
  solution_pdf_filename,
  active,
  display_order
)
VALUES (
  gen_random_uuid(),
  'G7gauss2023',
  'Waterloo Gauss Contest for Grade 7',
  '2023 Contest',
  7,
  'G7gauss2023-question.pdf',
  'G7gauss2023-solution.pdf',
  true,
  2023
)
ON CONFLICT (contest_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  updated_at = NOW();

-- Step 2: Get the contest ID and insert questions
DO $$
DECLARE
  v_contest_id UUID;
BEGIN
  -- Get the contest ID
  SELECT id INTO v_contest_id FROM gauss_contests WHERE contest_code = 'G7gauss2023';

  -- Insert all 25 questions
  INSERT INTO gauss_questions (id, contest_id, contest_question_number, source_year, source_grade, source_question_number, correct_answer)
  VALUES
    (gen_random_uuid(), v_contest_id, 1, 2023, 7, 1, 'D'),
    (gen_random_uuid(), v_contest_id, 2, 2023, 7, 2, 'C'),
    (gen_random_uuid(), v_contest_id, 3, 2023, 7, 3, 'B'),
    (gen_random_uuid(), v_contest_id, 4, 2023, 7, 4, 'A'),
    (gen_random_uuid(), v_contest_id, 5, 2023, 7, 5, 'E'),
    (gen_random_uuid(), v_contest_id, 6, 2023, 7, 6, 'C'),
    (gen_random_uuid(), v_contest_id, 7, 2023, 7, 7, 'C'),
    (gen_random_uuid(), v_contest_id, 8, 2023, 7, 8, 'B'),
    (gen_random_uuid(), v_contest_id, 9, 2023, 7, 9, 'C'),
    (gen_random_uuid(), v_contest_id, 10, 2023, 7, 10, 'D'),
    (gen_random_uuid(), v_contest_id, 11, 2023, 7, 11, 'B'),
    (gen_random_uuid(), v_contest_id, 12, 2023, 7, 12, 'A'),
    (gen_random_uuid(), v_contest_id, 13, 2023, 7, 13, 'D'),
    (gen_random_uuid(), v_contest_id, 14, 2023, 7, 14, 'D'),
    (gen_random_uuid(), v_contest_id, 15, 2023, 7, 15, 'D'),
    (gen_random_uuid(), v_contest_id, 16, 2023, 7, 16, 'E'),
    (gen_random_uuid(), v_contest_id, 17, 2023, 7, 17, 'C'),
    (gen_random_uuid(), v_contest_id, 18, 2023, 7, 18, 'D'),
    (gen_random_uuid(), v_contest_id, 19, 2023, 7, 19, 'D'),
    (gen_random_uuid(), v_contest_id, 20, 2023, 7, 20, 'E'),
    (gen_random_uuid(), v_contest_id, 21, 2023, 7, 21, 'B'),
    (gen_random_uuid(), v_contest_id, 22, 2023, 7, 22, 'E'),
    (gen_random_uuid(), v_contest_id, 23, 2023, 7, 23, 'D'),
    (gen_random_uuid(), v_contest_id, 24, 2023, 7, 24, 'E'),
    (gen_random_uuid(), v_contest_id, 25, 2023, 7, 25, 'B')
  ON CONFLICT (contest_id, contest_question_number) DO UPDATE SET
    source_year = EXCLUDED.source_year,
    source_grade = EXCLUDED.source_grade,
    source_question_number = EXCLUDED.source_question_number,
    correct_answer = EXCLUDED.correct_answer,
    updated_at = NOW();
END $$;

-- Verify the contest was created
SELECT id, contest_code, title, description, grade, active
FROM gauss_contests
WHERE contest_code = 'G7gauss2023';

-- Verify the questions were created
SELECT q.contest_question_number, q.correct_answer, q.source_year, q.source_grade, q.source_question_number
FROM gauss_questions q
JOIN gauss_contests c ON q.contest_id = c.id
WHERE c.contest_code = 'G7gauss2023'
ORDER BY q.contest_question_number;
