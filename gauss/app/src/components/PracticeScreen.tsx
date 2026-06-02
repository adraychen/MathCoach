import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { PDFViewer } from './PDFViewer'
import { AnswerCard } from './AnswerCard'
import { CoachingPanel } from './CoachingPanel'
import { ProgressIndicator } from './ProgressIndicator'
import { SummaryPanel } from './SummaryPanel'
import { UserHeader } from './UserHeader'
import type { QuestionWithSolution, QuestionState, AnswerChoice, Solution, PracticeProgress } from '../types/database'

interface PracticeSetRow {
  id: string
}

interface QuestionRow {
  id: string
  practice_question_number: number
  correct_answer: string
  short_problem_summary: string | null
  question_pdf_page: number | null
  crop_x: number | null
  crop_y: number | null
  crop_width: number | null
  crop_height: number | null
}

interface SolutionRow {
  id: string
  question_id: string
  coaching_available: boolean
  hint_1: string | null
  hint_2: string | null
  guided_steps: unknown
  detailed_solution_text: string | null
  psg_solution_text: string | null
  key_strategy: string | null
  common_mistake: string | null
}

interface PracticeScreenProps {
  setCode: string
}

export function PracticeScreen({ setCode }: PracticeScreenProps) {
  const [questions, setQuestions] = useState<QuestionWithSolution[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [questionStates, setQuestionStates] = useState<Map<string, QuestionState>>(new Map())
  const [coachingOpen, setCoachingOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pdfPage, setPdfPage] = useState(1)
  const [showSummary, setShowSummary] = useState(false)
  const [noFlaggedMessage, setNoFlaggedMessage] = useState(false)

  // Fetch questions and solutions
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        // Get practice set
        const { data: practiceSet, error: psError } = await supabase
          .from('gauss_practice_sets')
          .select('id')
          .eq('set_code', setCode)
          .single()

        if (psError || !practiceSet) {
          throw new Error(`Practice set "${setCode}" not found`)
        }

        const ps = practiceSet as PracticeSetRow

        // Get questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('gauss_questions')
          .select('*')
          .eq('practice_set_id', ps.id)
          .order('practice_question_number', { ascending: true })

        if (questionsError) {
          throw questionsError
        }

        const qData = (questionsData || []) as QuestionRow[]

        if (qData.length === 0) {
          throw new Error('No questions found for this practice set')
        }

        // Get solutions for all questions
        const questionIds = qData.map(q => q.id)
        const { data: solutionsData, error: solutionsError } = await supabase
          .from('gauss_solutions')
          .select('*')
          .in('question_id', questionIds)

        if (solutionsError) {
          console.warn('Error fetching solutions:', solutionsError)
        }

        const solData = (solutionsData || []) as SolutionRow[]

        // Map solutions to questions
        const solutionsMap = new Map<string, Solution>()
        solData.forEach((sol) => {
          solutionsMap.set(sol.question_id, {
            id: sol.id,
            question_id: sol.question_id,
            coaching_available: sol.coaching_available,
            hint_1: sol.hint_1,
            hint_2: sol.hint_2,
            guided_steps: sol.guided_steps as Solution['guided_steps'],
            detailed_solution_text: sol.detailed_solution_text,
            psg_solution_text: sol.psg_solution_text,
            key_strategy: sol.key_strategy,
            common_mistake: sol.common_mistake,
          })
        })

        const questionsWithSolutions: QuestionWithSolution[] = qData.map((q) => ({
          id: q.id,
          practice_question_number: q.practice_question_number,
          correct_answer: q.correct_answer as AnswerChoice,
          short_problem_summary: q.short_problem_summary,
          question_pdf_page: q.question_pdf_page,
          crop_x: q.crop_x,
          crop_y: q.crop_y,
          crop_width: q.crop_width,
          crop_height: q.crop_height,
          solution: solutionsMap.get(q.id) || null,
        }))

        setQuestions(questionsWithSolutions)

        // Initialize question states
        const initialStates = new Map<string, QuestionState>()
        questionsWithSolutions.forEach((q) => {
          initialStates.set(q.id, {
            practice_question_number: q.practice_question_number,
            selected_answer: null,
            status: 'unanswered',
            wrong_answers: [],
            flagged: false,
          })
        })
        setQuestionStates(initialStates)

        // Set initial PDF page
        if (questionsWithSolutions[0]?.question_pdf_page) {
          setPdfPage(questionsWithSolutions[0].question_pdf_page)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [setCode])

  // Calculate progress
  const progress = useMemo((): PracticeProgress => {
    const states = Array.from(questionStates.values())
    return {
      total: states.length,
      answered: states.filter(s => s.status === 'correct' || s.status === 'wrong').length,
      correct: states.filter(s => s.status === 'correct').length,
      wrong: states.filter(s => s.status === 'wrong').length,
      skipped: states.filter(s => s.status === 'skipped').length,
      flagged: states.filter(s => s.flagged).length,
    }
  }, [questionStates])

  const currentQuestion = questions[currentQuestionIndex]
  const currentState = currentQuestion
    ? questionStates.get(currentQuestion.id) || {
        practice_question_number: currentQuestion.practice_question_number,
        selected_answer: null,
        status: 'unanswered' as const,
        wrong_answers: [],
        flagged: false,
      }
    : null

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index)
      setCoachingOpen(false)
      setShowSummary(false)

      const question = questions[index]
      if (question?.question_pdf_page) {
        setPdfPage(question.question_pdf_page)
      }
    }
  }, [questions])

  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      goToQuestion(currentQuestionIndex + 1)
    } else {
      // Reached the end - show summary
      setShowSummary(true)
    }
  }, [currentQuestionIndex, questions.length, goToQuestion])

  const goToPreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      goToQuestion(currentQuestionIndex - 1)
    }
  }, [currentQuestionIndex, goToQuestion])

  const handleSelectAnswer = useCallback((answer: AnswerChoice) => {
    if (!currentQuestion) return

    const isCorrect = answer === currentQuestion.correct_answer

    setQuestionStates((prev) => {
      const newStates = new Map(prev)
      const prevState = prev.get(currentQuestion.id)!

      if (isCorrect) {
        newStates.set(currentQuestion.id, {
          ...prevState,
          selected_answer: answer,
          status: 'correct',
        })
      } else {
        newStates.set(currentQuestion.id, {
          ...prevState,
          selected_answer: answer,
          status: 'wrong',
          wrong_answers: [...prevState.wrong_answers, answer],
        })
      }
      return newStates
    })

    if (isCorrect) {
      // Auto-advance after a short delay
      setTimeout(goToNextQuestion, 600)
    } else {
      // Open coaching panel on wrong answer
      setCoachingOpen(true)
    }
  }, [currentQuestion, goToNextQuestion])

  const handleSkip = useCallback(() => {
    if (!currentQuestion) return

    setQuestionStates((prev) => {
      const newStates = new Map(prev)
      const prevState = prev.get(currentQuestion.id)!
      newStates.set(currentQuestion.id, {
        ...prevState,
        status: 'skipped',
      })
      return newStates
    })

    goToNextQuestion()
  }, [currentQuestion, goToNextQuestion])

  const handleFlag = useCallback(() => {
    if (!currentQuestion) return

    const currentFlagged = questionStates.get(currentQuestion.id)?.flagged || false

    setQuestionStates((prev) => {
      const newStates = new Map(prev)
      const prevState = prev.get(currentQuestion.id)!
      newStates.set(currentQuestion.id, {
        ...prevState,
        flagged: !currentFlagged,
      })
      return newStates
    })

    // Only auto-advance if flagging (not unflagging)
    if (!currentFlagged) {
      goToNextQuestion()
    }
  }, [currentQuestion, questionStates, goToNextQuestion])

  const handleReviewFlagged = useCallback(() => {
    // Find first flagged question
    const flaggedIndex = questions.findIndex(q =>
      questionStates.get(q.id)?.flagged === true
    )

    if (flaggedIndex >= 0) {
      goToQuestion(flaggedIndex)
      setNoFlaggedMessage(false)
    } else {
      setNoFlaggedMessage(true)
      setTimeout(() => setNoFlaggedMessage(false), 2000)
    }
  }, [questions, questionStates, goToQuestion])

  const handleReviewWrong = useCallback(() => {
    // Find first wrong question
    const wrongIndex = questions.findIndex(q =>
      questionStates.get(q.id)?.status === 'wrong'
    )

    if (wrongIndex >= 0) {
      goToQuestion(wrongIndex)
    }
  }, [questions, questionStates, goToQuestion])

  const handleRestart = useCallback(() => {
    // Reset all question states
    const resetStates = new Map<string, QuestionState>()
    questions.forEach((q) => {
      resetStates.set(q.id, {
        practice_question_number: q.practice_question_number,
        selected_answer: null,
        status: 'unanswered',
        wrong_answers: [],
        flagged: false,
      })
    })
    setQuestionStates(resetStates)
    setCurrentQuestionIndex(0)
    setShowSummary(false)
    setCoachingOpen(false)

    if (questions[0]?.question_pdf_page) {
      setPdfPage(questions[0].question_pdf_page)
    }
  }, [questions])

  const handlePdfPageChange = (page: number) => {
    setPdfPage(page)
  }

  const toggleCoaching = () => {
    setCoachingOpen((prev) => !prev)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading practice set...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (showSummary) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 p-4">
        <SummaryPanel
          progress={progress}
          onRestart={handleRestart}
          onReviewFlagged={handleReviewFlagged}
          onReviewWrong={handleReviewWrong}
        />
      </div>
    )
  }

  if (!currentQuestion || !currentState) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">No questions available.</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 p-3 gap-2">
      {/* Header */}
      <div className="flex-shrink-0">
        <UserHeader />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-3 min-h-0">
        {/* Left Main Area */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          {/* Progress Indicator */}
          <div className="flex-shrink-0 relative">
            <ProgressIndicator
              progress={progress}
              onReviewFlagged={handleReviewFlagged}
            />
            {noFlaggedMessage && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-3 py-1 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                No flagged questions yet.
              </div>
            )}
          </div>

        {/* PDF Viewer - Top */}
        <div className="flex-1 min-h-0">
          <PDFViewer
            pdfUrl="/G7gauss1-question.pdf"
            currentPage={pdfPage}
            onPageChange={handlePdfPageChange}
          />
        </div>

        {/* Answer Card - Bottom */}
        <div className="flex-shrink-0">
          <AnswerCard
            currentQuestionNumber={currentQuestion.practice_question_number}
            totalQuestions={questions.length}
            questionState={currentState}
            onSelectAnswer={handleSelectAnswer}
            onSkip={handleSkip}
            onFlag={handleFlag}
            onPrevious={goToPreviousQuestion}
            onNext={goToNextQuestion}
            canGoPrevious={currentQuestionIndex > 0}
            canGoNext={currentQuestionIndex < questions.length - 1}
          />
        </div>
      </div>

        {/* Right Side Panel - Coaching */}
        <div className="w-80 flex-shrink-0">
          <div className="sticky top-4">
            <CoachingPanel
              solution={currentQuestion.solution}
              isOpen={coachingOpen}
              onToggle={toggleCoaching}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
