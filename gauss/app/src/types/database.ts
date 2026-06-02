export interface Database {
  public: {
    Tables: {
      gauss_practice_sets: {
        Row: {
          id: string
          set_code: string
          title: string
          grade: number
          source_type: string | null
          question_pdf_filename: string | null
          solution_pdf_filename: string | null
          description: string | null
          created_at: string
        }
      }
      gauss_questions: {
        Row: {
          id: string
          practice_set_id: string
          practice_question_number: number
          source_year: number | null
          source_grade: number | null
          source_question_number: number | null
          primary_topics: string[]
          secondary_topics: string[]
          correct_answer: 'A' | 'B' | 'C' | 'D' | 'E'
          short_problem_summary: string | null
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
          detailed_solution_text: string | null
          detailed_solution_image_url: string | null
          detailed_solution_source_pdf: string | null
          detailed_solution_page: number | null
          detailed_solution_status: string
          coaching_available: boolean
          key_strategy: string | null
          hint_1: string | null
          hint_2: string | null
          guided_steps: GuidedStep[] | null
          common_mistake: string | null
          reflection_question: string | null
          created_at: string
        }
      }
    }
  }
}

export interface GuidedStep {
  step: number
  text: string
}

export interface PracticeSet {
  id: string
  set_code: string
  title: string
  grade: number
  question_pdf_filename: string | null
}

export interface Question {
  id: string
  practice_question_number: number
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
  coaching_available: boolean
  hint_1: string | null
  hint_2: string | null
  guided_steps: GuidedStep[] | null
  detailed_solution_text: string | null
  psg_solution_text: string | null
  key_strategy: string | null
  common_mistake: string | null
}

export interface QuestionWithSolution extends Question {
  solution: Solution | null
}

export type AnswerChoice = 'A' | 'B' | 'C' | 'D' | 'E'

export type QuestionStatus = 'unanswered' | 'correct' | 'wrong' | 'skipped' | 'flagged'

export interface QuestionState {
  practice_question_number: number
  selected_answer: AnswerChoice | null
  status: QuestionStatus
  wrong_answers: AnswerChoice[]
  flagged: boolean
}

export interface PracticeProgress {
  total: number
  answered: number
  correct: number
  wrong: number
  skipped: number
  flagged: number
}
