import { createClient } from '@supabase/supabase-js';

/**
 * Netlify Function: Socratic Coach
 *
 * Supports stuck coaching and follow-up coaching.
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
6. If the student clearly reaches the final answer through reasoning, briefly confirm the reasoning in one short sentence.
7. If the student asks for the full solution, do not provide it in Socratic coaching; ask one next-step guiding question instead.
`;

const PARTIAL_PROGRESS_RULE = `
Partial-progress rule:
If the student's response is partly correct but missing one important piece, do not go back to a broad strategy question. Use the official solution privately to identify the missing piece, then ask one narrow gap-finding question that helps the student find only that missing piece. Do not directly state the missing value or final answer.
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
  return `
Question:
${context.question_text || context.short_problem_summary || 'Question text not available'}

${buildTopicContext(context) ? `Curriculum context:\n${buildTopicContext(context)}\n` : ''}
${context.visual_description ? `Visual description, if needed:\n${context.visual_description}\n` : ''}
${context.archetype ? `Reasoning style, optional:\n${context.archetype}\n` : ''}
Reasoning summary, private:
${context.reasoning_summary || 'Not available'}

Solution pattern, private:
${context.solution_pattern || 'Not available'}

Official solution, for private reference only:
${context.official_solution || 'Not available'}

Use the official solution only to know the correct path. Do not reveal it, even if the student asks for the full solution. Guide the student with questions instead.
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

${buildPrivateContext(context)}

Follow-up instructions:
- Read the student's latest response and the conversation history.
- Choose only one next action: a simpler guiding question, a short concept clarification plus one guiding question, a narrow gap-finding question for a partially correct response, the next small-step question, or final reasoning confirmation if the student has clearly reached the answer.
- If the student is close but missing one part, do not ask a broad strategy question such as "How can you use division..." or "How can you break this down...". Ask a specific question about the missing part.
- Do not reveal the final answer or the correct answer letter unless the student has clearly reached the final reasoning through their own work.
- Never say only "Correct" or "Great"; keep moving the thinking forward.
`;

  const messages = [{ role: 'system', content: systemPrompt }];
  messages.push(...normalizeMessages(conversationHistory));

  if (studentMessage && studentMessage.trim()) {
    messages.push({ role: 'user', content: studentMessage.trim() });
  }

  return callGroq(messages);
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

  return 'What is the next small thing you can figure out?';
}


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

  const {
    set_code,
    practice_question_number,
    coaching_trigger,
    student_message = '',
    conversation_history = [],
  } = body;

  if (!set_code || typeof set_code !== 'string') {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'set_code is required' }),
    };
  }

  if (!practice_question_number || typeof practice_question_number !== 'number') {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'practice_question_number is required' }),
    };
  }

  if (coaching_trigger !== 'stuck' && coaching_trigger !== 'followup') {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'coaching_trigger must be "stuck" or "followup"' }),
    };
  }

  const { data: practiceSet, error: psError } = await supabase
    .from('gauss_practice_sets')
    .select('id')
    .eq('set_code', set_code)
    .single();

  if (psError || !practiceSet) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: `Practice set "${set_code}" not found` }),
    };
  }

  const { data: question, error: qError } = await supabase
    .from('gauss_questions')
    .select('id, short_problem_summary, primary_topics, secondary_topics, difficulty_band')
    .eq('practice_set_id', practiceSet.id)
    .eq('practice_question_number', practice_question_number)
    .single();

  if (qError || !question) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: `Question ${practice_question_number} not found` }),
    };
  }

  const { data: solution, error: solError } = await supabase
    .from('gauss_solutions')
    .select('coaching_available, coaching_mode, coaching_source_id, psg_solution_text, psg_solution_summary')
    .eq('question_id', question.id)
    .single();

  if (solError || !solution) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: false, message: 'Coaching is not available for this question yet.' }),
    };
  }

  if (!solution.coaching_available || solution.coaching_mode === 'none' || !solution.coaching_source_id) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: false, message: 'Coaching is not available for this question yet.' }),
    };
  }

  const { data: sourceQuestion, error: srcError } = await supabase
    .from('gauss_source_questions')
    .select('question_text, options, official_solution, reasoning_summary, solution_pattern, archetype, visual_required, visual_description')
    .eq('id', solution.coaching_source_id)
    .single();

  if (srcError || !sourceQuestion) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: false, message: 'Coaching is not available for this question yet.' }),
    };
  }

  const context = {
    short_problem_summary: question.short_problem_summary,
    primary_topics: question.primary_topics,
    secondary_topics: question.secondary_topics,
    difficulty_band: question.difficulty_band,
    psg_solution_text: solution.psg_solution_text,
    psg_solution_summary: solution.psg_solution_summary,
    question_text: sourceQuestion.question_text,
    options: sourceQuestion.options,
    official_solution: sourceQuestion.official_solution,
    reasoning_summary: sourceQuestion.reasoning_summary,
    solution_pattern: sourceQuestion.solution_pattern,
    archetype: sourceQuestion.archetype,
    visual_required: sourceQuestion.visual_required,
    visual_description: sourceQuestion.visual_description,
  };


  let coachMessage;

  if (coaching_trigger === 'stuck') {
    coachMessage = await getGroqStuckCoaching(context);
    if (!coachMessage) coachMessage = getFallbackStuckMessage(context);
  } else {
    coachMessage = await getGroqFollowupCoaching(context, student_message, conversation_history);
    if (!coachMessage) coachMessage = getFallbackFollowupMessage(student_message);
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      available: true,
      coach_message: coachMessage,
      stage: coaching_trigger,
    }),
  };
}
