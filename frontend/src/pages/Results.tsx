import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { getQuiz, type QuizSession } from '@/services/api'

export function ResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()

  const [session, setSession] = useState<QuizSession | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return

    const loadSession = async () => {
      try {
        const data = await getQuiz(sessionId)
        setSession(data)

        // Redirect if not completed
        if (!data.completed) {
          navigate(`/quiz/${sessionId}`)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load results')
      }
    }

    loadSession()
  }, [sessionId, navigate])

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => navigate('/practice')}>Back to Practice</Button>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <p>Loading results...</p>
      </div>
    )
  }

  // Calculate statistics
  const totalQuestions = session.questions.length
  const correctAnswers = Object.values(session.question_states).filter(
    (state) => state.is_correct
  ).length
  const percentage = Math.round((correctAnswers / totalQuestions) * 100)

  // Calculate total points (Waterloo Gauss scoring)
  const totalPoints = session.questions.reduce((sum, q, index) => {
    const state = session.question_states[q.id]
    if (state?.correct) {
      // Part A = 5pts, Part B = 6pts, Part C = 8pts
      switch (q.difficulty) {
        case 'part_a':
          return sum + 5
        case 'part_b':
          return sum + 6
        case 'part_c':
          return sum + 8
        default:
          return sum + 5
      }
    }
    return sum
  }, 0)

  const maxPoints = session.questions.reduce((sum, q) => {
    switch (q.difficulty) {
      case 'part_a':
        return sum + 5
      case 'part_b':
        return sum + 6
      case 'part_c':
        return sum + 8
      default:
        return sum + 5
    }
  }, 0)

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
          <CardDescription>
            Here's how you did on this practice session
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Score Summary */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-primary">
                {correctAnswers}/{totalQuestions}
              </div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-primary">{percentage}%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-primary">
                {totalPoints}/{maxPoints}
              </div>
              <div className="text-sm text-muted-foreground">Points</div>
            </div>
          </div>

          {/* Performance Message */}
          <div className="text-center p-4 rounded-lg bg-accent">
            {percentage >= 80 ? (
              <p className="text-lg">
                Excellent work! You're showing strong mastery of these concepts.
              </p>
            ) : percentage >= 60 ? (
              <p className="text-lg">
                Good effort! Keep practicing to strengthen your understanding.
              </p>
            ) : (
              <p className="text-lg">
                Keep going! Practice makes perfect. Review the coaching tips for
                questions you missed.
              </p>
            )}
          </div>

          {/* Question Review */}
          <div className="space-y-3">
            <h3 className="font-semibold">Question Review</h3>
            {session.questions.map((question, index) => {
              const state = session.question_states[question.id]
              const isCorrect = state?.correct

              return (
                <div
                  key={question.id}
                  className={`p-3 rounded-lg border ${
                    isCorrect
                      ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950'
                      : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        Question {index + 1}
                        <span className="ml-2 text-muted-foreground font-normal">
                          ({question.difficulty.replace('_', ' ')})
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {question.question_text}
                      </div>
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        isCorrect
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                      }`}
                    >
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </div>
                  </div>
                  {!isCorrect && state?.selected_answer && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Your answer: {state.selected_answer} | Correct:{' '}
                      {question.correct_answer}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>

        <CardFooter className="flex gap-4">
          <Button asChild variant="outline" className="flex-1">
            <Link to="/practice">New Practice</Link>
          </Button>
          <Button asChild className="flex-1">
            <Link to="/">Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
