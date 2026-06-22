export interface Database {
  public: {
    Tables: {
      gauss_contests: {
        Row: {
          id: string
          contest_code: string
          title: string
          grade: number
          question_pdf_filename: string | null
          solution_pdf_filename: string | null
          description: string | null
          display_order: number
          active: boolean
          created_at: string
          updated_at: string
        }
      }
      gauss_questions: {
        Row: {
          id: string
          contest_id: string
          contest_question_number: number
          source_year: number | null
          source_grade: number | null
          source_question_number: number | null
          primary_topics: string[]
          secondary_topics: string[]
          correct_answer: 'A' | 'B' | 'C' | 'D' | 'E'
          short_problem_summary: string | null
          question_text: string | null
          options: Record<string, string> | null
          question_image_url: string | null
          question_pdf_page: number | null
          crop_x: number | null
          crop_y: number | null
          crop_width: number | null
          crop_height: number | null
          difficulty_band: 'Easy' | 'Medium' | 'Hard' | null
          created_at: string
        }
      }
      gauss_solutions: {
        Row: {
          id: string
          question_id: string
          psg_solution_text: string | null
          psg_solution_summary: string | null
          psg_solution_image_url: string | null
          created_at: string
          updated_at: string
        }
      }
      gauss_contest_sessions: {
        Row: {
          id: string
          user_id: string
          contest_id: string
          status: 'in_progress' | 'completed' | 'abandoned'
          current_question_number: number
          total_questions: number
          correct_count: number
          wrong_count: number
          skipped_count: number
          flagged_count: number
          score: number | null
          started_at: string
          completed_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contest_id: string
          status?: 'in_progress' | 'completed' | 'abandoned'
          current_question_number?: number
          total_questions?: number
          correct_count?: number
          wrong_count?: number
          skipped_count?: number
          flagged_count?: number
          score?: number | null
          started_at?: string
          completed_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          contest_id?: string
          status?: 'in_progress' | 'completed' | 'abandoned'
          current_question_number?: number
          total_questions?: number
          correct_count?: number
          wrong_count?: number
          skipped_count?: number
          flagged_count?: number
          score?: number | null
          started_at?: string
          completed_at?: string | null
          updated_at?: string
        }
      }
      gauss_attempts: {
        Row: {
          id: string
          session_id: string | null
          user_id: string | null
          question_id: string
          selected_answer: string | null
          is_correct: boolean | null
          status: 'unanswered' | 'correct' | 'wrong' | 'skipped' | 'flagged' | null
          wrong_answers: string[] | null
          flagged: boolean | null
          skipped: boolean | null
          time_spent_seconds: number | null
          used_hint: boolean
          used_guided_solution: boolean
          viewed_psg_solution: boolean
          viewed_detailed_solution: boolean
          attempted_at: string
        }
        Insert: {
          id?: string
          session_id?: string | null
          user_id?: string | null
          question_id: string
          selected_answer?: string | null
          is_correct?: boolean | null
          status?: 'unanswered' | 'correct' | 'wrong' | 'skipped' | 'flagged' | null
          wrong_answers?: string[] | null
          flagged?: boolean | null
          skipped?: boolean | null
          time_spent_seconds?: number | null
          used_hint?: boolean
          used_guided_solution?: boolean
          viewed_psg_solution?: boolean
          viewed_detailed_solution?: boolean
          attempted_at?: string
        }
        Update: {
          id?: string
          session_id?: string | null
          user_id?: string | null
          question_id?: string
          selected_answer?: string | null
          is_correct?: boolean | null
          status?: 'unanswered' | 'correct' | 'wrong' | 'skipped' | 'flagged' | null
          wrong_answers?: string[] | null
          flagged?: boolean | null
          skipped?: boolean | null
          time_spent_seconds?: number | null
          used_hint?: boolean
          used_guided_solution?: boolean
          viewed_psg_solution?: boolean
          viewed_detailed_solution?: boolean
          attempted_at?: string
        }
      }
    }
  }
}

export interface Contest {
  id: string
  contest_code: string
  title: string
  grade: number
  question_pdf_filename: string | null
  display_order: number
}

export interface ContestSession {
  id: string
  user_id: string
  contest_id: string
  status: 'in_progress' | 'completed' | 'abandoned'
  current_question_number: number
  total_questions: number
  correct_count: number
  wrong_count: number
  skipped_count: number
  flagged_count: number
  score: number | null
  started_at: string
  completed_at: string | null
}

export interface ContestWithSession extends Contest {
  session?: ContestSession | null
}

export interface DashboardStats {
  contestsStarted: number
  contestsCompleted: number
  totalContests: number
  currentInProgress: string | null
  totalCorrect: number
  totalWrong: number
  totalSkipped: number
  totalFlagged: number
  averageScore: number
}

export interface TopicPerformance {
  topic: string
  attempted_count: number
  correct_count: number
  wrong_count: number
  accuracy_rate: number
}

export interface Question {
  id: string
  contest_question_number: number
  correct_answer: 'A' | 'B' | 'C' | 'D' | 'E'
  short_problem_summary: string | null
  question_pdf_page: number | null
  crop_x: number | null
  crop_y: number | null
  crop_width: number | null
  crop_height: number | null
}

export interface Solution {
  id: string
  question_id: string
  psg_solution_text: string | null
  psg_solution_summary: string | null
  // Coaching availability is computed dynamically from source_question existence
  coaching_available: boolean
  // Source question data (from gauss_source_questions via year/grade/question_number)
  source_question?: SourceQuestion | null
}

export interface SourceQuestion {
  id: string
  question_text: string | null
  options: Record<string, string> | null
  official_solution: string | null
  reasoning_summary: string | null
  solution_pattern: string | null
  archetype: string | null
  blueprint_code: string | null
  visual_required: boolean | null
  visual_description: string | null
}

export interface QuestionWithSolution extends Question {
  solution: Solution | null
}

export type AnswerChoice = 'A' | 'B' | 'C' | 'D' | 'E'

export type QuestionStatus = 'unanswered' | 'correct' | 'wrong' | 'skipped' | 'flagged'

export interface QuestionState {
  contest_question_number: number
  selected_answer: AnswerChoice | null
  status: QuestionStatus
  wrong_answers: AnswerChoice[]
  flagged: boolean
}

export interface ContestProgress {
  total: number
  answered: number
  correct: number
  wrong: number
  skipped: number
  flagged: number
}

export interface Program {
  id: string
  program_code: string
  program_name: string
  description: string | null
  grade: number
  program_type: string
  active: boolean
}

export interface StudentProgramAssignment {
  id: string
  student_id: string
  program_id: string
  active: boolean
  assigned_at: string
}
