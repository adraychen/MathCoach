-- Update 2025 Grade 7 official_solution (Q10, Q20, Q24, Q25) in gauss_source_questions
-- Run this in Supabase SQL Editor

UPDATE gauss_source_questions
SET official_solution = 'When viewed from the opposite side of the window, text appears reflected horizontally.
That is, P U G F O R S A L E appears as its horizontal reflection when viewed from the opposite side of the window. The letters that look the same when viewed from both sides of the window are A, O and U and so there are 3 such letters.'
WHERE year = 2025 AND grade = 7 AND question_number = 10;

UPDATE gauss_source_questions
SET official_solution = 'We begin by extending PT to point U on QR, as shown.

(The solution diagram shows polygon PQRST with PT extended to meet QR at point U. The original labelled angles are ∠TPQ = 60°, ∠PQR = 60°, and ∠QRS = 60°. Segment PQ is labelled 10 cm and segment TS is labelled 6 cm. Since PT is parallel to SR, the extended segment TU is parallel to SR. Since TS is parallel to QR, TS is parallel to UR. Point U lies on QR, so QR is divided into QU and UR.)

Since PT is parallel to SR, then TU is parallel to SR.
Similarly, since TS is parallel to QR, then TS is parallel to UR.
Since TU is parallel to SR and TS is parallel to UR, then TURS is a parallelogram, and so TU = SR and UR = TS = 6 cm.
In △PQU, the sum of the measures of the three angles is 180°, and so ∠PUQ = 180° − 60° − 60° = 60°.
Thus, △PQU is an equilateral triangle, and so QU = PU = PQ = 10 cm.
The perimeter of PQRST is
PQ + QR + SR + TS + PT = PQ + QU + UR + SR + TS + PT (since QR = QU + UR)
= PQ + QU + UR + TU + TS + PT (since SR = TU)
= PQ + QU + UR + PT + TU + TS (reordering some sides)
= PQ + QU + UR + PU + TS (since PT + TU = PU)
= 10 cm + 10 cm + 6 cm + 10 cm + 6 cm
= 42 cm
Answer: (A)'
WHERE year = 2025 AND grade = 7 AND question_number = 20;

UPDATE gauss_source_questions
SET official_solution = 'We begin by naming shapes shown by the thick lines 1, 2, 3, 4, and 5, as shown in the diagram.
We also adopt the notation [row number, column number] to refer to the contents of specific squares in the diagram.
For example, we are given that [2, 3] is D (this is in shape 3), and [2, 4] is A (this is in shape 2).

(The initial diagram is a 5 by 5 letter grid divided into five thick-outlined regions labelled 1, 2, 3, 4, and 5. Rows are numbered from top to bottom as 1 to 5, and columns are numbered from left to right as 1 to 5. The given letters are D at [2, 3], A at [2, 4], C at [3, 2], B at [5, 3], and E at [5, 5]. The shaded square is [4, 1]. Shape 1 contains [1, 1], [2, 1], [3, 1], [3, 2], and [4, 1]. Shape 2 contains [1, 2], [1, 3], [1, 4], [1, 5], and [2, 4]. Shape 3 contains [2, 2], [2, 3], [3, 3], [4, 3], and [4, 4]. Shape 4 contains [2, 5], [3, 4], [3, 5], [4, 5], and [5, 5]. Shape 5 contains [4, 2], [5, 1], [5, 2], [5, 3], and [5, 4].)

It is important to note that the solution that follows is one of many different ways to arrive at the final answer.
Since [3, 2] is C, then [2, 1] cannot be C (shape 1 already has C), and [2, 2] cannot be C (column 2 already has C), and thus the C in row 2 must be [2, 5].
Since row 5 already has an E, then the E in shape 5 cannot be in row 5, and thus [4, 2] is E.

(The first updated diagram adds C at [2, 5] and E at [4, 2], while retaining the original given letters and region labels.)

Row 2 is missing B and E and since column 2 has an E, then [2, 1] is E and [2, 2] is B.
The letters determined to this point are included in the diagram above.
Since shape 2 already contains A and row 1 is missing A, then [1, 1] is A.
Also, column 4 already contains A and so [5, 4] is not A which means that [5, 2] is A (since shape 5 is missing A).
The letters determined to this point are included in the diagram to the right.

(The second updated diagram adds A at [1, 1] and A at [5, 2].)

Shape 1 must contain D somewhere in column 1 and so [5, 1] is not D. Since shape 5 is missing D, then [5, 4] is D.
Shape 4 is missing A, B and D. Since column 4 already contains A and D, then [3, 4] cannot be A or D, and thus [3, 4] is B.
Finally, shape 1 is missing B and D. Since row 3 contains B, then [3, 1] cannot be B, and so the letter in the shaded square, [4, 1], is B as shown.

(The third updated diagram adds D at [5, 4], B at [3, 4], and B at the shaded square [4, 1].)

The completed diagram is included below. Given the initial 5 letters and their locations, there is exactly one way to complete this diagram.

(The completed 5 by 5 grid is:
A D C E B
E B D A C
D C E B A
B E A C D
C A B D E)
Answer: (B)'
WHERE year = 2025 AND grade = 7 AND question_number = 24;

UPDATE gauss_source_questions
SET official_solution = 'We adopt the notation [row number, column number] to be equal to the contents of a specific square in the grid.
Since [1, 1] is 1 and adjacent numbers increase by a fixed integer a > 0 moving left to right within each row, then [1, 2] is 1 + a, [1, 3] is 1 + 2a, and so on to the end of the row where [1, 8] is 1 + 7a.
Similarly, adjacent numbers increase by a fixed integer b > 0 moving top to bottom within each column, and so the contents of each square in row 2 is b greater than the adjacent square in row 1.
That is, [2, 1] is 1 + b, [2, 2] is 1 + a + b, [2, 3] is 1 + 2a + b, and so on to the end of the row where [2, 8] is 1 + 7a + b.
Continuing in this way in row 3, we get [3, 1] is 1 + 2b, [3, 2] is 1 + a + 2b, [3, 3] is 1 + 2a + 2b, and so on to [3, 8] which is equal to 1 + 7a + 2b.
We continue this pattern in the table below, and include each of the entries in column 5 since the focus of the question is on this column.

The table is:

Row 1: 1, 1 + a, 1 + 2a, 1 + 3a, 1 + 4a, 1 + 5a, 1 + 6a, 1 + 7a
Row 2: 1 + b, 1 + a + b, 1 + 2a + b, 1 + 3a + b, 1 + 4a + b, 1 + 5a + b, 1 + 6a + b, 1 + 7a + b
Row 3: 1 + 2b, 1 + a + 2b, 1 + 2a + 2b, 1 + 3a + 2b, 1 + 4a + 2b, 1 + 5a + 2b, 1 + 6a + 2b, 1 + 7a + 2b
...
Row 4, column 5: 1 + 4a + 3b
Row 5, column 5: 1 + 4a + 4b
Row 6, column 5: 1 + 4a + 5b
Row 7, column 5: 1 + 4a + 6b
Row 8, column 5: 1 + 4a + 7b
Row 8, column 8: 1 + 7a + 7b

We are given that the number in the bottom right corner of the grid is less than 75, and so 1 + 7a + 7b < 75 or 7a + 7b < 74.
Dividing each term of this inequality by 7, we get 7a/7 + 7b/7 < 74/7 or a + b < 74/7 and since a and b are positive integers, then a + b ≤ 10.
Since a + b ≤ 10, then by multiplying each term by 4, we get 4a + 4b ≤ 40.
In the table above, [5, 5] is 1 + 4a + 4b. Since 4a + 4b ≤ 40, then 1 + 4a + 4b ≤ 41 and so [5, 5] cannot equal 45.
Further, since b is a positive integer, then each of the entries in column 5 above row 5 is less than 1 + 4a + 4b and thus cannot equal 45.
Thus if 45 appears in column 5 of this grid, then it can only appear in rows 6, 7 and 8.
We begin by noting that a and b are positive integers, and since a + b ≤ 10, then a ≤ 9 and b ≤ 9.
If [6, 5] is 45, then 1 + 4a + 5b = 45 or 4a + 5b = 44.
If a = 1, then 4 × 1 + 5b = 44 or 5b = 40, and so b = 8.
We confirm that when a = 1 and b = 8, then a + b ≤ 10 and so the number appearing in the bottom right corner of the grid is less than 75.
Thus, in the arithmetic grid with a = 1 and b = 8, [6, 5] is 45.
If a = 2, then 4 × 2 + 5b = 44 or 5b = 36 or b = 36/5 (which is not an integer), and so there is no such arithmetic grid in which [6, 5] is 45 when a = 2.
We could continue substituting the remaining values of a from 3 to 9 to determine for which values of a, 4a + 5b = 44 and a + b ≤ 10 and b is a positive integer.
Alternately, we might notice that 4a is a multiple of 4, as is 44.
Thus, if 4a + 5b = 44 then 5b must also be a multiple of 4 and so b must be a multiple of 4.
The only remaining positive integer b for which b ≤ 9 and b is a multiple of 4 is b = 4.
When b = 4, we get 4a + 5 × 4 = 44 or 4a = 24 and so a = 6.
We again confirm that when a = 6 and b = 4, then a + b ≤ 10 and so the number appearing in the bottom right corner of the grid is less than 75.
In the arithmetic grid with a = 6 and b = 4, [6, 5] is 45.
Thus, there are exactly 2 such grids in which 45 appears in row 6, column 5.
If [7, 5] is 45, then 1 + 4a + 6b = 45 or 4a + 6b = 44 or 2a + 3b = 22.
In this case, we similarly notice that 2a is a multiple of 2, as is 22.
Thus, if 2a + 3b = 22 then 3b must also be a multiple of 2 and so b must be a multiple of 2.
We proceed by checking values of b which are equal to positive even integers.
When b = 2, we get 2a + 3 × 2 = 22 or 2a = 16 and so a = 8.
In this case, a + b ≤ 10 and so the number appearing in the bottom right corner is less than 75.
In the arithmetic grid with a = 8 and b = 2, [7, 5] is 45.
When b = 4, we get 2a + 3 × 4 = 22 or 2a = 10 and so a = 5.
In this case, a + b ≤ 10.
In the arithmetic grid with a = 5 and b = 4, [7, 5] is 45.
When b = 6, we get 2a + 3 × 6 = 22 or 2a = 4 and so a = 2.
In this case, a + b ≤ 10.
In the arithmetic grid with a = 2 and b = 6, [7, 5] is 45.
When b = 8, we get 2a + 3 × 8 = 22 which is not possible since a > 0.
Thus, there are exactly 3 such grids in which 45 appears in row 7, column 5.
If [8, 5] is 45, then 1 + 4a + 7b = 45 or 4a + 7b = 44.
We notice that 4a is a multiple of 4, as is 44.
Thus, if 4a + 7b = 44 then 7b must also be a multiple of 4 and so b must be a multiple of 4.
We proceed by checking the two possible values of b, namely b = 4 and b = 8.
When b = 4, we get 4a + 7 × 4 = 44 or 4a = 16 and so a = 4.
In this case, a + b ≤ 10 and so the number appearing in the bottom right corner is less than 75.
In the arithmetic grid with a = 4 and b = 4, [8, 5] is 45.
When b = 8, we get 4a + 7 × 8 = 44 which is not possible since a > 0.
Thus, there is exactly 1 such grid in which 45 appears in row 8, column 5, and so there are 2 + 3 + 1 = 6 grids in total.
Answer: (A)'
WHERE year = 2025 AND grade = 7 AND question_number = 25;

-- Verify updates
SELECT question_number, official_solution
FROM gauss_source_questions
WHERE year = 2025 AND grade = 7 AND question_number IN (10, 20, 24, 25)
ORDER BY question_number;
