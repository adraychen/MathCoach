-- Update 2023 Grade 7 questions in gauss_source_questions
-- Columns: options, official_solution, visual_required, visual_type, visual_description

UPDATE gauss_source_questions SET
  options = '{"A": "2", "B": "4", "C": "6", "D": "12", "E": "48"}',
  official_solution = 'Half of 24 is 24 ÷ 2 = 12. Kiyana gives her friend 12 grapes. Answer: (D)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2023 AND grade = 7 AND question_number = 1;

UPDATE gauss_source_questions SET
  options = '{"A": "Tuesday", "B": "Thursday", "C": "Friday", "D": "Saturday", "E": "Sunday"}',
  official_solution = 'Reading from the graph, Friday had the highest temperature. Answer: (C)',
  visual_required = true,
  visual_type = 'bar_graph',
  visual_description = 'A bar graph titled Daily Temperature shows temperatures in degrees Celsius for Monday through Sunday. The heights of the bars are compared to determine which day has the highest temperature.'
WHERE year = 2023 AND grade = 7 AND question_number = 2;

UPDATE gauss_source_questions SET
  options = '{"A": "$64.00", "B": "$66.00", "C": "$64.50", "D": "$65.50", "E": "$65.00"}',
  official_solution = 'At a cost of $16.50 a basket, the cost to buy 4 baskets of strawberries is 4 × $16.50 = $66.00. Answer: (B)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2023 AND grade = 7 AND question_number = 3;

UPDATE gauss_source_questions SET
  options = '{"A": "8", "B": "3", "C": "2", "D": "13", "E": "5"}',
  official_solution = 'The difference between 3 and −5 is 3 − (−5) = 3 + 5 = 8. Therefore, it is now 8°C warmer. Answer: (A)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2023 AND grade = 7 AND question_number = 4;

UPDATE gauss_source_questions SET
  options = '{"A": "32", "B": "33", "C": "34", "D": "35", "E": "36"}',
  official_solution = 'Since 5 × 5 = 25 and each of the given answers is greater than 25, then the integer that Sarah multiplied by itself must have been greater than 5. Further, 6 × 6 = 36 and each of the given answers is less than or equal to 36. Thus, of the given answers, only 36 could be the result of multiplying an integer by itself. Alternatively, we may have noted that the result of multiplying an integer by itself is a perfect square, and of the answers given, 36 is the only perfect square. Answer: (E)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2023 AND grade = 7 AND question_number = 5;

UPDATE gauss_source_questions SET
  options = '{"A": "6 cm", "B": "7 cm", "C": "8 cm", "D": "9 cm", "E": "10 cm"}',
  official_solution = 'Since the perimeter of PQRS is 40 cm and SR = 16 cm, then the combined length of the remaining three sides is 40 cm − 16 cm = 24 cm. Each of the remaining three sides is equal in length, and so PQ = 24 cm ÷ 3 = 8 cm. Answer: (C)',
  visual_required = true,
  visual_type = 'geometry_diagram',
  visual_description = 'A quadrilateral PQRS is shown with vertices P and Q along the top and S and R along the bottom. Side SR is labelled 16 cm. The other three sides, including PQ, are indicated as equal in length.'
WHERE year = 2023 AND grade = 7 AND question_number = 6;

UPDATE gauss_source_questions SET
  options = '{"A": "52/5", "B": "52/7", "C": "52/4", "D": "52/3", "E": "52/6"}',
  official_solution = 'Dividing 52 by each of the given denominators, we get that 52/4 = 13 is the only whole number. Answer: (C)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2023 AND grade = 7 AND question_number = 7;

UPDATE gauss_source_questions SET
  options = '{"A": "10 cm", "B": "8 cm", "C": "4 cm", "D": "12 cm", "E": "6 cm"}',
  official_solution = 'The line segment with greatest length that joins two points on a circle is a diameter of the circle. Since the circle has a radius of 4 cm, then its diameter has length 2 × 4 cm = 8 cm, and so the greatest possible length of the line segment is 8 cm. Answer: (B)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2023 AND grade = 7 AND question_number = 8;

UPDATE gauss_source_questions SET
  options = '{"A": "3/10", "B": "4/10", "C": "5/10", "D": "6/10", "E": "7/10"}',
  official_solution = 'The number of integers in the list is 10. Of these integers, 5 are even: 10, 12, 14, 16, and 18. Thus, the probability that the chosen integer is even is 5/10. Answer: (C)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2023 AND grade = 7 AND question_number = 9;

UPDATE gauss_source_questions SET
  options = '{"A": "$15.16", "B": "$15.08", "C": "$15.22", "D": "$15.75", "E": "$15.38"}',
  official_solution = 'Before adding tax, the combined cost of the three items is $4.20 + $7.60 + $3.20 = $15.00. The 5% tax on $15.00 is 0.05 × $15.00 = $0.75, and so the total cost of the three items, after tax is added, is $15.00 + $0.75 = $15.75. Note that we could have calculated the 5% tax on each individual item, however doing so is less efficient than calculating tax on the $15.00 total. Answer: (D)',
  visual_required = true,
  visual_type = 'table',
  visual_description = 'A grocery receipt lists three items and prices before tax: Sponge $4.20, Shampoo $7.60, and Soap $3.20.'
WHERE year = 2023 AND grade = 7 AND question_number = 10;

UPDATE gauss_source_questions SET
  options = '{"A": "35 degrees", "B": "40 degrees", "C": "60 degrees", "D": "75 degrees", "E": "45 degrees"}',
  official_solution = 'Since BCD is a straight line segment, then ∠BCD = 180°. Therefore, ∠ACB = ∠BCD − ∠ACD = 180° − 75° = 105°. Since the sum of the three angles in △ABC is 180°, then ∠ABC = 180° − 105° − 35° = 40°. Answer: (B)',
  visual_required = true,
  visual_type = 'geometry_diagram',
  visual_description = 'Point D, C, and B lie on a straight line segment. Segment AC forms triangle ABC with angle A marked 35° and exterior angle ACD marked 75°.'
WHERE year = 2023 AND grade = 7 AND question_number = 11;

UPDATE gauss_source_questions SET
  options = '{"A": "3", "B": "4", "C": "5", "D": "6", "E": "7"}',
  official_solution = 'Of the 100 small identical squares, 28 are presently unshaded, and so 100 − 28 = 72 are shaded. So that 75% of the area of WXYZ is shaded, 75 of the 100 small squares must be shaded. Therefore, 75 − 72 = 3 more of the small squares must be shaded. Answer: (A)',
  visual_required = true,
  visual_type = 'grid_diagram',
  visual_description = 'Square WXYZ is divided into a 10 by 10 grid of 100 small identical squares. Some squares are shaded and the remaining squares are unshaded.'
WHERE year = 2023 AND grade = 7 AND question_number = 12;

UPDATE gauss_source_questions SET
  options = '{"A": "(5, 2)", "B": "(4, 4)", "C": "(1, 5)", "D": "(4, 5)", "E": "(2, 4)"}',
  official_solution = 'Suppose we call the unknown vertex V. The side of the rectangle joining the points (2, 1) and (2, 5) is vertical, and so the opposite side of the rectangle, the side joining (4, 1) to V, must also be vertical. This means that V has the same x-coordinate as (4, 1), which is 4. Similarly, the side of the rectangle joining the points (2, 1) and (4, 1) is horizontal, and so the opposite side of the rectangle, the side joining (2, 5) to V, must also be horizontal. This means that V has the same y-coordinate as (2, 5), which is 5. Therefore, the coordinates of the fourth vertex of the rectangle are (4, 5). Answer: (D)',
  visual_required = true,
  visual_type = 'coordinate_grid',
  visual_description = 'A coordinate grid shows three vertices of a rectangle at (2, 1), (4, 1), and (2, 5). The missing fourth vertex must complete the rectangle.'
WHERE year = 2023 AND grade = 7 AND question_number = 13;

UPDATE gauss_source_questions SET
  options = '{"A": "24", "B": "16", "C": "4", "D": "21", "E": "9"}',
  official_solution = 'The prime numbers that are less than 10 are 2, 3, 5, and 7. Thus, the only two different prime numbers whose sum is 10 are 3 and 7. The product of these two numbers is 3 × 7 = 21. Answer: (D)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2023 AND grade = 7 AND question_number = 14;

UPDATE gauss_source_questions SET
  options = '{"A": "9", "B": "12", "C": "10", "D": "5", "E": "6"}',
  official_solution = 'The given list, 2, 9, 4, n, 2n contains 5 numbers. The average of these 5 numbers is 6, and so the sum of the 5 numbers is 5 × 6 = 30. That is, 2 + 9 + 4 + n + 2n = 30 or 15 + 3n = 30, and so 3n = 15 or n = 5. Answer: (D)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2023 AND grade = 7 AND question_number = 15;

UPDATE gauss_source_questions SET
  options = '{"A": "4", "B": "6", "C": "2", "D": "3", "E": "5"}',
  official_solution = 'The sum of P and Q is equal to 5, and so P and Q are, in some order, either equal to 1 and 4, or they are equal to 2 and 3. The difference between R and S is equal to 5, and so R and S must be, in some order, equal to 1 and 6. Since R and S are equal to 1 and 6, then neither P nor Q can be 1, which means that P and Q cannot be equal to 1 and 4, and so they must be equal to 2 and 3. The only numbers from 1 to 6 not accounted for are 4 and 5. Since T is greater than U, then the number that replaces T is 5. Answer: (E)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2023 AND grade = 7 AND question_number = 16;

UPDATE gauss_source_questions SET
  options = '{"A": "48 cm2", "B": "36 cm2", "C": "72 cm2", "D": "9 cm2", "E": "54 cm2"}',
  official_solution = 'Solution 1: The area of △AED is equal to one-half its base times its height. Suppose the base of △AED is AE, then its height is BD, since AE is perpendicular to BD. Since AB = BC = 24 cm and E and D are the midpoints of their respective sides, then AE = 12 cm and BD = 12 cm. Thus, the area of △AED is 1/2 × 12 cm × 12 cm = 72 cm². Solution 2: The area of △AED is equal to the area of △ABD minus the area of △EBD. Suppose the base of △EBD is BD, then its height is EB. Since AB = BC = 24 cm and E and D are the midpoints of their respective sides, then EB = 12 cm and BD = 12 cm. Thus, the area of △EBD is 1/2 × 12 cm × 12 cm = 72 cm². The area of △ABD is equal to 1/2 × BD × AB = 1/2 × 12 cm × 24 cm = 144 cm². Thus, the area of △AED is 144 cm² − 72 cm² = 72 cm². Answer: (C)',
  visual_required = true,
  visual_type = 'geometry_diagram',
  visual_description = 'Triangle ABC is a right-angled isosceles triangle with the right angle at B. AB and BC are perpendicular equal sides, each 24 cm. D is the midpoint of BC, E is the midpoint of AB, and segment ED is drawn to form triangle AED.'
WHERE year = 2023 AND grade = 7 AND question_number = 17;

UPDATE gauss_source_questions SET
  options = '{"A": "0.75 cm", "B": "1 cm", "C": "1.25 cm", "D": "1.5 cm", "E": "1.75 cm"}',
  official_solution = 'The water is in the shape of a rectangular prism with a 2 cm by 5 cm base and depth 6 cm. Therefore, the volume of water is 2 cm × 5 cm × 6 cm = 60 cm³. A face of the prism having the greatest area has dimensions 5 cm by 8 cm. When the prism is tipped so that it stands on a 5 cm by 8 cm face, the water is once again in the shape of a rectangular prism with a 5 cm by 8 cm base and unknown depth. Suppose that after the prism is tipped, the water''s depth is d cm. Since the volume of water is still 60 cm³ when the prism is tipped, then 5 cm × 8 cm × d cm = 60 cm³ or 40d cm³ = 60 cm³, and so d = 60/40 = 3/2. When the prism is tipped so that it stands on a face with the greatest area, the depth of the water is 3/2 cm = 1.5 cm. Answer: (D)',
  visual_required = true,
  visual_type = 'shape_diagram',
  visual_description = 'A closed rectangular prism has dimensions 2 cm by 5 cm by 8 cm. It is standing on the 2 cm by 5 cm face, and water inside has depth 6 cm.'
WHERE year = 2023 AND grade = 7 AND question_number = 18;

UPDATE gauss_source_questions SET
  options = '{"A": "11/36", "B": "2/9", "C": "1/36", "D": "1/6", "E": "5/36"}',
  official_solution = 'Solution 1: We begin by completing a table in which the ones digit of each possible product is listed. Of the 36 possible outcomes in the table, 6 outcomes have a ones digit that is equal to 0. Thus, the probability that the ones digit of the product is 0 is 6/36 = 1/6. Solution 2: Since the ones digit of the product is 0, then the product is divisible by 5 and is even. Since the possible numbers in the product are 1, 2, 3, 4, 5, 6, then one of the numbers rolled must be 5. Since the product is even and 5 is not, then the other number rolled must be one of the three even numbers, namely 2, 4, 6. Thus, the possible pairs of numbers that can be rolled to give a product whose ones digit is 0 are (5, 2), (5, 4), (5, 6), (2, 5), (4, 5), and (6, 5). Since there are 6 possible rolls for each of the two dice, then there are 6 × 6 = 36 possible ordered pairs representing all possible outcomes. Since 6 of these ordered pairs represent a product whose ones digit is 0, then the required probability is 6/36 = 1/6. Answer: (D)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2023 AND grade = 7 AND question_number = 19;

UPDATE gauss_source_questions SET
  options = '{"A": "4", "B": "1", "C": "0", "D": "5", "E": "2"}',
  official_solution = 'Since a and b are positive integers, then each of a/7 and 2/b is greater than 0. The sum of a/7 and 2/b is equal to 1, and so each is less than 1. Since a/7 is greater than 0 and less than 1, the possible values of a are 1, 2, 3, 4, 5, 6. Substituting a = 1 gives 2/b = 6/7, which gives b = 7/3, not an integer. Substituting a = 2 gives 2/b = 5/7, which gives 5b = 14, not an integer solution. Substituting a = 3 gives 2/b = 4/7, which gives 2b = 7, not an integer solution. Substituting a = 4 gives 2/b = 3/7, which gives 3b = 14, not an integer solution. Substituting a = 5 gives 2/b = 2/7, so b = 7. Substituting a = 6 gives 2/b = 1/7, so b = 14. Thus, there are two pairs of positive integers a and b that satisfy the equation: a = 5, b = 7 and a = 6, b = 14. Answer: (E)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2023 AND grade = 7 AND question_number = 20;

UPDATE gauss_source_questions SET
  options = '{"A": "51", "B": "32", "C": "44", "D": "34", "E": "33"}',
  official_solution = 'Since ABCD is a square and its side lengths are integers, then its area is equal to a perfect square. Since the product of the areas of ABCD and EFGH, the rectangle, is equal to 98, then the area of ABCD is a divisor of 98. The positive divisors of 98 are 1, 2, 7, 14, 49, and 98. There are exactly two divisors of 98 that are perfect squares, namely 1 and 49. Since the area of ABCD is greater than the area of EFGH, the area of ABCD is 49, and so the area of EFGH is 2, since 49 × 2 = 98. Square ABCD has area 49, and so AB = BC = CD = DA = 7. The perimeter of ABCDEFGH is AB + BC + CD + DE + EF + FG + GH + HA = 7 + 7 + 7 + DE + EF + EH + GH + HA, since EH = FG. Reorganizing, this equals 21 + DE + EH + HA + EF + GH = 21 + DA + EF + GH = 21 + 7 + EF + GH = 28 + 2 × GH, since EF = GH. Since the side lengths are integers and the area of EFGH is 2, either GH = 1 and FG = 2, or GH = 2 and FG = 1. If GH = 1, the perimeter is 28 + 2 × 1 = 30. Since 30 is not given as a possible answer, GH = 2 and the perimeter is 28 + 2 × 2 = 32. Answer: (B)',
  visual_required = true,
  visual_type = 'geometry_diagram',
  visual_description = 'An eight-sided polygon ABCDEFGH is formed from a square ABCD attached to a rectangle EFGH. The diagram shows the shared boundary and how the polygon is divided into the square and rectangle.'
WHERE year = 2023 AND grade = 7 AND question_number = 21;

UPDATE gauss_source_questions SET
  options = '{"A": "40", "B": "72", "C": "34", "D": "56", "E": "64"}',
  official_solution = 'If a Gareth sequence begins 10, 8, then the 3rd number in the sequence is 10 − 8 = 2, the 4th is 8 − 2 = 6, the 5th is 6 − 2 = 4, the 6th is 6 − 4 = 2, the 7th is 4 − 2 = 2, the 8th is 2 − 2 = 0, the 9th is 2 − 0 = 2, the 10th is 2 − 0 = 2, and the 11th is 2 − 2 = 0. Thus, the resulting sequence is 10, 8, 2, 6, 4, 2, 2, 0, 2, 2, 0, ... . The first 5 numbers are 10, 8, 2, 6, 4, the next 3 numbers are 2, 2, 0, and this block of 3 numbers appears to repeat. Since each new number is determined by the two previous numbers, this block of 3 numbers will continue to repeat. The first 30 numbers consist of the first 5 numbers, followed by 8 blocks of 2, 2, 0, followed by one additional 2, since 5 + 8 × 3 + 1 = 30. The sum of the first 5 numbers is 10 + 8 + 2 + 6 + 4 = 30. The sum of each repeating block is 2 + 2 + 0 = 4, and so the sum of 8 such blocks is 8 × 4 = 32. Thus, the sum of the first 30 numbers is 30 + 32 + 2 = 64. Answer: (E)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2023 AND grade = 7 AND question_number = 22;

UPDATE gauss_source_questions SET
  options = '{"A": "176", "B": "184", "C": "186", "D": "198", "E": "212"}',
  official_solution = 'Suppose that the length, width, or height of the rectangular prism is equal to 5. The product of 5 with any of the remaining digits has a units digit of 5 or 0. This means that if one of the dimensions is 5, at least one of the two-digit integers, the area of a face, has a units digit equal to 5 or 0. However, 0 is not a digit that can be used, and each digit from 1 to 9 is used exactly once, so 5 cannot be used twice. Thus, it is not possible for one of the dimensions to equal 5. Therefore, the digit 5 occurs in one of the two-digit integers, the area of a face. The digit 5 cannot be the units digit of the area of a face, since this would require one of the dimensions to be 5. Therefore, one of the areas of a face has tens digit 5. The two-digit integers with tens digit 5 that are equal to the product of two different one-digit integers not equal to 5 are 54 = 6 × 9 and 56 = 7 × 8. Suppose that two of the dimensions are 7 and 8, so one of the areas is 56. Then the digits 5, 6, 7, and 8 have been used, leaving 1, 2, 3, 4, and 9. The remaining dimension cannot be 1, since 1 × 7 and 1 × 8 do not give two-digit areas. It cannot be 2, since 2 × 8 = 16 and 6 has already been used. It cannot be 3, since 3 × 7 = 21 and 3 × 8 = 24, so the areas of two faces share the digit 2. It cannot be 4, since 4 × 7 = 28 and 8 has already been used. It cannot be 9, since 9 × 7 = 63 and 6 has already been used. Therefore, 7 and 8 cannot be dimensions of the prism, so 6 and 9 must be two of the three dimensions. A systematic check of the remaining digits gives 3 as the third dimension. When the dimensions are 3, 6 and 9, the areas of the faces are 3 × 6 = 18, 3 × 9 = 27, and 6 × 9 = 54, using each digit from 1 to 9 exactly once. The surface area is 2 × (18 + 27 + 54) = 2 × 99 = 198. Answer: (D)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2023 AND grade = 7 AND question_number = 23;

UPDATE gauss_source_questions SET
  options = '{"A": "14", "B": "12", "C": "24", "D": "10", "E": "20"}',
  official_solution = 'Solution 1: Begin by colouring the section at the top blue. Since two circles have the same colouring if one can be rotated to match the other, it does not matter which section is coloured blue, so we arbitrarily choose the top section. There are now 5 sections which can be coloured green. After choosing the section to be coloured green, there are 4 sections remaining which can be coloured yellow. Each of the remaining 3 sections must then be coloured red. Thus, the total number of different colourings of the circle is 5 × 4 = 20. Solution 2: Consider the locations of the three red sections relative to one another. The three red sections could be adjacent to one another, exactly two red sections could be adjacent to one another, or no red section could be adjacent to another red section. Case 1: If all three red sections are adjacent, then after fixing those adjacent red sections, the remaining blue, green and yellow sections can be arranged in 3 × 2 × 1 = 6 ways. Case 2: If exactly two red sections are adjacent, there are two different arrangements up to rotation. In each arrangement, the blue, green and yellow sections can again be arranged in 3 × 2 × 1 = 6 ways, giving 12 colourings. Case 3: If no red section is adjacent to another red section, then, up to rotation, there are 2 possible colourings. The total number of different colourings is 6 + 12 + 2 = 20. Answer: (E)',
  visual_required = true,
  visual_type = 'shape_diagram',
  visual_description = 'A circle is divided into six equal sectors. Three example colourings are shown using three red sectors, one blue sector, one green sector, and one yellow sector. Figures 1 and 2 match by rotation, while Figure 3 does not match Figure 1 by rotation.'
WHERE year = 2023 AND grade = 7 AND question_number = 24;

UPDATE gauss_source_questions SET
  options = '{"A": "191", "B": "185", "C": "261", "D": "95", "E": "175"}',
  official_solution = 'Let x be the number of students that participated in hiking and canoeing, but not swimming. Let y be the number of students that participated in hiking and swimming, but not canoeing. Let z be the number of students that participated in canoeing and swimming, but not hiking. Since 10 students participated in all three activities and no students participated in fewer than two activities, the only nonzero regions are x, y, z, and 10 in the centre. Suppose that the total number of students participating in the school trip was n. Since 50% of all students participated in at least hiking and canoeing, n/2 students participated in at least hiking and canoeing, so n must be divisible by 2. Since 60% of all students participated in at least hiking and swimming, 3n/5 students participated in at least hiking and swimming, so n must be divisible by 5. Thus n is divisible by 10. From the Venn diagram, x + 10 = n/2 and y + 10 = 3n/5. Also, x + y + z + 10 = n, so z = n − 10 − x − y. Thus x = n/2 − 10, y = 3n/5 − 10, and z = n − 10 − x − y. Since n is a positive multiple of 10, n = 10 gives x = −5, which is impossible. Trying successively greater multiples of 10: for n = 20, x = 0, y = 2, z = 8, so k = (8 + 10)/20 × 100 = 90. For n = 30, x = 5, y = 8, z = 7, so k ≈ 56.7, not an integer. For n = 40, x = 10, y = 14, z = 6, so k = 40. For n = 50, x = 15, y = 20, z = 5, so k = 30. For n = 60, x = 20, y = 26, z = 4, so k ≈ 23.3, not an integer. For n = 70, x = 25, y = 32, z = 3, so k ≈ 18.6, not an integer. For n = 80, x = 30, y = 38, z = 2, so k = 15. For n = 90, x = 35, y = 44, z = 1, so k ≈ 12.2, not an integer. For n = 100, x = 40, y = 50, z = 0, so k = 10. For values of n greater than 100, z < 0, which is not possible. Therefore, the possible positive integer values of k are 90, 40, 30, 15, and 10, and their sum is 90 + 40 + 30 + 15 + 10 = 185. Answer: (B)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2023 AND grade = 7 AND question_number = 25;
