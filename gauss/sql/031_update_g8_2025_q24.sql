-- Update 2025 Grade 8 Q24 official_solution in gauss_source_questions
-- Run this in Supabase SQL Editor

UPDATE gauss_source_questions
SET official_solution = 'Suppose the integer in the centre circle is a.

Then each integer in a circle connected to the centre circle is either d more than a, which is a + d, or it is d less than a, which is a − d.

The integers in the two circles connected to the centre could both be a + d, as in Figure 1 below, or they could both be a − d, as in Figure 2, or one could be a − d and one could be a + d, as in Figure 3.

(Figure 1 shows the centre circle labelled a, with both circles directly connected to the centre labelled a + d. Figure 2 shows the centre circle labelled a, with both circles directly connected to the centre labelled a − d. Figure 3 shows the centre circle labelled a, with one circle directly connected to the centre labelled a − d and the other circle directly connected to the centre labelled a + d.)

We note that in the last case (Figure 3), swapping locations of the a − d and the a + d does not change the integers in the final two empty circles (since they still depend on a + d and a − d), and thus does not change the sum of the five integers.

Next, we explain why it is possible to place integers into the remaining two circles (in each of the three cases above) so that the positive difference between each pair of integers in connected circles is d.

For the case that began in Figure 1, the integers in the two empty circles are either d more than a + d, which is a + 2d, or they are d less than a + d, which is a.

These integers could both be a + 2d, as in Figure 1a below, or they could both be a, as in Figure 1b, or one could be a + 2d and one could be a, as in Figure 1c.

(Figure 1a shows the centre circle labelled a, the two circles connected to the centre labelled a + d, and the two remaining outer circles labelled a + 2d. Figure 1b shows the centre circle labelled a, the two circles connected to the centre labelled a + d, and the two remaining outer circles labelled a. Figure 1c shows the centre circle labelled a, the two circles connected to the centre labelled a + d, with one remaining outer circle labelled a + 2d and the other remaining outer circle labelled a.)

We note that in the last case (Figure 1c), swapping locations of the final two integers, a + 2d and a, does not change the sum of the five integers.

For the case that began in Figure 2, the integers in the two empty circles are either d more than a − d, which is a, or they are d less than a − d, which is a − 2d.

These integers could both be a, as in Figure 2a below, or they could both be a − 2d, as in Figure 2b, or one could be a and one could be a − 2d, as in Figure 2c.

(Figure 2a shows the centre circle labelled a, the two circles connected to the centre labelled a − d, and the two remaining outer circles labelled a. Figure 2b shows the centre circle labelled a, the two circles connected to the centre labelled a − d, and the two remaining outer circles labelled a − 2d. Figure 2c shows the centre circle labelled a, the two circles connected to the centre labelled a − d, with one remaining outer circle labelled a and the other remaining outer circle labelled a − 2d.)

We again note that in the last case (Figure 2c), swapping locations of the final two integers, a and a − 2d, does not change the sum of the five integers.

Finally, for the case that began in Figure 3, each integer in an empty circle must have a positive difference of d with both a − d and a + d.

The integer d more than a − d is a, and the integer d less than a − d is a − 2d.

The integer d more than a + d is a + 2d, and the integer d less than a + d is a.

Thus, a is the only integer that has a positive difference of d with both a − d and a + d, and so the integers in the two empty circles must each be equal to a, as shown in Figure 3a.

(Figure 3a shows the centre circle labelled a, the two circles connected to the centre labelled a − d and a + d, and the two remaining outer circles both labelled a.)

Suppose that the sum of the five integers in the circles is S.

For Case 1a (which corresponds to Figure 1a), adding the five integers in the figure, we get S = a + (a + d) + (a + 2d) + (a + d) + (a + 2d) = 5a + 6d.

In the table below, we determine the value of S for each of the 7 cases.

Case table:

| Case    | Sum S       |
| ------- | ----------- |
| Case 1a | S = 5a + 6d |
| Case 1b | S = 5a + 2d |
| Case 1c | S = 5a + 4d |
| Case 2a | S = 5a − 2d |
| Case 2b | S = 5a − 6d |
| Case 2c | S = 5a − 4d |
| Case 3a | S = 5a      |

We must determine the number of different integers d, between 1 and 20 inclusive, for which at least one of the seven expressions for S is equal to 54 and a is an integer.

Consider Case 1a, from which we get 5a + 6d = 54.

Since both a and d are integers, and d is between 1 and 20 inclusive, we can systematically substitute values of d into this equation, and then solve for a to determine if a is an integer.

For example if d = 1, we get 5a + 6 × 1 = 54 or 5a = 48.

However, there is no integer a for which 5a = 48 and so d = 1 is not a possible value of d in Case 1a. Substituting d = 2 and d = 3 similarly give non-integer values of a.

When d = 4, we get 5a + 6 × 4 = 54 and so 5a = 30 or a = 6.

In this case, the pair of integers d = 4 and a = 6 satisfy the equation 5a + 6d = 54.

Substituting d = 4 and a = 6 into Figure 1a, we get the diagram shown to the right.

(The example diagram for d = 4 and a = 6 shows Case 1a with centre value 6, the two circles connected to the centre labelled 10 and 10, and the two remaining outer circles labelled 14 and 14.)

We can confirm that the positive difference between each pair of integers in connected circles is 4 (an integer between 1 and 20 inclusive), and the sum of the five integers in the circles is 54, as required. Thus d = 4 is a possible value satisfying the given conditions.

We can systematically continue to substitute d = 5, 6, 7, ..., 20 into 5a + 6d = 54 and solve the equation to determine which values of d give integer values of a.

The next smallest value of d for which a is an integer is d = 9. In this case, we get 5a + 6 × 9 = 54 and so 5a = 0 or a = 0.

We could continue in this systematic way, however since there are 20 possible values of d and 7 cases to check, this would take a while to complete. Instead, we might recognize that d = 4, a = 6 and d = 9, a = 0 are both solutions to 5a + 6d = 54.

Notice that from the first solution to the second, the value of d increases by 5, and the value of a decreases by 6.

Can you see why increasing d by 5 and decreasing a by 6 gives the next possible pair of integers for which 5a + 6d = 54? (Hint: Take a close look at the left side of the equation.)

If we increase d by 5 again, and decrease a by 6, we get d = 9 + 5 = 14 and a = 0 − 6 = −6, and since 5a + 6d = 5 × (−6) + 6 × 14 = −30 + 84 = 54, then d = 14 and a = −6 is a solution to the equation (and in fact, this is the next smallest value of d that works).

The final integer value of d between 1 and 20 inclusive for which 5a + 6d = 54 is d = 14 + 5 = 19, and in this case a = −6 − 6 = −12 or (d, a) = (19, −12).

Therefore, Case 1a gives d = 4, 9, 14, and 19, or 4 values of d which satisfy the given conditions.

We continue in this way for each of the first four cases, and summarize all possible integer solutions for those cases in the table below.

Solution table:

| Case    | Equation     | Integer solutions                             | Possible values of d |
| ------- | ------------ | --------------------------------------------- | -------------------- |
| Case 1a | 5a + 6d = 54 | (d, a) = (4, 6), (9, 0), (14, −6), (19, −12)  | d = 4, 9, 14, 19     |
| Case 1b | 5a + 2d = 54 | (d, a) = (2, 10), (7, 8), (12, 6), (17, 4)    | d = 2, 7, 12, 17     |
| Case 1c | 5a + 4d = 54 | (d, a) = (1, 10), (6, 6), (11, 2), (16, −2)   | d = 1, 6, 11, 16     |
| Case 2a | 5a − 2d = 54 | (d, a) = (3, 12), (8, 14), (13, 16), (18, 18) | d = 3, 8, 13, 18     |

Notice that after the first four cases shown above, all possible values of d from 1 to 20 inclusive satisfy the given conditions with the exception of d = 5, 10, 15, and 20.

In Case 3a we get, 5a = 54 and so a is not an integer.

Next, consider Case 2b, 5a − 6d = 54.

Each value of d left to check (d = 5, 10, 15, 20) is a multiple of 5, and so 6d is a multiple of 5 for each of these possible values of d.

Since 5a is also a multiple of 5 for all possible integers a, then 5a − 6d is the difference between two multiples of 5, and thus is a multiple of 5.

However, the right side of the equation 5a − 6d = 54 is not a multiple of 5 and so d cannot be equal to a multiple of 5.

In the final case, 5a − 4d = 54, it is similarly not possible for d to be equal to a multiple of 5.

Thus d can be equal to each of the first 20 positive integers with the exception of 5, 10, 15, and 20, and so there are 20 − 4 = 16 different possible values of d.

It is worth noting that there are many different ways to find the integer solutions to each of the 7 equations (cases) above. For example, the value of each of the terms 6d, 2d, 4d, −2d, −6d, −4d, 0d is even for all integers d, and the right side of each equation, 54, is also even. This means that in each equation, the value of 5a must be even, and so a is even. Further, when a is even, the units digit of 5a is 0. Since the units digit of 54 is 4, what do we now know about the units digit of each term containing a d, and in each case, what does that tell us about the possible values of d?'
WHERE year = 2025 AND grade = 8 AND question_number = 24;

-- Verify update
SELECT question_number, official_solution
FROM gauss_source_questions
WHERE year = 2025 AND grade = 8 AND question_number = 24;
