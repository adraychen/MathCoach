### STYLE\_GUIDE: Waterloo Gauss Grade 7 Question Style

#### A. Waterloo Gauss Grade 7 Question Style Summary

The Waterloo Gauss style is **academic, direct, and neutral** 1-5. It prioritizes clarity over narrative, using the minimum amount of context required to frame a mathematical problem 3, 6, 7\. It avoids "classroom" language (e.g., "Let's learn how to...") and instead uses a **contest prompt tone** that assumes the student is ready to apply known concepts 8-10.

#### B. Core Wording Principles

* **Brevity:** Every word must serve the mathematical setup or the final question 1, 11, 12\.
* **Precision:** Use specific terms like "positive whole numbers," "prime factors," or "arithmetic mean" without over-explaining them 13-15.
* **Consistency:** Use identical phrasing for similar operations across different years (e.g., "What is the value of..." or "Which of the following...") 1, 11, 16-18.

#### C. Sentence Structure Rules

* **Structure:** Most questions follow a 1-3 sentence pattern: **Setup/Condition → Rule/Change → Target Question** 19-22.
* **Openers:** Use "If...", "In the diagram...", "A list of...", or "Suppose..." to introduce constraints 1, 12, 15, 19, 23\.
* **Length:** Keep sentences short. Part A questions are often a single sentence 1, 2, 4\. Part B/C use multiple sentences to layer constraints 23-26.

#### D. Vocabulary and Tone Rules

* **Tone:** Neutral and formal. Avoid exclamation marks, playful puns, or overly friendly greetings.
* **Grade 7 Lexicon:** Use: *integer, sum, product, mean (average), probability, sequence, palindrome, translation, coordinate, reflection* 13, 15, 27-30.
* **Avoid:** Instructional verbs like "Note that," "Remember," or "Calculate." Do not explain technical terms unless they are novel to the specific problem (e.g., "palindrome" is usually defined in the stem) 27, 31-33.

#### E. Context Rules

* **Common Contexts:** Sports scores, fruit/candy counts, bookstore sales, coin jars, simple geometric shapes, or unnamed "lists" of numbers 3, 7, 11, 28, 34\.
* **Names:** Use short, common, and diverse names (e.g., Dan, Joe, Susie, Sam, Brett, Juanita, Arjun, Becca) 7, 11, 25, 34, 35\.
* **Fluff:** Avoid "fluff" story details. If a name is used, they are simply performing an action (e.g., "Sam has only one measuring container") 36\.

#### F. Mathematical Wording Rules

* **Standard Phrasing:**
* "What is the value of..." 11, 16, 36
* "How many..." 14, 19, 33
* "Which of the following is closest to..." 2, 11
* "When the result... is calculated..." 24, 37
* **Units:** Place units in the stem or immediately after the numbers in the options (e.g., "20 cm" or "80%") 1, 6, 13, 35, 38\.

#### G. Visual Question Wording Rules

* **Reference:** Always refer to the visual explicitly at the start of the question (e.g., "In the diagram," or "Based on the graph shown...") 1, 3, 4, 7, 11, 16\.
* **Balance:** Place the data in the visual (labels, coordinates, side lengths) and use the text only to define the target or the rule 6, 11, 16, 29, 39, 40\.

#### H. Answer Choice Formatting Rules

* **Order:** Numerical choices must be ordered (usually smallest to largest) 1, 7, 12, 35, 41\.
* **Format:** Similar in format (e.g., all fractions, all decimals, or all percentages) 5, 24, 25, 41\.
* **Units:** If the question asks for a length or percentage, the unit should appear in every choice 1, 13, 35, 38\.

#### I. Part A, Part B, Part C Wording Differences

* **Part A:** Extremely concise. Setup and question are often combined into one phrase 1, 2, 4\.
* **Part B:** Adds 1-2 layers of logic or a two-step transformation 14, 19, 34\.
* **Part C:** Still concise but uses "multi-variable" setup or complex iterative rules (e.g., "James first replaces... Next, James multiplies...") 23, 26, 32, 42\.

#### J. Common Official Phrases

* "Which of the following is true...?" 38, 41
* "...is divisible by both..." 43
* "The ratio of... to... is..." 44, 45
* "Each digit... is used exactly once." 37, 46

#### K. Styles to Avoid

* **The "Lesson" Style:** Avoid explaining the "why" in the question stem.
* **Instructional Phrasing:** Avoid "Think about...", "Try to find...", or "Help Name figure out...".
* **Vague Definitions:** Avoid "Some numbers," use "A list of five numbers" 12, 39\.

#### L. Generator Prompt Rules for MathCoach

1. Use the **"If Context, then Question"** or **"Setup. What is Target?"** structure.
2. Maintain **neutral tone**; no encouraging or conversational remarks.
3. Order all numerical answer choices from **least to greatest**.
4. Reference visuals in the **first four words** of the question.

### STYLE\_FEATURE TABLE

style\_feature,official\_waterloo\_pattern,mathcoach\_generation\_rule,examples\_or\_notes,confidence
Tone,"Formal, neutral, contest-oriented.",Avoid conversational or instructional fluff.,"""What is the sum..."" not ""Can you find the sum...""",High
Sentence structure,Setup → Constraint → Question.,Use 1-3 sentences max.,"""If n=5, the value of n+2 is..."" 4",High
Visual referencing,"""In the diagram,"" or ""Based on the graph,""",Start question with visual reference if applicable.,"1, 3, 5",High
Answer choices,"Five options (A) to (E), ordered.",Always provide 5 ordered numerical options.,"1, 2, 7, 35",High
Naming,"Common, short names.","Use simple names like Dan, Joe, Sam.",Avoid complex or distracting names.,High
Units,Units following values in choices.,Keep units consistent across all options.,"""20 cm (A), 25 cm (B)...""",High
Technical Vocabulary,Assumes knowledge of G7 terms.,"Do not define 'mean', 'prime', or 'coordinate'.",13-15,High
Question Type,"""Which of the following...""",Use standard Waterloo openers.,"2, 11, 19",High

### PROMPT\_INSERT

**WRITING STYLE INSTRUCTIONS (Waterloo Gauss Grade 7):**Write all questions in a formal, concise contest style. **Avoid "classroom fluff"** like "Let's explore," "Help Dan," or instructional hints. Use a **direct setup structure**: provide the context or conditions first (often using "If...", "Suppose...", or "A list of..."), followed by a specific question (using "What is...", "How many...", or "Which of the following..."). If a visual is required, start the question with "In the diagram," or "Based on the graph shown,". Ensure all numerical answer choices are provided in **increasing order** and use consistent formatting. **Use technical terms** like "integer," "prime factor," and "mean" without explanation. Keep Part A questions to 1 sentence, Part B to 2, and Part C to 3-4 concise sentences.
