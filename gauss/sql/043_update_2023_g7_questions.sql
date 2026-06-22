-- Update 2023 Grade 7 questions with visual descriptions and question text
-- Run this in Supabase SQL Editor

-- Q2: visual_description
UPDATE gauss_source_questions
SET visual_description = 'A vertical bar graph titled "Daily Temperature" shows the temperature in °C for each day from Monday to Sunday. The x-axis is labelled "Day of the Week" with days Mon, Tue, Wed, Thu, Fri, Sat, Sun. The y-axis is labelled "Temperature (°C)" with marks at 0, 10, and 20. The bars show approximately: Monday 17°C, Tuesday 17°C, Wednesday 18°C, Thursday 21°C, Friday 25°C, Saturday 18°C, and Sunday 15°C. Friday has the tallest bar.',
    updated_at = NOW()
WHERE year = 2023 AND grade = 7 AND question_number = 2;

-- Q12: visual_description
UPDATE gauss_source_questions
SET visual_description = 'Square WXYZ is divided into a 10 by 10 grid of 100 identical small squares. Some squares are shaded grey and some are unshaded white. There are 72 shaded squares and 28 unshaded squares.',
    updated_at = NOW()
WHERE year = 2023 AND grade = 7 AND question_number = 12;

-- Q13: visual_description
UPDATE gauss_source_questions
SET visual_description = 'A coordinate grid shows three vertices of a rectangle at (2, 1), (4, 1), and (2, 5).',
    updated_at = NOW()
WHERE year = 2023 AND grade = 7 AND question_number = 13;

-- Q21: visual_description
UPDATE gauss_source_questions
SET visual_description = 'An eight-sided polygon ABCDEFGH is shown. It is made from a square ABCD and a smaller rectangle EFGH. The square ABCD is on the right, with A at the top-left, B at the top-right, C at the bottom-right, and D at the bottom-left. The rectangle EFGH is attached to the left side of the square along part of side AD. Points E and H lie on side AD, with E below H. The rectangle extends left from segment EH, with F to the left of E and G to the left of H. The outside boundary of the polygon goes A → B → C → D → E → F → G → H → A.',
    updated_at = NOW()
WHERE year = 2023 AND grade = 7 AND question_number = 21;

-- Q22: question_text
UPDATE gauss_source_questions
SET question_text = 'A Gareth sequence is a sequence of numbers in which each number after the second is the non-negative difference between the two previous numbers. For example, if a Gareth sequence begins 15, 12, then

the third number in the sequence is 15 − 12 = 3,
the fourth number is 12 − 3 = 9,
the fifth number is 9 − 3 = 6,

and so the resulting sequence is 15, 12, 3, 9, 6, ... . If a Gareth sequence begins 10, 8, what is the sum of the first 30 numbers in the sequence?',
    updated_at = NOW()
WHERE year = 2023 AND grade = 7 AND question_number = 22;

-- Q24: question_text and visual_description
UPDATE gauss_source_questions
SET question_text = 'A circle is divided into six equal sections. Each section is to be coloured with a single colour so that three sections are red, one is blue, one is green, and one is yellow. Two circles have the same colouring if one can be rotated to match the other. In the diagram, Figure 1 and Figure 2 have the same colouring, while Figure 1 and Figure 3 have different colourings. How many different colourings are there for the circle?',
    visual_description = 'A diagram shows three circles, labelled Figure 1, Figure 2, and Figure 3. Each circle is divided into six equal sectors and coloured using exactly three red sectors, one blue sector, one green sector, and one yellow sector. In Figure 1, the three red sectors are adjacent to one another, followed around the circle by the blue, green, and yellow sectors. Figure 2 has the same arrangement of colours as Figure 1, but rotated, so it represents the same colouring. Figure 3 also has three adjacent red sectors, but the blue, green, and yellow sectors are in a different clockwise order, so it cannot be rotated to match Figure 1.',
    updated_at = NOW()
WHERE year = 2023 AND grade = 7 AND question_number = 24;

-- Q25: question_text
UPDATE gauss_source_questions
SET question_text = 'A school trip offered its participants three activities: hiking, canoeing and swimming. Attendance records show that of all participants

10 students participated in all three activities,
50% participated in at least hiking and canoeing,
60% participated in at least hiking and swimming,
k% participated in at least canoeing and swimming, and
no students participated in fewer than two activities.

If k is a positive integer, what is the sum of all possible values of k?',
    updated_at = NOW()
WHERE year = 2023 AND grade = 7 AND question_number = 25;

-- Verify updates
SELECT question_number,
       LEFT(question_text, 50) as question_preview,
       LEFT(visual_description, 50) as visual_preview
FROM gauss_source_questions
WHERE year = 2023 AND grade = 7 AND question_number IN (2, 12, 13, 21, 22, 24, 25)
ORDER BY question_number;
