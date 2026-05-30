/**
 * API client for MathCoach backend
 */

const API_BASE = import.meta.env.VITE_API_URL || ''

// Types
export interface QuestionOptions {
  A: string
  B: string
  C: string
  D: string
  E: string
}

export interface Question {
  id: string
  program: string
  topic: string
  subtopic?: string
  difficulty: string
  archetype?: string
  question_text: string
  options: QuestionOptions
  correct_answer: string
  reasoning_skills: string[]
  misconceptions: string[]
  distractor_rationale?: Record<string, string | null>
  solution?: {
    steps: string[]
    key_insight: string
  }
  coaching_hints: string[]
}

export interface QuizStart {
  program?: string
  topic?: string
  difficulty?: string
  num_questions?: number
}

export interface QuizSession {
  session_id: string
  questions: Question[]
  current_index: number
  question_states: Record<string, QuizQuestionState>
  created_at: string
  completed: boolean
}

export interface QuizQuestionState {
  question_id: string
  start_time: string
  time_to_correct?: number
  is_correct: boolean
  attempts: number
  selected_answer?: string
}

export interface QuizAnswerResult {
  correct: boolean
  correct_answer?: string
  attempts: number
  time_elapsed: number
  coaching_message?: string
}

export interface QuizResults {
  session_id: string
  score: number
  total_possible: number
  correct_count: number
  incorrect_count: number
  blank_count: number
  blank_bonus: number
  average_time_seconds: number
  breakdown: {
    part_a_correct: number
    part_a_total: number
    part_b_correct: number
    part_b_total: number
    part_c_correct: number
    part_c_total: number
  }
  question_results: QuizQuestionState[]
}

export interface CoachingResponse {
  message: string
  question_id: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// API Functions

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || `API error: ${response.status}`)
  }

  return response.json()
}

// Quiz API

export async function startQuiz(params: QuizStart): Promise<QuizSession> {
  return fetchAPI<QuizSession>('/api/quiz/start', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

export async function getQuiz(sessionId: string): Promise<QuizSession> {
  return fetchAPI<QuizSession>(`/api/quiz/${sessionId}`)
}

export async function submitAnswer(
  sessionId: string,
  questionId: string,
  selectedAnswer: string
): Promise<QuizAnswerResult> {
  return fetchAPI<QuizAnswerResult>(`/api/quiz/${sessionId}/answer`, {
    method: 'POST',
    body: JSON.stringify({
      question_id: questionId,
      selected_answer: selectedAnswer,
    }),
  })
}

export async function getResults(sessionId: string): Promise<QuizResults> {
  return fetchAPI<QuizResults>(`/api/quiz/${sessionId}/results`)
}

// Coaching API

export async function getStartCoaching(
  question: Question
): Promise<CoachingResponse> {
  return fetchAPI<CoachingResponse>('/api/coaching/start', {
    method: 'POST',
    body: JSON.stringify({
      question_id: question.id,
      question_text: question.question_text,
      options: question.options,
      coaching_hints: question.coaching_hints,
    }),
  })
}

export async function getMisconceptionCoaching(
  question: Question,
  selectedAnswer: string
): Promise<CoachingResponse> {
  return fetchAPI<CoachingResponse>('/api/coaching/misconception', {
    method: 'POST',
    body: JSON.stringify({
      question_id: question.id,
      question_text: question.question_text,
      options: question.options,
      correct_answer: question.correct_answer,
      selected_answer: selectedAnswer,
      misconceptions: question.misconceptions,
      distractor_rationale: question.distractor_rationale,
      key_insight: question.solution?.key_insight,
    }),
  })
}

export async function getFollowupCoaching(
  question: Question,
  conversationHistory: ChatMessage[]
): Promise<CoachingResponse> {
  return fetchAPI<CoachingResponse>('/api/coaching/followup', {
    method: 'POST',
    body: JSON.stringify({
      question_id: question.id,
      question_text: question.question_text,
      correct_answer: question.correct_answer,
      coaching_hints: question.coaching_hints,
      key_insight: question.solution?.key_insight,
      conversation_history: conversationHistory,
    }),
  })
}

// Questions API

export async function listQuestions(params?: {
  program?: string
  topic?: string
  difficulty?: string
  limit?: number
  offset?: number
}): Promise<{ questions: Question[]; total: number }> {
  const searchParams = new URLSearchParams()
  if (params?.program) searchParams.set('program', params.program)
  if (params?.topic) searchParams.set('topic', params.topic)
  if (params?.difficulty) searchParams.set('difficulty', params.difficulty)
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.offset) searchParams.set('offset', params.offset.toString())

  const query = searchParams.toString()
  return fetchAPI<{ questions: Question[]; total: number }>(
    `/api/questions${query ? `?${query}` : ''}`
  )
}
