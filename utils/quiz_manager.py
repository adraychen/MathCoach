import random

QUIZ_LENGTH = 5

def generate_quiz(questions, topic, difficulty):

    filtered_questions = questions

    if topic != "All Topics":
        filtered_questions = [
            q for q in filtered_questions
            if q["topic"] == topic
        ]

    filtered_questions = [
        q for q in filtered_questions
        if q["difficulty"] == difficulty
    ]

    random.shuffle(filtered_questions)

    return filtered_questions[:QUIZ_LENGTH]