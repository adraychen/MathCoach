-- Insert 2023 Grade 7 solutions into gauss_source_questions
-- Run this in Supabase SQL Editor

INSERT INTO gauss_source_questions (id, year, grade, question_number, correct_answer, official_solution)
VALUES
('waterloo_gauss_g7_2023_q01', 2023, 7, 1, 'D', 'Half of 24 is 24 ÷ 2 = 12. Kiyana gives her friend 12 grapes.'),
('waterloo_gauss_g7_2023_q02', 2023, 7, 2, 'C', 'Reading from the graph, Friday had the highest temperature.'),
('waterloo_gauss_g7_2023_q03', 2023, 7, 3, 'B', 'At a cost of $16.50 a basket, the cost to buy 4 baskets of strawberries is 4 × $16.50 = $66.00.'),
('waterloo_gauss_g7_2023_q04', 2023, 7, 4, 'A', 'The difference between 3 and −5 is 3 − (−5) = 3 + 5 = 8. Therefore, it is now 8°C warmer.'),
('waterloo_gauss_g7_2023_q05', 2023, 7, 5, 'E', 'Since 5 × 5 = 25 and each of the given answers is greater than 25, then the integer that Sarah multiplied by itself must have been greater than 5.
Further, 6 × 6 = 36 and each of the given answers is less than or equal to 36.
Thus, of the given answers, only 36 could be the result of multiplying an integer by itself.
Alternatively, we may have noted that the result of multiplying an integer by itself is a perfect square, and of the answers given, 36 is the only perfect square.'),
('waterloo_gauss_g7_2023_q06', 2023, 7, 6, 'C', 'Since the perimeter of PQRS is 40 cm and SR = 16 cm, then the combined length of the remaining three sides is 40 cm − 16 cm = 24 cm.
Each of the remaining three sides is equal in length, and so PQ = 24 cm/3 = 8 cm.'),
('waterloo_gauss_g7_2023_q07', 2023, 7, 7, 'C', 'Dividing 52 by each of the given denominators, we get that 52/4 = 13 is the only whole number.'),
('waterloo_gauss_g7_2023_q08', 2023, 7, 8, 'B', 'The line segment with greatest length that joins two points on a circle is a diameter of the circle. Since the circle has a radius of 4 cm, then its diameter has length 2 × 4 cm = 8 cm, and so the greatest possible length of the line segment is 8 cm.'),
('waterloo_gauss_g7_2023_q09', 2023, 7, 9, 'C', 'The number of integers in the list is 10. Of these integers, 5 are even (they are 10, 12, 14, 16, and 18). Thus, the probability that the chosen integer is even is 5/10.'),
('waterloo_gauss_g7_2023_q10', 2023, 7, 10, 'D', 'Before adding tax, the combined cost of the three items is $4.20 + $7.60 + $3.20 = $15.00.
The 5% tax on $15.00 is 0.05 × $15.00 = $0.75, and so the total cost of the three items, after tax is added, is $15.00 + $0.75 = $15.75.
Note that we could have calculated the 5% tax on each individual item, however doing so is less efficient than calculating tax on the $15.00 total.'),
('waterloo_gauss_g7_2023_q11', 2023, 7, 11, 'B', 'Since BCD is a straight line segment, then ∠BCD = 180°.
Therefore, ∠ACB = ∠BCD − ∠ACD = 180° − 75° = 105°.
Since the sum of the three angles in △ABC is 180°, then ∠ABC = 180° − 105° − 35° = 40°.'),
('waterloo_gauss_g7_2023_q12', 2023, 7, 12, 'A', 'Of the 100 small identical squares, 28 are presently unshaded, and so 100 − 28 = 72 are shaded.
So that 75% of the area of WXYZ is shaded, 75 of the 100 small squares must be shaded.
Therefore, 75 − 72 = 3 more of the small squares must be shaded.'),
('waterloo_gauss_g7_2023_q13', 2023, 7, 13, 'D', 'Suppose we call the unknown vertex V.
The side of the rectangle joining the points (2, 1) and (2, 5) is vertical, and so the opposite side of the rectangle (the side joining (4, 1) to V) must also be vertical.
This means that V has the same x-coordinate as (4, 1), which is 4.
Similarly, the side of the rectangle joining the points (2, 1) and (4, 1) is horizontal, and so the opposite side of the rectangle (the side joining (2, 5) to V) must also be horizontal.
This means that V has the same y-coordinate as (2, 5), which is 5.
Therefore, the coordinates of the fourth vertex of the rectangle are (4, 5).'),
('waterloo_gauss_g7_2023_q14', 2023, 7, 14, 'D', 'The prime numbers that are less than 10 are 2, 3, 5, and 7.
Thus, the only two different prime numbers whose sum is 10 are 3 and 7.
The product of these two numbers is 3 × 7 = 21.'),
('waterloo_gauss_g7_2023_q15', 2023, 7, 15, 'D', 'The given list, 2, 9, 4, n, 2n contains 5 numbers.
The average of these 5 numbers is 6, and so the sum of the 5 numbers is 5 × 6 = 30.
That is, 2 + 9 + 4 + n + 2n = 30 or 15 + 3n = 30, and so 3n = 15 or n = 5.'),
('waterloo_gauss_g7_2023_q16', 2023, 7, 16, 'E', 'The sum of P and Q is equal to 5, and so P and Q are (in some order) either equal to 1 and 4, or they are equal to 2 and 3.
The difference between R and S is equal to 5, and so R and S must be (in some order) equal to 1 and 6.
Since R and S are equal to 1 and 6, then neither P nor Q can be 1, which means that P and Q cannot be equal to 1 and 4, and so they must be equal to 2 and 3.
The only numbers from 1 to 6 not accounted for are 4 and 5.
Since T is greater than U, then the number that replaces T is 5.'),
('waterloo_gauss_g7_2023_q17', 2023, 7, 17, 'C', 'Solution 1
The area of △AED is equal to one-half its base times its height.
Suppose the base of △AED is AE, then its height is BD (AE is perpendicular to BD).
Since AB = BC = 24 cm and E and D are the midpoints of their respective sides, then AE = 12 cm and BD = 12 cm.
Thus, the area of △AED is 1/2 × 12 cm × 12 cm = 72 cm².
Solution 2
The area of △AED is equal to the area of △ABD minus the area of △EBD.
Suppose the base of △EBD is BD, then its height is EB.
Since AB = BC = 24 cm and E and D are the midpoints of their respective sides, then EB = 12 cm and BD = 12 cm.
Thus, the area of △EBD is 1/2 × 12 cm × 12 cm = 72 cm².
The area of △ABD is equal to 1/2 × BD × AB = 1/2 × 12 cm × 24 cm = 144 cm².
Thus, the area of △AED is 144 cm² − 72 cm² = 72 cm².'),
('waterloo_gauss_g7_2023_q18', 2023, 7, 18, 'D', 'The water is in the shape of a rectangular prism with a 2 cm by 5 cm base and depth 6 cm.
Therefore, the volume of water is 2 cm × 5 cm × 6 cm = 60 cm³.
A face of the prism having the greatest area has dimensions 5 cm by 8 cm.
When the prism is tipped so that it stands on a 5 cm by 8 cm face, the water is once again in the shape of a rectangular prism with a 5 cm by 8 cm base and unknown depth.
Suppose that after the prism is tipped, the water''s depth is d cm.
Since the volume of water is still 60 cm³ when the prism is tipped, then 5 cm × 8 cm × d cm = 60 cm³ or 40d cm³ = 60 cm³, and so d = 60/40 = 3/2.
When the prism is tipped so that it stands on a face with the greatest area, the depth of the water is 3/2 cm = 1.5 cm.'),
('waterloo_gauss_g7_2023_q19', 2023, 7, 19, 'D', 'Solution 1
We begin by completing a table in which the ones digit of each possible product is listed.
For example, when the number on the first die is 3 and the number on the second die is 6, the entry in the table is 8 since 3 × 6 = 18 and the ones digit of 18 is 8.

(The grid is a 6 by 6 table of the ones digit of each product. The top row is labelled 1, 2, 3, 4, 5, 6 for the number on the first die. The first column is labelled 1, 2, 3, 4, 5, 6 for the number on the second die. The inside entries are:

| × | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 1 | 2 | 3 | 4 | 5 | 6 |
| 2 | 2 | 4 | 6 | 8 | 0 | 2 |
| 3 | 3 | 6 | 9 | 2 | 5 | 8 |
| 4 | 4 | 8 | 2 | 6 | 0 | 4 |
| 5 | 5 | 0 | 5 | 0 | 5 | 0 |
| 6 | 6 | 2 | 8 | 4 | 0 | 6 |)

Of the 36 possible outcomes in the table above, 6 outcomes have a ones digit that is equal to 0.
Thus, the probability that the ones digit of the product is 0 is 6/36 = 1/6.
Solution 2
Since the ones digit of the product is 0, then the product is divisible by 5 and is even.
Since the possible numbers in the product are 1, 2, 3, 4, 5, 6, then one of the numbers rolled must be 5.
Since the product is even (and 5 is not), then the other number rolled must be one of the three even numbers, namely 2, 4, 6.
Thus, the possible pairs of numbers that can be rolled to give a product whose ones digit is 0, are (5, 2), (5, 4), (5, 6) or (2, 5), (4, 5), (6, 5). (We note that the first number in the ordered pair represents the first number rolled, while the second number in the pair is the second number rolled.)
Since there are 6 possible rolls for each of the two dice, then there are 6 × 6 = 36 possible ordered pairs representing all possible outcomes.
Since 6 of these ordered pairs represent a product whose ones digit is 0, then the required probability is 6/36 = 1/6.'),
('waterloo_gauss_g7_2023_q20', 2023, 7, 20, 'E', 'Since a and b are positive integers, then each of a/7 and 2/b is greater than 0.
The sum of a/7 and 2/b is equal to 1, and so each is less than 1.
Since a/7 is greater than 0 and less than 1, then the possible values of a are 1, 2, 3, 4, 5, 6.
By substituting each of these values for a into the equation one at a time, we can determine if there is a positive integer value of b for which the equation is true.
Substituting a = 1, we get
1/7 + 2/b = 1 or 2/b = 1 − 1/7, and so 2/b = 6/7.
Since 2/b = 6/7, we can multiply the numerator and denominator of the first fraction by 3 (which is 6 ÷ 2) to get 6/3b = 6/7.
This gives 3b = 7 which does not have an integer solution (b = 7/3).
Thus when a = 1, there is no positive integer value of b that satisfies the equation.
Substituting a = 2, we get
2/7 + 2/b = 1 or 2/b = 1 − 2/7, and so 2/b = 5/7.
Since 2/b = 5/7, we can multiply the numerator and denominator of the first fraction by 5, and the numerator and denominator of the second fraction by 2 to get 10/5b = 10/14.
This gives 5b = 14 which does not have an integer solution.
Thus when a = 2, there is no positive integer value of b that satisfies the equation.
Substituting a = 3, we get
3/7 + 2/b = 1 or 2/b = 1 − 3/7, and so 2/b = 4/7.
Since 2/b = 4/7, we can multiply the numerator and denominator of the first fraction by 2 to get 4/2b = 4/7.
This gives 2b = 7 which does not have an integer solution.
Thus when a = 3, there is no positive integer value of b that satisfies the equation.
Substituting a = 4 and simplifying, we get 2/b = 3/7.
Since 2/b = 3/7, we can multiply the numerator and denominator of the first fraction by 3, and the numerator and denominator of the second fraction by 2 to get 6/3b = 6/14.
This gives 3b = 14 which does not have an integer solution.
Thus when a = 4, there is no positive integer value of b that satisfies the equation.
Substituting a = 5 and simplifying, we get 2/b = 2/7.
Since the numerators are equal, then the denominators must be equal, and so b = 7 satisfies the equation.
Finally, substituting a = 6 and simplifying, we get 2/b = 1/7.
Since 2/b = 1/7, we can multiply the numerator and denominator of the second fraction by 2 to get 2/b = 2/14, and so b = 14.
Thus, there are two pairs of positive integers a and b that satisfy the given equation: a = 5, b = 7 and a = 6, b = 14.'),
('waterloo_gauss_g7_2023_q21', 2023, 7, 21, 'B', 'Since ABCD is a square and its side lengths are integers, then its area is equal to a perfect square.
Since the product of the areas of ABCD and EFGH (the rectangle) is equal to 98, then the area of ABCD is a divisor of 98.
The positive divisors of 98 are 1, 2, 7, 14, 49, and 98.
There are exactly two divisors of 98 that are perfect squares, namely 1 and 49.
Since the area of ABCD is greater than the area of EFGH, then the area of ABCD is 49, and so the area of EFGH is 2 (since 49 × 2 = 98).
Square ABCD has area 49, and so AB = BC = CD = DA = 7.
(The diagram shows square ABCD joined to rectangle EFGH along part of side DA. The square has side length 7. The outside perimeter is labelled in order A, B, C, D, E, F, G, H, with EFGH attached along the left side of the square. The rectangle EFGH has vertical side FG = EH and horizontal sides EF = GH.)
The perimeter of ABCDEFGH is equal to
AB + BC + CD + DE + EF + FG + GH + HA
= 7 + 7 + 7 + DE + EF + EH + GH + HA (since EH = FG)
= 21 + DE + EH + HA + EF + GH (reorganizing)
= 21 + DA + EF + GH (since DE + EH + HA = DA)
= 21 + 7 + EF + GH (since DA = 7)
= 28 + 2 × GH (since EF = GH)
Since the side lengths are integers and the area of EFGH is 2, then either GH = 1 (and FG = 2), or GH = 2 (and FG = 1).
If GH = 1, then the perimeter of ABCDEFGH is 28 + 2 × 1 = 30.
Since 30 is not given as a possible answer, then GH = 2 and the perimeter is 28 + 2 × 2 = 32.'),
('waterloo_gauss_g7_2023_q22', 2023, 7, 22, 'E', 'If a Gareth sequence begins 10, 8, then the 3rd number in the sequence is 10 − 8 = 2, the 4th is 8 − 2 = 6, the 5th is 6 − 2 = 4, the 6th is 6 − 4 = 2, the 7th is 4 − 2 = 2, the 8th is 2 − 2 = 0, the 9th is 2 − 0 = 2, the 10th is 2 − 0 = 2, and the 11th is 2 − 2 = 0.
Thus, the resulting sequence is 10, 8, 2, 6, 4, 2, 2, 0, 2, 2, 0, ... .
The first 5 numbers in the sequence are 10, 8, 2, 6, 4, the next 3 numbers are 2, 2, 0, and this block of 3 numbers appears to repeat.
Since each new number added to the end of this sequence is determined by the two previous numbers in the sequence, then this block of 3 numbers will indeed continue to repeat. (That is, since the block repeats once, then it will continue repeating.)
The first 30 numbers of the sequence begins with the first 5 numbers, followed by 8 blocks of 2, 2, 0, followed by one additional 2 (since 5 + 8 × 3 + 1 = 30).
The sum of the first 5 numbers is 10 + 8 + 2 + 6 + 4 = 30.
The sum of each repeating block is 2 + 2 + 0 = 4, and so the sum of 8 such blocks is 8 × 4 = 32.
Thus, the sum of the first 30 numbers in the sequence is 30 + 32 + 2 = 64.'),
('waterloo_gauss_g7_2023_q23', 2023, 7, 23, 'D', 'Suppose that the length, or the width, or the height of the rectangular prism is equal to 5.
The product of 5 with any of the remaining digits has a units (ones) digit that is equal to 5 or it is equal to 0.
This means that if the length, or the width, or the height of the rectangular prism is equal to 5, then at least one of the two-digit integers (the area of a face) has a units digit that is equal to 5 or 0.
However, 0 is not a digit that can be used, and each digit from 1 to 9 is used exactly once (that is, 5 cannot be used twice), and so it is not possible for one of the dimensions of the rectangular prism to equal 5.
Thus, the digit 5 occurs in one of the two-digit integers (the area of a face).
The digit 5 cannot be the units digit of the area of a face, since this would require that one of the dimensions be 5.
Therefore, one of the areas of a face has a tens digit that is equal to 5.
The two-digit integers with tens digit 5 that are equal to the product of two different one-digit integers (not equal to 5) are 54 = 6 × 9 and 56 = 7 × 8.
Suppose that two of the dimensions of the prism are 7 and 8, and so one of the areas is 56.
In this case, the digits 5, 6, 7, and 8 have been used, and so the digits 1, 2, 3, 4, and 9 remain.
Which of these digits is equal to the remaining dimension of the prism?
It cannot be 1 since the product of 1 and 7 does not give a two-digit area, nor does the product of 1 and 8.
It cannot be 2 since the product of 2 and 8 is 16 and the digit 6 has already been used.
It cannot be 3 since 3 × 7 = 21 and 3 × 8 = 24, and so the areas of two faces share the digit 2.
It cannot be 4 since 4 × 7 = 28 and the digit 8 has already been used.
Finally, it cannot be 9 since 9 × 7 = 63 and the digit 6 has already been used.
Therefore, it is not possible for 7 and 8 to be the dimensions of the prism, and thus 6 and 9 must be two of the three dimensions.
Using a similar systematic check of the remaining digits, we determine that 3 is the third dimension of the prism.
That is, when the dimensions of the prism are 3, 6 and 9, the areas of the faces are 3 × 6 = 18, 3 × 9 = 27, and 6 × 9 = 54, and we may confirm that each of the digits from 1 to 9 has been used exactly once.
Since the areas of the faces are 18, 27 and 54, the surface area of the rectangular prism is 2 × (18 + 27 + 54) or 2 × 99 = 198.'),
('waterloo_gauss_g7_2023_q24', 2023, 7, 24, 'E', 'Solution 1
Begin by colouring the section at the top blue.
(The first diagram shows a circle divided into 6 equal sections with the top section coloured blue.)
Since two circles have the same colouring if one can be rotated to match the other, it does not matter which section is coloured blue, so we arbitrarily choose the top section.
There are now 5 sections which can be coloured green.
After choosing the section to be coloured green, there are 4 sections remaining which can be coloured yellow.
Each of the remaining 3 sections must then be coloured red.
Thus, the total number of different colourings of the circle is 5 × 4 = 20.
Solution 2
We begin by considering the locations of the three sections coloured red, relative to one another.
The three red sections could be adjacent to one another, or exactly two red sections could be adjacent to one another, or no red section could be adjacent to another red section.
We consider each of these 3 cases separately.
Case 1: All three red sections are adjacent to one another
Begin by colouring any three adjacent sections red.
(The diagram for Case 1 shows a circle divided into 6 equal sections with three adjacent sections coloured red.)
Since two circles have the same colouring if one can be rotated to match the other, it does not matter which three adjacent sections are coloured red.
Consider the first section that follows the three red sections as we move clockwise around the circle.
There are 3 choices for the colour of this section: blue, green or yellow.
Continuing to move clockwise to the next section, there are now 2 choices for the colour of this section.
Finally, there is 1 choice for the colour of the final section, and thus there are 3 × 2 × 1 = 6 different colourings of the circle in which all three red sections are adjacent to one another.
These 6 colourings are shown below.
(The six Case 1 diagrams show the same three adjacent red sections, with the remaining three sections filled by blue, green, and yellow in all 3 × 2 × 1 possible clockwise orders.)
Case 2: Exactly two red sections are adjacent to one another
There are two different possible arrangements in which exactly two red sections are adjacent to one another.
In the first of these, the next two sections that follow the two adjacent red sections as we move clockwise around the circle, are both not red. We call this Case 2a.
In the second of these, the section that follows the two adjacent red sections as we move clockwise around the circle is not red, but the next section is. We call this Case 2b.
The arrangements for Cases 2a and 2b are shown below.
(The Case 2a diagram shows two adjacent red sections, followed clockwise by two non-red sections, then the third red section. The Case 2b diagram shows two adjacent red sections, followed clockwise by one non-red section, then the third red section.)
Notice that the first of these two circles cannot be rotated to match the second.
The number of colourings in Case 2a and in Case 2b are each equal to the number of colourings as in Case 1.
That is, there are 3 choices for the first uncoloured section that follows the two red sections as we move clockwise around the circle.
Continuing to move clockwise to the next uncoloured section, there are now 2 choices for the colour of this section.
Finally, there is 1 choice for the colour of the final section, and thus there are 3 × 2 × 1 = 6 different colourings of the circle in Case 2a as well as in Case 2b.
These 12 colourings are shown below.
(The twelve Case 2 diagrams show the two non-equivalent red arrangements from Case 2a and Case 2b, with the remaining three sections filled by blue, green, and yellow in all possible orders for each case.)
Case 3: No red section is adjacent to another red section
Begin by colouring any three non-adjacent sections red.
(The Case 3 diagram shows a circle divided into 6 equal sections with red sections alternating with non-red sections.)
Since two circles have the same colouring if one can be rotated to match the other, it does not matter which three non-adjacent sections are coloured red.
In this case, there are 2 possible colourings as shown below.
(The two Case 3 diagrams show the three non-red sections filled by blue, green, and yellow. Up to rotation, only two clockwise orders of blue, green, and yellow are different.)
A circle with any other arrangement of the green, yellow and blue sections can be rotated to match one of the two circles above.
The total number of different colourings of the circle is 6 + 12 + 2 = 20.'),
('waterloo_gauss_g7_2023_q25', 2023, 7, 25, 'B', 'We can represent the given information in a Venn diagram by first introducing some variables.
Let x be the number of students that participated in hiking and canoeing, but not swimming.
Let y be the number of students that participated in hiking and swimming, but not canoeing.
Let z be the number of students that participated in canoeing and swimming, but not hiking.
Since 10 students participated in all three activities and no students participated in fewer than two activities, we complete the Venn diagram as shown.
(The Venn diagram has three overlapping circles labelled hiking, swimming, and canoeing. The centre overlap of all three activities is 10. The hiking-and-canoeing-only region is x, the hiking-and-swimming-only region is y, and the canoeing-and-swimming-only region is z. The regions for only hiking, only swimming, only canoeing, and outside all circles are each 0. The total number of participants is labelled n.)
Suppose that the total number of students participating in the school trip was n.
Since 50% of all students participated in at least hiking and canoeing, then 50/100 n or n/2 participated in at least hiking and canoeing.
Since this number of students, n/2, is an integer, then n must be divisible by 2.
Similarly, 60/100 n or 3n/5 students participated in at least hiking and swimming.
Since this number of students, 3n/5, is an integer, then n must be divisible by 5 (since 3 and 5 have no factors in common).
This means that n is divisible by both 2 and 5, and thus n is divisible by 10.
From the Venn diagram, we see that x + 10 = n/2, and y + 10 = 3n/5.
Since the total number of participants is n, we also get that x + y + z + 10 = n or z = n − 10 − x − y.
We may now use these equations,
x = n/2 − 10, y = 3n/5 − 10, and z = n − 10 − x − y
and the fact that n is divisible by 10, to determine all possible values of z.
We can then use the values of z to determine all possible values of the positive integer k, where k% participated in at least canoeing and swimming.
Since n is a positive integer that is divisible by 10, its smallest possible value is 10.
However, substituting n = 10 into x = n/2 − 10, we get x = 5 − 10 and so x = −5 which is not possible. (Recall that x is the number of students that participated in hiking and canoeing, but not swimming, and so x ≥ 0.)
Next, we try n = 20.
When n = 20, x = 10 − 10 and so x = 0.
When n = 20, y = (3 × 20)/5 − 10 or y = 12 − 10, and so y = 2.
Finally, when n = 20, x = 0, and y = 2, we get z = 20 − 10 − 0 − 2 = 8.
When z = 8, the number of students who participated in at least canoeing and swimming is 8 + 10 = 18 (since 10 students participated in all three), and so the percentage of students who participated in at least canoeing and swimming is 18/20 × 100% = 90%, and so k = 90.
In the table below, we continue in this way by using successively greater multiples of 10 for the value of n.

| n | x = n/2 − 10 | y = 3n/5 − 10 | z = n − 10 − x − y | k = (z + 10)/n × 100 |
|---:|---:|---:|---:|---|
| 20 | 0 | 2 | 8 | k = (8 + 10)/20 × 100 = 90 |
| 30 | 5 | 8 | 7 | k = (7 + 10)/30 × 100 ≈ 56.7 |
| 40 | 10 | 14 | 6 | k = (6 + 10)/40 × 100 = 40 |
| 50 | 15 | 20 | 5 | k = (5 + 10)/50 × 100 = 30 |
| 60 | 20 | 26 | 4 | k = (4 + 10)/60 × 100 ≈ 23.3 |
| 70 | 25 | 32 | 3 | k = (3 + 10)/70 × 100 ≈ 18.6 |
| 80 | 30 | 38 | 2 | k = (2 + 10)/80 × 100 = 15 |
| 90 | 35 | 44 | 1 | k = (1 + 10)/90 × 100 ≈ 12.2 |
| 100 | 40 | 50 | 0 | k = (0 + 10)/100 × 100 = 10 |

For values of n that are greater than 100, we get that z < 0, which is not possible.
Therefore, the sum of all such positive integers k is 90 + 40 + 30 + 15 + 10 = 185.')
ON CONFLICT (id) DO UPDATE SET
  year = EXCLUDED.year,
  grade = EXCLUDED.grade,
  question_number = EXCLUDED.question_number,
  correct_answer = EXCLUDED.correct_answer,
  official_solution = EXCLUDED.official_solution,
  updated_at = NOW();

-- Verify inserts
SELECT id, year, grade, question_number, correct_answer, LEFT(official_solution, 50) as solution_preview
FROM gauss_source_questions
WHERE year = 2023 AND grade = 7
ORDER BY question_number;
