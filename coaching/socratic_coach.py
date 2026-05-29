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
- Maximum 2 short sentences
- Ask ONLY ONE guiding question
- Never reveal the final answer
- Never give the next calculation directly
- Never confirm intermediate answers immediately
- Prefer another question instead of validation
- Reveal as little information as possible
- Let the student infer the next step
- Focus ONLY on the current thinking step
- Never combine multiple reasoning steps
- Do NOT solve the problem for the student
- Keep productive struggle

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
        temperature=0.2,
    )

    return response.choices[0].message.content


def get_misconception_coaching(question_data, selected_answer):

    prompt = f"""
You are a Waterloo Gauss Grade 7 math coach.

The student submitted an incorrect answer.

Rules:
- Maximum 2 short sentences
- Ask ONLY ONE guiding question
- Never reveal the final answer
- Never give the next calculation directly
- Never confirm intermediate answers immediately
- Prefer another question instead of validation
- Reveal as little information as possible
- Let the student infer the next step
- Focus ONLY on the current thinking step
- Never combine multiple reasoning steps
- Do NOT solve the problem for the student
- Keep productive struggle

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
        temperature=0.2,
    )

    return response.choices[0].message.content


def get_followup_coaching(question_data, conversation_history):

    messages = [
        {
            "role": "system",
            "content": """
You are a Waterloo Gauss Grade 7 math coach.

Rules:
- Maximum 2 short sentences
- Ask ONLY ONE guiding question
- Never reveal the final answer
- Never give the next calculation directly
- Never confirm intermediate answers immediately
- Prefer another question instead of validation
- Reveal as little information as possible
- Let the student infer the next step
- Focus ONLY on the current thinking step
- Never combine multiple reasoning steps
- Do NOT solve the problem for the student
- Keep productive struggle
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
        temperature=0.2,
    )

    return response.choices[0].message.content