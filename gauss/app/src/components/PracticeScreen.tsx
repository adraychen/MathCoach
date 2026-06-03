import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
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
  coaching_mode: string | null
  coaching_source_id: string | null
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

interface PracticeScreenProps {
  setCode: string
}

export function PracticeScreen({ setCode }: PracticeScreenProps) {
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
  const [practiceSetId, setPracticeSetId] = useState<string | null>(null)

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
        setPracticeSetId(ps.id)

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
          .select('id, question_id, coaching_available, coaching_mode, coaching_source_id, psg_solution_text, psg_solution_summary')
          .in('question_id', questionIds)

        if (solutionsError) {
          console.warn('Error fetching solutions:', solutionsError)
        }

        const solData = (solutionsData || []) as SolutionRow[]

        // Get coaching source IDs that exist
        const coachingSourceIds = solData
          .map(sol => sol.coaching_source_id)
          .filter((id): id is string => id !== null)

        // Fetch source questions for coaching
        let sourceQuestionsMap = new Map<string, SourceQuestionRow>()
        if (coachingSourceIds.length > 0) {
          const { data: sourceData, error: sourceError } = await (supabase
            .from('gauss_source_questions') as any)
            .select('id, question_text, options, official_solution, reasoning_summary, solution_pattern, archetype, blueprint_code, visual_required, visual_description')
            .in('id', coachingSourceIds)

          if (sourceError) {
            console.warn('Error fetching source questions:', sourceError)
          } else if (sourceData) {
            (sourceData as SourceQuestionRow[]).forEach(src => {
              sourceQuestionsMap.set(src.id, src)
            })
          }
        }

        // Map solutions to questions
        const solutionsMap = new Map<string, Solution>()
        solData.forEach((sol) => {
          const sourceQuestion = sol.coaching_source_id
            ? sourceQuestionsMap.get(sol.coaching_source_id) || null
            : null

          solutionsMap.set(sol.question_id, {
            id: sol.id,
            question_id: sol.question_id,
            coaching_available: sol.coaching_available,
            coaching_mode: (sol.coaching_mode as Solution['coaching_mode']) || 'none',
            coaching_source_id: sol.coaching_source_id,
            psg_solution_text: sol.psg_solution_text,
            psg_solution_summary: sol.psg_solution_summary,
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

        // Find or create session
        const { data: existingSession, error: sessionError } = await (supabase
          .from('gauss_practice_sessions') as any)
          .select('*')
          .eq('user_id', user.id)
          .eq('practice_set_id', ps.id)
          .eq('status', 'in_progress')
          .order('started_at', { ascending: false })
          .limit(1)
          .single()

        let currentSession: SessionRow

        if (sessionError || !existingSession) {
          // Create new session
          console.log('Creating new practice session for user:', user.id)
          const { data: newSession, error: createError } = await (supabase
            .from('gauss_practice_sessions') as any)
            .insert({
              user_id: user.id,
              practice_set_id: ps.id,
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
            throw new Error(`Failed to create practice session: ${createError.message}`)
          }

          if (!newSession) {
            throw new Error('Failed to create practice session: No data returned')
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
            practice_question_number: q.practice_question_number,
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
                practice_question_number: question.practice_question_number,
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
  }, [setCode, user?.id])

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
      .from('gauss_practice_sessions') as any)
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
    if (!user?.id || !practiceSetId) {
      console.error('Cannot restart: missing user or practiceSetId')
      alert('Unable to restart. Please refresh the page.')
      return
    }

    console.log('Restarting practice...')

    // Mark current session as abandoned (not completed)
    if (sessionId) {
      console.log('Marking session as abandoned:', sessionId)
      await updateSession({ status: 'abandoned' })
    }

    // Create new session
    console.log('Creating new session...')
    const { data: newSession, error: createError } = await (supabase
      .from('gauss_practice_sessions') as any)
      .insert({
        user_id: user.id,
        practice_set_id: practiceSetId,
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
  }, [user?.id, practiceSetId, sessionId, questions, updateSession])

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
              setCode={setCode}
              practiceQuestionNumber={currentQuestion.practice_question_number}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
