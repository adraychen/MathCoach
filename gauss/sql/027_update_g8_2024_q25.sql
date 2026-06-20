-- Update 2024 Grade 8 Q25 official_solution in gauss_source_questions
-- Run this in Supabase SQL Editor

UPDATE gauss_source_questions
SET official_solution = 'The smallest possible value of d is closest to 6.40.

On a flat surface, the shortest distance between two points is along a straight line between the points. The ant must walk on the surface of the figure, and so to determine a straight line distance between P and Q, we can "flatten" the figure.

In the figures below, we show a straight line path whose distance is closest to 6.40 from each of the two perspectives.

(The figures show the same cube structure from two different perspectives. In each perspective, a path is drawn on the outside surface of the figure from P to Q. The path travels across exposed faces of the cubes rather than through the solid.)

To help see this path more clearly, we strip away all but the 5 cubes that the ant walks on, below.

(The next figures show only the 5 cubes used by this surface path. The cubes are labelled 1, 2, 3, 4, and 5. The labels identify the cubes whose faces are included in the flattened net that follows.)

To see that this path is along a straight line from P to Q, we draw a partial net of the previous diagrams. This partial net includes each face that the ant walks on.

(The partial net shows the relevant cube faces unfolded into a flat surface. The path from P to Q is now represented as a straight line across the unfolded faces.)

The numbers shown in the diagram below indicate that the face is from the cube with the matching number in the diagrams above.

(The numbered faces in the net correspond to the numbered cubes 1, 2, 3, 4, and 5 from the stripped-down cube diagrams.)

To determine the length of PQ, we position R so that PR is perpendicular to QR, as shown below.

(The final diagram adds point R to the partial net. Segment PR and segment QR form the legs of a right-angled triangle PQR, with PR = 5 and QR = 4.)

Triangle PQR is a right-angled triangle with PR = 5 and QR = 4, and so by the Pythagorean Theorem, we get PQ = √(5² + 4²) = √41, and so the distance d is closest to 6.40.

Since 6.40 is the smallest of the five choices given, and we have shown that there is a path of this length from P to Q on the figure''s surface, then the smallest possible value of d is 6.40.

Each of the other four given answers, 6.43, 6.48, 6.66, and 6.71 is a result of the ant travelling along other paths from P to Q. For example, there exists a second possible straight line path on a net of this figure for which PQ is approximately 6.71. Can you determine this path, and each of the other three paths from P to Q whose lengths are equal to 6.43, 6.48, and 6.66?

There are also paths different from the one shown above for which PQ = √41. Can you find these?'
WHERE year = 2024 AND grade = 8 AND question_number = 25;

-- Verify update
SELECT question_number, official_solution
FROM gauss_source_questions
WHERE year = 2024 AND grade = 8 AND question_number = 25;
