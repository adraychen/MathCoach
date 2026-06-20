-- Update 2024 Grade 8 official_solution (Q16, Q17, Q19, Q21, Q23) in gauss_source_questions
-- Run this in Supabase SQL Editor

UPDATE gauss_source_questions
SET official_solution = 'Before the hole was drilled, the volume of the block of wood was 4 cm × 4 cm × 7 cm = 112 cm³. The cylindrical hole has radius 1 cm and height equal to that of the block of wood, 7 cm. The volume of the cylindrical hole is thus π × (1 cm)² × 7 cm = 7π cm³. In cm³, the volume of the block of wood after the hole is drilled is 112 − 7π ≈ 90.01, which when rounded to the nearest cm³, is 90 cm³.'
WHERE year = 2024 AND grade = 8 AND question_number = 16;

UPDATE gauss_source_questions
SET official_solution = 'There are 3 different colours and 4 different numbers, and therefore 3 × 4 = 12 different kinds of robots that may be assembled. (These are R1, R2, R3, R4, B1, B2, B3, B4, G1, G2, G3, G4, where R, B, G represent the 3 colours red, blue, green.)

Since there are 12 different kinds of robots, it is possible that the first 12 robots assembled are all different from one another.

In this case, the 13th robot assembled would be the first robot to have the same colour and the same number as a previously assembled robot, and thus the greatest possible value of n is 13.'
WHERE year = 2024 AND grade = 8 AND question_number = 17;

UPDATE gauss_source_questions
SET official_solution = 'We work backward from each of the given choices. Since we are asked to find the smallest possible integer in the list, we begin with the smallest of the five choices, 39.

If the smallest integer in the list is 39, then the largest integer in the list is 39 + 14 = 53 (since the three integers have a range of 14).

If the three integers have a mean of 50, then they have a sum of 50 × 3 = 150. Two of the integers are 39 and 53, and so the third (the middle) integer is 150 − 39 − 53 = 58.

Since 58 is greater than 53, this is not possible (the range of these three integers is 58 − 39 = 19, not 14).

If the smallest integer in the list is 40, then the largest integer in the list is 40 + 14 = 54. The third integer is 150 − 40 − 54 = 56. Since 56 is greater than 54, this is not possible.

If the smallest integer in the list is 41, then the largest integer in the list is 41 + 14 = 55. The third integer is 150 − 41 − 55 = 54.

We may confirm that the three integers 41, 54, 55 indeed have a range of 14 and a mean of 50.

Therefore, the smallest possible integer in the list is 41.'
WHERE year = 2024 AND grade = 8 AND question_number = 19;

UPDATE gauss_source_questions
SET official_solution = 'Expressing the product 6 × 5 × 4 × 3 × 2 × 1 in terms of prime factors, we get 6 × 5 × 4 × 3 × 2 × 1 = (2 × 3) × 5 × (2 × 2) × 3 × 2.

This product has 4 factors of 2, 2 factors of 3, and 1 factor of 5, and thus is equal to 2⁴ × 3² × 5¹.

The value of a + b + c is 4 + 2 + 1 = 7.'
WHERE year = 2024 AND grade = 8 AND question_number = 21;

UPDATE gauss_source_questions
SET official_solution = 'The smallest five positive integers, each having a divisor of d, are d, 2d, 3d, 4d, and 5d.

Thus, the smallest possible sum of five different positive integers whose greatest common divisor is d is d + 2d + 3d + 4d + 5d = 15d.

We know that the sum is at least 15d and is equal to 264, which means that 15d ≤ 264, and so d ≤ 264 / 15 or d ≤ 17.6.

Each of the five integers is divisible by d, and so the sum of the five integers, 264, is divisible by d.

Thus, we want the largest possible divisor of 264 that is less than or equal to 17.

Since 264 = 2³ × 3 × 11, the divisors of 264 that are less than or equal to 17 are: 1, 2, 3, 4, 6, 8, 11, and 12, and so the largest possible value of d is 12.

The sum of the digits of the largest possible value of d is 1 + 2 = 3.

(We note that 12, 24, 36, 48, and 144 are five such integers whose greatest common divisor is 12 and whose sum is 264.)'
WHERE year = 2024 AND grade = 8 AND question_number = 23;

-- Verify updates
SELECT question_number, official_solution
FROM gauss_source_questions
WHERE year = 2024 AND grade = 8 AND question_number IN (16, 17, 19, 21, 23)
ORDER BY question_number;
