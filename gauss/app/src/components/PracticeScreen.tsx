import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { PDFViewer } from './PDFViewer'
import { AnswerCard } from './AnswerCard'
import { CoachingPanel } from './CoachingPanel'
import { ProgressIndicator } from './ProgressIndicator'
import { SummaryPanel } from './SummaryPanel'
import { UserHeader } from './UserHeader'
import { ArrowLeft } from 'lucide-react'
import type { QuestionWithSolution, QuestionState, AnswerChoice, Solution, ContestProgress } from '../types/database'

interface ContestRow {
  id: string
  question_pdf_filename: string | null
}

interface QuestionRow {
  id: string
  contest_question_number: number
  correct_answer: string
  short_problem_summary: string | null
  question_pdf_page: number | null
  crop_x: number | null
  crop_y: number | null
  crop_width: number | null
  crop_height: number | null
  source_year: number | null
  source_grade: number | null
  source_question_number: number | null
}

interface SolutionRow {
  id: string
  question_id: string
  psg_solution_text: string | null
  psg_solution_summary: string | null
}

interface SourceQuestionRow {
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

interface SessionRow {
  id: string
  current_question_number: number
  correct_count: number
  wrong_count: number
  skipped_count: number
  flagged_count: number
  status: string
}

interface AttemptRow {
  id: string
  question_id: string
  selected_answer: string | null
  is_correct: boolean | null
  status: string | null
  wrong_answers: string[] | null
  flagged: boolean | null
  skipped: boolean | null
}

interface ContestScreenProps {
  contestCode: string
  onBack?: () => void
}

export function PracticeScreen({ contestCode, onBack }: ContestScreenProps) {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<QuestionWithSolution[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [questionStates, setQuestionStates] = useState<Map<string, QuestionState>>(new Map())
  const [coachingOpen, setCoachingOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pdfPage, setPdfPage] = useState(1)
  const [showSummary, setShowSummary] = useState(false)
  const [noFlaggedMessage, setNoFlaggedMessage] = useState(false)

  // Session tracking
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [contestId, setContestId] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  // Fetch questions, solutions, and session
  useEffect(() => {
    async function fetchData() {
      if (!user?.id) {
        setError('Please sign in to practice')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Get contest
        const { data: contest, error: contestError } = await supabase
          .from('gauss_contests')
          .select('id, question_pdf_filename')
          .eq('contest_code', contestCode)
          .single()

        if (contestError || !contest) {
          throw new Error(`Contest "${contestCode}" not found`)
        }

        const c = contest as ContestRow
        setContestId(c.id)

        // Set PDF URL from contest data
        if (c.question_pdf_filename) {
          setPdfUrl(`/questions/${c.question_pdf_filename}`)
        }

        // Get questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('gauss_questions')
          .select('*')
          .eq('contest_id', c.id)
          .order('contest_question_number', { ascending: true })

        if (questionsError) {
          throw questionsError
        }

        const qData = (questionsData || []) as QuestionRow[]

        if (qData.length === 0) {
          throw new Error('No questions found for this contest')
        }

        // Get solutions for all questions
        const questionIds = qData.map(q => q.id)
        const { data: solutionsData, error: solutionsError } = await supabase
          .from('gauss_solutions')
          .select('id, question_id, psg_solution_text, psg_solution_summary')
          .in('question_id', questionIds)

        if (solutionsError) {
          console.warn('Error fetching solutions:', solutionsError)
        }

        const solData = (solutionsData || []) as SolutionRow[]

        // Build source question lookup keys from questions that have source mapping
        const sourceKeys = qData
          .filter(q => q.source_year && q.source_grade && q.source_question_number)
          .map(q => ({ year: q.source_year!, grade: q.source_grade!, question_number: q.source_question_number! }))

        // Fetch source questions by year/grade/question_number
        // Coaching is available if source question exists AND has official_solution
        const sourceQuestionsMap = new Map<string, SourceQuestionRow>()
        if (sourceKeys.length > 0) {
          // Query source questions - we need to check each combination
          const { data: sourceData, error: sourceError } = await (supabase
            .from('gauss_source_questions') as any)
            .select('id, year, grade, question_number, question_text, options, official_solution, reasoning_summary, solution_pattern, archetype, blueprint_code, visual_required, visual_description')

          if (sourceError) {
            console.warn('Error fetching source questions:', sourceError)
          } else if (sourceData) {
            (sourceData as (SourceQuestionRow & { year: number; grade: number; question_number: number })[]).forEach(src => {
              // Key by year-grade-question_number for lookup
              const key = `${src.year}-${src.grade}-${src.question_number}`
              sourceQuestionsMap.set(key, src)
            })
          }
        }

        // Map solutions to questions, determining coaching_available from source questions
        const solutionsMap = new Map<string, Solution>()
        qData.forEach((q) => {
          const sol = solData.find(s => s.question_id === q.id)
          const sourceKey = q.source_year && q.source_grade && q.source_question_number
            ? `${q.source_year}-${q.source_grade}-${q.source_question_number}`
            : null
          const sourceQuestion = sourceKey ? sourceQuestionsMap.get(sourceKey) : null

          // Coaching is available if source question exists AND has official_solution
          const coachingAvailable = !!(sourceQuestion && sourceQuestion.official_solution)

          solutionsMap.set(q.id, {
            id: sol?.id || '',
            question_id: q.id,
            psg_solution_text: sol?.psg_solution_text || null,
            psg_solution_summary: sol?.psg_solution_summary || null,
            coaching_available: coachingAvailable,
            source_question: sourceQuestion ? {
              id: sourceQuestion.id,
              question_text: sourceQuestion.question_text,
              options: sourceQuestion.options,
              official_solution: sourceQuestion.official_solution,
              reasoning_summary: sourceQuestion.reasoning_summary,
              solution_pattern: sourceQuestion.solution_pattern,
              archetype: sourceQuestion.archetype,
              blueprint_code: sourceQuestion.blueprint_code,
              visual_required: sourceQuestion.visual_required,
              visual_description: sourceQuestion.visual_description,
            } : null,
          })
        })

        const questionsWithSolutions: QuestionWithSolution[] = qData.map((q) => ({
          id: q.id,
          contest_question_number: q.contest_question_number,
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

        // Find or create session
        const { data: existingSession, error: sessionError } = await (supabase
          .from('gauss_contest_sessions') as any)
          .select('*')
          .eq('user_id', user.id)
          .eq('contest_id', c.id)
          .eq('status', 'in_progress')
          .order('started_at', { ascending: false })
          .limit(1)
          .single()

        let currentSession: SessionRow

        if (sessionError || !existingSession) {
          // Create new session
          console.log('Creating new contest session for user:', user.id)
          const { data: newSession, error: createError } = await (supabase
            .from('gauss_contest_sessions') as any)
            .insert({
              user_id: user.id,
              contest_id: c.id,
              status: 'in_progress',
              current_question_number: 1,
              total_questions: qData.length,
              correct_count: 0,
              wrong_count: 0,
              skipped_count: 0,
              flagged_count: 0,
            })
            .select()
            .single()

          if (createError) {
            console.error('Session creation error:', createError)
            throw new Error(`Failed to create contest session: ${createError.message}`)
          }

          if (!newSession) {
            throw new Error('Failed to create contest session: No data returned')
          }

          console.log('Session created:', newSession.id)
          currentSession = newSession as SessionRow
        } else {
          console.log('Resuming existing session:', existingSession.id)
          currentSession = existingSession as SessionRow
        }

        setSessionId(currentSession.id)

        // Initialize question states
        const initialStates = new Map<string, QuestionState>()
        questionsWithSolutions.forEach((q) => {
          initialStates.set(q.id, {
            contest_question_number: q.contest_question_number,
            selected_answer: null,
            status: 'unanswered',
            wrong_answers: [],
            flagged: false,
          })
        })

        // Load existing attempts for this session
        const { data: attemptsData, error: attemptsError } = await (supabase
          .from('gauss_attempts') as any)
          .select('*')
          .eq('session_id', currentSession.id)

        if (!attemptsError && attemptsData) {
          const attempts = attemptsData as AttemptRow[]
          attempts.forEach((attempt) => {
            const question = questionsWithSolutions.find(q => q.id === attempt.question_id)
            if (question) {
              initialStates.set(attempt.question_id, {
                contest_question_number: question.contest_question_number,
                selected_answer: attempt.selected_answer as AnswerChoice | null,
                status: (attempt.status as QuestionState['status']) || 'unanswered',
                wrong_answers: (attempt.wrong_answers || []) as AnswerChoice[],
                flagged: attempt.flagged || false,
              })
            }
          })
        }

        setQuestionStates(initialStates)

        // Restore current question from session
        const restoredIndex = Math.max(0, currentSession.current_question_number - 1)
        setCurrentQuestionIndex(restoredIndex)

        // Set PDF page
        const currentQ = questionsWithSolutions[restoredIndex]
        if (currentQ?.question_pdf_page) {
          setPdfPage(currentQ.question_pdf_page)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [contestCode, user?.id])

  // Save attempt to database
  const saveAttempt = useCallback(async (
    questionId: string,
    state: QuestionState
  ) => {
    if (!sessionId || !user?.id) {
      console.warn('Cannot save attempt: missing sessionId or user')
      return
    }

    // Check if attempt already exists
    const { data: existing, error: fetchError } = await (supabase
      .from('gauss_attempts') as any)
      .select('id')
      .eq('session_id', sessionId)
      .eq('question_id', questionId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing attempt:', fetchError)
    }

    if (existing) {
      // Update existing attempt
      const { error: updateError } = await (supabase
        .from('gauss_attempts') as any)
        .update({
          selected_answer: state.selected_answer,
          is_correct: state.status === 'correct',
          status: state.status,
          wrong_answers: state.wrong_answers,
          flagged: state.flagged,
          skipped: state.status === 'skipped',
          attempted_at: new Date().toISOString(),
        })
        .eq('id', existing.id)

      if (updateError) {
        console.error('Error updating attempt:', updateError)
      } else {
        console.log('Attempt updated for question:', questionId)
      }
    } else {
      // Insert new attempt
      const { error: insertError } = await (supabase
        .from('gauss_attempts') as any)
        .insert({
          session_id: sessionId,
          user_id: user.id,
          question_id: questionId,
          selected_answer: state.selected_answer,
          is_correct: state.status === 'correct',
          status: state.status,
          wrong_answers: state.wrong_answers,
          flagged: state.flagged,
          skipped: state.status === 'skipped',
          attempted_at: new Date().toISOString(),
        })

      if (insertError) {
        console.error('Error inserting attempt:', insertError)
      } else {
        console.log('Attempt saved for question:', questionId)
      }
    }
  }, [sessionId, user?.id])

  // Update session in database
  const updateSession = useCallback(async (updates: Record<string, unknown>) => {
    if (!sessionId) {
      console.warn('Cannot update session: no sessionId')
      return
    }

    console.log('Updating session:', sessionId, updates)
    const { error } = await (supabase
      .from('gauss_contest_sessions') as any)
      .update(updates)
      .eq('id', sessionId)

    if (error) {
      console.error('Session update error:', error)
    } else {
      console.log('Session updated successfully')
    }
  }, [sessionId])

  // Update session counts
  const updateSessionCounts = useCallback(async (states: Map<string, QuestionState>) => {
    const statesArray = Array.from(states.values())
    const counts = {
      correct_count: statesArray.filter(s => s.status === 'correct').length,
      wrong_count: statesArray.filter(s => s.status === 'wrong').length,
      skipped_count: statesArray.filter(s => s.status === 'skipped').length,
      flagged_count: statesArray.filter(s => s.flagged).length,
    }
    await updateSession(counts)
  }, [updateSession])

  // Calculate progress
  const progress = useMemo((): ContestProgress => {
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
        contest_question_number: currentQuestion.contest_question_number,
        selected_answer: null,
        status: 'unanswered' as const,
        wrong_answers: [],
        flagged: false,
      }
    : null

  const goToQuestion = useCallback(async (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index)
      setCoachingOpen(false)
      setShowSummary(false)

      const question = questions[index]
      if (question?.question_pdf_page) {
        setPdfPage(question.question_pdf_page)
      }

      // Update session current_question_number
      await updateSession({ current_question_number: index + 1 })
    }
  }, [questions, updateSession])

  const goToNextQuestion = useCallback(async () => {
    if (currentQuestionIndex < questions.length - 1) {
      await goToQuestion(currentQuestionIndex + 1)
    } else {
      // Reached the end - show summary
      setShowSummary(true)

      // Check if all questions have been dealt with (answered, skipped, or flagged)
      const states = Array.from(questionStates.values())
      const allDealtWith = states.every(s =>
        s.status === 'correct' || s.status === 'wrong' || s.status === 'skipped' || s.status === 'flagged'
      )

      if (allDealtWith) {
        console.log('All questions dealt with, marking session as completed')
        await updateSession({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
      }
    }
  }, [currentQuestionIndex, questions.length, goToQuestion, questionStates, updateSession])

  const goToPreviousQuestion = useCallback(async () => {
    if (currentQuestionIndex > 0) {
      await goToQuestion(currentQuestionIndex - 1)
    }
  }, [currentQuestionIndex, goToQuestion])

  const handleSelectAnswer = useCallback(async (answer: AnswerChoice) => {
    if (!currentQuestion) return

    const isCorrect = answer === currentQuestion.correct_answer

    let newState: QuestionState

    setQuestionStates((prev) => {
      const newStates = new Map(prev)
      const prevState = prev.get(currentQuestion.id)!

      if (isCorrect) {
        newState = {
          ...prevState,
          selected_answer: answer,
          status: 'correct',
        }
      } else {
        newState = {
          ...prevState,
          selected_answer: answer,
          status: 'wrong',
          wrong_answers: [...prevState.wrong_answers, answer],
        }
      }

      newStates.set(currentQuestion.id, newState)

      // Update session counts
      updateSessionCounts(newStates)

      return newStates
    })

    // Save attempt to database
    const prevState = questionStates.get(currentQuestion.id)!
    const attemptState: QuestionState = isCorrect
      ? { ...prevState, selected_answer: answer, status: 'correct' }
      : { ...prevState, selected_answer: answer, status: 'wrong', wrong_answers: [...prevState.wrong_answers, answer] }

    await saveAttempt(currentQuestion.id, attemptState)

    if (isCorrect) {
      // Auto-advance after a short delay
      setTimeout(() => goToNextQuestion(), 600)
    } else {
      // Open coaching panel on wrong answer
      setCoachingOpen(true)
    }
  }, [currentQuestion, questionStates, saveAttempt, updateSessionCounts, goToNextQuestion])

  const handleSkip = useCallback(async () => {
    if (!currentQuestion) return

    const prevState = questionStates.get(currentQuestion.id)!
    const newState: QuestionState = {
      ...prevState,
      status: 'skipped',
    }

    setQuestionStates((prev) => {
      const newStates = new Map(prev)
      newStates.set(currentQuestion.id, newState)
      updateSessionCounts(newStates)
      return newStates
    })

    await saveAttempt(currentQuestion.id, newState)
    await goToNextQuestion()
  }, [currentQuestion, questionStates, saveAttempt, updateSessionCounts, goToNextQuestion])

  const handleFlag = useCallback(async () => {
    if (!currentQuestion) return

    const currentFlagged = questionStates.get(currentQuestion.id)?.flagged || false
    const prevState = questionStates.get(currentQuestion.id)!

    const newState: QuestionState = {
      ...prevState,
      flagged: !currentFlagged,
      status: !currentFlagged ? 'flagged' : prevState.status === 'flagged' ? 'unanswered' : prevState.status,
    }

    setQuestionStates((prev) => {
      const newStates = new Map(prev)
      newStates.set(currentQuestion.id, newState)
      updateSessionCounts(newStates)
      return newStates
    })

    await saveAttempt(currentQuestion.id, newState)

    // Only auto-advance if flagging (not unflagging)
    if (!currentFlagged) {
      await goToNextQuestion()
    }
  }, [currentQuestion, questionStates, saveAttempt, updateSessionCounts, goToNextQuestion])

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

  const handleRestart = useCallback(async () => {
    if (!user?.id || !contestId) {
      console.error('Cannot restart: missing user or contestId')
      alert('Unable to restart. Please refresh the page.')
      return
    }

    console.log('Restarting contest...')

    // Mark current session as abandoned (not completed)
    if (sessionId) {
      console.log('Marking session as abandoned:', sessionId)
      await updateSession({ status: 'abandoned' })
    }

    // Create new session
    console.log('Creating new session...')
    const { data: newSession, error: createError } = await (supabase
      .from('gauss_contest_sessions') as any)
      .insert({
        user_id: user.id,
        contest_id: contestId,
        status: 'in_progress',
        current_question_number: 1,
        total_questions: questions.length,
        correct_count: 0,
        wrong_count: 0,
        skipped_count: 0,
        flagged_count: 0,
      })
      .select()
      .single()

    if (createError) {
      console.error('Failed to create new session:', createError)
      alert(`Failed to restart: ${createError.message}`)
      return
    }

    if (!newSession) {
      console.error('No session data returned')
      alert('Failed to restart: No session created')
      return
    }

    console.log('New session created:', newSession.id)
    setSessionId((newSession as SessionRow).id)

    // Reset all question states
    const resetStates = new Map<string, QuestionState>()
    questions.forEach((q) => {
      resetStates.set(q.id, {
        contest_question_number: q.contest_question_number,
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
  }, [user?.id, contestId, sessionId, questions, updateSession])

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
          <p className="text-gray-600">Loading contest...</p>
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
    <div className="h-screen flex bg-gray-100 p-3 gap-3">
      {/* Left Main Area */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {/* Back button row (only when onBack exists) */}
        {onBack && (
          <div className="flex-shrink-0">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors bg-white border border-gray-200"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
          </div>
        )}
        {/* PDF Viewer */}
        <div className="flex-1 min-h-0">
          {pdfUrl ? (
            <PDFViewer
              pdfUrl={pdfUrl}
              currentPage={pdfPage}
              onPageChange={handlePdfPageChange}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-200 rounded-lg">
              <p className="text-gray-500">No PDF available for this contest</p>
            </div>
          )}
        </div>

        {/* Answer Card - Bottom */}
        <div className="flex-shrink-0">
          <AnswerCard
            currentQuestionNumber={currentQuestion.contest_question_number}
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

        {/* Right Side Panel - Header + Coaching + Progress */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-2">
          {/* User Header */}
          <div className="flex-shrink-0">
            <UserHeader />
          </div>
          {/* Coaching Panel */}
          <div className="flex-1 min-h-0">
            <CoachingPanel
              solution={currentQuestion.solution}
              isOpen={coachingOpen}
              onToggle={toggleCoaching}
              contestCode={contestCode}
              contestQuestionNumber={currentQuestion.contest_question_number}
            />
          </div>
          {/* Progress Indicator - Bottom of right panel */}
          <div className="flex-shrink-0 relative">
            <ProgressIndicator
              progress={progress}
              onReviewFlagged={handleReviewFlagged}
            />
            {noFlaggedMessage && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-3 py-1 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                No flagged questions yet.
              </div>
            )}
          </div>
        </div>
    </div>
  )
}
