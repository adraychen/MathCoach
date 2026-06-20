-- Update 2025 Grade 8 official_solution (Q18, Q19, Q20, Q22, Q25) in gauss_source_questions
-- Run this in Supabase SQL Editor

UPDATE gauss_source_questions
SET official_solution = 'In the grid shown, the first column and first row show the possible numbers that may appear on the top faces of the two dice.

(The grid is a 6 by 6 multiplication table. The top row is labelled 1, 2, 3, 4, 5, 6, representing the possible result of one die. The first column is labelled 1, 2, 3, 4, 5, 6, representing the possible result of the other die. Each inside cell shows the product of its row label and column label. The inside products are:

      1   2   3   4   5   6
1     1   2   3   4   5   6
2     2   4   6   8  10  12
3     3   6   9  12  15  18
4     4   8  12  16  20  24
5     5  10  15  20  25  30
6     6  12  18  24  30  36)

The inside of the grid shows the product of the corresponding two numbers. Of the results, a product of 4 appears 3 times, a product of 6 appears 4 times, a product of 9 appears 1 time, a product of 15 appears 2 times, and a product of 8 appears 2 times. Thus, of the possible products given, 6 is the most likely to occur.'
WHERE year = 2025 AND grade = 8 AND question_number = 18;

UPDATE gauss_source_questions
SET official_solution = 'We begin by determining the prime factorization of 2025. 2025 = 25 × 81 = 5 × 5 × 9 × 9 = 5 × 5 × 3 × 3 × 3 × 3 = 3⁴ × 5². There are exactly 15 positive factors of 2025. These are: 1, 3, 3², 3³, 3⁴, 5, 5², 3 × 5, 3² × 5, 3³ × 5, 3⁴ × 5, 3 × 5², 3² × 5², 3³ × 5², and 3⁴ × 5². We are asked to express 2025 as the product of two positive integers n and m², where m² is a perfect square. Of the 15 positive factors, the following are perfect squares: 1, 3², 3⁴, 5², 3² × 5², and 3⁴ × 5². These are all the possible values of m², and so the values of m are: 1, 3, 5, 3², 3 × 5, and 3² × 5. Thus, the ordered pairs of positive integers (m, n) for which m² × n = 2025 are: (1, 3⁴ × 5²), (3, 3² × 5²), (5, 3⁴), (3², 5²), (3 × 5, 3²), (3² × 5, 1). Therefore, there are 6 such ordered pairs.'
WHERE year = 2025 AND grade = 8 AND question_number = 19;

UPDATE gauss_source_questions
SET official_solution = 'In the first diagram shown, we label the vertices of the polygon and the length ST = c, since ST = QR.

(In the first diagram, the original polygon is labelled P, Q, R, S, T, U in order around the boundary. The polygon is rectilinear, so each angle is a right angle. Segment UT has length a, segment SR has length b, and segment QR has length c. Segment ST is also labelled c because ST = QR. Matching tick marks show that PQ = PU.)

Next, we extend UT by a length equal to SR, and we extend QR by a length equal to ST, as shown in the second diagram.

(In the second diagram, UT is extended past T to a new point V so that TV = SR = b. Also, QR is extended past R to the same point V so that RV = ST = c. These two extensions meet at V. This creates rectangle STVR, with TV = SR = b and RV = ST = c. The larger outer figure PQVU is formed by adding this rectangle to the original polygon.)

Each of the angles in the polygon is a right angle, and so these two extended line segments are perpendicular to each other and will meet at a point that we label V.

That is, STVR is a rectangle with TV = SR = b and RV = ST = c.

Each of the following expressions is equal to the perimeter of the original polygon:

PQ + QR + SR + ST + TU + PU
= PQ + QR + ST + SR + TU + PU (reordering the lengths)
= PQ + QR + RV + TV + TU + PU (since RV = ST and TV = SR)
= PQ + QV + UV + PU (since QR + RV = QV and TV + TU = UV)

which is the perimeter of PQVU.

Each of the angles in PQVU is a right angle, and PQ = PU, and thus PQVU is a square.

Since PQ = UV = UT + TV = a + b, and PU = QV = QR + RV = c + c = 2c, then a + b = 2c.

Summarizing, the perimeter of the original polygon is equal to the perimeter of square PQVU, and each side length of square PQVU can be expressed as a + b or as 2c since a + b = 2c.

If each of the 4 side lengths is expressed as a + b, then the perimeter of PQVU, and thus the perimeter of the original polygon, is equal to

(a + b) + (a + b) + (a + b) + (a + b) = 4a + 4b.

If 3 side lengths are expressed as a + b and 1 side length is expressed as 2c, then the perimeter is

(a + b) + (a + b) + (a + b) + (2c) = 3a + 3b + 2c.

If 2 side lengths are expressed as a + b and 2 side lengths are expressed as 2c, then the perimeter is

(a + b) + (a + b) + (2c) + (2c) = 2a + 2b + 4c.

If 1 side length is expressed as a + b and 3 side lengths are expressed as 2c, then the perimeter is

(a + b) + (2c) + (2c) + (2c) = a + b + 6c.

Finally, if all 4 side lengths are expressed as 2c, the perimeter is

(2c) + (2c) + (2c) + (2c) = 8c.

Of the expressions given, a + b + 7c remains, and since a + b + 7c = 2c + 7c = 9c is not equal to the perimeter, then the correct answer is (B).'
WHERE year = 2025 AND grade = 8 AND question_number = 20;

UPDATE gauss_source_questions
SET official_solution = 'Solution 1

The opposite sides of ABCD are parallel, and so ABCD is a parallelogram. The opposite sides of a parallelogram are equal in length, and so AB = CD and AD = BC.

Since the value of r + s + t is equal to a constant, we may choose any location for B(0, r) provided that it satisfies the given condition r < 0. We choose r = −2, so that the y-coordinate of B(0, r) is equal to the y-coordinate of A(−3, −2), and so AB is a horizontal line segment as shown.

(The diagram for Solution 1 shows parallelogram ABCD on a coordinate plane. Point A is at (−3, −2), point B is chosen as (0, −2), point C is at (6, 10), and point D is at (s, t). Segment AB is horizontal because A and B have the same y-coordinate. Since CD is parallel to AB, segment CD is also horizontal, placing D at the same height as C.)

In this case, the length of AB is equal to the positive difference between the x-coordinates of A and B, which is 0 − (−3) = 3.

CD is parallel to AB, and so CD must also be a horizontal line segment. Thus, points C(6, 10) and D(s, t) have equal y-coordinates, and so t = 10. Further, CD has the same length as AB, and so 6 − s = 3 or s = 3.

Therefore, the value of r + s + t = −2 + 3 + 10 = 11.

Solution 2

The opposite sides of ABCD are parallel, and so ABCD is a parallelogram. The opposite sides of a parallelogram are equal in length, and so AB = CD and AD = BC.

Since AB and CD are parallel and equal in length, then the vertical distance between A and B must equal the vertical distance between C and D, and the horizontal distance between A and B must equal the horizontal distance between C and D.

(The diagram for Solution 2 shows parallelogram ABCD on a coordinate plane with A(−3, −2), B(0, r), C(6, 10), and D(s, t). The diagram shows AB and CD as opposite parallel sides. It compares the vertical change from A to B with the vertical change from D to C, and compares the horizontal change from A to B with the horizontal change from D to C.)

The vertical distance between two points is equal to the non-negative difference between their y-coordinates, and so −2 − r = t − 10 (assuming r ≤ −2 and t ≥ 10 as in the diagram).

Simplifying, we get −2 + 10 = t + r and so t + r = 8.

The horizontal distance between two points is equal to the non-negative difference between their x-coordinates, and so 0 − (−3) = 6 − s (assuming s < 6 as in the diagram).

Simplifying, we get 0 + 3 = 6 − s or s = 6 − 3 and so s = 3.

Therefore, the value of r + s + t = (r + t) + s = 8 + 3 = 11. From Solution 1, we note that r = −2, s = 3, t = 10 are values satisfying the given conditions and for which r + s + t = 11.'
WHERE year = 2025 AND grade = 8 AND question_number = 22;

UPDATE gauss_source_questions
SET official_solution = 'We begin by recognizing that in the given list, each of the digits 1 through 7 occurs at least once as a units digit, and at least once as a tens digit.

For example, the digit 1 occurs twice as a units digit (11 and 31), and three times as a tens digit (11, 12 and 14).

Counting the number of times each of the digits 1 through 7 occurs as a units digit and as a tens digit, we get:

| Digit                                      |  1 |  2 |  3 |  4 |  5 |  6 |  7 |
| ------------------------------------------ | -: | -: | -: | -: | -: | -: | -: |
| Number of times occurring as a units digit |  2 |  1 |  1 |  4 |  1 |  2 |  1 |
| Number of times occurring as a tens digit  |  3 |  1 |  1 |  3 |  1 |  2 |  1 |

The units digit of each number in the list matches the tens digit of the number that follows it.

This tells us that if we ignore the tens digit of the first number in the list and the units digit of the last number in the list, then the number of times that each digit occurs as a units digit must be equal to the number of times that it occurs as a tens digit.

Looking back to the table above, we see that this is true for all digits except 1 and 4.

Since the digit 1 occurs twice as a units digit and three times as a tens digit, then the tens digit of the first number in the list must be equal to 1.

Similarly, the digit 4 occurs four times as a units digit and three times as a tens digit, and so the units digit of the last number in the list must be equal to 4.

Ignoring the number 14 for a moment, we separate the 11 remaining numbers into two distinct lists, which we call A and B.

A: 11, 12, 23, 31
B: 44, 45, 46, 56, 64, 67, 74

Each digit in A is less than or equal to 3, and each digit in B is greater than or equal to 4.

Since 14 is the only number given that does not appear in A or B, and 14 has a digit that appears in A and a digit that appears in B, then 14 is the only number that can ''connect'' the numbers in A to those in B.

Further, this tells us that the numbers in A must be arranged and then placed before an arrangement of the numbers in B, with 14 appearing between the two arrangements.

Also, the arrangement of the numbers in A must begin and end with a 1, and the arrangement of the numbers in B must begin and end with a 4 (since 14 occurs between the two lists).

Next, we count the number of different ways to arrange the numbers in A, starting and ending with 1.

We begin by recognizing that each of the digits 2 and 3 occurs exactly once as a units digit and once as a tens digit, and so 12, 23, 31 must appear together in this order (the two 2s must occur together and the two 3s must occur together).

The list must begin and end with a 1, and so there are 2 possible locations for the 11 and thus 2 possible arrangements of the numbers in A:

11, 12, 23, 31
12, 23, 31, 11

Next, we count the number of different ways to arrange the numbers in B, starting and ending with 4.

We begin by recognizing that each of the digits 5 and 7 occurs exactly once as a units digit and once as a tens digit, and so 45, 56 must appear together in this order (the two 5s must occur together), and 67, 74 must appear together in this order (the two 7s must occur together).

The arrangement ends with a 4, and thus cannot end with 45, 56, and so at least one more number must immediately follow 45, 56.

There are two such possibilities: 45, 56, 64, and 45, 56, 67, 74 (recall that 67, 74 must remain together), which leads to exactly two distinct cases to consider.

Case 1: 45, 56, 64 occur together in this order

In this case, the remaining numbers are 44, 46, 67, and 74.

Since 44 has two equal digits, its location in the arrangement of the B list cannot change the first digit in the list (which must be 4), and cannot change the last digit in the list (which must also be 4), and thus we ignore 44 for the moment.

The remaining numbers, 46, 67, 74 must occur together in this order. Can you see why?

Since the blocks 45, 56, 64 and 46, 67, 74 must each occur together in their respective orders, this gives two possible arrangements of the B list (ignoring the 44).

These are:

45, 56, 64, 46, 67, 74
46, 67, 74, 45, 56, 64

Next, we determine the number of different ways to place 44 into each of these arrangements.

In the 45, 56, 64, 46, 67, 74 arrangement, the 44 may appear at the start, at the end, or between the 64 and 46, which gives 3 different arrangements of the B list.

These are:

44, 45, 56, 64, 46, 67, 74
45, 56, 64, 46, 67, 74, 44
45, 56, 64, 44, 46, 67, 74

In the 46, 67, 74, 45, 56, 64 arrangement, the 44 may appear at the start, at the end, or between the 74 and 45, which gives 3 more arrangements of the B list, or 6 in total for Case 1.

Case 2: 45, 56, 67, 74 occur together in this order

In this case, the remaining numbers are 44, 46, and 64.

We again begin by ignoring 44 for the moment.

The remaining numbers, 46, 64 must occur together in this order.

Since the blocks 45, 56, 67, 74 and 46, 64 must each occur together in their respective orders, this gives two possible arrangements of the B list (ignoring the 44).

These are:

45, 56, 67, 74, 46, 64
46, 64, 45, 56, 67, 74

In the 45, 56, 67, 74, 46, 64 arrangement, the 44 may appear at the start, at the end, or between the 74 and 46, which gives 3 more different arrangements of the B list.

In the 46, 64, 45, 56, 67, 74 arrangement, the 44 may appear at the start, at the end, or between the 64 and 45, which gives 3 more arrangements of the B list, or 6 in total for Case 2.

Thus, there are a total of 6 + 6 = 12 different ways to arrange the B list.

There are 2 different ways to arrange the numbers in list A, 12 different ways to arrange the numbers in list B, and exactly 1 way to place the number 14 between arrangements of each of the two lists. Thus, the total number of arrangements of the given list is 2 × 12 × 1 = 24.'
WHERE year = 2025 AND grade = 8 AND question_number = 25;

-- Verify updates
SELECT question_number, official_solution
FROM gauss_source_questions
WHERE year = 2025 AND grade = 8 AND question_number IN (18, 19, 20, 22, 25)
ORDER BY question_number;
