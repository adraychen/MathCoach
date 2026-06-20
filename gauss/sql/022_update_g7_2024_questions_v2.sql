-- Update 2024 Grade 7 questions (Q3, Q8, Q11) in gauss_source_questions
-- Run this in Supabase SQL Editor

UPDATE gauss_source_questions
SET visual_description = 'Five labelled shapes A, B, C, D, and E are shown.

(A) An irregular quadrilateral with a vertical left side, a horizontal top side, a diagonal right side slanting down to the lower right, and a horizontal bottom side.

(B) A shape made from a rectangle-like left part joined to a rounded semicircular right side. It has a flat bottom, a vertical left side, a slanted upper-left edge, a short horizontal top edge, and a curved right edge.

(C) An L-shaped rectilinear polygon made from two joined rectangles. It has only horizontal and vertical edges, with a step-like notch on the upper right.

(D) A thin slanted triangular shape, like a narrow kite or wedge, with one long diagonal edge and one shorter diagonal edge meeting at a point.

(E) A rectangle with horizontal top and bottom sides and vertical left and right sides.'
WHERE year = 2024 AND grade = 7 AND question_number = 3;

UPDATE gauss_source_questions
SET options = '{"A": "○", "B": "◄", "C": "⊠", "D": "△", "E": "★"}',
    visual_required = false,
    visual_type = 'none',
    visual_description = null
WHERE year = 2024 AND grade = 7 AND question_number = 8;

UPDATE gauss_source_questions
SET question_text = 'In the subtraction of the two-digit numbers shown, the letters P and Q each represent a single digit.

  8P
- Q6
----
  49

The value of P + Q is',
    visual_required = false,
    visual_type = 'none',
    visual_description = null
WHERE year = 2024 AND grade = 7 AND question_number = 11;

-- Verify updates
SELECT question_number, question_text, options, visual_required, visual_type, visual_description
FROM gauss_source_questions
WHERE year = 2024 AND grade = 7 AND question_number IN (3, 8, 11)
ORDER BY question_number;
