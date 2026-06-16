-- Update 2017 Grade 7 questions in gauss_source_questions
-- Columns: question_text, visual_type, visual_required, visual_description, options, official_solution
-- NOTE: Source JSON file was labeled 2017 but contained 2018 data - verify year is correct

UPDATE gauss_source_questions SET
  question_text = 'The value of (2 + 4 + 6) − (1 + 3 + 5) is',
  options = '{"A": "12", "B": "13", "C": "14", "D": "15", "E": "16"}',
  official_solution = 'Evaluating, (2 + 4 + 6) − (1 + 3 + 5) = 12 − 9 = 3. Answer: (B)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2017 AND grade = 7 AND question_number = 1;

UPDATE gauss_source_questions SET
  question_text = 'Based on the graph shown, which sport is played by the most students?',
  options = '{"A": "40", "B": "80", "C": "100", "D": "20", "E": "60"}',
  official_solution = 'Reading from the tallest bar on the graph, approximately 50 students play soccer. Since this is larger than the number of students who play any of the other sports, then soccer is played by the most students. Answer: (C)',
  visual_required = true,
  visual_type = 'bar_graph',
  visual_description = 'A vertical bar graph titled ''Sports Played by Students'' shows the number of students playing hockey, basketball, soccer, volleyball, and badminton.'
WHERE year = 2017 AND grade = 7 AND question_number = 2;

UPDATE gauss_source_questions SET
  question_text = 'Michael has $280 in $20 bills. How many $20 bills does he have?',
  options = '{"A": "15", "B": "25", "C": "35", "D": "45", "E": "75"}',
  official_solution = 'Michael has $280 in $20 bills and so the number of $20 bills that he has is 280 ÷ 20 = 14. Answer: (C)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2017 AND grade = 7 AND question_number = 3;

UPDATE gauss_source_questions SET
  question_text = 'When two integers between 1 and 10 are multiplied, the result is 14. What is the sum of these two integers?',
  options = '{"A": "288 cm", "B": "72 cm", "C": "48 cm", "D": "12 cm", "E": "36 cm"}',
  official_solution = 'There are only two different products of two positive integers whose result is 14. These are 2 × 7 and 1 × 14. Since the two integers must be between 1 and 10, then the product must be 2 × 7. The sum of these two integers is 2 + 7 = 9. Answer: (D)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2017 AND grade = 7 AND question_number = 4;

UPDATE gauss_source_questions SET
  question_text = 'Three thousandths is equal to',
  options = '{"A": "Five $1 items and five $2 items", "B": "Nine $1 items and four $2 items", "C": "Nine $1 items and five $2 items", "D": "Two $1 items and six $2 items", "E": "Sixteen $1 items and no $2 items"}',
  official_solution = 'Written as a fraction, three thousandths is equal to 3/1000. As a decimal, three thousandths is equal to 3 ÷ 1000 = 0.003. Answer: (E)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2017 AND grade = 7 AND question_number = 5;

UPDATE gauss_source_questions SET
  question_text = 'In the square shown, x is equal to',
  options = '{"A": "5 / 2", "B": "11 / 4", "C": "11 / 5", "D": "13 / 4", "E": "13 / 5"}',
  official_solution = 'Solution 1: Since the given figure is a square, then PQ = QR and ∠PQR = 90°. Since PQ = QR, △PQR is isosceles and so ∠QPR = ∠QRP = x°. The three angles in any triangle add to 180° and since ∠PQR = 90°, then ∠QPR + ∠QRP = 180° − 90° = 90°. Since ∠QPR = ∠QRP, then ∠QRP = 90° ÷ 2 = 45°, and so x = 45. Solution 2: Diagonal PR divides square PQRS into two identical triangles: △PQR and △PSR. Since these triangles are identical, ∠PRS = ∠PRQ = x°. Since PQRS is a square, then ∠QRS = 90°. That is, ∠PRS + ∠PRQ = 90° or x° + x° = 90° or 2x = 90 and so x = 45. Answer: (B)',
  visual_required = true,
  visual_type = 'geometry_diagram',
  visual_description = 'A square PQRS is shown with diagonal PR drawn. The angle x° is marked at vertex R between the diagonal and one side of the square.'
WHERE year = 2017 AND grade = 7 AND question_number = 6;

UPDATE gauss_source_questions SET
  question_text = 'Which integer is closest in value to 35/4?',
  options = '{"A": "2 / 9", "B": "5 / 9", "C": "9 / 7", "D": "7 / 9", "E": "1 / 9"}',
  official_solution = 'Solution 1: Written as a mixed fraction, 35/4 = 8 3/4. Since 3/4 is closer to 1 than it is to 0, then 8 3/4 is closer to 9 than it is to 8. The integer closest in value to 35/4 is 9. Solution 2: Written as a decimal 35/4 = 35 ÷ 4 = 8.75. Since 0.75 is closer to 1 than it is to 0, then 8.75 is closer to 9 than it is to 8. The integer closest in value to 35/4 is 9. Answer: (C)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2017 AND grade = 7 AND question_number = 7;

UPDATE gauss_source_questions SET
  question_text = 'When n = 101, which of the following expressions has an even value?',
  options = '{"A": "12", "B": "24", "C": "7", "D": "81", "E": "4"}',
  official_solution = 'When n = 101: 3n = 3 × 101 = 303; n + 2 = 101 + 2 = 103; n − 12 = 101 − 12 = 89; 2n − 2 = 2 × 101 − 2 = 202 − 2 = 200; 3n + 2 = 3 × 101 + 2 = 303 + 2 = 305. Of the expressions given, 2n − 2 is the only expression which has an even value when n = 101. Answer: (D)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2017 AND grade = 7 AND question_number = 8;

UPDATE gauss_source_questions SET
  question_text = 'The sum of three consecutive integers is 153. The largest of these three integers is',
  options = '{"A": "50° and 90°", "B": "40° and 50°", "C": "50° and 80°", "D": "30° and 100°", "E": "60° and 70°"}',
  official_solution = 'The mean (average) of three integers whose sum is 153 is 153/3 = 51. The mean of three consecutive integers equals the middle of the three integers. That is, 51 is the middle integer of three consecutive integers and so the largest of these integers is 52. We may check that 50 + 51 + 52 = 153. Answer: (A)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2017 AND grade = 7 AND question_number = 9;

UPDATE gauss_source_questions SET
  question_text = 'In the diagram, △PQR is equilateral and is made up of four smaller equilateral triangles. If each of the smaller triangles has a perimeter of 9 cm, what is the perimeter of △PQR?',
  options = '{"A": "ALN", "B": "ZLN", "C": "AMR", "D": "AMQ", "E": "ZMQ"}',
  official_solution = 'Each of the 4 smaller triangles is equilateral and thus has sides of equal length. Each of these smaller triangles has a perimeter of 9 cm and so has sides of length 9/3 = 3 cm. In △PQR, side PQ is made up of two such sides of length 3 cm and thus PQ = 2 × 3 = 6 cm. Since △PQR is equilateral, then PR = QR = PQ = 6 cm. Therefore, the perimeter of △PQR is 3 × 6 = 18 cm. Answer: (E)',
  visual_required = true,
  visual_type = 'geometry_diagram',
  visual_description = 'An equilateral triangle PQR is divided into four congruent smaller equilateral triangles, with each side of the large triangle made of two smaller-triangle side lengths.'
WHERE year = 2017 AND grade = 7 AND question_number = 10;

UPDATE gauss_source_questions SET
  question_text = 'The number that goes into the box to make 3/7 = box/63 true is',
  options = '{"A": "4", "B": "5", "C": "6", "D": "7", "E": "8"}',
  official_solution = 'The denominators of the two fractions are 7 and 63. Since 7 × 9 = 63, then we must also multiply the numerator 3 by 9 so that the fractions are equivalent. That is, 3/7 = (3 × 9)/(7 × 9) = 27/63. Therefore, the number that goes into the box so that the statement is true is 27. Answer: (A)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2017 AND grade = 7 AND question_number = 11;

UPDATE gauss_source_questions SET
  question_text = 'At the Gaussian Store, puzzles cost $10 each or $50 for a box of 6 puzzles. If a customer would like exactly 25 puzzles, what is the minimum possible cost?',
  options = '{"A": "10 cm2", "B": "20 cm2", "C": "12 cm2", "D": "24 cm2", "E": "16 cm2"}',
  official_solution = 'If puzzles are bought individually for $10 each, then 6 puzzles will cost $10 × 6 = $60. Since the cost for a box of 6 puzzles is $50, it is less expensive to buy puzzles by the box than it is to buy them individually. Buying 4 boxes of 6 puzzles gives the customer 4 × 6 = 24 puzzles and the cost is 4 × $50 = $200. Buying one additional puzzle for $10 gives the customer 25 puzzles at a minimum cost of $210. Answer: (A)',
  visual_required = true,
  visual_type = 'geometry_diagram',
  visual_description = 'A perspective drawing of a rectangular prism with dimensions 1 cm, 2 cm, and 2 cm labeled.'
WHERE year = 2017 AND grade = 7 AND question_number = 12;

UPDATE gauss_source_questions SET
  question_text = 'When the shaded triangle shown is translated, which of the following triangles can be obtained?',
  options = '{"A": "9", "B": "12", "C": "13", "D": "14", "E": "15"}',
  official_solution = 'A translation moves or slides an object some distance without altering it in any other way. That is, the object is not rotated, reflected, and its exact size and shape are maintained. Of the triangles given, the triangle labelled D is the only triangle whose orientation is identical to that of the shaded triangle. Thus, D is the triangle which can be obtained when the shaded triangle is translated. Answer: (D)',
  visual_required = true,
  visual_type = 'coordinate_grid',
  visual_description = 'A coordinate grid shows one shaded triangle and five labelled triangles A, B, C, D, and E. The task is to identify which labelled triangle can be obtained by translating the shaded triangle.'
WHERE year = 2017 AND grade = 7 AND question_number = 13;

UPDATE gauss_source_questions SET
  question_text = 'When the time in Toronto, ON is 1:00 p.m., the time in Gander, NL is 2:30 p.m. A flight from Toronto to Gander takes 2 hours and 50 minutes. If the flight departs at 3:00 p.m. (Toronto time), what time will the flight land in Gander (Gander time)?',
  options = '{"A": "Monday", "B": "Tuesday", "C": "Friday", "D": "Saturday", "E": "Sunday"}',
  official_solution = 'Since the time in Toronto, ON is 1:00 p.m. when the time in Gander, NL is 2:30 p.m., then the time in Gander is 1 hour and 30 minutes ahead of the time in Toronto. A flight that departs from Toronto at 3:00 p.m. and takes 2 hours and 50 minutes will land in Gander at 5:50 p.m. Toronto time. When the time in Toronto is 5:50 p.m., the time in Gander is 1 hour and 30 minutes ahead which is 7:20 p.m. Answer: (A)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2017 AND grade = 7 AND question_number = 14;

UPDATE gauss_source_questions SET
  question_text = 'Five students ran a race. Ryan was faster than Henry and Faiz. Henry was slower than Faiz. Toma was faster than Ryan but slower than Omar. Which student finished fourth?',
  options = '{"A": "10", "B": "15", "C": "25", "D": "20", "E": "6"}',
  official_solution = 'Henry was slower than Faiz and thus finished the race behind Faiz. Ryan was faster than Henry and Faiz and thus finished the race ahead of both of them. From fastest to slowest, these three runners finished in the order Ryan, Faiz and then Henry. Toma was faster than Ryan but slower than Omar. Therefore, from fastest to slowest, the runners finished in the order Omar, Toma, Ryan, Faiz, and Henry. The student who finished fourth was Faiz. Answer: (A)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2017 AND grade = 7 AND question_number = 15;

UPDATE gauss_source_questions SET
  question_text = 'A circular spinner is divided into 20 equal sections, as shown. An arrow is attached to the centre of the spinner. The arrow is spun once. What is the probability that the arrow stops in a section containing a number that is a divisor of 20?',
  options = '{"A": "28", "B": "27", "C": "23", "D": "21", "E": "29"}',
  official_solution = 'The positive divisors of 20 are: 1, 2, 4, 5, 10, 20. Of the 20 numbers on the spinner, 6 of the numbers are divisors of 20. It is equally likely that the spinner lands on any of the 20 numbers. Therefore, the probability that the spinner lands on a number that is a divisor of 20 is 6/20. Answer: (E)',
  visual_required = true,
  visual_type = 'spinner_diagram',
  visual_description = 'A circular spinner is divided into 20 equal sections numbered 1 through 20, with an arrow attached at the centre.'
WHERE year = 2017 AND grade = 7 AND question_number = 16;

UPDATE gauss_source_questions SET
  question_text = 'The mean (average) of the four integers 78, 83, 82, and x is 80. Which one of the following statements is true?',
  options = '{"A": "1 / 3", "B": "1 / 6", "C": "1 / 12", "D": "1 / 18", "E": "1 / 19"}',
  official_solution = 'Solution 1: Since 78 is 2 less than 80 and 82 is 2 greater than 80, the mean of 78 and 82 is 80. Since the mean of all four integers is 80, then the mean of 83 and x must also equal 80. The integer 83 is 3 greater than 80, and so x must be 3 less than 80. That is, x = 80 − 3 = 77. Solution 2: Since the mean of the four integers is 80, then the sum of the four integers is 4 × 80 = 320. Since the sum of 78, 83 and 82 is 243, then x = 320 − 243 = 77. Therefore, x is 77 which is 3 less than the mean 80. Answer: (D)',
  visual_required = true,
  visual_type = 'shape_diagram',
  visual_description = 'Three concentric circles forming an inner circle, a shaded middle ring, and an unshaded outer ring.'
WHERE year = 2017 AND grade = 7 AND question_number = 17;

UPDATE gauss_source_questions SET
  question_text = 'Sara goes to a bookstore and wants to buy a book that is originally priced at $100. Which of the following options gives her the best discounted price?',
  options = '{"A": "−6", "B": "−2", "C": "0", "D": "2", "E": "6"}',
  official_solution = 'A discount of 20% on a book priced at $100 is a 0.20 × $100 = $20 discount. Thus for option (A), Sara''s discounted price is $100 − $20 = $80. A discount of 10% on a book priced at $100 is a 0.10 × $100 = $10 discount, giving a discounted price of $90. A second discount of 10% on the new price of $90 is a 0.10 × $90 = $9 discount. Thus for option (B), Sara''s discounted price is $81. A discount of 15% on a book priced at $100 is a $15 discount, giving a discounted price of $85. A further discount of 5% on the new price of $85 is $4.25, so option (C) gives $80.75. A discount of 5% gives $95, and a further discount of 15% on $95 is $14.25, so option (D) also gives $80.75. Therefore, the four options do not give the same price and option (A) gives Sara the best discounted price. Answer: (A)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2017 AND grade = 7 AND question_number = 18;

UPDATE gauss_source_questions SET
  question_text = 'Two sheets of 11 cm × 8 cm paper are placed on top of each other, forming an overlapping 8 cm × 8 cm square in the centre, as shown. The area of rectangle WXYZ is',
  options = '{"A": "135 cm", "B": "160 cm", "C": "170 cm", "D": "175 cm", "E": "148 cm"}',
  official_solution = 'In the diagram, rectangles WQRZ and PXYS are the two sheets of 11 cm × 8 cm paper. The overlapping square PQRS has sides of length 8 cm. That is, WQ = ZR = PX = SY = 11 cm and WZ = QR = PS = XY = PQ = SR = 8 cm. In rectangle WQRZ, WQ = WP + PQ = 11 cm and so WP = 11 − 8 = 3 cm. In rectangle WXYZ, WX = WP + PX = 3 + 11 = 14 cm. Since WX = 14 cm and XY = 8 cm, the area of WXYZ is 14 × 8 = 112 cm². Answer: (B)',
  visual_required = true,
  visual_type = 'geometry_diagram',
  visual_description = 'Two 11 cm by 8 cm rectangular sheets overlap perpendicularly to form an 8 cm by 8 cm square in the centre. The outside boundary is rectangle WXYZ.'
WHERE year = 2017 AND grade = 7 AND question_number = 19;

UPDATE gauss_source_questions SET
  question_text = 'Betty and Ann are walking around a rectangular park with dimensions 600 m by 400 m, as shown. They both begin at the top left corner of the park and walk at constant but different speeds. Betty walks in a clockwise direction and Ann walks in a counterclockwise direction. Points P, Q, R, S, T divide the bottom edge of the park into six segments of equal length. When Betty and Ann meet for the first time, they are between Q and R. Which of the following could be the ratio of Betty''s speed to Ann''s speed?',
  options = '{"A": "110", "B": "90", "C": "95", "D": "100", "E": "105"}',
  official_solution = 'Points P, Q, R, S, T divide the bottom edge of the park into six segments of equal length, each of which has length 600 ÷ 6 = 100 m. If Betty and Ann had met for the first time at point Q, then Betty would have walked 600 + 400 + 4 × 100 = 1400 m and Ann would have walked 400 + 2 × 100 = 600 m. Since they have walked for the same time, the ratio of their speeds equals the ratio of distances, 1400 : 600 = 7 : 3. If they had met at point R, Betty would have walked 600 + 400 + 3 × 100 = 1300 m and Ann would have walked 400 + 3 × 100 = 700 m, giving 1300 : 700 = 13 : 7. Since they meet between Q and R, the ratio must be less than 7 : 3 and greater than 13 : 7. Converting choices to fractions, 5/3 = 1 2/3, 9/4 = 2 1/4, 11/6 = 1 5/6, 12/5 = 2 2/5, and 17/7 = 2 3/7. The only value between 13/7 and 7/3 is 9/4, so the ratio could be 9 : 4. Answer: (B)',
  visual_required = true,
  visual_type = 'geometry_diagram',
  visual_description = 'A 600 m by 400 m rectangular park is shown. Betty and Ann start at the top-left corner and walk in opposite directions. Points P, Q, R, S, and T divide the bottom edge into six equal 100 m segments.'
WHERE year = 2017 AND grade = 7 AND question_number = 20;

UPDATE gauss_source_questions SET
  question_text = 'Rectangles that measure 4×2 are positioned in a pattern in which the top left vertex of each rectangle (after the top one) is placed at the midpoint of the bottom edge of the rectangle above it, as shown. When a total of ten rectangles are arranged in this pattern, what is the perimeter of the figure?',
  options = '{"A": "29", "B": "30", "C": "26", "D": "27", "E": "28"}',
  official_solution = 'Solution 1: The first and tenth rectangles each contribute two vertical sides of length 2, one full side of length 4, and one half of the opposite side of length 4. Thus each contributes 2 + 2 + 4 + 2 = 10 to the perimeter. Rectangles two through nine each contribute two vertical sides of length 2, one half of a side of length 4, and one half of the opposite side of length 4. Thus each of these eight rectangles contributes 2 + 2 + 2 + 2 = 8. Therefore, the total perimeter is (2 × 10) + (8 × 8) = 20 + 64 = 84. Solution 2: The 20 vertical sides each have length 2, contributing 40. The horizontal lengths consist of half-bottoms of the first nine rectangles, the full bottom of the tenth, half-tops of rectangles two through ten, and the full top of the first, for 18 + 4 + 18 + 4 = 44. Total perimeter is 40 + 44 = 84. Answer: (D)',
  visual_required = true,
  visual_type = 'pattern_diagram',
  visual_description = 'A stair-step pattern of 4 by 2 rectangles is shown. Each rectangle after the top one has its top-left vertex placed at the midpoint of the bottom edge of the rectangle above it.'
WHERE year = 2017 AND grade = 7 AND question_number = 21;

UPDATE gauss_source_questions SET
  question_text = 'In the six-digit number 1ABCDE, each letter represents a digit. Given that 1ABCDE × 3 = ABCDE1, the value of A + B + C + D + E is',
  options = '{"A": "7", "B": "6", "C": "5", "D": "9", "E": "8"}',
  official_solution = 'The units digit of 1ABCDE × 3 is 1, so the units digit of E × 3 must be 1. Thus E = 7. Since 7 × 3 = 21, carry 2. The units digit of D × 3 + 2 is 7, so the units digit of D × 3 is 5, giving D = 5. Since 5 × 3 = 15, carry 1. The units digit of C × 3 + 1 is 5, so the units digit of C × 3 is 4, giving C = 8. Since 8 × 3 = 24, carry 2. The units digit of B × 3 + 2 is 8, so the units digit of B × 3 is 6, giving B = 2. Since 2 × 3 = 6, there is no carry. The units digit of A × 3 is 2, giving A = 4. This gives 142857 × 3 = 428571, so A + B + C + D + E = 4 + 2 + 8 + 5 + 7 = 26. Answer: (B)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2017 AND grade = 7 AND question_number = 22;

UPDATE gauss_source_questions SET
  question_text = 'Given 8 dimes (10¢ coins) and 3 quarters (25¢ coins), how many different amounts of money can be created using one or more of the 11 coins?',
  options = '{"A": "4", "B": "5", "C": "6", "D": "7", "E": "8"}',
  official_solution = 'Given 8 dimes and 3 quarters, list the possible amounts in cents using 0 through 8 dimes and 0 through 3 quarters. With 0 quarters, the amounts are 0, 10, 20, 30, 40, 50, 60, 70, 80. With 1 quarter, the amounts are 25, 35, 45, 55, 65, 75, 85, 95, 105. With 2 quarters, the amounts are 50, 60, 70, 80, 90, 100, 110, 120, 130; the first four of these duplicate earlier amounts. With 3 quarters, the amounts are 75, 85, 95, 105, 115, 125, 135, 145, 155; the first four duplicate earlier amounts. Ignoring 0 because at least one coin must be used, there are 27 different positive amounts of money. Answer: (A)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2017 AND grade = 7 AND question_number = 23;

UPDATE gauss_source_questions SET
  question_text = 'Four vertices of a quadrilateral are located at (7, 6), (−5, 1), (−2, −3), and (10, 2). The area of the quadrilateral in square units is',
  options = '{"A": "28", "B": "27", "C": "31", "D": "34", "E": "22"}',
  official_solution = 'Construct rectangle ABCD around the quadrilateral PQRS. The vertical sides pass through Q(−5, 1) and S(10, 2), and the horizontal sides pass through P(7, 6) and R(−2, −3). The rectangle has width 10 − (−5) = 15 and height 6 − (−3) = 9, so its area is 135. Subtract the four right triangles around the quadrilateral. Their leg lengths are 5 and 12, 4 and 3, 5 and 12, and 4 and 3, so their areas are 30, 6, 30, and 6. Therefore, the area of the quadrilateral is 135 − 30 × 2 − 6 × 2 = 135 − 60 − 12 = 63. Answer: (B)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2017 AND grade = 7 AND question_number = 24;

UPDATE gauss_source_questions SET
  question_text = 'Ashley writes out the first 2017 positive integers. She then underlines any of the 2017 integers that is a multiple of 2, and then underlines any of the 2017 integers that is a multiple of 3, and then underlines any of the 2017 integers that is a multiple of 5. Finally, Ashley finds the sum of all the integers which have not been underlined. What is this sum?',
  options = '{"A": "85", "B": "99", "C": "66", "D": "81", "E": "67"}',
  official_solution = 'The sum of the positive integers from 1 to 2017 is 2017(2018)/2 = 2 035 153. To find the sum of the integers not underlined, subtract the sums of the multiples of 2, 3, and 5, then add back the sums of the multiples of 6, 10, and 15, and finally subtract the sum of the multiples of 30. The sum of multiples of 2 is 2(1 + 2 + ... + 1008) = 1 017 072. The sum of multiples of 3 is 3(1 + 2 + ... + 672) = 678 384. The sum of multiples of 5 is 5(1 + 2 + ... + 403) = 407 030. The sum of multiples of 6 is 6(1 + 2 + ... + 336) = 339 696. The sum of multiples of 10 is 10(1 + 2 + ... + 201) = 203 010. The sum of multiples of 15 is 15(1 + 2 + ... + 134) = 135 675. After subtracting multiples of 2, 3, and 5 and adding back multiples of 6, 10, and 15, the total is 611 048. Multiples of 30 have been added back too many times, so subtract their sum: 30(1 + 2 + ... + 67) = 68 340. The required sum is 611 048 − 68 340 = 542 708. Answer: (A)',
  visual_required = true,
  visual_type = 'pattern_diagram',
  visual_description = 'A triangle with circles at the vertices and circles along each of the three sides. There are 8 circles in total.'
WHERE year = 2017 AND grade = 7 AND question_number = 25;
