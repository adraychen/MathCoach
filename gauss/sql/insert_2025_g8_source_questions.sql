-- Insert 2025 Grade 8 questions into gauss_source_questions
-- Missing columns (correct_answer, official_solution, etc.) are left NULL

INSERT INTO gauss_source_questions (id, year, grade, question_number, part, question_text, options, visual_required, visual_type, visual_description)
VALUES
('waterloo_gauss_g8_2025_q01', 2025, 8, 1, 'A', 'In the diagram, how many of the 24 circles are shaded?', '{"A": "10", "B": "12", "C": "14", "D": "16", "E": "18"}', true, 'grid_diagram', 'Twenty-four circles are arranged in equal rows and columns. Some circles are shaded and some are unshaded. Students must determine how many circles are shaded.'),

('waterloo_gauss_g8_2025_q02', 2025, 8, 2, 'A', 'Seong-hun had 36 dried apricot pieces that he gave to his 4 children. Each child received the same number of pieces. How many pieces did each child receive?', '{"A": "12", "B": "6", "C": "3", "D": "9", "E": "10"}', false, 'none', NULL),

('waterloo_gauss_g8_2025_q03', 2025, 8, 3, 'A', 'Recycling is picked up every two weeks. Recycling was last picked up on May 12. On what date is the recycling picked up next?', '{"A": "May 19", "B": "May 20", "C": "May 25", "D": "May 26", "E": "May 27"}', false, 'none', NULL),

('waterloo_gauss_g8_2025_q04', 2025, 8, 4, 'A', 'At 8:45 a.m., Aisha starts a movie that is 2 hours and 45 minutes long. If she watches the movie all the way through without a pause or a break, at what time will it finish?', '{"A": "10:30 a.m.", "B": "11:15 a.m.", "C": "11:30 a.m.", "D": "10:50 a.m.", "E": "10:45 a.m."}', false, 'none', NULL),

('waterloo_gauss_g8_2025_q05', 2025, 8, 5, 'A', 'If 7x - 3 = 60, the value of x is', '{"A": "9", "B": "7", "C": "10", "D": "6", "E": "8"}', false, 'none', NULL),

('waterloo_gauss_g8_2025_q06', 2025, 8, 6, 'A', 'A figure is made by placing a triangle on top of a square, as shown. The triangle is coloured either red or yellow. The square is coloured either blue or purple or green. How many different ways can the figure be coloured?', '{"A": "5", "B": "3", "C": "9", "D": "6", "E": "2"}', true, 'shape_diagram', 'A figure consisting of a triangle placed directly on top of a square.'),

('waterloo_gauss_g8_2025_q07', 2025, 8, 7, 'A', 'The point (5, 7) is plotted on the graph shown. When (5, 7) is reflected in the x-axis, the resulting point is', '{"A": "(5, -7)", "B": "(-5, -7)", "C": "(5, 7)", "D": "(7, 5)", "E": "(-7, -5)"}', true, 'coordinate_grid', 'A coordinate grid with an x-axis and a y-axis. The point (5, 7) is plotted in the first quadrant.'),

('waterloo_gauss_g8_2025_q08', 2025, 8, 8, 'A', 'Each of Mrs. Myer''s students voted exactly once for their favourite season. Which of the following statements about the results in the graph shown is false?', '{"A": "Five students voted for Fall.", "B": "Winter received more votes than Spring.", "C": "Thirty-five students participated in this survey.", "D": "More than half of the students voted for Summer.", "E": "Fall and Spring received the same number of votes."}', true, 'bar_graph', 'A bar graph titled ''Favourite Season''. The horizontal axis is labelled ''Season'' with categories Spring, Summer, Fall, Winter. The vertical axis is labelled ''Number of Students'' with grid lines every 5 units from 0 to 15. The bar heights are: Spring 5, Summer 15, Fall 5, Winter 10.'),

('waterloo_gauss_g8_2025_q09', 2025, 8, 9, 'A', 'Ruhab wrote the list 5, 2, 8, 7, 9 and then erased one of the five digits. The sum of the remaining four digits was a multiple of 4. Which number did she erase?', '{"A": "5", "B": "2", "C": "8", "D": "7", "E": "9"}', false, 'none', NULL),

('waterloo_gauss_g8_2025_q10', 2025, 8, 10, 'A', 'An integer from 3 to 20, inclusive, is randomly selected. What is the probability that the integer selected is a perfect square?', '{"A": "3/20", "B": "1/9", "C": "1/6", "D": "1/10", "E": "2/9"}', false, 'none', NULL),

('waterloo_gauss_g8_2025_q11', 2025, 8, 11, 'B', 'What number goes in the box so that 28/32 + 1/[ ] = 1?', '{"A": "24", "B": "-3", "C": "7", "D": "16", "E": "8"}', false, 'none', NULL),

('waterloo_gauss_g8_2025_q12', 2025, 8, 12, 'B', 'Leticia can walk 1.5 km in 20 minutes. Walking at this same rate, how far does Leticia walk in 4 hours?', '{"A": "18 km", "B": "30 km", "C": "22.5 km", "D": "15 km", "E": "4.5 km"}', false, 'none', NULL),

('waterloo_gauss_g8_2025_q13', 2025, 8, 13, 'B', 'A list of one-digit integers contains exactly one 1, two 2s, three 3s, four 4s, five 5s, and six 6s. What is the median of this list?', '{"A": "2", "B": "3", "C": "4", "D": "5", "E": "6"}', false, 'none', NULL),

('waterloo_gauss_g8_2025_q14', 2025, 8, 14, 'B', 'In the diagram, which of the following pairs of angles have measures whose sum is equal to 180°?', '{"A": "w and z", "B": "z and y", "C": "u and x", "D": "t and y", "E": "s and x"}', true, 'geometry_diagram', 'Two parallel horizontal lines are intersected by a transversal line. The top intersection has an angle of 50 degrees in the top-left position, angle s in the top-right, angle u in the bottom-left, and angle t in the bottom-right. The bottom intersection has angle w in the top-left, angle x in the top-right, angle y in the bottom-left, and angle z in the bottom-right.'),

('waterloo_gauss_g8_2025_q15', 2025, 8, 15, 'B', 'The ages of three students are consecutive integers. Their mean (average) age is 13. A fourth student joins the group and the mean of their four ages is 14. How old is the fourth student?', '{"A": "15", "B": "18", "C": "16", "D": "14", "E": "17"}', false, 'none', NULL),

('waterloo_gauss_g8_2025_q16', 2025, 8, 16, 'B', 'At Doggy Daycare, there is one dog for every bowl of food, two dogs for every bowl of water, and three dogs for every bowl of treats. Every dog gets a serving of food, water and treats. If there are a total of 77 bowls, how many dogs are there?', '{"A": "35", "B": "77", "C": "42", "D": "11", "E": "24"}', false, 'none', NULL),

('waterloo_gauss_g8_2025_q17', 2025, 8, 17, 'B', 'Points B and D lie on sides AC and CE, respectively, of triangle ACE, as shown. If angle CAE = angle CBD = 90° and CB = BD = DE, the measure of angle ABE is', '{"A": "60°", "B": "67.5°", "C": "70°", "D": "75°", "E": "52.5°"}', true, 'geometry_diagram', 'A right-angled triangle ACE with the right angle at A. Point B is on AC and point D is on CE. A line segment connects B and D, and another connects B and E. Angle CBD is a right angle. Segments CB, BD, and DE have tick marks indicating they are equal in length.'),

('waterloo_gauss_g8_2025_q18', 2025, 8, 18, 'B', 'Two standard six-sided dice are rolled. If the two numbers on the top faces are multiplied, which of the following products is most likely?', '{"A": "4", "B": "6", "C": "9", "D": "15", "E": "8"}', false, 'none', NULL),

('waterloo_gauss_g8_2025_q19', 2025, 8, 19, 'B', 'How many ordered pairs of positive integers (m, n) are there so that m^2 × n = 2025?', '{"A": "3", "B": "7", "C": "4", "D": "5", "E": "6"}', false, 'none', NULL),

('waterloo_gauss_g8_2025_q20', 2025, 8, 20, 'B', 'In the diagram, each of a, b and c is greater than zero. Which of the following expressions is not equal to the perimeter of this polygon?', '{"A": "4a + 4b", "B": "a + b + 7c", "C": "8c", "D": "2a + 2b + 4c", "E": "3a + 3b + 2c"}', true, 'shape_diagram', 'A rectilinear L-shaped polygon with all interior angles equal to 90°. The right vertical segment has length a. An interior vertical segment has length b. A bottom horizontal segment has length c. Matching tick marks indicate pairs of equal-length sides.'),

('waterloo_gauss_g8_2025_q21', 2025, 8, 21, 'C', 'In the diagram, each letter from A to H is equal to a different integer from 1 to 8. Also, H is a perfect square and is 1 more than D; 5 and 8 are in the same row; C is a multiple of both G and D; B is the largest prime number in the set; The value of B + G is even. What is the value of F?', '{"A": "2", "B": "6", "C": "1", "D": "7", "E": "8"}', true, 'grid_diagram', 'A 2 by 4 grid of cells. The top row contains the letters A, B, C, D from left to right. The bottom row contains the letters E, F, G, H from left to right.'),

('waterloo_gauss_g8_2025_q22', 2025, 8, 22, 'C', 'ABCD has vertices A(-3, -2), B(0, r), C(6, 10), and D(s, t). AB is parallel to CD, BC is parallel to AD, and r < 0. What is the value of r + s + t?', '{"A": "10", "B": "11", "C": "12", "D": "13", "E": "14"}', false, 'none', NULL),

('waterloo_gauss_g8_2025_q23', 2025, 8, 23, 'C', 'The number 2013 is multiplied by a positive integer n. The last four digits of the result are 2025. What is the sum of the digits of the smallest possible value of n?', '{"A": "17", "B": "13", "C": "15", "D": "14", "E": "16"}', false, 'none', NULL),

('waterloo_gauss_g8_2025_q24', 2025, 8, 24, 'C', 'In the diagram, circles are connected if they are joined by a line segment. Each circle is filled with one integer so that the positive difference between each pair of integers in connected circles is d, and the sum of the five integers in the circles is 54. For how many different values of d between 1 and 20 inclusive can the circles be filled in this way?', '{"A": "4", "B": "12", "C": "8", "D": "20", "E": "16"}', true, 'shape_diagram', 'A square configuration with five circles: one circle at each of the four corners and one circle in the center. Line segments connect the four corner circles to form a square. Additional line segments connect the center circle to the top-left corner and the bottom-right corner.'),

('waterloo_gauss_g8_2025_q25', 2025, 8, 25, 'C', 'The list 11, 12, 14, 23, 31, 44, 45, 46, 56, 64, 67, 74 can be arranged so that the units digit of each number matches the tens digit of the number that follows it. For example, 12, 23, 31, 11, 14, 44, 45, 56, 67, 74, 46, 64 is one such arrangement. How many such arrangements of the given list are possible?', '{"A": "18", "B": "24", "C": "36", "D": "30", "E": "12"}', false, 'none', NULL);
