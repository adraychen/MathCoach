-- Update 2024 Grade 8 official_solution (Q13, Q24, Q25) in gauss_source_questions
-- Run this in Supabase SQL Editor

UPDATE gauss_source_questions
SET official_solution = 'We begin by splitting ABCD into three equilateral triangles, as shown. (In the solution diagram, quadrilateral ABCD is split into three equilateral triangles. The middle equilateral triangle shares one full side with the left equilateral triangle and one full side with the right equilateral triangle. The outside perimeter of ABCD consists of 5 equal triangle side lengths, and segment AB is one of these side lengths.) Since the equilateral triangle in the middle shares a side with each of the two other equilateral triangles, then the sides of all three equilateral triangles are equal in length. The perimeter of ABCD is made up of 5 side lengths of these equilateral triangles. Since the perimeter of ABCD is 840 cm, then each side length of these equilateral triangles is 840 cm / 5 = 168 cm. Since AB is a side of an equilateral triangle, then AB = 168 cm.'
WHERE year = 2024 AND grade = 8 AND question_number = 13;

UPDATE gauss_source_questions
SET official_solution = 'The solution diagram is a branching path diagram with six split points labelled 1 through 6 and three bottom bins labelled A, B, and C. A ball starts at the top split, labelled 1. At each split, the ball travels down-left or down-right with probability 1/2.

There are 6 different locations at which the path splits, and we label these splits 1 to 6.

We begin by determining the probability that a ball lands in the bin labelled A. There is exactly one path that leads to bin A. This path travels downward to the left at each of the three splits labelled 1, 2 and 3. At each of these splits, the probability that a ball travels to the left is 1/2, and so the probability that a ball lands in bin A is 1/2 × 1/2 × 1/2 = 1/8.

Next, we determine the probability that a ball lands in the bin labelled C. There are exactly three paths that lead to bin C.

One path travels downward to the right at each of the three splits labelled 1, 4 and 6. The probability is 1/2 × 1/2 × 1/2 = 1/8.

A second path travels right at split 1, left at split 4, right at split 5, and right at split 6. The probability is 1/2 × 1/2 × 1/2 × 1/2 = 1/16.

The third path travels left at split 1, and right at each of splits 2, 5 and 6. The probability is also 1/16.

The probability that a ball lands in bin C is 1/8 + 1/16 + 1/16 = 4/16 = 1/4.

The probability that a ball lands in bin B is 1 − 1/8 − 1/4 = 5/8.

The probability that the two balls land in different bins is equal to 1 minus the probability that the two balls land in the same bin.

The probability that two balls land in bin A is 1/8 × 1/8 = 1/64.
The probability that two balls land in bin C is 1/4 × 1/4 = 1/16.
The probability that two balls land in bin B is 5/8 × 5/8 = 25/64.

Therefore, the probability that the two balls land in different bins is 1 − 1/64 − 1/16 − 25/64 = (64 − 1 − 4 − 25) / 64 = 34/64 = 17/32.'
WHERE year = 2024 AND grade = 8 AND question_number = 24;

UPDATE gauss_source_questions
SET official_solution = 'The smallest possible value of d is closest to 6.40.

On a flat surface, the shortest distance between two points is along a straight line between the points. The ant must walk on the surface of the figure, and so to determine a straight line distance between P and Q, we can "flatten" the figure.

The diagrams show a straight line path from P to Q on the surface. To see this path more clearly, we strip away all but the 5 cubes that the ant walks on.

To see that this path is along a straight line from P to Q, we draw a partial net of the figure including each face that the ant walks on.

To determine the length of PQ, we position R so that PR is perpendicular to QR.

Triangle PQR is a right-angled triangle with PR = 5 and QR = 4, and so by the Pythagorean Theorem, we get PQ = √(5² + 4²) = √41, and so the distance d is closest to 6.40.

Since 6.40 is the smallest of the five choices given, and we have shown that there is a path of this length from P to Q on the figure''s surface, then the smallest possible value of d is 6.40.'
WHERE year = 2024 AND grade = 8 AND question_number = 25;

-- Verify updates
SELECT question_number, official_solution
FROM gauss_source_questions
WHERE year = 2024 AND grade = 8 AND question_number IN (13, 24, 25)
ORDER BY question_number;
