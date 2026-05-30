"""
Socratic coaching service.
Reused from coaching/socratic_coach.py
"""

from groq import Groq

from ..config import get_settings
from ..models.coaching import ChatMessage

settings = get_settings()
client = Groq(api_key=settings.groq_api_key)

MODEL_NAME = "llama-3.3-70b-versatile"

COACHING_RULES = """
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


async def get_starting_coaching(
    question_text: str,
    options: dict[str, str],
    coaching_hints: list[str],
) -> str:
    """Get initial coaching hint when student is stuck."""
    first_hint = coaching_hints[0] if coaching_hints else ""

    prompt = f"""
You are a Waterloo Gauss Grade 7 math coach.

The student does not know how to start.

{COACHING_RULES}

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


async def get_misconception_coaching(
    question_text: str,
    options: dict[str, str],
    correct_answer: str,
    selected_answer: str,
    misconceptions: list[str],
    distractor_rationale: dict[str, str | None] | None,
    key_insight: str | None,
) -> str:
    """Get coaching for a specific misconception after wrong answer."""
    distractor_reason = ""
    if distractor_rationale:
        distractor_reason = distractor_rationale.get(selected_answer, "")

    prompt = f"""
You are a Waterloo Gauss Grade 7 math coach.

The student submitted an incorrect answer.

{COACHING_RULES}

Question:
{question_text}

Options:
A: {options.get('A', '')}
B: {options.get('B', '')}
C: {options.get('C', '')}
D: {options.get('D', '')}
E: {options.get('E', '')}

Correct Answer:
{correct_answer}

Student Selected:
{selected_answer}

Why student might have chosen this answer:
{distractor_reason}

Key insight needed:
{key_insight or ''}

Misconception categories:
{misconceptions}
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


async def get_followup_coaching(
    question_text: str,
    correct_answer: str,
    coaching_hints: list[str],
    key_insight: str | None,
    conversation_history: list[ChatMessage],
) -> str:
    """Continue coaching conversation based on student response."""
    messages = [
        {
            "role": "system",
            "content": f"""
You are a Waterloo Gauss Grade 7 math coach.

{COACHING_RULES}
"""
        },
        {
            "role": "user",
            "content": f"""
Question:
{question_text}

Correct Answer:
{correct_answer}

Key insight needed:
{key_insight or ''}

Progressive hints available (reveal gradually if student is stuck):
{coaching_hints}
"""
        }
    ]

    # Add conversation history
    for msg in conversation_history:
        messages.append({
            "role": msg.role,
            "content": msg.content
        })

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages,
        temperature=0.2,
    )

    return response.choices[0].message.content
