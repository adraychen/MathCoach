-- Update 2025 Grade 8 questions (Q1, Q20, Q21) in gauss_source_questions
-- Run this in Supabase SQL Editor

UPDATE gauss_source_questions
SET question_text = 'In the diagram, how many of the 24 circles are shaded?',
    visual_description = 'A diagram of 24 circles arranged in 4 rows and 6 columns. In each row, 3 of the 6 circles are shaded and 3 are unshaded. The shaded circles are arranged so that exactly half of the circles in the whole diagram are shaded.'
WHERE year = 2025 AND grade = 8 AND question_number = 1;

UPDATE gauss_source_questions
SET question_text = 'In the diagram, each of a, b and c is greater than zero. Which of the following expressions is not equal to the perimeter of this polygon?',
    visual_description = 'A rectilinear polygon with six sides and all angles equal to 90°. Starting at the top-left vertex and moving clockwise: the top side goes horizontally right, the right side goes vertically down and is labelled a, the next side goes horizontally left, the next side goes vertically down and is labelled b, the bottom side goes horizontally left and is labelled c, and the left side goes vertically up back to the starting point. Matching tick marks show that the top horizontal side is equal in length to the bottom horizontal side labelled c. Matching tick marks also show that the middle horizontal side is equal in length to these two sides. The vertical sides labelled a and b are separate side lengths used in the perimeter expressions.'
WHERE year = 2025 AND grade = 8 AND question_number = 20;

UPDATE gauss_source_questions
SET question_text = 'In the diagram, each letter from A to H is equal to a different integer from 1 to 8. Also,
H is a perfect square and is 1 more than D
5 and 8 are in the same row
C is a multiple of both G and D
B is the largest prime number in the set
The value of B + G is even

A E
B F
C G
D H

What is the value of F?'
WHERE year = 2025 AND grade = 8 AND question_number = 21;

-- Verify updates
SELECT question_number, question_text, visual_description
FROM gauss_source_questions
WHERE year = 2025 AND grade = 8 AND question_number IN (1, 20, 21)
ORDER BY question_number;
