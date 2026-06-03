-- Enable coaching for G7gauss1 questions with source questions from 2016-2025
-- Only updates questions that have matching gauss_source_questions with official_solution

-- Update gauss_solutions for qualifying questions
UPDATE gauss_solutions sol
SET
    detailed_solution_text = src.official_solution,
    detailed_solution_source_pdf = 'gauss_source_questions',
    detailed_solution_status = 'available',
    coaching_available = true,
    key_strategy = src.solution_pattern,
    common_mistake = null,
    reflection_question = null,
    hint_1 = 'Think about the main idea: ' || COALESCE(src.reasoning_summary, '') || '.',
    hint_2 = 'Use the strategy: ' || COALESCE(src.solution_pattern, '') || '.',
    guided_steps = jsonb_build_array(src.official_solution)
FROM gauss_questions q
JOIN gauss_practice_sets ps ON ps.id = q.practice_set_id
JOIN gauss_source_questions src ON
    src.year = q.source_year
    AND src.grade = q.source_grade
    AND src.question_number = q.source_question_number
WHERE sol.question_id = q.id
    AND ps.set_code = 'G7gauss1'
    AND q.source_year BETWEEN 2016 AND 2025
    AND src.official_solution IS NOT NULL;

-- Show what was updated
SELECT
    q.practice_question_number,
    q.source_year,
    q.source_grade,
    q.source_question_number,
    sol.coaching_available,
    sol.detailed_solution_status,
    LEFT(sol.detailed_solution_text, 50) AS solution_preview
FROM gauss_solutions sol
JOIN gauss_questions q ON q.id = sol.question_id
JOIN gauss_practice_sets ps ON ps.id = q.practice_set_id
WHERE ps.set_code = 'G7gauss1'
    AND q.source_year BETWEEN 2016 AND 2025
    AND sol.coaching_available = true
ORDER BY q.practice_question_number;
