-- Update 2024 Grade 7 official_solution (Q18-Q25) in gauss_source_questions
-- Run this in Supabase SQL Editor

UPDATE gauss_source_questions
SET official_solution = 'There are 3 different colours and 4 different numbers, and therefore 3 × 4 = 12 different kinds of robots that may be assembled. (These are R1, R2, R3, R4, B1, B2, B3, B4, G1, G2, G3, G4, where R, B, G represent the 3 colours red, blue, green.)

Since there are 12 different kinds of robots, it is possible that the first 12 robots assembled are all different from one another.

In this case, the 13th robot assembled would be the first robot to have the same colour and the same number as a previously assembled robot, and thus the greatest possible value of n is 13.

Notes:
(i) It is possible that the first duplicate occurs earlier, but we want the latest that it can occur.
(ii) There must be a duplicate robot among the first 13 assembled, and so n < 14.
(iii) This solution makes use of the Pigeonhole principle – a concept worth further investigation.'
WHERE year = 2024 AND grade = 7 AND question_number = 18;

UPDATE gauss_source_questions
SET official_solution = 'Consider the following list of 5 integers, ordered from smallest to largest, and having a median of 10: a, b, 10, c, d.

Since a is the smallest integer in the list and d is the largest, and the list has a range of 7, then d is 7 more than a.

Since a and d differ by 7, then to find the smallest possible value of a, we can find the smallest possible value of d and subtract 7.

The 5 integers in the list are different from one another, and so the smallest possible value of c is 11 (c must be greater than the median 10), and the smallest possible value of d is thus 12.

Since d is 7 more than a, then the smallest possible integer in the list is 12 − 7 = 5.

(We note that 5, b, 10, 11, 12, where b is greater than 5 and less than 10, is such a list.)'
WHERE year = 2024 AND grade = 7 AND question_number = 19;

UPDATE gauss_source_questions
SET official_solution = 'Beginning at height 1 and moving up 6 settings at a time, the desk can stop at settings 7, 13, 19, 25, and 31.

Beginning at height 31 and moving down 4 settings at a time, the desk can stop at settings 27, 23, 19, 15, 11, 7, and 3.

The desk originally begins at an odd-numbered height, 1.

Moving up 6 settings at a time, the desk can stop at only odd-numbered heights (since an even number added to an odd number is odd).

Similarly, moving down 4 settings at a time, the desk can stop at only odd-numbered heights.

Thus, it is not possible for the desk to stop at an even-numbered setting.

To this point, we have shown that the desk is able to stop at the settings 1, 3, 7, 11, 13, 15, 19, 23, 25, 27, 31, and is not able to stop at even-numbered settings.

Next, we will show that it is possible for the desk to stop at the remaining odd-numbered settings, 5, 9, 17, 21, and 29.

Since the desk can stop at setting 13, then it can stop at settings 9 and 5 with one and two presses of the down button, respectively.

Similarly, since the desk can stop at setting 25, then it can stop at settings 21 and 17.

Finally, since the desk can stop at setting 23, then one press of the up button will take the desk to setting 29.

The desk can stop at all odd-numbered settings from 1 to 31 inclusive, and thus is able to stop at 16 different settings.'
WHERE year = 2024 AND grade = 7 AND question_number = 20;

UPDATE gauss_source_questions
SET official_solution = 'The three different integers selected from 1 to 6 and whose sum is 7 must be the integers 1, 2, 4. Thus, the vertical column contains the integers 1, 2, 4 in some order.

(Can you see why no other combination of three of the given integers has a sum of 7?)

The three different integers selected from 1 to 6 and whose sum is 11 must be 1, 4, 6 or 2, 4, 5 or 2, 3, 6.

If the integers in the horizontal row are 1, 4, 6, then there are two integers in common with those in the vertical column, namely 1 and 4.

Since there have to be five different integers used in the squares, then there cannot be two integers in common between the two lists, and so 1, 4, 6 cannot appear in the horizontal row.

Similarly, 2, 4, 5 cannot appear in the horizontal row.

Thus, the horizontal row must contain the integers 2, 3, 6 with 2 appearing in the centre square since it is the integer in common between the two lists.

The integer not appearing in any square is 5.'
WHERE year = 2024 AND grade = 7 AND question_number = 21;

UPDATE gauss_source_questions
SET official_solution = 'We begin by determining the number of inner toothpicks used to make a 20 by 24 grid of squares.

A grid containing 20 rows has 19 horizontal lines of inner toothpicks, each of which contains 24 toothpicks (since there are 24 columns).

Thus, the number of inner toothpicks positioned horizontally is 19 × 24 = 456.

A grid containing 24 columns has 23 vertical lines of inner toothpicks, each of which contains 20 toothpicks (since there are 20 rows).

Thus, the number of inner toothpicks positioned vertically is 23 × 20 = 460.

In total, there are 456 + 460 = 916 inner toothpicks.

Next, we determine the total number of toothpicks used to make a 20 by 24 grid of squares.

There are 21 horizontal lines of toothpicks, each of which contains 24 toothpicks.

There are 25 vertical lines of toothpicks, each of which contains 20 toothpicks.

Thus, there are a total of 21 × 24 + 25 × 20 = 1004 toothpicks used to make a 20 by 24 grid.

(Alternately, we could have determined that there are 88 outer toothpicks, and so there are 916 + 88 = 1004 toothpicks in total.)

The percentage of inner toothpicks used is 916/1004 × 100%, which is 91% when rounded to the nearest percent.'
WHERE year = 2024 AND grade = 7 AND question_number = 22;

UPDATE gauss_source_questions
SET official_solution = 'All six faces of the prism are painted which means that the 1 by 1 by 1 cubes in the interior of the prism are the only cubes that have no paint on them.

Each of the three dimensions of the prism (length, width, height) must be at least 3, otherwise there are no 1 by 1 by 1 cubes without paint on them.

The set of interior 1 by 1 by 1 cubes must also be in the shape of a rectangular prism.

(You should confirm each of these last two sentences for yourself before reading on.)

There are 50 interior 1 by 1 by 1 cubes, and so the volume of the interior prism is 50.

Thus, we are looking for three positive integers, representing the length, width and height of the interior prism, whose product is 50.

We may use the positive divisors of 50 (1, 2, 5, 10, 25, 50) to help identify the four possibilities: 1 × 1 × 50, 1 × 2 × 25, 1 × 5 × 10, and 2 × 5 × 5.

These are the only ways to express 50 as the product of three positive integers.

Next, we determine the dimensions of the original prisms given each set of dimensions for the interior prisms.

Consider the interior prism with dimensions 1 × 1 × 50.

Recall that this is the prism that remains after all exterior (painted) cubes are removed.

That is, 1 by 1 by 1 cubes have been removed from the top and bottom of the 1 × 1 × 50 interior prism, from the left and right sides, as well as from the two ends (the front and back).

This means that the dimensions of the original prism are each 2 greater than the dimensions of the interior prism. (You should try to visualize this.)

We complete the following table to determine the dimensions and the volume of the original prism in each case.

Interior prism dimensions | Original prism dimensions | Volume of original prism
1 × 1 × 50 | 3 × 3 × 52 | V = 3 × 3 × 52 = 468
1 × 2 × 25 | 3 × 4 × 27 | V = 3 × 4 × 27 = 324
1 × 5 × 10 | 3 × 7 × 12 | V = 3 × 7 × 12 = 252
2 × 5 × 5 | 4 × 7 × 7 | V = 4 × 7 × 7 = 196

Therefore, the mean of all possible values of V is (468 + 324 + 252 + 196) / 4 = 1240 / 4 = 310.'
WHERE year = 2024 AND grade = 7 AND question_number = 23;

UPDATE gauss_source_questions
SET official_solution = 'Each Tiny three-digit integer belongs to exactly one of the following three cases.

Case 1: The units digit is 0

If the units digit of a Tiny integer is 0, then the tens digit must also be 0, otherwise, the units digit and tens digit can be switched to give a smaller integer.

In this case, there are no restrictions on the hundreds digit and thus there are 9 such Tiny integers. These are: 100, 200, 300, 400, 500, 600, 700, 800, 900.

Case 2: The units digit is not 0, but the tens digit is 0

If the hundreds digit is x and the units digit is z, then the integers in this case are of the form x0z, where z ≠ 0. (If x is greater than z, then switching x and z creates a smaller integer.)

Integers of this form are Tiny exactly when x is greater than or equal to 1, and x is less than or equal to z. If x = 1, then z can be equal to any integer from 1 to 9 inclusive, and so there are 9 such Tiny integers. These are: 101, 102, 103, ..., 108, 109.

If x = 2, then z can be equal to any integer from 2 to 9 inclusive, and so there are 8 such Tiny integers. These are: 202, 203, 204, ..., 208, 209.

Continuing in this way, there are 7 Tiny integers when x = 3, 6 when x = 4, 5 when x = 5, 4 when x = 6, 3 when x = 7, 2 when x = 8, and finally 1 when x = 9.

In this case, there are 9 + 8 + 7 + 6 + 5 + 4 + 3 + 2 + 1 = 45 Tiny integers.

Case 3: The units digit and the tens digit are both not 0

If the hundreds digit is x (where x is greater than or equal to 1), the tens digit is y, and the units digit is z, then the integers in this case are of the form xyz. Integers of this form are Tiny exactly when x is less than or equal to y, and y is less than or equal to z.

For x = 1, we count the number of such Tiny integers in the table that follows.

Value of x | Value of y | Possible values of z | Number of Tiny integers
x = 1 | y = 1 | z = 1, 2, 3, 4, ..., 9 | 9
x = 1 | y = 2 | z = 2, 3, 4, ..., 9 | 8
x = 1 | y = 3 | z = 3, 4, ..., 9 | 7
...
x = 1 | y = 8 | z = 8, 9 | 2
x = 1 | y = 9 | z = 9 | 1

When x = 1, there are 9 + 8 + 7 + 6 + 5 + 4 + 3 + 2 + 1 = 45 Tiny integers in this case.

For x = 2, we may similarly count the number of Tiny integers.

Value of x | Value of y | Possible values of z | Number of Tiny integers
x = 2 | y = 2 | z = 2, 3, 4, ..., 9 | 8
x = 2 | y = 3 | z = 3, 4, ..., 9 | 7
x = 2 | y = 4 | z = 4, ..., 9 | 6
...
x = 2 | y = 8 | z = 8, 9 | 2
x = 2 | y = 9 | z = 9 | 1

When x = 2, there are 8 + 7 + 6 + 5 + 4 + 3 + 2 + 1 = 36 Tiny integers in this case.

Notice that for each increase in the value of x by 1, the smallest possible value of y increases by 1 (to match the value of x), and so the smallest possible value of z also increases by 1 (to match the value of y).

This means that when x = 3, for example, the number of Tiny integers in the first row of the corresponding table is 1 less than the first row of the table for x = 2, and thus is 7.

That is, when x = 3, there are 7 + 6 + 5 + 4 + 3 + 2 + 1 = 28 Tiny integers, and when x = 4, there are 6 + 5 + 4 + 3 + 2 + 1 = 21 Tiny integers.

Continuing in this way, we summarize the count of Tiny integers for Case 3.

Value of x | Number of Tiny integers
x = 1 | 9 + 8 + 7 + 6 + 5 + 4 + 3 + 2 + 1 = 45
x = 2 | 8 + 7 + 6 + 5 + 4 + 3 + 2 + 1 = 36
x = 3 | 7 + 6 + 5 + 4 + 3 + 2 + 1 = 28
x = 4 | 6 + 5 + 4 + 3 + 2 + 1 = 21
x = 5 | 5 + 4 + 3 + 2 + 1 = 15
x = 6 | 4 + 3 + 2 + 1 = 10
x = 7 | 3 + 2 + 1 = 6
x = 8 | 2 + 1 = 3
x = 9 | 1

The number of Tiny three-digit integers in this case is 45 + 36 + 28 + 21 + 15 + 10 + 6 + 3 + 1 = 165 and so the total number of Tiny three-digit integers is 9 + 45 + 165 = 219.'
WHERE year = 2024 AND grade = 7 AND question_number = 24;

UPDATE gauss_source_questions
SET official_solution = 'We begin by recognizing that 2 is the only even prime number.

If x, y and z are each odd prime numbers, then both x + y and x + z are even prime numbers (since the sum of two odd numbers is even).

However, both x + y and x + z are each at least 2 + 3 = 5, and therefore each must be an odd prime number.

This tells us that x, y, z cannot all be odd prime numbers, and so exactly one of them is equal to 2 (since they are all different from one another and 2 is the only even prime number).

If y = 2, then each of x and z is odd and so x + z is even, which is not possible.

Similarly, if z = 2, then each of x and y is odd and so x + y is even, which is not possible, and so we conclude that x = 2.

Substituting x = 2, the list of 8 different prime numbers becomes:

w, 2, y, z, 2 + y, 2 + z, 234 + z, 234 − z,

and we note that w + x + y = 234 becomes w + y = 232.

Since z and 2 + z are prime numbers that differ by 2, next we consider the consecutive odd prime numbers with z less than 50.

These are: 3 and 5, 5 and 7, 11 and 13, 17 and 19, 29 and 31, 41 and 43.

So then z is equal to one of 3, 5, 11, 17, 29, or 41.

If z = 3, then 234 − z = 231 which is divisible by 3 and thus not a prime number.

If z = 11, then 234 + z = 245 which is divisible by 5 and thus not a prime number.

If z = 17, then 234 − z = 217 which is divisible by 7 and thus not a prime number.

If z = 29, then 234 − z = 205 which is divisible by 5 and thus not a prime number.

If z = 41, then 234 + z = 275 which is divisible by 5 and thus not a prime number.

Finally, if z = 5, then 234 − z = 229 and 234 + z = 239, and both of these are prime numbers.

Alternately, we may have noted that if z has units digit 1, then 234 + z has units digit 5, and if z has units digit 9, then 234 − z also has units digit 5, and so each is divisible by 5, which is not possible since each is a prime number. We could have then removed z = 11, 29, 41 as possibilities and considered only z = 3, 5, 17 as we did above.

The table below summarizes what we know about the 8 different prime numbers to this point.

w | x | y | z | x + y | x + z | 234 + z | 234 − z
  | 2 |   | 5 | 2 + y | 7 | 239 | 229

As shown previously, since y and 2 + y are consecutive odd prime numbers (with y less than 50), then y is equal to one of 3, 11, 17, 29, or 41 (recall that z = 5 and the 8 numbers must all be different).

Since w + y = 232, then w = 232 − y.

For which value(s) of y is w = 232 − y a prime number different from those already in our list?

If y = 3, then w = 229 which is not possible since 234 − z = 229.

If y = 11, then w = 221 which is divisible by 13 and therefore not a prime number.

If y = 17, then w = 215 which is divisible by 5 and therefore not a prime number.

If y = 29, then w = 203 which is divisible by 7 and therefore not a prime number.

Finally, if y = 41, then w = 191 which is a prime number.

The final list of 8 different prime numbers is shown below.

w | x | y | z | x + y | x + z | 234 + z | 234 − z
191 | 2 | 41 | 5 | 43 | 7 | 239 | 229

The value of w − y is 191 − 41 = 150.'
WHERE year = 2024 AND grade = 7 AND question_number = 25;

-- Verify updates
SELECT question_number, LEFT(official_solution, 60) as solution_preview
FROM gauss_source_questions
WHERE year = 2024 AND grade = 7 AND question_number IN (18, 19, 20, 21, 22, 23, 24, 25)
ORDER BY question_number;
