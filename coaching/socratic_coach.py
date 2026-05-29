import os
from groq import Groq

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

MODEL_NAME = "llama-3.3-70b-versatile"


def get_question_text(question_data):
    """Get question text, supporting both old and new schema."""
    return question_data.get("question_text", question_data.get("question", ""))


def get_coaching_hints(question_data):
    """Get coaching hints if available."""
    return question_data.get("coaching_hints", [])


def get_key_insight(question_data):
    """Get key insight from solution if available."""
    solution = question_data.get("solution", {})
    return solution.get("key_insight", "")


def get_distractor_rationale(question_data, answer):
    """Get rationale for why a specific wrong answer might be chosen."""
    rationales = question_data.get("distractor_rationale", {})
    return rationales.get(answer, "")


def get_starting_coaching(question_data):

    question_text = get_question_text(question_data)
    hints = get_coaching_hints(question_data)
    first_hint = hints[0] if hints else ""

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
{question_text}

Suggested starting hint direction (use as inspiration, not verbatim):
{first_hint}
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

    question_text = get_question_text(question_data)
    distractor_reason = get_distractor_rationale(question_data, selected_answer)
    key_insight = get_key_insight(question_data)

    # Support both old schema (common_mistakes) and new schema (misconceptions)
    common_mistakes = question_data.get("common_mistakes", [])
    misconception_ids = question_data.get("misconceptions", [])

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
{question_text}

Options:
{question_data['options']}

Correct Answer:
{question_data['correct_answer']}

Student Selected:
{selected_answer}

Why student might have chosen this answer:
{distractor_reason}

Key insight needed:
{key_insight}

Common Mistakes:
{common_mistakes}

Misconception categories:
{misconception_ids}
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

    question_text = get_question_text(question_data)
    hints = get_coaching_hints(question_data)
    key_insight = get_key_insight(question_data)

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
{question_text}

Correct Answer:
{question_data['correct_answer']}

Key insight needed:
{key_insight}

Progressive hints available (reveal gradually if student is stuck):
{hints}
"""
    })

    messages.extend(conversation_history)

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages,
        temperature=0.2,
    )

    return response.choices[0].message.content