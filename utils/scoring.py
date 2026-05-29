def calculate_score(questions, answers):
    """
    Waterloo Gauss scoring:
    - Part A correct = 5
    - Part B correct = 6
    - Part C correct = 8
    - Blank = 2 points each (max 10 blanks)
    """

    score = 0

    correct_count = 0
    incorrect_count = 0
    blank_count = 0

    for question in questions:

        qid = question["id"]
        correct_answer = question["correct_answer"]

        user_answer = answers.get(qid)

        # Blank
        if user_answer is None:
            blank_count += 1
            continue

        # Correct
        if user_answer == correct_answer:

            difficulty = question["difficulty"]

            if difficulty == "part_a":
                score += 5
            elif difficulty == "part_b":
                score += 6
            elif difficulty == "part_c":
                score += 8

            correct_count += 1

        else:
            incorrect_count += 1

    # Waterloo blank bonus
    blank_bonus = min(blank_count, 10) * 2

    score += blank_bonus

    return {
        "score": score,
        "correct": correct_count,
        "incorrect": incorrect_count,
        "blank": blank_count,
        "blank_bonus": blank_bonus
    }