-- Update question_text for 2025 Grade 7 questions in gauss_source_questions
-- Run this in Supabase SQL Editor

UPDATE gauss_source_questions
SET question_text = 'Sam has only one measuring container. The volume of this container is 1/2 cup. A recipe needs 2 1/2 cups of flour. How many times does Sam fill his 1/2 cup container to accurately measure the flour for this recipe?'
WHERE year = 2025 AND grade = 7 AND question_number = 8;

UPDATE gauss_source_questions
SET question_text = 'A train stops at Waterloo Station every 3 minutes. A bus stops at Waterloo Station every 5 minutes. A train and a bus both stop at Waterloo Station at 6:25 a.m. The next time that a train and a bus both stop at Waterloo Station at the same time is'
WHERE year = 2025 AND grade = 7 AND question_number = 12;

UPDATE gauss_source_questions
SET question_text = 'Each of the digits 7, 1, 3, 6, 8, and 2 is placed into one of the squares below to make an expression containing three 2-digit numbers: [Box][Box] + [Box][Box] - [Box][Box].
When the first two 2-digit numbers are added and the third is subtracted, the greatest possible result is'
WHERE year = 2025 AND grade = 7 AND question_number = 16;

UPDATE gauss_source_questions
SET question_text = 'Savanah tossed a fair coin some number of times and 50% of those tosses resulted in tails. She then tossed the coin one final time and the result was tails. If 60% of all tosses resulted in tails, how many tosses did she make in total?'
WHERE year = 2025 AND grade = 7 AND question_number = 17;

UPDATE gauss_source_questions
SET question_text = 'Ten students each receive a card numbered with a different integer from 10 to 19. The students are each given the checklist shown and they check off each box that describes their number. How many students check off exactly two boxes? [Checklist: Odd, Even, Prime, Composite, Perfect Square]'
WHERE year = 2025 AND grade = 7 AND question_number = 19;

UPDATE gauss_source_questions
SET question_text = 'Each of three doors is painted one colour: either black or white or gold. Each colour is equally likely to be chosen for each door. What is the probability that at least one colour is not used?'
WHERE year = 2025 AND grade = 7 AND question_number = 22;

UPDATE gauss_source_questions
SET question_text = 'Suppose a, b and c are the last three digits of the six-digit integer N = 111abc. If N is divisible by 18, how many possibilities are there for N?'
WHERE year = 2025 AND grade = 7 AND question_number = 23;

UPDATE gauss_source_questions
SET question_text = 'In the diagram, each row, each column, and each shape shown by the thick lines must contain the letters A, B, C, D, and E. If each square contains exactly one letter, what letter must be placed in the shaded square?'
WHERE year = 2025 AND grade = 7 AND question_number = 24;

UPDATE gauss_source_questions
SET question_text = 'In the diagram, ∠PQR is a straight angle. The value of x is'
WHERE year = 2025 AND grade = 7 AND question_number = 6;

UPDATE gauss_source_questions
SET question_text = 'In the diagram, ∠PQR = ∠QRS = ∠TPQ = 60 deg. Also, PT is parallel to SR and TS is parallel to QR. If PQ = 10 cm and TS = 6 cm, the perimeter of figure PQRST is'
WHERE year = 2025 AND grade = 7 AND question_number = 20;

UPDATE gauss_source_questions
SET question_text = 'Three circles have radii 1 cm, 5 cm, and x cm. If the mean (average) area of the three circles is 30π cm², the value of x is'
WHERE year = 2025 AND grade = 7 AND question_number = 21;

-- Verify updates
SELECT question_number, question_text
FROM gauss_source_questions
WHERE year = 2025 AND grade = 7 AND question_number IN (6, 8, 12, 16, 17, 19, 20, 21, 22, 23, 24)
ORDER BY question_number;
