/**
 * Question Context Resolver
 *
 * Builds one normalized question context object for the app/coaching layer.
 *
 * Priority rules:
 *
 * question_text:
 *   - Use gauss_source_questions.question_text if source record exists and is not null
 *   - Otherwise use gauss_questions.question_text
 *
 * options:
 *   - Use gauss_source_questions.options if source record exists and is not null
 *   - Otherwise use gauss_questions.options
 *
 * correct_answer:
 *   - Use gauss_questions.correct_answer as primary (authoritative for contest)
 *   - If missing, use gauss_source_questions.correct_answer as fallback
 *
 * official_solution:
 *   - Use gauss_source_questions.official_solution only
 *
 * psg_solution:
 *   - Use gauss_solutions.psg_solution_text
 *
 * coaching_plan:
 *   - Use gauss_coaching_plans when matching source_question_id exists
 *
 * Important:
 *   - Do not copy 2016-2025 question_text/options into gauss_questions
 *   - Use gauss_questions.question_text/options only for pre-2016 questions
 *     without a matching gauss_source_questions record
 *   - Coaching availability requires official_solution from gauss_source_questions
 *   - The resolver supports future fallback coaching, but it is not enabled yet
 */

/**
 * Fetches and resolves question context from all available sources
 *
 * @param {object} supabase - Supabase client
 * @param {string} contestCode - Contest code (e.g., 'G7gauss1')
 * @param {number} contestQuestionNumber - Question number within the contest
 * @returns {Promise<{success: boolean, context?: object, coachingAvailable?: boolean, error?: string}>}
 */
export async function resolveQuestionContext(supabase, contestCode, contestQuestionNumber) {
  // 1. Get contest
  const { data: contest, error: contestError } = await supabase
    .from('gauss_contests')
    .select('id')
    .eq('contest_code', contestCode)
    .single();

  if (contestError || !contest) {
    return { success: false, error: `Contest "${contestCode}" not found` };
  }

  // 2. Get question from gauss_questions (includes fallback fields)
  const { data: question, error: questionError } = await supabase
    .from('gauss_questions')
    .select(`
      id,
      contest_question_number,
      correct_answer,
      short_problem_summary,
      primary_topics,
      secondary_topics,
      difficulty_band,
      source_year,
      source_grade,
      source_question_number,
      question_text,
      options
    `)
    .eq('contest_id', contest.id)
    .eq('contest_question_number', contestQuestionNumber)
    .single();

  if (questionError || !question) {
    return { success: false, error: `Question ${contestQuestionNumber} not found in contest "${contestCode}"` };
  }

  // 3. Try to get source question (if source mapping exists)
  let sourceQuestion = null;
  if (question.source_year && question.source_grade && question.source_question_number) {
    const { data: srcData } = await supabase
      .from('gauss_source_questions')
      .select(`
        id,
        question_text,
        options,
        correct_answer,
        official_solution,
        reasoning_summary,
        solution_pattern,
        archetype,
        visual_required,
        visual_description
      `)
      .eq('year', question.source_year)
      .eq('grade', question.source_grade)
      .eq('question_number', question.source_question_number)
      .single();

    if (srcData) {
      sourceQuestion = srcData;
    }
  }

  // 4. Get PSG solution
  let psgSolution = null;
  const { data: solutionData } = await supabase
    .from('gauss_solutions')
    .select('psg_solution_text, psg_solution_summary')
    .eq('question_id', question.id)
    .single();

  if (solutionData) {
    psgSolution = solutionData;
  }

  // 5. Get coaching plan (if source question exists)
  let coachingPlan = null;
  if (sourceQuestion?.id) {
    const { data: planData } = await supabase
      .from('gauss_coaching_plans')
      .select(`
        first_step_prompt,
        coaching_goal,
        expected_reasoning_steps,
        key_concepts,
        common_misconceptions,
        adaptive_guidance_rules
      `)
      .eq('source_question_id', sourceQuestion.id)
      .single();

    if (planData) {
      coachingPlan = planData;
    }
  }

  // 6. Build resolved context with priority rules
  const resolvedContext = {
    // === Question metadata ===
    questionId: question.id,
    contestQuestionNumber: question.contest_question_number,
    shortProblemSummary: question.short_problem_summary,
    primaryTopics: question.primary_topics || [],
    secondaryTopics: question.secondary_topics || [],
    difficultyBand: question.difficulty_band,

    // === Correct answer ===
    // Primary: gauss_questions.correct_answer
    // Fallback: gauss_source_questions.correct_answer
    correctAnswer: question.correct_answer || sourceQuestion?.correct_answer || null,

    // === Question text ===
    // Primary: gauss_source_questions.question_text (if exists and not null)
    // Fallback: gauss_questions.question_text (for pre-2016 questions)
    questionText: sourceQuestion?.question_text ?? question.question_text ?? null,

    // === Options ===
    // Primary: gauss_source_questions.options (if exists and not null)
    // Fallback: gauss_questions.options (for pre-2016 questions)
    options: sourceQuestion?.options ?? question.options ?? null,

    // === Official solution ===
    // Only from gauss_source_questions
    officialSolution: sourceQuestion?.official_solution || null,

    // === PSG solution ===
    // From gauss_solutions
    psgSolutionText: psgSolution?.psg_solution_text || null,
    psgSolutionSummary: psgSolution?.psg_solution_summary || null,

    // === Reasoning metadata (source only) ===
    reasoningSummary: sourceQuestion?.reasoning_summary || null,
    solutionPattern: sourceQuestion?.solution_pattern || null,
    archetype: sourceQuestion?.archetype || null,
    visualRequired: sourceQuestion?.visual_required || null,
    visualDescription: sourceQuestion?.visual_description || null,

    // === Coaching plan ===
    coachingPlan: coachingPlan,

    // === Source info ===
    hasSourceQuestion: !!sourceQuestion,
    sourceQuestionId: sourceQuestion?.id || null,

    // === Fallback info (for future use) ===
    hasFallbackQuestionText: !sourceQuestion?.question_text && !!question.question_text,
    hasFallbackOptions: !sourceQuestion?.options && !!question.options,
  };

  // 7. Determine coaching availability
  // Current rule: coaching requires official_solution from gauss_source_questions
  // Future: may enable fallback coaching with question_text/options + psg_solution
  const coachingAvailable = !!resolvedContext.officialSolution;

  return {
    success: true,
    context: resolvedContext,
    coachingAvailable,
  };
}

/**
 * Gets the effective solution text based on priority
 * Priority: official_solution > psg_solution_text > coaching_plan steps
 *
 * @param {object} context - Resolved question context
 * @returns {string|null}
 */
export function getEffectiveSolution(context) {
  if (context.officialSolution) {
    return context.officialSolution;
  }
  if (context.psgSolutionText) {
    return context.psgSolutionText;
  }
  if (context.coachingPlan?.expected_reasoning_steps) {
    const steps = context.coachingPlan.expected_reasoning_steps;
    if (Array.isArray(steps)) {
      return steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
    }
    return steps;
  }
  return null;
}

/**
 * Gets the correct option text from options object
 *
 * @param {object} context - Resolved question context
 * @returns {string|null}
 */
export function getCorrectOptionText(context) {
  if (!context.correctAnswer || !context.options) {
    return null;
  }
  const letter = context.correctAnswer.toUpperCase();
  return context.options[letter] || context.options[letter.toLowerCase()] || null;
}

/**
 * Builds a context summary for logging/debugging
 *
 * @param {object} context - Resolved question context
 * @returns {object}
 */
export function getContextSummary(context) {
  return {
    questionId: context.questionId,
    contestQuestionNumber: context.contestQuestionNumber,
    correctAnswer: context.correctAnswer,
    hasSourceQuestion: context.hasSourceQuestion,
    hasQuestionText: !!context.questionText,
    hasOptions: !!context.options,
    hasOfficialSolution: !!context.officialSolution,
    hasPsgSolution: !!context.psgSolutionText,
    hasCoachingPlan: !!context.coachingPlan,
    hasFallbackQuestionText: context.hasFallbackQuestionText,
    hasFallbackOptions: context.hasFallbackOptions,
  };
}

/**
 * Checks if fallback coaching would be possible (for future use)
 * Fallback coaching requires: question_text + options + (psg_solution OR coaching_plan)
 *
 * @param {object} context - Resolved question context
 * @returns {boolean}
 */
export function canUseFallbackCoaching(context) {
  const hasQuestionContext = !!(context.questionText && context.options);
  const hasReasoningSupport = !!(context.psgSolutionText || context.coachingPlan);
  return hasQuestionContext && hasReasoningSupport;
}
