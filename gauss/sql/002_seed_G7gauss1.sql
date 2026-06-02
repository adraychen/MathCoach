-- Seed data for G7gauss1 practice set
-- This file can be run multiple times without creating duplicates

-- ============================================
-- 1. Insert Practice Set
-- ============================================
INSERT INTO gauss_practice_sets (
    set_code,
    title,
    grade,
    source_type,
    question_pdf_filename,
    solution_pdf_filename,
    description
) VALUES (
    'G7gauss1',
    'Grade 7 Gauss Practice Set 1',
    7,
    'cemc_problem_set_generator',
    'G7gauss1-question.pdf',
    'G7gauss1-solution.pdf',
    'First Grade 7 Gauss practice set imported from CEMC Problem Set Generator.'
)
ON CONFLICT (set_code) DO UPDATE SET
    title = EXCLUDED.title,
    grade = EXCLUDED.grade,
    source_type = EXCLUDED.source_type,
    question_pdf_filename = EXCLUDED.question_pdf_filename,
    solution_pdf_filename = EXCLUDED.solution_pdf_filename,
    description = EXCLUDED.description;

-- ============================================
-- 2. Insert Questions
-- ============================================
WITH practice_set AS (
    SELECT id FROM gauss_practice_sets WHERE set_code = 'G7gauss1'
)
INSERT INTO gauss_questions (
    practice_set_id,
    practice_question_number,
    source_year,
    source_grade,
    source_question_number,
    primary_topics,
    secondary_topics,
    correct_answer,
    short_problem_summary,
    question_image_url,
    question_pdf_page,
    crop_x,
    crop_y,
    crop_width,
    crop_height,
    difficulty_band
)
SELECT
    practice_set.id,
    v.practice_question_number,
    v.source_year,
    v.source_grade,
    v.source_question_number,
    v.primary_topics,
    v.secondary_topics,
    v.correct_answer,
    v.short_problem_summary,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    v.difficulty_band
FROM practice_set, (VALUES
    (1, 2017, 7, 1, ARRAY['Number Sense'], ARRAY['Operations'], 'B', 'Evaluate (2 + 4 + 6) - (1 + 3 + 5).', 'Easy'),
    (2, 2005, 7, 2, ARRAY['Number Sense'], ARRAY['Decimals', 'Operations'], 'E', 'Evaluate 0.8 - 0.07.', 'Easy'),
    (3, 2008, 7, 3, ARRAY['Number Sense'], ARRAY['Fractions/Ratios'], 'D', 'Evaluate 1/2 + 1/4 + 1/8.', 'Easy'),
    (4, 2015, 7, 4, ARRAY['Algebra and Equations'], ARRAY['Equations Solving'], 'B', 'Find the mass of one rectangle relative to circles on a balanced scale.', 'Easy'),
    (5, 2018, 7, 5, ARRAY['Number Sense'], ARRAY['Operations'], 'C', 'Identify which purchase combination costs more than $18.', 'Easy'),
    (6, 2008, 7, 6, ARRAY['Geometry and Measurement'], ARRAY['Angles'], 'A', 'Find the value of x if five equal angles of x° form a straight line.', 'Easy'),
    (7, 2011, 7, 7, ARRAY['Number Sense'], ARRAY['Fractions/Ratios'], 'E', 'Evaluate the sum of 1/3 added seven times.', 'Easy'),
    (8, 2023, 7, 8, ARRAY['Geometry and Measurement'], ARRAY['Circles', 'Measurement'], 'B', 'Find the greatest possible length of a segment joining two points on a circle with radius 4 cm.', 'Easy'),
    (9, 2007, 7, 9, ARRAY['Geometry and Measurement'], ARRAY['Transformations'], 'D', 'Determine how the word "BANK" appears when viewed through a clear window from inside.', 'Easy'),
    (10, 2014, 7, 10, ARRAY['Number Sense'], ARRAY['Operations'], 'C', 'Identify which expression equals 17.', 'Easy'),
    (11, 2022, 7, 11, ARRAY['Number Sense'], ARRAY['Prime Numbers', 'Divisibility', 'Factoring'], 'C', 'Calculate the sum of the prime factors of 42.', 'Medium'),
    (12, 2005, 7, 12, ARRAY['Number Sense'], ARRAY['Rates', 'Decimals', 'Estimation', 'Measurement'], 'E', 'Find the final height of a bamboo plant after 7 days growing at 105 cm/day.', 'Medium'),
    (13, 2010, 7, 13, ARRAY['Number Sense'], ARRAY['Patterning/Sequences/Series', 'Averages'], 'E', 'Find the smallest of five consecutive integers with a mean of 21.', 'Medium'),
    (14, 2019, 7, 14, ARRAY['Counting and Probability'], ARRAY['Probability', 'Prime Numbers'], 'C', 'Find the probability of spinning an odd prime number on an 8-section spinner (2-9).', 'Medium'),
    (15, 2023, 7, 15, ARRAY['Number Sense', 'Data Analysis'], ARRAY['Averages', 'Expressions'], 'D', 'Find n if the mean of {2, 9, 4, n, 2n} is 6.', 'Medium'),
    (16, 2022, 7, 16, ARRAY['Counting and Probability'], ARRAY['Probability', 'Counting', 'Fractions/Ratios'], 'C', 'Find the probability that three coin tosses are all the same.', 'Medium'),
    (17, 2012, 7, 17, ARRAY['Number Sense'], ARRAY['Fractions/Ratios'], 'C', 'Calculate total kindergarteners if JK:SK ratio is 8:5 and there are 128 JKs.', 'Medium'),
    (18, 2021, 7, 18, ARRAY['Geometry and Measurement'], ARRAY['Measurement', 'Triangles'], 'B', 'Find length AM in isosceles ABC given perimeters of ABC (64) and ABM (40).', 'Medium'),
    (19, 2006, 7, 19, ARRAY['Number Sense'], ARRAY['Measurement', 'Estimation'], 'B', 'Identify which time duration is closest to 1,000,000 seconds.', 'Medium'),
    (20, 2006, 7, 20, ARRAY['Geometry and Measurement'], ARRAY['Transformations'], 'B', 'Determine the transformed orientation of ''A'' based on transformations shown for ''P''.', 'Medium'),
    (21, 2019, 7, 21, ARRAY['Other', 'Algebra and Equations'], ARRAY['Logic', 'Inequalities'], 'D', 'Determine which statement about cat/dog ownership counts must be true.', 'Hard'),
    (22, 2005, 7, 22, ARRAY['Number Sense'], ARRAY['Fractions/Ratios'], 'C', 'Find the ratio of apples to lemons given apples:oranges and oranges:lemons.', 'Hard'),
    (23, 2006, 7, 23, ARRAY['Number Sense'], ARRAY['Logic', 'Equations Solving', 'Digits'], 'D', 'Find the units digit of a sum using digits 0-6 exactly once in a 2-digit addition.', 'Hard'),
    (24, 2005, 7, 24, ARRAY['Algebra and Equations'], ARRAY['Fractions/Ratios', 'Equations Solving'], 'D', 'Find the speed ratio for two runners passing at the same three equidistant places.', 'Hard'),
    (25, 2023, 7, 25, ARRAY['Counting and Probability'], ARRAY['Counting', 'Graphs', 'Logic'], 'B', 'Find the sum of all possible percentage values k for students in shared activities.', 'Hard')
) AS v(practice_question_number, source_year, source_grade, source_question_number, primary_topics, secondary_topics, correct_answer, short_problem_summary, difficulty_band)
ON CONFLICT (practice_set_id, practice_question_number) DO UPDATE SET
    source_year = EXCLUDED.source_year,
    source_grade = EXCLUDED.source_grade,
    source_question_number = EXCLUDED.source_question_number,
    primary_topics = EXCLUDED.primary_topics,
    secondary_topics = EXCLUDED.secondary_topics,
    correct_answer = EXCLUDED.correct_answer,
    short_problem_summary = EXCLUDED.short_problem_summary,
    difficulty_band = EXCLUDED.difficulty_band;

-- ============================================
-- 3. Insert Solutions
-- ============================================
WITH questions AS (
    SELECT q.id, q.practice_question_number
    FROM gauss_questions q
    JOIN gauss_practice_sets ps ON q.practice_set_id = ps.id
    WHERE ps.set_code = 'G7gauss1'
)
INSERT INTO gauss_solutions (
    question_id,
    psg_solution_text,
    psg_solution_summary,
    psg_solution_image_url,
    detailed_solution_text,
    detailed_solution_image_url,
    detailed_solution_source_pdf,
    detailed_solution_page,
    detailed_solution_status,
    coaching_available,
    key_strategy,
    hint_1,
    hint_2,
    guided_steps,
    common_mistake,
    reflection_question
)
SELECT
    questions.id,
    v.psg_solution_text,
    v.psg_solution_summary,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    v.detailed_solution_status,
    v.coaching_available,
    v.key_strategy,
    v.hint_1,
    v.hint_2,
    NULL,
    v.common_mistake,
    NULL
FROM questions
JOIN (VALUES
    (1, 'Evaluating, (2 + 4 + 6) - (1 + 3 + 5) = 12 - 9 = 3.', 'Sum the numbers in each set of brackets first, then subtract.', 'not_available', false, NULL::text, NULL::text, NULL::text, NULL::text),
    (2, 'Calculating, 0.8 - 0.07 = 0.80 - 0.07 = 0.73.', 'Align decimal places by adding a placeholder zero before subtracting.', 'not_available', false, NULL, NULL, NULL, NULL),
    (3, 'Using a common denominator of 8, we have 1/2 + 1/4 + 1/8 = 4/8 + 2/8 + 1/8 = 7/8.', 'Find a common denominator of 8 to add the fractions.', 'not_available', false, NULL, NULL, NULL, NULL),
    (4, 'The equal-arm balance shows that 2 rectangles have the same mass as 6 circles. If we organize these shapes into two equal piles on both sides of the balance, then we see that 1 rectangle has the same mass as 3 circles.', 'Divide the quantity on both sides of the balance by 2.', 'not_available', false, NULL, NULL, NULL, NULL),
    (5, 'The cost of nine $1 items and five $2 items is (9 x $1) + (5 x $2), which is $9 + $10 or $19. The correct answer is (C). (We may check that each of the remaining four answers gives a cost that is less than $18.)', 'Calculate total costs for each option; 9($1) + 5($2) equals $19.', 'not_available', false, NULL, NULL, NULL, NULL),
    (6, 'Since PQ is a straight line, then x° + x° + x° + x° + x° = 180° or 5x = 180 or x = 36.', 'Divide the 180 degrees of a straight line by five.', 'not_available', false, NULL, NULL, NULL, NULL),
    (7, 'Since we are adding 1/3 seven times, the result is 7 × 1/3 = 7/3.', 'Recognize that repeated addition is multiplication: seven copies of 1/3 equals 7/3.', 'not_available', false, NULL, NULL, NULL, NULL),
    (8, 'The line segment with greatest length that joins two points on a circle is a diameter of the circle. Since the circle has a radius of 4 cm, then its diameter has length 2 x 4 cm = 8 cm, and so the greatest possible length of the line segment is 8 cm.', 'Identify that the diameter is the longest chord and is twice the radius.', 'not_available', false, NULL, NULL, NULL, NULL),
    (9, 'When the word BANK is viewed from the inside of the window, the letters appear in the reverse order and the letters themselves are all backwards, so the word appears as (D).', 'Apply a horizontal reflection to both the word order and individual letter shapes.', 'not_available', false, NULL, NULL, NULL, NULL),
    (10, 'In the table below, each of the five expressions is evaluated using the correct order of operations. The only expression that is equal to 17 is 3 + 4 x 5 - 6, or (C).', 'Evaluate expressions using BEDMAS, prioritizing the multiplication.', 'not_available', false, NULL, NULL, NULL, NULL),
    (11, 'Since 42 is an even number, then 2 is a factor of 42. Since 42 = 2 x 21 and 21 = 3 x 7, then 42 = 2 x 3 x 7. Each of 2, 3 and 7 is a prime number and each is a factor of 42. Thus, the sum of the prime factors of 42 is 2 + 3 + 7 = 12.', 'Factor 42 into primes (2, 3, 7) and sum them.', 'not_available', false, NULL, NULL, NULL, NULL),
    (12, 'Since the bamboo plant grows at a rate of 105 cm per day and there are 7 days from May 1st and May 8th, then it grows 7 x 105 = 735 cm in this time period. Since 735 cm = 7.35 m, then the height of the plant on May 8th is 2 + 7.35 = 9.35 m.', 'Calculate total growth in cm, convert to meters, and add to the initial height.', 'not_available', false, NULL, NULL, NULL, NULL),
    (13, 'The mean of 5 consecutive integers is equal to the number in the middle. Since the numbers have a mean of 21... the numbers are 21 - 2, 21 - 1, 21, 21 + 1, 21 + 2. The smallest... is 19.', 'Use the property that the middle term of five consecutive integers is the mean.', 'not_available', false, NULL, NULL, NULL, NULL),
    (14, 'On the spinner given, the prime numbers that are odd are 3, 5 and 7. Since the spinner is divided into 8 equal sections, the probability that the arrow stops in a section containing a prime number that is odd is 3/8.', 'Count the odd prime sections (3, 5, 7) and divide by the total number of sections.', 'not_available', false, NULL, NULL, NULL, NULL),
    (15, 'The list contains 5 numbers. The average is 6, so the sum of the 5 numbers is 5 x 6 = 30. That is, 2 + 9 + 4 + n + 2n = 30 or 15 + 3n = 30, and so 3n = 15 or n = 5.', 'Set the sum of the list equal to the average multiplied by the count of terms.', 'not_available', false, NULL, NULL, NULL, NULL),
    (16, 'There are 8 possible outcomes: HHH, HHT, HTH, THH, HTT, THT, TTH, and TTT. Of these 8 outcomes, there are exactly 2 whose outcomes are all the same (HHH and TTT). Therefore, the probability... is 2/8 = 1/4.', 'Identify the 2 desired outcomes out of 8 total possible combinations.', 'not_available', false, NULL, NULL, NULL, NULL),
    (17, 'The number of SKs is 5/8 of the number of JKs. Since JKs is 128, the number of SKs is 5/8 x 128 = 80. The total number... is 128 + 80 = 208.', 'Determine the number of students in the second group using the ratio and sum both groups.', 'not_available', false, NULL, NULL, NULL, NULL),
    (18, 'Since AB = CA and BM = MC, half of the perimeter of ABC is AB + BM = 32. The perimeter of ABM is AM + AB + BM = 40. Since AB + BM = 32, then AM = 40 - 32 = 8.', 'Use symmetry to relate the semi-perimeter of the large triangle to the side sum of the smaller triangle.', 'not_available', false, NULL, NULL, NULL, NULL),
    (19, 'In one day there are 24 x 3600 = 86,400 seconds. Therefore, 10^6 seconds is equal to 10^6 / 86,400 ≈ 11.574 days, which of the given choices is closest to 10 days.', 'Convert seconds to days to compare with the given multiple-choice options.', 'not_available', false, NULL, NULL, NULL, NULL),
    (20, 'One possible way... is to reflect the grid in the vertical line... and then rotate the grid 90° counterclockwise... Applying these transformations to the grid containing the A, we obtain (B).', 'Identify the sequence of reflection and rotation and apply them to the new letter grid.', 'not_available', false, NULL, NULL, NULL, NULL),
    (21, 'We separate information: Alice owns more dogs than Kathy and Bruce; Kathy and Bruce own more cats than Alice. Bullet 2 and 3 show Alice owns the most dogs. Answer (D) must be true.', 'Organize the comparative statements into inequalities to find the definite conclusion.', 'not_available', false, NULL, NULL, NULL, NULL),
    (22, 'Assuming 20 oranges: ratio of apples to oranges is 1:4 (so 5 apples); ratio of oranges to lemons is 5:2 (so 8 lemons). Ratio of apples to lemons is 5:8.', 'Select a common multiple for the shared quantity (oranges) to calculate the external ratio.', 'not_available', false, NULL, NULL, NULL, NULL),
    (23, 'Sum cannot be 200+, so E=1. Logical checks show A+C must be 10 (4 and 6). Remaining digits (2, 3, 5) mean the units digit G must be 5. (Example: 42 + 63 = 105).', 'Use logical elimination based on place value constraints and the available digits.', 'not_available', false, NULL, NULL, NULL, NULL),
    (24, 'Since they pass at the same three places, the places are equally spaced at 1/3 track intervals. Beryl must run 2/3 of the track while Alphonse runs 1/3 in the opposite direction. Ratio is 2:1.', 'Translate equidistant meeting points into relative distances traveled by each runner.', 'not_available', false, NULL, NULL, NULL, NULL),
    (25, 'Represent in a Venn diagram. Total students n must be a multiple of 10. Solving for possible values of n and checking integer constraints on variables x, y, z reveals k can be 90, 40, 30, 15, 10. Sum = 185.', 'Use a Venn diagram and divisibility rules to bound and test the possible integer solutions.', 'not_available', false, NULL, NULL, NULL, NULL)
) AS v(practice_question_number, psg_solution_text, psg_solution_summary, detailed_solution_status, coaching_available, key_strategy, hint_1, hint_2, common_mistake)
ON questions.practice_question_number = v.practice_question_number
ON CONFLICT (question_id) DO UPDATE SET
    psg_solution_text = EXCLUDED.psg_solution_text,
    psg_solution_summary = EXCLUDED.psg_solution_summary,
    detailed_solution_status = EXCLUDED.detailed_solution_status,
    coaching_available = EXCLUDED.coaching_available,
    key_strategy = EXCLUDED.key_strategy,
    hint_1 = EXCLUDED.hint_1,
    hint_2 = EXCLUDED.hint_2,
    common_mistake = EXCLUDED.common_mistake;
