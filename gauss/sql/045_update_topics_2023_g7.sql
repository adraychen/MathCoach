-- Update primary_topics and secondary_topics in gauss_questions for 2023 Grade 7
-- Run this in Supabase SQL Editor

UPDATE gauss_questions SET primary_topics = '{"Number Sense"}', secondary_topics = '{"Fractions/Ratios","Expressions"}'
WHERE source_year = 2023 AND source_grade = 7 AND source_question_number = 1;

UPDATE gauss_questions SET primary_topics = '{"Data Analysis"}', secondary_topics = '{"Counting","Graphs"}'
WHERE source_year = 2023 AND source_grade = 7 AND source_question_number = 2;

UPDATE gauss_questions SET primary_topics = '{"Number Sense","Algebra and Equations"}', secondary_topics = '{"Expressions","Fractions/Ratios","Rates","Counting"}'
WHERE source_year = 2023 AND source_grade = 7 AND source_question_number = 3;

UPDATE gauss_questions SET primary_topics = '{"Number Sense"}', secondary_topics = '{"Counting","Operations","Expressions"}'
WHERE source_year = 2023 AND source_grade = 7 AND source_question_number = 4;

UPDATE gauss_questions SET primary_topics = '{"Algebra and Equations","Number Sense"}', secondary_topics = '{"Operations","Exponents","Expressions"}'
WHERE source_year = 2023 AND source_grade = 7 AND source_question_number = 5;

UPDATE gauss_questions SET primary_topics = '{"Geometry and Measurement"}', secondary_topics = '{"Operations","Quadrilaterals","Perimeter","Polygons"}'
WHERE source_year = 2023 AND source_grade = 7 AND source_question_number = 6;

UPDATE gauss_questions SET primary_topics = '{"Number Sense"}', secondary_topics = '{"Fractions/Ratios","Operations","Expressions"}'
WHERE source_year = 2023 AND source_grade = 7 AND source_question_number = 7;

UPDATE gauss_questions SET primary_topics = '{"Geometry and Measurement"}', secondary_topics = '{"Circles","Measurement"}'
WHERE source_year = 2023 AND source_grade = 7 AND source_question_number = 8;

UPDATE gauss_questions SET primary_topics = '{"Counting and Probability"}', secondary_topics = '{"Counting","Probability"}'
WHERE source_year = 2023 AND source_grade = 7 AND source_question_number = 9;

UPDATE gauss_questions SET primary_topics = '{"Algebra and Equations","Other"}', secondary_topics = '{"Decimals","Percentages","Expressions"}'
WHERE source_year = 2023 AND source_grade = 7 AND source_question_number = 10;

UPDATE gauss_questions SET primary_topics = '{"Geometry and Measurement"}', secondary_topics = '{"Triangles","Angles","Equations Solving","Counting"}'
WHERE source_year = 2023 AND source_grade = 7 AND source_question_number = 11;

UPDATE gauss_questions SET primary_topics = '{"Number Sense","Geometry and Measurement"}', secondary_topics = '{"Percentages","Counting","Area","Quadrilaterals"}'
WHERE source_year = 2023 AND source_grade = 7 AND source_question_number = 12;

UPDATE gauss_questions SET primary_topics = '{"Geometry and Measurement"}', secondary_topics = '{"Coordinate Geometry","Quadrilaterals","Counting","Polygons"}'
WHERE source_year = 2023 AND source_grade = 7 AND source_question_number = 13;

UPDATE gauss_questions SET primary_topics = '{"Number Sense"}', secondary_topics = '{"Operations","Factoring","Prime Numbers"}'
WHERE source_year = 2023 AND source_grade = 7 AND source_question_number = 14;

UPDATE gauss_questions SET primary_topics = '{"Number Sense","Data Analysis"}', secondary_topics = '{"Averages","Expressions"}'
WHERE source_year = 2023 AND source_grade = 7 AND source_question_number = 15;

UPDATE gauss_questions SET primary_topics = '{"Number Sense","Algebra and Equations"}', secondary_topics = '{"Patterning/Sequences/Series","Expressions","Inequalities"}'
WHERE source_year = 2023 AND source_grade = 7 AND source_question_number = 16;

UPDATE gauss_questions SET primary_topics = '{"Geometry and Measurement"}', secondary_topics = '{"Polygons","Triangles","Area"}'
WHERE source_year = 2023 AND source_grade = 7 AND source_question_number = 17;

UPDATE gauss_questions SET primary_topics = '{"Geometry and Measurement"}', secondary_topics = '{"Volume","Prisms","Measurement"}'
WHERE source_year = 2023 AND source_grade = 7 AND source_question_number = 18;

UPDATE gauss_questions SET primary_topics = '{"Counting and Probability"}', secondary_topics = '{"Games","Counting","Probability","Fractions/Ratios"}'
WHERE source_year = 2023 AND source_grade = 7 AND source_question_number = 19;

UPDATE gauss_questions SET primary_topics = '{"Number Sense","Algebra and Equations"}', secondary_topics = '{"Equations Solving","Fractions/Ratios","Operations"}'
WHERE source_year = 2023 AND source_grade = 7 AND source_question_number = 20;

UPDATE gauss_questions SET primary_topics = '{"Geometry and Measurement"}', secondary_topics = '{"Area","Perimeter","Measurement","Logic"}'
WHERE source_year = 2023 AND source_grade = 7 AND source_question_number = 21;

UPDATE gauss_questions SET primary_topics = '{"Data Analysis"}', secondary_topics = '{"Patterning/Sequences/Series","Counting","Operations"}'
WHERE source_year = 2023 AND source_grade = 7 AND source_question_number = 22;

UPDATE gauss_questions SET primary_topics = '{"Number Sense","Geometry and Measurement"}', secondary_topics = '{"Digits","Area","Prisms","Surface Area"}'
WHERE source_year = 2023 AND source_grade = 7 AND source_question_number = 23;

UPDATE gauss_questions SET primary_topics = '{"Counting and Probability"}', secondary_topics = '{"Counting","Circles"}'
WHERE source_year = 2023 AND source_grade = 7 AND source_question_number = 24;

UPDATE gauss_questions SET primary_topics = '{"Counting and Probability"}', secondary_topics = '{"Counting","Graphs","Logic"}'
WHERE source_year = 2023 AND source_grade = 7 AND source_question_number = 25;

-- Verify updates
SELECT source_question_number, primary_topics, secondary_topics
FROM gauss_questions
WHERE source_year = 2023 AND source_grade = 7
ORDER BY source_question_number;
