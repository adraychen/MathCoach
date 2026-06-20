-- Update 2024 Grade 7 questions in gauss_source_questions
-- Run this in Supabase SQL Editor

UPDATE gauss_source_questions
SET question_text = 'Students at Gauss Middle School were asked to choose their favourite school day. The results are shown in the circle graph. Which day was chosen by exactly one-quarter of the students?',
    visual_type = 'pie_chart',
    visual_description = 'A pie chart shows favourite school days: Monday 15%, Tuesday 10%, Wednesday 25%, Thursday 20%, and Friday 30%.'
WHERE year = 2024 AND grade = 7 AND question_number = 4;

UPDATE gauss_source_questions
SET question_text = 'Katie completed two laps of a track without stopping. The first lap took 3 minutes and 45 seconds, and the second lap took 4 minutes and 35 seconds. What was her total time?',
    visual_type = 'none',
    visual_description = null
WHERE year = 2024 AND grade = 7 AND question_number = 7;

UPDATE gauss_source_questions
SET question_text = 'The sequence of the five symbols ○ ◀ ⊠ △ ★ repeats to form the pattern:
○ ◀ ⊠ △ ★ ○ ◀ ⊠ △ ★ · · ·
If the pattern is continued, the 23rd symbol in the pattern is',
    visual_type = 'pattern_diagram',
    visual_description = 'A repeating pattern of five symbols is shown: open circle, black left-pointing triangle, square with an X inside, open triangle, black star. The sequence repeats in that order.'
WHERE year = 2024 AND grade = 7 AND question_number = 8;

UPDATE gauss_source_questions
SET question_text = 'Eloise purchased a number of water hand pumps to give to a charity. The mean (average) price was $85 per water pump. If Eloise spent a total of $765, how many water pumps did she purchase?',
    visual_type = 'none',
    visual_description = null
WHERE year = 2024 AND grade = 7 AND question_number = 13;

UPDATE gauss_source_questions
SET question_text = 'Brett and Juanita each have a glass containing 300 mL of water. Brett pours half of his water out and then Juanita pours 20% of her water into Brett''s glass. What volume of water is now in Brett''s glass?',
    visual_type = 'none',
    visual_description = null
WHERE year = 2024 AND grade = 7 AND question_number = 16;

UPDATE gauss_source_questions
SET question_text = 'A circular spinner is divided into 12 identical unshaded sections and 3 identical shaded sections, as shown. Each unshaded section is 3 times the size of each shaded section. An arrow is attached to the centre of the spinner. The arrow is spun once. What is the probability that the arrow stops in a shaded section?',
    visual_type = 'shape_diagram',
    visual_description = 'A circular spinner has 12 identical larger unshaded sections and 3 identical smaller shaded sections. Each unshaded section is 3 times the size of each shaded section. An arrow is attached at the centre.'
WHERE year = 2024 AND grade = 7 AND question_number = 17;

UPDATE gauss_source_questions
SET question_text = 'The Gaussbot factory assembles robots. Each robot comes in one of three colours: red, blue, or green. Each robot also has a number stamped on its head: 1, 2,3, or 4. The nth robot assembled is the first robot to have the same colour and the same number as a previously assembled robot. What is the greatest possible value of n?',
    visual_type = 'none',
    visual_description = null
WHERE year = 2024 AND grade = 7 AND question_number = 18;

UPDATE gauss_source_questions
SET question_text = 'Five different integers in a list have a median of 10 and a range of 7. What is the smallest possible integer in the list?',
    visual_type = 'none',
    visual_description = null
WHERE year = 2024 AND grade = 7 AND question_number = 19;

UPDATE gauss_source_questions
SET question_text = 'A standing desk has 31 height settings, numbered from the lowest height, 1, to the highest height, 31. Since the desk is not working properly, when the up button is pressed, the desk goes up 6 settings at a time if possible, otherwise it does not move. When the down button is pressed, the desk goes down 4 settings at a time if possible, otherwise it does not move. If the desk starts at setting number 1, how many of the 31 settings will the desk be able to stop at?',
    visual_type = 'none',
    visual_description = null
WHERE year = 2024 AND grade = 7 AND question_number = 20;

UPDATE gauss_source_questions
SET question_text = 'Five different integers are selected from 1 to 6 and one integer is placed into each of the five squares shown. The integers are placed so that the sum of the three integers in the vertical column is 7, and the sum of the three integers in the horizontal row is 11. Which integer does not appear in any square?',
    visual_type = 'grid_diagram',
    visual_description = 'Five squares form a cross shape: a vertical column of three squares and a horizontal row of three squares sharing the same centre square.'
WHERE year = 2024 AND grade = 7 AND question_number = 21;

UPDATE gauss_source_questions
SET question_text = 'In the diagram, 17 toothpicks are used to make a 2 by 3 grid of squares. Of the toothpicks used, 10 are outer toothpicks and 7 are inner toothpicks. Suppose that toothpicks are used to make a 20 by 24 grid of squares. To the nearest percent, what percentage of toothpicks used are inner toothpicks?',
    visual_type = 'grid_diagram',
    visual_description = 'A 2 by 3 rectangular grid of squares made from toothpicks is shown. The diagram distinguishes the idea of outer boundary toothpicks and inner shared toothpicks.'
WHERE year = 2024 AND grade = 7 AND question_number = 22;

UPDATE gauss_source_questions
SET question_text = 'A rectangular prism has integer edge lengths and has a volume of V. The six faces of the prism are painted and then the prism is cut into 1 by 1 by 1 cubes. Of these cubes, 50 cubes have no paint on them. What is the mean (average) of all possible values of V?',
    visual_type = 'none',
    visual_description = null
WHERE year = 2024 AND grade = 7 AND question_number = 23;

UPDATE gauss_source_questions
SET question_text = 'A three-digit integer is an integer from 100 to 999, inclusive. A three-digit integer is called Tiny if no rearrangement of its digits gives a three-digit integer that is smaller. For example, 138, 207 and 566 are Tiny, but 452, 360 and 727 are not. How many three-digit integers are Tiny?',
    visual_type = 'none',
    visual_description = null
WHERE year = 2024 AND grade = 7 AND question_number = 24;

UPDATE gauss_source_questions
SET question_text = 'Suppose that w, x, y, z, (x + y), (x + z), (234 + z), and (234 − z) are 8 different prime numbers. If w + x + y = 234, and each of y and z is less than 50, the value of w − y is',
    visual_type = 'none',
    visual_description = null
WHERE year = 2024 AND grade = 7 AND question_number = 25;

-- Verify updates
SELECT question_number, question_text, visual_type, visual_description
FROM gauss_source_questions
WHERE year = 2024 AND grade = 7 AND question_number IN (4, 7, 8, 13, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25)
ORDER BY question_number;
