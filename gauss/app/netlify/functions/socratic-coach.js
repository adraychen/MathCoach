import { createClient } from '@supabase/supabase-js';
import { resolveQuestionContext, getCorrectOptionText as getOptionText, getContextSummary } from './lib/questionContextResolver.js';

/**
 * Netlify Function: Socratic Coach
 *
 * Supports stuck coaching and follow-up coaching.
 * Uses gauss_coaching_plans when available for more targeted guidance.
 *
 * POST /.netlify/functions/socratic-coach
 *
 * Headers:
 *   Authorization: Bearer <access_token>
 *
 * Body:
 *   {
 *     "set_code": "G7gauss1",
 *     "practice_question_number": 11,
 *     "coaching_trigger": "stuck" | "followup",
 *     "student_message": "",
 *     "conversation_history": []
 *   }
 */

// ============================================
// Base Coaching Rules (used when no plan exists)
// ============================================

const COACHING_RULES = `
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
`;

const CONCEPT_REPAIR_RULE = `
Concept repair rule:
If the student's response shows they do not understand a key word, concept, or prerequisite skill, give one short Grade 7-friendly clarification before asking your one guiding question. The clarification must explain only the missing concept needed for the current step. It must not solve the problem, reveal the final answer, or perform the next calculation.
`;

const RESPONSE_DECISION_TREE = `
Coaching decision tree:
1. If this is the first stuck-coaching message, help the student interpret the question wording and ask only the first thinking-step question.
2. If the student's response is vague or incomplete, ask a simpler guiding question.
3. If the student's response shows concept confusion, use the concept repair rule.
4. If the student is partially correct but incomplete, use the partial-progress rule. Do not restart with a broad strategy question.
5. If the student is on the right path, ask the next small-step question without over-praising.
6. If the student reaches the final answer and it matches the private correct answer, correct option text, or official solution, confirm the answer and tell the student to select and submit it on the answer card. Do not continue coaching.
7. If the student asks for the full solution, do not provide it in Socratic coaching; ask one next-step guiding question instead.
`;

const PARTIAL_PROGRESS_RULE = `
Partial-progress rule:
If the student's response is partly correct but missing one important piece, do not go back to a broad strategy question. Use the official solution privately to identify the missing piece, then ask one narrow gap-finding question that helps the student find only that missing piece. Do not directly state the missing value or final answer.
`;

const INCORRECT_INTERMEDIATE_STEP_RULE = `
Incorrect intermediate step rule:
If the student states an intermediate fact that conflicts with the private correct answer, correct option text, official solution, coaching plan, or known mathematical facts, do not continue reasoning from that incorrect statement. Briefly repair the mistaken step using the smallest explanation needed, then ask one small guiding question.
`;

const FINAL_ANSWER_AUTHORITY_RULE = `
Final-answer authority rule:
When deciding whether the student's latest response is FINAL_CORRECT, use the private correct answer, correct option text, official solution, and coaching plan as the authoritative context. Do not decide correctness only from the conversation history. If the student's latest response conflicts with the private correct answer, correct option text, or official solution, do not classify it as FINAL_CORRECT. If the student's latest response matches the correct answer in words, numbers, option text, equivalent wording, or equivalent correct reasoning, classify it as FINAL_CORRECT.
`;

const ANSWER_SUBMISSION_RULE = `
Answer submission rule:
If the student's latest response correctly answers the original contest question, stop coaching. Briefly confirm the answer and tell the student to select and submit the answer on the answer card. Do not ask another guiding question.

Important: If the student's response to a coaching sub-question also happens to be the correct final answer to the original contest question, classify it as FINAL_CORRECT immediately. Do not ask "Is this your answer?" or "Is this your final answer?" or any similar confirmation question. The student does not need to explicitly state it is their final answer.
`;

const PARTIAL_PROGRESS_EXAMPLES = `
Examples of partial-progress coaching. These are examples only; do not hardcode them:
- Question: The sum of the prime factors of 42 is. Student says: "3 and 7". Good response: "3 × 7 gives 21. What factor is still needed to make 42?" Bad response: "How can you use division to check if 42 can be broken down further?"
- If a student finds some favourable outcomes in a probability question but misses total outcomes, ask only about the missing total.
- If a student finds one side length in a geometry problem but misses another, ask only about the missing length relationship.
- If a student identifies a pattern but misses the cycle length, ask only about the repeating group.
`;

const CONCEPT_REPAIR_EXAMPLES = `
Examples of concept repair. These are examples only; do not hardcode them:
- If the student confuses factors with prime factors: "A prime factor must be both a factor and a prime number. Is your number prime?"
- If the student confuses perimeter with area: "Perimeter means the distance around a shape. What sides would you count?"
- If the student confuses mean with total: "The mean is the total divided by the number of values. What total would the mean represent?"
- If the student confuses probability with counting only favourable cases: "Probability compares favourable outcomes to total possible outcomes. What are the total possible outcomes?"
- If the student confuses diameter with radius: "A diameter goes all the way across a circle through the centre. How is it related to the radius?"
`;

const MODEL_NAME = 'llama-3.3-70b-versatile';

function normalizeMessages(conversationHistory = []) {
  if (!Array.isArray(conversationHistory)) return [];

  return conversationHistory
    .filter((msg) => msg && typeof msg.content === 'string' && msg.content.trim())
    .map((msg) => ({
      role: msg.role === 'student' ? 'user' : 'assistant',
      content: msg.content.trim(),
    }));
}

function buildTopicContext(context) {
  const topics = [];
  if (Array.isArray(context.primary_topics) && context.primary_topics.length > 0) {
    topics.push(`Primary topics: ${context.primary_topics.join(', ')}`);
  }
  if (Array.isArray(context.secondary_topics) && context.secondary_topics.length > 0) {
    topics.push(`Secondary topics: ${context.secondary_topics.join(', ')}`);
  }
  return topics.join('\n');
}

function buildPrivateContext(context) {
  // Build solution context with priority: official_solution > psg_solution_text > coaching_plan_steps
  let solutionContext = '';
  if (context.official_solution) {
    solutionContext = `Official solution, for private reference only:
${context.official_solution}`;
  } else if (context.psg_solution_text) {
    solutionContext = `PSG solution (fallback), for private reference only:
${context.psg_solution_text}`;
  } else if (context.coaching_plan_steps && context.coaching_plan_steps.length > 0) {
    const steps = Array.isArray(context.coaching_plan_steps)
      ? context.coaching_plan_steps.map((s, i) => `${i + 1}. ${s}`).join('\n')
      : context.coaching_plan_steps;
    solutionContext = `Expected reasoning steps (fallback), for private reference only:
${steps}`;
  } else {
    solutionContext = 'Solution: Not available. Use correct answer and options to guide.';
  }

  return `
Question:
${context.question_text || context.short_problem_summary || 'Question text not available'}

Answer options:
${context.options ? Object.entries(context.options).map(([k, v]) => `${k}: ${v}`).join('\n') : 'Not available'}

${buildTopicContext(context) ? `Curriculum context:\n${buildTopicContext(context)}\n` : ''}
${context.visual_description ? `Visual description, if needed:\n${context.visual_description}\n` : ''}
${context.archetype ? `Reasoning style, optional:\n${context.archetype}\n` : ''}
${context.reasoning_summary ? `Reasoning summary, private:\n${context.reasoning_summary}\n` : ''}
${context.solution_pattern ? `Solution pattern, private:\n${context.solution_pattern}\n` : ''}
Correct answer letter, private:
${context.correct_answer || 'Not available'}

Correct option text, private:
${getCorrectOptionText(context) || 'Not available'}

${solutionContext}

Use the solution only to know the correct path. Do not reveal it, even if the student asks for the full solution. Guide the student with questions instead.
`;
}

async function callGroq(messages) {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) return null;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Groq API call failed:', error);
    return null;
  }
}

async function getGroqStuckCoaching(context) {
  const prompt = `
You are a Waterloo Gauss Grade 7 math coach.

The student does not know how to start.

${COACHING_RULES}
${CONCEPT_REPAIR_RULE}
${RESPONSE_DECISION_TREE}
${PARTIAL_PROGRESS_RULE}
${INCORRECT_INTERMEDIATE_STEP_RULE}

${buildPrivateContext(context)}

For the first stuck-coaching message:
- Help the student interpret the question wording.
- Ask exactly one Grade 7-friendly guiding question.
- Ask only the first thinking-step question.
- Do not ask how to begin solving yet unless the wording itself is already clear.
- Do not ask a two-part question.
- Do not use "and" to combine two tasks.
- Do not reveal the final answer or the correct answer letter.
`;

  return callGroq([
    {
      role: 'system',
      content: 'You are a Socratic Waterloo math tutor for Grade 7 students. Ask exactly one guiding question at a time.',
    },
    { role: 'user', content: prompt },
  ]);
}

async function getGroqFollowupCoaching(context, studentMessage, conversationHistory) {
  const systemPrompt = `
You are a Socratic Waterloo Gauss Grade 7 math coach.

${COACHING_RULES}
${CONCEPT_REPAIR_RULE}
${RESPONSE_DECISION_TREE}
${CONCEPT_REPAIR_EXAMPLES}
${PARTIAL_PROGRESS_RULE}
${PARTIAL_PROGRESS_EXAMPLES}
${INCORRECT_INTERMEDIATE_STEP_RULE}
${FINAL_ANSWER_AUTHORITY_RULE}
${ANSWER_SUBMISSION_RULE}

${buildPrivateContext(context)}

Follow-up instructions:
- Read the student's latest response and the conversation history.
- First classify the student's latest response privately as one of these categories:
  1. FINAL_CORRECT: The student has given the correct final answer, the correct answer in words, the correct option value, or equivalent correct reasoning. Important: If the student's response to a coaching sub-question also happens to be the correct answer to the original contest question, classify it as FINAL_CORRECT.
  2. PARTIAL_CORRECT: The student has a useful piece of the reasoning but has not completed the answer.
  3. CONCEPT_CONFUSION: The student shows misunderstanding of a key word, concept, or prerequisite skill.
  4. OFF_TRACK: The student response does not follow the needed reasoning.
- If FINAL_CORRECT: briefly confirm that the student answered the original contest question correctly, tell the student to select and submit the answer on the answer card, and do not ask another question. Do not ask "Is this your answer?" or any confirmation question.
- If PARTIAL_CORRECT: ask one narrow gap-finding question that targets only the missing piece. Do not restart with a broad strategy question.
- If CONCEPT_CONFUSION: give one short Grade 7-friendly clarification, then ask exactly one guiding question.
- If OFF_TRACK: ask one simpler guiding question.
- If the student is close but missing one part, do not ask a broad strategy question such as "How can you use division..." or "How can you break this down...". Ask a specific question about the missing part.
- Do not reveal the final answer or the correct answer letter unless the student's latest response has already reached the final answer or final reasoning.
- Never say only "Correct" or "Great"; either ask the next question or confirm the final reasoning when complete.
- Never ask "Is this your answer?" or "Is this your final answer?" when the student has given the correct answer.
`;

  const messages = [{ role: 'system', content: systemPrompt }];
  messages.push(...normalizeMessages(conversationHistory));

  if (studentMessage && studentMessage.trim()) {
    messages.push({ role: 'user', content: studentMessage.trim() });
  }

  return callGroq(messages);
}

function normalizeAnswerText(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .toLowerCase()
    .replace(/[,$]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractNumbers(value) {
  const text = normalizeAnswerText(value);
  const matches = text.match(/-?\d+(?:\.\d+)?/g);
  return matches ? matches.map(Number) : [];
}

function getCorrectOptionText(context) {
  const correctLetter = normalizeAnswerText(context.correct_answer).toUpperCase();
  const options = context.options || {};
  return options?.[correctLetter] ?? options?.[correctLetter.toLowerCase()] ?? '';
}

function studentReachedFinalAnswer(context, studentMessage = '') {
  const message = normalizeAnswerText(studentMessage);
  if (!message) return false;

  const correctLetter = normalizeAnswerText(context.correct_answer).toUpperCase();
  const correctOptionText = getCorrectOptionText(context);
  const normalizedOption = normalizeAnswerText(correctOptionText);

  // Accept the answer letter when the student clearly gives only a letter or says "answer is C".
  if (correctLetter && /^[A-E]$/.test(correctLetter)) {
    const letterPattern = new RegExp(`(^|\\b)(answer\\s*(is|=)?\\s*)?${correctLetter.toLowerCase()}(\\b|$)`, 'i');
    if (letterPattern.test(studentMessage.trim())) return true;
  }

  // Accept the exact option text if present.
  if (normalizedOption && message.includes(normalizedOption)) return true;

  // Accept numeric answer when the correct option contains a number, even if the student omits units.
  const optionNumbers = extractNumbers(correctOptionText);
  const messageNumbers = extractNumbers(studentMessage);
  if (optionNumbers.length > 0 && messageNumbers.length > 0) {
    const correctNumber = optionNumbers[0];
    if (messageNumbers.some((n) => Math.abs(n - correctNumber) < 1e-9)) return true;
  }

  return false;
}

function buildFinalConfirmation(context) {
  const reasoning = normalizeAnswerText(context.reasoning_summary);
  const pattern = normalizeAnswerText(context.solution_pattern);

  if (reasoning.includes('prime') || pattern.includes('factor')) {
    return 'Yes—that answers the question. Please select and submit your answer on the answer card.';
  }

  if (reasoning.includes('diameter') || pattern.includes('double the radius') || normalizeAnswerText(context.question_text).includes('circle')) {
    return 'Yes—that matches the greatest length. Please select and submit your answer on the answer card.';
  }

  if (reasoning.includes('mean') || reasoning.includes('average') || pattern.includes('mean')) {
    return 'Yes—that answers the question. Please select and submit your answer on the answer card.';
  }

  if (reasoning.includes('probability') || pattern.includes('outcome')) {
    return 'Yes—that answers the question. Please select and submit your answer on the answer card.';
  }

  return 'Yes—that answers the question. Please select and submit your answer on the answer card.';
}

function getFallbackStuckMessage(context) {
  const questionText = context.question_text || '';
  const reasoning = (context.reasoning_summary || '').toLowerCase();

  if (reasoning.includes('prime')) {
    return 'What does “prime factor” mean in this problem?';
  }
  if (reasoning.includes('mean') || reasoning.includes('average')) {
    return 'What does the mean tell you about the total?';
  }
  if (reasoning.includes('probability')) {
    return 'What are the total possible outcomes?';
  }
  if (reasoning.includes('diameter') || questionText.toLowerCase().includes('circle')) {
    return 'What special segment gives the greatest distance across a circle?';
  }

  return 'What is the question asking you to find?';
}

function getFallbackFollowupMessage(studentMessage = '') {
  const msg = studentMessage.toLowerCase();

  if (msg.includes("don't know") || msg.includes('dont know') || msg.includes('not sure')) {
    return 'Which word in the question seems most important?';
  }

  // Fallback is intentionally conservative because final-answer interpretation should be handled by Groq.
  return 'Can you explain the step that led to your answer?';
}

// ============================================
// Coaching Plan Functions
// ============================================

function buildCoachingPlanContext(plan) {
  const parts = [];

  if (plan.coaching_goal) {
    parts.push(`Coaching goal: ${plan.coaching_goal}`);
  }

  if (plan.key_concepts && plan.key_concepts.length > 0) {
    const concepts = Array.isArray(plan.key_concepts) ? plan.key_concepts.join(', ') : plan.key_concepts;
    parts.push(`Key concepts the student should understand: ${concepts}`);
  }

  if (plan.expected_reasoning_steps && plan.expected_reasoning_steps.length > 0) {
    const steps = Array.isArray(plan.expected_reasoning_steps)
      ? plan.expected_reasoning_steps.map((s, i) => `${i + 1}. ${s}`).join('\n')
      : plan.expected_reasoning_steps;
    parts.push(`Expected reasoning steps (guide, do not force in order):\n${steps}`);
  }

  if (plan.common_misconceptions && plan.common_misconceptions.length > 0) {
    const misconceptions = Array.isArray(plan.common_misconceptions)
      ? plan.common_misconceptions.join('; ')
      : plan.common_misconceptions;
    parts.push(`Common misconceptions to watch for: ${misconceptions}`);
  }

  if (plan.adaptive_guidance_rules) {
    parts.push(`Adaptive guidance rules:\n${plan.adaptive_guidance_rules}`);
  }

  return parts.join('\n\n');
}

async function getGroqStuckCoachingWithPlan(context, plan) {
  const planContext = buildCoachingPlanContext(plan);

  const prompt = `
You are a Waterloo Gauss Grade 7 math coach.

The student does not know how to start.

${COACHING_RULES}
${INCORRECT_INTERMEDIATE_STEP_RULE}
${FINAL_ANSWER_AUTHORITY_RULE}
${ANSWER_SUBMISSION_RULE}

Coaching plan context:
${planContext}

Question:
${context.question_text || context.short_problem_summary || 'Question text not available'}

Answer options:
${context.options ? Object.entries(context.options).map(([k, v]) => `${k}: ${v}`).join('\n') : 'Not available'}

Correct answer (private): ${context.correct_answer || 'Not available'}

Official solution summary (private):
${context.official_solution || 'Not available'}

${plan.first_step_prompt ? `First step guidance: ${plan.first_step_prompt}` : ''}

For the first stuck-coaching message:
- Use the first step guidance if provided, but phrase it as a Grade 7-friendly question.
- Help the student interpret the question wording.
- Ask exactly one small guiding question.
- Do not ask a two-part question.
- Do not reveal the final answer or the correct answer letter.
- Maximum 2 short sentences.
`;

  return callGroq([
    {
      role: 'system',
      content: 'You are a Socratic Waterloo math tutor for Grade 7 students. Ask exactly one guiding question at a time.',
    },
    { role: 'user', content: prompt },
  ]);
}

async function getGroqFollowupCoachingWithPlan(context, plan, studentMessage, conversationHistory) {
  const planContext = buildCoachingPlanContext(plan);

  const systemPrompt = `
You are a Socratic Waterloo Gauss Grade 7 math coach.

${COACHING_RULES}
${INCORRECT_INTERMEDIATE_STEP_RULE}
${FINAL_ANSWER_AUTHORITY_RULE}
${ANSWER_SUBMISSION_RULE}

Coaching plan context:
${planContext}

Question:
${context.question_text || context.short_problem_summary || 'Question text not available'}

Answer options:
${context.options ? Object.entries(context.options).map(([k, v]) => `${k}: ${v}`).join('\n') : 'Not available'}

Correct answer (private): ${context.correct_answer || 'Not available'}

Official solution summary (private):
${context.official_solution || 'Not available'}

Follow-up instructions:
1. First, privately classify the student's latest response as one of:
   - FINAL_CORRECT: Student gave the correct final answer or equivalent correct reasoning. Important: If the student's response to a coaching sub-question also happens to be the correct answer to the original contest question, classify it as FINAL_CORRECT.
   - PARTIAL_CORRECT: Student has part of the reasoning but is missing a piece.
   - CONCEPT_CONFUSION: Student shows misunderstanding of a key concept.
   - OFF_TRACK: Student's response does not follow the needed reasoning.
   - ASKED_FOR_SOLUTION: Student explicitly asks to see the answer or full solution.

2. Based on the classification:
   - FINAL_CORRECT: Briefly confirm that the student answered the original contest question correctly, tell the student to select and submit the answer on the answer card, and do not ask another question. Do not ask "Is this your answer?" or any confirmation question.
   - PARTIAL_CORRECT: Confirm the correct part briefly. Ask one narrow question about the missing piece.
   - CONCEPT_CONFUSION: Give one short Grade 7-friendly clarification, then ask one small guiding question.
   - OFF_TRACK: Gently redirect. Ask one clear next-step question.
   - ASKED_FOR_SOLUTION: Do not show the full solution. Ask a smaller guiding question instead.

3. Adaptive behavior:
   - If the student says "I don't know," "not sure," or gives a vague answer, break the current step into a smaller step.
   - Do not force the student through the expected reasoning steps in order if they need a smaller step.

4. Rules:
   - Maximum 2 short sentences.
   - Ask only ONE guiding question.
   - Never reveal the final answer unless the student has already reached it.
   - Do not say only "Correct" or "Great" without either confirming the final reasoning or asking the next question.
   - Never ask "Is this your answer?" or "Is this your final answer?" when the student has given the correct answer.
`;

  const messages = [{ role: 'system', content: systemPrompt }];
  messages.push(...normalizeMessages(conversationHistory));

  if (studentMessage && studentMessage.trim()) {
    messages.push({ role: 'user', content: studentMessage.trim() });
  }

  return callGroq(messages);
}

// ============================================
// Main Handler
// ============================================

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Server configuration error' }),
    };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing or invalid authorization header' }),
    };
  }

  const accessToken = authHeader.replace('Bearer ', '');
  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

  if (userError || !userData?.user) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid or expired access token' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  // Support both old (set_code, practice_question_number) and new (contest_code, contest_question_number) naming
  const {
    contest_code,
    set_code,
    contest_question_number,
    practice_question_number,
    coaching_trigger,
    student_message = '',
    conversation_history = [],
  } = body;

  // Use new naming internally, fall back to old for backward compatibility
  const contestCode = contest_code || set_code;
  const contestQuestionNumber = contest_question_number || practice_question_number;

  if (!contestCode || typeof contestCode !== 'string') {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'contest_code is required' }),
    };
  }

  if (!contestQuestionNumber || typeof contestQuestionNumber !== 'number') {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'contest_question_number is required' }),
    };
  }

  if (coaching_trigger !== 'stuck' && coaching_trigger !== 'followup') {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'coaching_trigger must be "stuck" or "followup"' }),
    };
  }

  // Use question context resolver
  const resolved = await resolveQuestionContext(supabase, contestCode, contestQuestionNumber);

  if (!resolved.success) {
    const statusCode = resolved.error.includes('not found') ? 404 : 500;
    return {
      statusCode,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: resolved.error }),
    };
  }

  const resolvedContext = resolved.context;
  console.log(`[Coaching] Context resolved:`, getContextSummary(resolvedContext));

  // Check coaching availability
  // Current rule: requires official_solution from gauss_source_questions
  if (!resolved.coachingAvailable) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: false, message: 'Coaching is not available for this question yet.' }),
    };
  }

  const coachingPlan = resolvedContext.coachingPlan;
  const hasCoachingPlan = !!coachingPlan;
  console.log(`[Coaching] Coaching plan found: ${hasCoachingPlan}`);

  // Build context object for coaching functions (using snake_case for compatibility)
  const context = {
    short_problem_summary: resolvedContext.shortProblemSummary,
    primary_topics: resolvedContext.primaryTopics,
    secondary_topics: resolvedContext.secondaryTopics,
    difficulty_band: resolvedContext.difficultyBand,
    correct_answer: resolvedContext.correctAnswer,
    psg_solution_text: resolvedContext.psgSolutionText,
    psg_solution_summary: resolvedContext.psgSolutionSummary,
    question_text: resolvedContext.questionText,
    options: resolvedContext.options,
    official_solution: resolvedContext.officialSolution,
    reasoning_summary: resolvedContext.reasoningSummary,
    solution_pattern: resolvedContext.solutionPattern,
    archetype: resolvedContext.archetype,
    visual_required: resolvedContext.visualRequired,
    visual_description: resolvedContext.visualDescription,
    coaching_plan_steps: coachingPlan?.expected_reasoning_steps || null,
  };

  let coachMessage;

  if (coaching_trigger === 'stuck') {
    if (hasCoachingPlan) {
      // Use coaching plan for stuck coaching
      coachMessage = await getGroqStuckCoachingWithPlan(context, coachingPlan);
    } else {
      // Fall back to existing stuck coaching
      coachMessage = await getGroqStuckCoaching(context);
    }
    if (!coachMessage) coachMessage = getFallbackStuckMessage(context);
  } else {
    // Follow-up coaching
    if (hasCoachingPlan) {
      // Use coaching plan for follow-up
      coachMessage = await getGroqFollowupCoachingWithPlan(context, coachingPlan, student_message, conversation_history);
    } else {
      // Fall back to existing follow-up coaching
      coachMessage = await getGroqFollowupCoaching(context, student_message, conversation_history);
    }
    if (!coachMessage) coachMessage = getFallbackFollowupMessage(student_message);
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      available: true,
      coach_message: coachMessage,
      stage: coaching_trigger,
      has_coaching_plan: hasCoachingPlan,
    }),
  };
}
