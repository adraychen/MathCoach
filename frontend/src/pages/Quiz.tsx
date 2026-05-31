import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  getQuiz,
  submitAnswer,
  getStartCoaching,
  getMisconceptionCoaching,
  getFollowupCoaching,
  type QuizSession,
  type Question,
  type ChatMessage,
} from '@/services/api'

export function QuizPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()

  const [session, setSession] = useState<QuizSession | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [coaching, setCoaching] = useState<ChatMessage[]>([])
  const [userInput, setUserInput] = useState('')
  const [isLoadingCoaching, setIsLoadingCoaching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load quiz session
  useEffect(() => {
    if (!sessionId) return

    const loadSession = async () => {
      try {
        const data = await getQuiz(sessionId)
        setSession(data)

        // Check if completed
        if (data.completed) {
          navigate(`/results/${sessionId}`)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quiz')
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
        <p>Loading quiz...</p>
      </div>
    )
  }

  const currentQuestion: Question = session.questions[session.current_index]

  const handleSubmit = async () => {
    if (!selectedAnswer || !sessionId) return

    setIsSubmitting(true)

    try {
      const result = await submitAnswer(sessionId, currentQuestion.id, selectedAnswer)

      if (result.correct) {
        // Add success message
        setCoaching((prev) => [
          ...prev,
          { role: 'assistant', content: 'Correct! Moving to the next question.' },
        ])

        // Reload session to get updated state
        const updatedSession = await getQuiz(sessionId)
        setSession(updatedSession)
        setSelectedAnswer(null)
        setCoaching([])

        // Check if completed
        if (updatedSession.completed) {
          navigate(`/results/${sessionId}`)
        }
      } else {
        // Get misconception coaching
        setIsLoadingCoaching(true)
        const coachingResponse = await getMisconceptionCoaching(
          currentQuestion,
          selectedAnswer
        )
        setCoaching((prev) => [
          ...prev,
          { role: 'assistant', content: coachingResponse.message },
        ])
        setIsLoadingCoaching(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNeedCoaching = async () => {
    setIsLoadingCoaching(true)

    try {
      const response = await getStartCoaching(currentQuestion)
      setCoaching((prev) => [
        ...prev,
        { role: 'assistant', content: response.message },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get coaching')
    } finally {
      setIsLoadingCoaching(false)
    }
  }

  const handleSendMessage = async () => {
    if (!userInput.trim()) return

    const newMessage: ChatMessage = { role: 'user', content: userInput }
    setCoaching((prev) => [...prev, newMessage])
    setUserInput('')
    setIsLoadingCoaching(true)

    try {
      const response = await getFollowupCoaching(currentQuestion, [
        ...coaching,
        newMessage,
      ])
      setCoaching((prev) => [
        ...prev,
        { role: 'assistant', content: response.message },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get coaching')
    } finally {
      setIsLoadingCoaching(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Question Panel */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>Question {session.current_index + 1} of {session.questions.length}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {currentQuestion.difficulty.replace('_', ' ').toUpperCase()}
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Visual (if present) */}
              {currentQuestion.visual?.required && currentQuestion.visual.spec && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">
                    Visual: {currentQuestion.visual.type}
                  </div>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(currentQuestion.visual.spec, null, 2)}
                  </pre>
                </div>
              )}

              {/* Question Text */}
              <div className="text-lg">{currentQuestion.question_text}</div>

              {/* Options */}
              <RadioGroup
                value={selectedAnswer || ''}
                onValueChange={setSelectedAnswer}
              >
                {Object.entries(currentQuestion.options).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent"
                  >
                    <RadioGroupItem value={key} id={`option-${key}`} />
                    <Label
                      htmlFor={`option-${key}`}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      <span className="font-medium mr-2">{key}.</span>
                      {value}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>

            <CardFooter className="flex gap-4">
              <Button
                variant="outline"
                onClick={handleNeedCoaching}
                disabled={isLoadingCoaching}
              >
                Need Coaching
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedAnswer || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Coaching Panel */}
        <div className="md:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">Coaching</CardTitle>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto space-y-4 max-h-96">
              {coaching.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Click "Need Coaching" if you're stuck, or submit your answer.
                </p>
              ) : (
                coaching.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg text-sm ${
                      msg.role === 'assistant'
                        ? 'bg-muted'
                        : 'bg-primary text-primary-foreground ml-4'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))
              )}
              {isLoadingCoaching && (
                <p className="text-sm text-muted-foreground">Thinking...</p>
              )}
            </CardContent>

            <CardFooter className="border-t pt-4">
              <div className="flex w-full gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask a question..."
                  className="flex-1 px-3 py-2 text-sm border rounded-md"
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!userInput.trim() || isLoadingCoaching}
                >
                  Send
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
