-- Update 2016 Grade 7 questions in gauss_source_questions
-- Columns: question_text, options, official_solution, visual_required, visual_type, visual_description

UPDATE gauss_source_questions SET
  question_text = 'The value of 333 + 33 + 3 is',
  options = '{"A": "2", "B": "4", "C": "6", "D": "12", "E": "48"}',
  official_solution = 'Evaluating, 333 + 33 + 3 = 366 + 3 = 369. Answer: (D)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2016 AND grade = 7 AND question_number = 1;

UPDATE gauss_source_questions SET
  question_text = 'The graph shows the number of text messages received by Tanner in a given week. On what day did Tanner receive the most text messages?',
  options = '{"A": "Tuesday", "B": "Thursday", "C": "Friday", "D": "Saturday", "E": "Sunday"}',
  official_solution = 'The day on which Tanner received the most text messages will be the day with the tallest corresponding bar. Thus, Tanner received the most text messages on Friday. Answer: (A)',
  visual_required = true,
  visual_type = 'bar_graph',
  visual_description = 'A bar graph titled ''Text Messages Received by Tanner'' shows the number of messages received each day from Monday to Sunday. The Friday bar is the tallest, at 50 messages.'
WHERE year = 2016 AND grade = 7 AND question_number = 2;

UPDATE gauss_source_questions SET
  question_text = 'Which of the following is a multiple of 7?',
  options = '{"A": "$64.00", "B": "$66.00", "C": "$64.50", "D": "$65.50", "E": "$65.00"}',
  official_solution = 'A number is a multiple of 7 if it is the result of multiplying 7 by an integer. Of the answers given, only 77 results from multiplying 7 by an integer, since 77 = 7 × 11. Equivalently, 77 ÷ 7 = 11 is an integer. Answer: (C)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2016 AND grade = 7 AND question_number = 3;

UPDATE gauss_source_questions SET
  question_text = 'Which of these fractions is larger than 1/2?',
  options = '{"A": "8", "B": "3", "C": "2", "D": "13", "E": "5"}',
  official_solution = 'A positive fraction is larger than 1/2 if its denominator is less than two times its numerator. Of the answers given, 4/7 is the only fraction in which the denominator, 7, is less than 2 times its numerator, 4, since 2 × 4 = 8. Therefore, 4/7 is larger than 1/2. Answer: (C)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2016 AND grade = 7 AND question_number = 4;

UPDATE gauss_source_questions SET
  question_text = 'A cube has exactly one face painted as shown. The other five faces of the cube are not painted. If the cube is rolled, which of the following could be the same cube?',
  options = '{"A": "32", "B": "33", "C": "34", "D": "35", "E": "36"}',
  official_solution = 'Rolling the cube does not change the size of the painted triangle, so answer (A) can be eliminated. Rolling the cube does not change the number of painted triangles, so answers (D) and (E) can be eliminated. Rolling the cube does not change the orientation of the painted triangle with respect to the face of the cube that it is painted on, so answer (C) can be eliminated. Of the given answers, the cube shown in (B) is the only cube which could be the same as the cube that was rolled. Answer: (B)',
  visual_required = true,
  visual_type = 'other_visual',
  visual_description = 'A cube is shown with exactly one painted triangular region on one face. Five answer-choice cube diagrams show possible orientations after the cube is rolled. The task is to decide which choice could show the same cube, preserving the size, number, and position of the painted triangular region on its face.'
WHERE year = 2016 AND grade = 7 AND question_number = 5;

UPDATE gauss_source_questions SET
  question_text = 'The measures of two angles of a triangle are 25° and 70°. The measure of the third angle is',
  options = '{"A": "6 cm", "B": "7 cm", "C": "8 cm", "D": "9 cm", "E": "10 cm"}',
  official_solution = 'The measure of the three angles in any triangle add to 180°. Since two of the angles measure 25° and 70°, the third angle measures 180° − 25° − 70° = 85°. Answer: (A)',
  visual_required = true,
  visual_type = 'geometry_diagram',
  visual_description = 'A quadrilateral PQRS with SR = 16 cm and three other equal sides.'
WHERE year = 2016 AND grade = 7 AND question_number = 6;

UPDATE gauss_source_questions SET
  question_text = 'A box of fruit contains 20 apples, 10 oranges, and no other fruit. When a fruit is randomly chosen from the box, what is the probability that the fruit is an orange?',
  options = '{"A": "52/5", "B": "52/7", "C": "52/4", "D": "52/3", "E": "52/6"}',
  official_solution = 'Each of the 30 pieces of fruit in the box is equally likely to be chosen. Since there are 10 oranges in the box, the probability that the chosen fruit is an orange is 10/30 = 1/3. Answer: (D)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2016 AND grade = 7 AND question_number = 7;

UPDATE gauss_source_questions SET
  question_text = 'Alex pays $2.25 to take the bus. Sam pays $3.00 to take the bus. If they each take the bus 20 times, how much less would Alex pay than Sam in total?',
  options = '{"A": "10 cm", "B": "8 cm", "C": "4 cm", "D": "12 cm", "E": "6 cm"}',
  official_solution = 'Since Alex pays $2.25 to take the bus, 20 trips would cost Alex 20 × $2.25 = $45. Since Sam pays $3.00 to take the bus, 20 trips would cost Sam 20 × $3.00 = $60. Therefore, Alex would pay $60 − $45 = $15 less than Sam. Equivalently, Alex pays $3.00 − $2.25 = $0.75 less per trip, and 20 × $0.75 = $15. Answer: (C)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2016 AND grade = 7 AND question_number = 8;

UPDATE gauss_source_questions SET
  question_text = 'Carrie is travelling at a constant speed of 85 km/h. If Carrie is halfway through a 510 km trip, how much longer will the trip take?',
  options = '{"A": "3/10", "B": "4/10", "C": "5/10", "D": "6/10", "E": "7/10"}',
  official_solution = 'At 85 km/h, the entire 510 km trip would take 510 ÷ 85 = 6 hours. Since Carrie is halfway through the trip, the remainder will take half of the total trip time, or 6 ÷ 2 = 3 hours. Equivalently, she has 510 ÷ 2 = 255 km left, and 255 ÷ 85 = 3 hours. Answer: (E)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2016 AND grade = 7 AND question_number = 9;

UPDATE gauss_source_questions SET
  question_text = 'Points P, Q and R are on a number line. Q is halfway between P and R. If P is at −6 and Q is at −1, then R is at',
  options = '{"A": "$15.16", "B": "$15.08", "C": "$15.22", "D": "$15.75", "E": "$15.38"}',
  official_solution = 'Since Q is halfway between P and R, the distance between P and Q is equal to the distance between Q and R. The distance between P and Q is −1 − (−6) = −1 + 6 = 5. Since P is 5 units to the left of Q, R is 5 units to the right of Q. Therefore, R is located at −1 + 5 = 4. Answer: (A)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2016 AND grade = 7 AND question_number = 10;

UPDATE gauss_source_questions SET
  question_text = 'The diagram shown contains octagons and squares only. The ratio of the number of octagons to the number of squares is',
  options = '{"A": "35 degrees", "B": "40 degrees", "C": "60 degrees", "D": "75 degrees", "E": "45 degrees"}',
  official_solution = 'In the diagram, there are 4 rows of octagons and each row contains 5 octagons, for a total of 4 × 5 = 20 octagons. There are 3 rows of squares and each row contains 4 squares, for a total of 3 × 4 = 12 squares. The ratio of octagons to squares is 20:12, which simplifies to 5:3. Answer: (E)',
  visual_required = true,
  visual_type = 'shape_diagram',
  visual_description = 'A tiled diagram contains octagons and squares only. There are 4 rows of octagons with 5 octagons in each row, and 3 rows of squares with 4 squares in each row.'
WHERE year = 2016 AND grade = 7 AND question_number = 11;

UPDATE gauss_source_questions SET
  question_text = 'In the sum shown, P and Q each represent a digit. The value of P + Q is',
  options = '{"A": "3", "B": "4", "C": "5", "D": "6", "E": "7"}',
  official_solution = 'The sum of the units column is Q + Q + Q = 3Q. Since Q is a single digit and 3Q ends in 6, the only possibility is Q = 2. Then 3Q = 6, so there is no carry to the tens column. The tens column becomes 2 + P + 2 = P + 4. Since P is a single digit and P + 4 ends in 7, the only possibility is P = 3. There is no carry to the hundreds column. The hundreds column is then 3 + 3 + 2 = 8. Therefore, P + Q = 3 + 2 = 5. Answer: (B)',
  visual_required = true,
  visual_type = 'other_visual',
  visual_description = 'A vertical addition problem is shown with three addends PQQ, PPQ, and QQQ, and sum 876. The letters P and Q each represent a digit.'
WHERE year = 2016 AND grade = 7 AND question_number = 12;

UPDATE gauss_source_questions SET
  question_text = 'A larger cube has volume 64 cm³. A smaller cube has edges that are half the length of the edges of the larger cube. What is the volume of the smaller cube?',
  options = '{"A": "24 cm³", "B": "48 cm³", "C": "8 cm³", "D": "16 cm³", "E": "27 cm³"}',
  official_solution = 'A cube has edges of equal length, so its volume is the product of three equal numbers. The larger cube has volume 64 cm³, and 64 = 4 × 4 × 4, so the length of each edge of the larger cube is 4 cm. The smaller cube has edges half as long, so each edge is 2 cm. Its volume is 2 × 2 × 2 = 8 cm³. Answer: (C)',
  visual_required = true,
  visual_type = 'coordinate_grid',
  visual_description = 'A coordinate plane with three points marked at (2,1), (4,1), and (2,5).'
WHERE year = 2016 AND grade = 7 AND question_number = 13;

UPDATE gauss_source_questions SET
  question_text = 'Ahmed chooses two different items for a snack. His choices are an apple, an orange, a banana, and a granola bar. How many different pairs of snacks could he choose?',
  options = '{"A": "24", "B": "16", "C": "4", "D": "21", "E": "9"}',
  official_solution = 'Ahmed could choose: apple and orange, apple and banana, apple and granola bar, orange and banana, orange and granola bar, or banana and granola bar. Therefore, there are 6 different pairs of snacks that Ahmed may choose. Answer: (D)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2016 AND grade = 7 AND question_number = 14;

UPDATE gauss_source_questions SET
  question_text = 'Sophia did push-ups every day for 7 days. Each day after the first day, she did 5 more push-ups than the day before. In total she did 175 push-ups. How many push-ups did Sophia do on the last day?',
  options = '{"A": "9", "B": "12", "C": "10", "D": "5", "E": "6"}',
  official_solution = 'Sophia did push-ups for 7 days, and each day she did 5 more than the day before. Since there are 7 days, the number of push-ups on the middle day, day 4, is equal to the average number per day. The average is 175 ÷ 7 = 25, so she did 25 push-ups on day 4. Then day 5 is 30, day 6 is 35, and day 7 is 40. We can check that 10 + 15 + 20 + 25 + 30 + 35 + 40 = 175. Answer: (E)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2016 AND grade = 7 AND question_number = 15;

UPDATE gauss_source_questions SET
  question_text = 'Each of □, △ and ♦ represents a non-zero number. If □ = △ + △ + △ and □ = ♦ + ♦, then □ + ♦ + △ equals',
  options = '{"A": "□ + △", "B": "♦ + △ + △ + △ + △", "C": "♦ + ♦ + □", "D": "△ + △ + △ + ♦ + ♦", "E": "♦ + ♦ + ♦ + △ + △"}',
  official_solution = 'Since □ = △ + △ + △, adding ♦ to both sides gives □ + ♦ = ♦ + △ + △ + △. Adding △ to both sides gives □ + ♦ + △ = ♦ + △ + △ + △ + △. Therefore, the matching expression is answer (B). Answer: (B)',
  visual_required = true,
  visual_type = 'other_visual',
  visual_description = 'The problem uses three symbols: a square, a triangle, and a diamond. The relationships shown are □ = △ + △ + △ and □ = ♦ + ♦. The expression to rewrite is □ + ♦ + △.'
WHERE year = 2016 AND grade = 7 AND question_number = 16;

UPDATE gauss_source_questions SET
  question_text = 'Triangle T is reflected once. Which of the following triangles cannot be this reflection of triangle T?',
  options = '{"A": "48 cm2", "B": "36 cm2", "C": "72 cm2", "D": "9 cm2", "E": "54 cm2"}',
  official_solution = 'Each of the triangles labelled A, B, D, and E can be obtained as the image of triangle T after reflection in some line. The triangle labelled C is the only triangle that cannot be a reflection of triangle T. Answer: (C)',
  visual_required = true,
  visual_type = 'coordinate_grid',
  visual_description = 'A coordinate grid shows triangle T and five labelled triangles A, B, C, D, and E in different positions and orientations. The task is to decide which labelled triangle cannot be obtained by reflecting triangle T once.'
WHERE year = 2016 AND grade = 7 AND question_number = 17;

UPDATE gauss_source_questions SET
  question_text = 'The mean (average) of a set of six numbers is 10. When the number 25 is removed from the set, the mean of the remaining numbers is',
  options = '{"A": "0.75 cm", "B": "1 cm", "C": "1.25 cm", "D": "1.5 cm", "E": "1.75 cm"}',
  official_solution = 'The mean of the set of six numbers is 10, so the sum of the six numbers is 6 × 10 = 60. If 25 is removed, the sum of the remaining five numbers is 60 − 25 = 35. The mean of the remaining five numbers is 35 ÷ 5 = 7. Answer: (B)',
  visual_required = true,
  visual_type = 'shape_diagram',
  visual_description = 'A rectangular prism with dimensions 2 cm x 5 cm x 8 cm containing water.'
WHERE year = 2016 AND grade = 7 AND question_number = 18;

UPDATE gauss_source_questions SET
  question_text = 'Suzy''s 5 m long ribbon has shaded and unshaded sections of equal length, as shown. Points A, B, C, D, E are equally spaced along the ribbon. If Suzy wants a ribbon that is 11/15 of the size of this ribbon, at which point could she make a single vertical cut?',
  options = '{"A": "11/36", "B": "2/9", "C": "1/36", "D": "1/6", "E": "5/36"}',
  official_solution = 'The shaded and unshaded sections have equal length. Since there are 5 such sections, each section is 1/5 = 3/15 of the ribbon. Measurements are taken from the left end. Point A is 3 sections from the left, so A is at 3 × 3/15 = 9/15 of the ribbon. Point D is 4 sections from the left, so D is at 4 × 3/15 = 12/15. Points B and C divide the section between A and D into 3 equal lengths, so B is at 10/15 and C is at 11/15. Therefore, Suzy should cut at point C. Answer: (C)',
  visual_required = true,
  visual_type = 'other_visual',
  visual_description = 'A horizontal 5 m ribbon is divided into five equal shaded and unshaded sections. Points A, B, C, D, and E are equally spaced along the ribbon near the boundary between the fourth and fifth sections. The question asks where to cut so that the left portion is 11/15 of the full ribbon.'
WHERE year = 2016 AND grade = 7 AND question_number = 19;

UPDATE gauss_source_questions SET
  question_text = 'In the diagram, four different integers from 1 to 9 inclusive are placed in the four boxes in the top row. The integers in the left two boxes are multiplied and the integers in the right two boxes are added and these results are then divided, as shown. The final result is placed in the bottom box. Which of the following integers cannot appear in the bottom box?',
  options = '{"A": "4", "B": "1", "C": "0", "D": "5", "E": "2"}',
  official_solution = 'Name the two left top boxes F and G, the two right top boxes H and J, the product box K, the sum box L, and the final bottom box M. Since F and G contain different integers, the maximum possible value of K is 8 × 9 = 72. Since H and J contain different integers, the minimum possible value of L is 1 + 2 = 3. If 20 were to appear in M and L = 3, then K would have to be 60, since 60 ÷ 3 = 20. But no two different integers from 1 to 9 have product 60. If L is at least 4, then K would have to be at least 4 × 20 = 80, which is greater than the maximum possible value 72. Therefore, 20 cannot appear in the bottom box. The other choices can appear: 6 × 8 divided by 1 + 2 gives 16; 8 × 9 divided by 1 + 2 gives 24; 6 × 7 divided by 2 + 4 gives 7; and 4 × 9 divided by 1 + 3 gives 9. Answer: (D)',
  visual_required = true,
  visual_type = 'other_visual',
  visual_description = 'A flow diagram has four top boxes. The left two top boxes are multiplied to form a left middle box. The right two top boxes are added to form a right middle box. The left middle result is divided by the right middle result to form the bottom box. The four top boxes must contain four different integers from 1 to 9.'
WHERE year = 2016 AND grade = 7 AND question_number = 20;

UPDATE gauss_source_questions SET
  question_text = 'A 10 by 10 grid is created using 100 points, as shown. Point P is given. One of the other 99 points is randomly chosen to be Q. What is the probability that the line segment PQ is vertical or horizontal?',
  options = '{"A": "51", "B": "32", "C": "44", "D": "34", "E": "33"}',
  official_solution = 'Line segment PQ is vertical if Q is chosen from the points in the column containing P. This column contains 9 points other than P. Line segment PQ is horizontal if Q is chosen from the points in the row containing P. This row contains 9 points other than P. These 9 row points are different from the 9 column points. Thus, there are 9 + 9 = 18 favourable choices for Q. Since there are 99 possible choices for Q, the probability is 18/99 = 2/11. Answer: (A)',
  visual_required = true,
  visual_type = 'grid_diagram',
  visual_description = 'A 10 by 10 array of equally spaced points is shown, with one point labelled P inside the grid. One of the other 99 points is chosen as Q.'
WHERE year = 2016 AND grade = 7 AND question_number = 21;

UPDATE gauss_source_questions SET
  question_text = 'The eight vertices of a cube are randomly labelled with the integers from 1 to 8 inclusive. Judith looks at the labels of the four vertices of one of the faces of the cube. She lists these four labels in increasing order. After doing this for all six faces, she gets the following six lists: (1, 2, 5, 8), (3, 4, 6, 7), (2, 4, 5, 7), (1, 3, 6, 8), (2, 3, 7, 8), and (1, 4, 5, 6). The label of the vertex of the cube that is farthest away from the vertex labelled 2 is',
  options = '{"A": "40", "B": "72", "C": "34", "D": "56", "E": "64"}',
  official_solution = 'Choose the vertex labelled 2. The vertex farthest away from it is the opposite vertex, which is the only vertex that does not lie on any face containing the vertex labelled 2. From the six face lists, the lists containing 2 are (1, 2, 5, 8), (2, 4, 5, 7), and (2, 3, 7, 8). Thus, the vertices labelled 1, 5, 8, 4, 7, and 3 all lie on a face with the vertex labelled 2. The only label not included is 6, so the vertex farthest away from the vertex labelled 2 is labelled 6. Answer: (D)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2016 AND grade = 7 AND question_number = 22;

UPDATE gauss_source_questions SET
  question_text = 'Angie has a jar that contains 2 red marbles, 2 blue marbles, and no other marbles. She randomly draws 2 marbles from the jar. If the marbles are the same colour, she discards one and puts the other back into the jar. If the marbles are different colours, she discards the red marble and puts the blue marble back into the jar. She repeats this process a total of three times. What is the probability that the remaining marble is red?',
  options = '{"A": "176", "B": "184", "C": "186", "D": "198", "E": "212"}',
  official_solution = 'Let R represent a red marble and B represent a blue marble. On the first draw, Angie may draw RR, RB, or BB. If she draws RR or RB first, then she discards an R and the jar becomes RBB. On the second draw, she may draw RB or BB. If she draws RB, she discards R and the remaining marbles are BB, so the final marble cannot be red. If she draws BB, she discards B and the remaining marbles are RB; on the third draw, R is discarded and B remains. If Angie draws BB first, she discards B and the jar becomes RRB. On the second draw, she may draw RR or RB. In either case, one R is discarded and the final two marbles become RB; on the third draw, R is discarded and B remains. Therefore, under the given rules, the final marble can never be red, so the probability is 0. Answer: (E)',
  visual_required = false,
  visual_type = 'none',
  visual_description = NULL
WHERE year = 2016 AND grade = 7 AND question_number = 23;

UPDATE gauss_source_questions SET
  question_text = 'How many of the five numbers 101, 148, 200, 512, 621 cannot be expressed as the sum of two or more consecutive positive integers?',
  options = '{"A": "14", "B": "12", "C": "24", "D": "10", "E": "20"}',
  official_solution = 'First, 101, 148, 200, and 621 can be expressed as sums of two or more consecutive positive integers: 101 = 50 + 51; 148 = 15 + 16 + 17 + 18 + 19 + 20 + 21 + 22; 200 = 38 + 39 + 40 + 41 + 42; and 621 = 310 + 311. We show that 512 cannot be expressed this way. If 512 were the sum of an odd number p > 1 of consecutive positive integers, then the sum would equal the middle integer m times p, so 512 = mp. But 512 = 2^9 has no odd divisor greater than 1, so this is impossible. If 512 were the sum of an even number p > 1 of consecutive positive integers, the average would be halfway between two middle integers, m and m + 1, so 512 = (m + 1/2)p. Multiplying by 2 gives 1024 = (2m + 1)p. But 1024 = 2^10 has no odd divisor greater than 1, and 2m + 1 is odd and greater than 1, so this is impossible. Therefore 512 is not the sum of any number of consecutive positive integers. Exactly one of the five numbers cannot be expressed in the required way. Answer: (B)',
  visual_required = true,
  visual_type = 'pattern_diagram',
  visual_description = 'A circle divided into 6 equal sections.'
WHERE year = 2016 AND grade = 7 AND question_number = 24;

UPDATE gauss_source_questions SET
  question_text = 'In the triangle shown, the first diagonal line, 1, 2, 3, 4, ..., begins at 1 and each number after the first is one larger than the previous number. The second diagonal line, 2, 4, 6, 8, ... begins at 2 and each number after the first is two larger than the previous number. The nth diagonal line begins at n and each number after the first is n larger than the previous number. In which horizontal row does the number 2016 first appear?',
  options = '{"A": "191", "B": "185", "C": "261", "D": "95", "E": "175"}',
  official_solution = 'Consider diagonal lines that begin on the left edge and move downward to the right. The first number in the nth diagonal line is n and lies in row n. The second number is 2n and lies in row n + 1. The third number is 3n and lies in row n + 2. In general, the mth number in the nth diagonal line is m × n and lies in row n + m − 1. To find where 2016 first appears, write 2016 = m × n and minimize n + m − 1. The factor pairs of 2016 give row numbers including (32,63) → 94, (36,56) → 91, and (42,48) → 89. The closest factor pair is 42 × 48 = 2016, which minimizes m + n. Therefore, the first appearance of 2016 is in row 42 + 48 − 1 = 89. Answer: (E)',
  visual_required = true,
  visual_type = 'pattern_diagram',
  visual_description = 'A triangular array of numbers is shown. The first few horizontal rows are 1; then 2, 2; then 3, 4, 3; then 4, 6, 6, 4; then 5, 8, 9, 8, 5; then 6, 10, 12, 12, 10, 6. Diagonal lines begin at n on the left edge and increase by n down-right.'
WHERE year = 2016 AND grade = 7 AND question_number = 25;
