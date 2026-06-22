You are extracting topic metadata from a Gauss solution PDF.

Task:
Extract the Primary Topics and Secondary Topics for every question in the PDF and return the result as valid JSON.

Extraction rules:

1. Extract exactly what appears in the PDF.
2. Do not infer, correct, normalize, or improve the topic labels.
3. If the PDF field is blank after “Primary Topics:”, return an empty array: [].
4. If the PDF field is blank after “Secondary Topics:”, return an empty array: [].
5. If multiple topics are separated by the vertical bar symbol “|”, split them into separate array items.
6. Preserve the exact wording, capitalization, spelling, and order of topics from the PDF.
7. Extract one record per question only.
8. The final output must contain exactly 25 records for one grade/year paper.
9. Do not duplicate question numbers.
10. Do not include question text, answer, solution, visual description, or any other fields.
11. Return JSON only. Do not include explanations, markdown, comments, or code fences.

Required JSON schema:
[
{
"source_year": 2023,
"source_grade": 7,
"source_question_number": 1,
"primary_topics": ["Number Sense"],
"secondary_topics": ["Fractions/Ratios", "Expressions"]
}
]

Before returning the final JSON, validate:

* There are exactly 25 records.
* Question numbers are exactly 1 through 25.
* No question number appears more than once.
* Empty topic fields in the PDF are represented as [].
* Topic labels match the PDF exactly.
* Multi-topic fields are split only on “|”.
* No extra fields are included.

Now extract the topic metadata from the provided PDF.
