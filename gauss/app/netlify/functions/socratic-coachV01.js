import { createClient } from '@supabase/supabase-js';

/**
 * Netlify Function: Socratic Coach
 *
 * Returns one Socratic coaching message when the student is stuck or following up.
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

const MODEL_NAME = 'llama-3.3-70b-versatile';

/**
 * Call Groq API for stuck coaching (first message)
 */
async function getGroqStuckCoaching(context) {
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    return null;
  }

  const {
    question_text,
    reasoning_summary,
    solution_pattern,
    primary_topics,
    secondary_topics,
    archetype,
    official_solution,
  } = context;

  // Build the hint direction from available context
  let hintDirection = '';
  if (reasoning_summary) {
    hintDirection = reasoning_summary;
  } else if (solution_pattern) {
    hintDirection = solution_pattern;
  }

  // Build topic context
  const topicsContext = [];
  if (primary_topics && primary_topics.length > 0) {
    topicsContext.push(`Primary topics: ${primary_topics.join(', ')}`);
  }
  if (secondary_topics && secondary_topics.length > 0) {
    topicsContext.push(`Secondary topics: ${secondary_topics.join(', ')}`);
  }

  const prompt = `
You are a Waterloo Gauss Grade 7 math coach.

The student does not know how to start.

${COACHING_RULES}

Question:
${question_text || 'Question text not available'}

${topicsContext.length > 0 ? `Curriculum context:\n${topicsContext.join('\n')}` : ''}

${archetype ? `Problem archetype: ${archetype}` : ''}

Suggested starting hint direction (use as inspiration, not verbatim):
${hintDirection}

Official solution, for private reference only:
${official_solution || 'Not available'}

Use this only to know the correct path. Do not reveal it. Do not give the next calculation.

Ask exactly one Grade 7-friendly question.

For the first stuck-coaching message:
- Help the student interpret the wording of the question.
- Do not ask the student to start solving yet.
- Do not ask two-part questions.
- Do not use 'and' to combine two tasks.
- Do not ask both what the concept means and how to begin in the same message.
- Ask only the first thinking step.

Good example:
The question asks for prime factors, not just any factors. What does "prime factor" mean?

Bad example:
What does it mean to find the prime factors, and how can you start breaking down 42?
`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          {
            role: 'system',
            content: 'You are a Socratic Waterloo math tutor for Grade 7 students. Ask only ONE question at a time. Never combine multiple questions.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('Groq API call failed:', error);
    return null;
  }
}

/**
 * Call Groq API for followup coaching
 */
async function getGroqFollowupCoaching(context, studentMessage, conversationHistory) {
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    return null;
  }

  const {
    question_text,
    reasoning_summary,
    solution_pattern,
    official_solution,
    primary_topics,
  } = context;

  const systemPrompt = `
You are a Socratic Waterloo math tutor for Grade 7 students.

${COACHING_RULES}

Question being worked on:
${question_text || 'Question text not available'}

${primary_topics && primary_topics.length > 0 ? `Topics: ${primary_topics.join(', ')}` : ''}

Key reasoning approach (private, do not reveal directly):
${reasoning_summary || ''}

Solution pattern (private, do not reveal directly):
${solution_pattern || ''}

Official solution, for private reference only:
${official_solution || 'Not available'}

Use this only to know the correct path. Do not reveal it. Do not give the next calculation.

Instructions for followup:
- Ask only one guiding question.
- Do not reveal the final answer.
- Do not give the next calculation directly.
- If the student is vague or wrong, ask a simpler clarifying question.
- If the student is on the right path, move to the next small step without over-praising.
- Never say "Great!" or "Correct!" - instead ask the next question.
- Keep responses to 1-2 short sentences.
`;

  // Build messages array with conversation history
  const messages = [
    {
      role: 'system',
      content: systemPrompt,
    },
  ];

  // Add conversation history
  if (conversationHistory && conversationHistory.length > 0) {
    for (const msg of conversationHistory) {
      messages.push({
        role: msg.role === 'student' ? 'user' : 'assistant',
        content: msg.content,
      });
    }
  }

  // Add current student message
  if (studentMessage) {
    messages.push({
      role: 'user',
      content: studentMessage,
    });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
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
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('Groq API call failed:', error);
    return null;
  }
}

/**
 * Generate fallback message when Groq is unavailable
 */
function getFallbackStuckMessage(context) {
  const { reasoning_summary, primary_topics } = context;

  if (reasoning_summary) {
    // Extract just the first concept to ask about
    return `What is the question asking you to find?`;
  }

  if (primary_topics && primary_topics.length > 0) {
    return `This problem involves ${primary_topics[0]}. What does the question ask you to find?`;
  }

  // Default fallback - single simple question
  return 'What is the question asking you to find?';
}

/**
 * Generate fallback followup message when Groq is unavailable
 */
function getFallbackFollowupMessage() {
  return 'Can you tell me more about your thinking?';
}

export async function handler(event) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Validate environment variables
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

  // Create Supabase admin client
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Get access token from Authorization header
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing or invalid authorization header' }),
    };
  }

  const accessToken = authHeader.replace('Bearer ', '');

  // Verify the requesting user
  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

  if (userError || !userData?.user) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid or expired access token' }),
    };
  }

  // Parse request body
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
    student_message,
    conversation_history,
  } = body;

  // Validate required fields
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

  // Fetch practice set
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

  // Fetch question
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

  // Fetch solution
  const { data: solution, error: solError } = await supabase
    .from('gauss_solutions')
    .select('coaching_available, coaching_mode, coaching_source_id, psg_solution_text, psg_solution_summary')
    .eq('question_id', question.id)
    .single();

  if (solError || !solution) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        available: false,
        message: 'Coaching is not available for this question yet.',
      }),
    };
  }

  // Check if coaching is available
  if (
    !solution.coaching_available ||
    solution.coaching_mode === 'none' ||
    !solution.coaching_source_id
  ) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        available: false,
        message: 'Coaching is not available for this question yet.',
      }),
    };
  }

  // Fetch source question for coaching context
  const { data: sourceQuestion, error: srcError } = await supabase
    .from('gauss_source_questions')
    .select('question_text, options, official_solution, reasoning_summary, solution_pattern, archetype, visual_required, visual_description')
    .eq('id', solution.coaching_source_id)
    .single();

  if (srcError || !sourceQuestion) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        available: false,
        message: 'Coaching is not available for this question yet.',
      }),
    };
  }

  // Build coaching context
  const context = {
    // From gauss_questions
    short_problem_summary: question.short_problem_summary,
    primary_topics: question.primary_topics,
    secondary_topics: question.secondary_topics,
    difficulty_band: question.difficulty_band,
    // From gauss_solutions
    psg_solution_text: solution.psg_solution_text,
    psg_solution_summary: solution.psg_solution_summary,
    // From gauss_source_questions
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
    // First stuck message
    coachMessage = await getGroqStuckCoaching(context);
    if (!coachMessage) {
      coachMessage = getFallbackStuckMessage(context);
    }
  } else {
    // Followup message
    coachMessage = await getGroqFollowupCoaching(context, student_message, conversation_history);
    if (!coachMessage) {
      coachMessage = getFallbackFollowupMessage();
    }
  }

  // Return response
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      available: true,
      coach_message: coachMessage,
      stage: coaching_trigger,
      can_show_solution: true,
    }),
  };
}
