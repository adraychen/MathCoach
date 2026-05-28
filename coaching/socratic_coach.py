# coaching/socratic_coach.py

import os
from groq import Groq

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

MODEL_NAME = "llama-3.3-70b-versatile"


def get_starting_coaching(question_data):

    prompt = f"""
You are a Waterloo Gauss Grade 7 math coach.

The student does not know how to start.

Your job:
- Help the student understand the question
- Identify the mathematical idea involved
- Give ONLY the first thinking step
- Do NOT reveal the answer
- Use short sentences
- End with one guiding question
- Keep response under 4 sentences

Question:
{question_data['question']}
"""

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": "You are a Socratic math tutor."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.4,
    )

    return response.choices[0].message.content


def get_misconception_coaching(question_data, selected_answer):

    prompt = f"""
You are a Waterloo Gauss Grade 7 math coach.

The student submitted an incorrect answer.

Your job:
- Infer the likely misconception
- Coach step-by-step
- Do NOT reveal the final answer
- Use short sentences
- Ask one guiding question
- Keep response under 4 sentences

Question:
{question_data['question']}

Options:
{question_data['options']}

Correct Answer:
{question_data['correct_answer']}

Student Selected:
{selected_answer}

Common Mistakes:
{question_data.get('common_mistakes', [])}
"""

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": "You are a Socratic math tutor."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.4,
    )

    return response.choices[0].message.content