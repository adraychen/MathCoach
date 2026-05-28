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

Rules:
- Maximum 2 sentences
- Ask ONLY ONE guiding question
- Never reveal the final answer
- Focus ONLY on the first thinking step
- Use short simple sentences
- Do NOT explain multiple ideas at once

Question:
{question_data['question']}
"""

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": "You are a Socratic Waterloo math tutor."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3,
    )

    return response.choices[0].message.content


def get_misconception_coaching(question_data, selected_answer):

    prompt = f"""
You are a Waterloo Gauss Grade 7 math coach.

The student submitted an incorrect answer.

Rules:
- Maximum 2 sentences
- Ask ONLY ONE guiding question
- Never reveal the final answer
- Focus ONLY on the likely misconception
- Use short simple sentences
- Do NOT explain multiple ideas at once

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
            {
                "role": "system",
                "content": "You are a Socratic Waterloo math tutor."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3,
    )

    return response.choices[0].message.content


def get_followup_coaching(question_data, conversation_history):

    messages = [
        {
            "role": "system",
            "content": """
You are a Waterloo Gauss Grade 7 math coach.

Rules:
- Maximum 2 sentences
- Ask ONLY ONE guiding question
- Never reveal the final answer
- Focus ONLY on the student's current misunderstanding
- Use short simple sentences
- Do NOT explain multiple ideas at once
"""
        }
    ]

    messages.append({
        "role": "user",
        "content": f"""
Question:
{question_data['question']}

Correct Answer:
{question_data['correct_answer']}
"""
    })

    messages.extend(conversation_history)

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages,
        temperature=0.3,
    )

    return response.choices[0].message.content