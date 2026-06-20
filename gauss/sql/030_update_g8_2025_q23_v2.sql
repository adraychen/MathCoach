-- Update 2025 Grade 8 Q23 official_solution in gauss_source_questions
-- Run this in Supabase SQL Editor

UPDATE gauss_source_questions
SET official_solution = 'Solution 1

Let the last three digits of n be abc. That is, n has units digit c, tens digit b and hundreds digit a.

(By the end of this solution, we will have demonstrated why considering only the last three digits of n was sufficient.)

The units digit of the product 2013 × n is equal to the units digit of 3 × c.

Multiplication setup:

2013 × abc = ...2025

This means that the product must have units digit 5, tens digit 2, hundreds digit 0, and thousands digit 2.

Since the units digit of the product 2013 × n is 5, then the units digit of 3 × c is 5, and so c = 5.

(You should confirm for yourself that this is the only possible value of c.)

Known partial product:

2013 × 5 = 10 065

Continuing the long multiplication, the tens digit of n is b, and so the tens digit of 2013 × n is equal to the units digit of 6 + 3b, as shown.

Column focus for the tens digit:

From 2013 × 5 = 10 065, the carry into the tens column is 6.

The tens digit b contributes the units digit of 3b to the tens column.

Therefore, the tens digit of 2013 × n is the units digit of 6 + 3b.

Since the units digit of 6 + 3b is 2, then the units digit of 3b is 6, and so b = 2.

(You should confirm for yourself that this is the only possible value of b.)

The multiplication completed to this point is shown below.

2013 × 25 = 50 325

We have determined that the last two digits of the product 2013 × n are 25 exactly when the last two digits of n are 25.

Continuing the long multiplication, the hundreds digit of n is a, and so the hundreds digit of 2013 × n is equal to the units digit of 1 + 0 + 2 + 3a (the 1 is the "carry" from the tens column).

Column focus for the hundreds digit:

From the multiplication completed so far, the carry from the tens column is 1.

The hundreds column receives contributions represented by:

1 + 0 + 2 + 3a

This simplifies to 3 + 3a.

Since the units digit of 3 + 3a is 0, then the units digit of 3a is 7, and so a = 9.

(You should confirm that this is the only possible value of a.)

The last three digits of 2013 × n are 025 exactly when the last three digits of n are 925 (that is, a = 9, b = 2, c = 5 are the only possibilities for a, b, c).

The multiplication completed to this point is shown below.

2013 × 925 = 1 862 025

This shows that when n = 925, the last four digits of the product 2013 × n are 2025, as required.

Adding additional digits to n will increase the value of n, and since we are asked for the smallest possible value of n, we stop here.

Thus, the smallest possible value of n for which 2013 × n has last four digits 2025, is n = 925, and so the sum of the digits of n is 9 + 2 + 5 = 16.

Solution 2

We begin by showing that every positive integer having last two digits 25 is a multiple of 25.

(It is worth noting that it is not true that every multiple of 25 has last two digits 25.)

All positive integers whose last two digits are 25, are 25 more than some non-negative multiple of 100.

That is, all positive integers whose last two digits are 25 can be expressed as 100k + 25 for some integer k ≥ 0.

Since 100k is divisible by 25, and 25 is divisible by 25, then 100k + 25 is divisible by 25.

Thus, every positive integer whose last two digits are 25 is a multiple of 25, and so 2013 × n is a multiple of 25.

Since 2013 = 3 × 11 × 61 does not have a prime factor of 5, then 2013 × n is a multiple of 25 exactly when n is a multiple of 25.

The last two digits of 2013 × n are equal to the two-digit number formed by the last two digits of the product of 13 and the last two digits of n.

What are the last two digits of n? Since n is a multiple of 25, then the last two digits of n could be 25, 50, 75, or 00.

(You should confirm that these are the only possibilities.)

Thus, the last two digits of 2013 × n are equal to the last two digits of 13 × 25 or 13 × 50 or 13 × 75 or 13 × 00, which are 25, 50, 75, and 00 respectively.

Since we require the last two digits of 2013 × n to be 25, then the last two digits of n are 25.

We have reduced the problem to finding the smallest value of the positive integer n with last two digits 25 so that the last four digits of 2013 × n are 2025.

We substitute n = 25, 125, 225, 325, 425, ..., and so on, in turn, into the product 2013 × n.

Evaluating these products, we determine that 2013 × 925 = 1 862 025 is the first time that the last four digits of 2013 × n are 2025.

Thus, the smallest possible value of n for which 2013 × n has last four digits 2025 is n = 925, and the sum of the digits of n is 9 + 2 + 5 = 16.'
WHERE year = 2025 AND grade = 8 AND question_number = 23;

-- Verify update
SELECT question_number, official_solution
FROM gauss_source_questions
WHERE year = 2025 AND grade = 8 AND question_number = 23;
