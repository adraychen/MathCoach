import { useState, useEffect, useRef } from 'react'
import { Lightbulb, Loader2, Send } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Solution } from '../types/database'

type CoachingMode = 'stuck' | 'wrong_answer'

interface CoachingPanelProps {
  solution: Solution | null
  isOpen: boolean
  onToggle: () => void
  contestCode: string
  contestQuestionNumber: number
  coachingMode?: CoachingMode
  selectedAnswer?: string | null
}

interface ChatMessage {
  role: 'coach' | 'student'
  content: string
}

interface CoachingResponse {
  available: boolean
  message?: string
  coach_message?: string
  stage?: string
  error?: string
}

export function CoachingPanel({
  solution,
  isOpen,
  onToggle,
  contestCode,
  contestQuestionNumber,
  coachingMode = 'stuck',
  selectedAnswer = null,
}: CoachingPanelProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [hasFetchedStuck, setHasFetchedStuck] = useState(false)
  const [studentInput, setStudentInput] = useState('')
  const [lastWrongAnswerFetched, setLastWrongAnswerFetched] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const coachingAvailable = solution?.coaching_available ?? false

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Reset everything when question changes
  useEffect(() => {
    setMessages([])
    setError(null)
    setHasFetchedStuck(false)
    setLastWrongAnswerFetched(null)
    setStudentInput('')
  }, [contestQuestionNumber])

  // Handle stuck coaching - fetch when panel opens in stuck mode
  useEffect(() => {
    if (isOpen && coachingAvailable && !hasFetchedStuck && !loading && coachingMode === 'stuck') {
      fetchCoaching('stuck', '', [], null)
      setHasFetchedStuck(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, coachingAvailable, hasFetchedStuck, coachingMode])

  // Handle wrong_answer coaching - append to existing conversation
  useEffect(() => {
    if (isOpen && coachingAvailable && coachingMode === 'wrong_answer' && selectedAnswer && !loading) {
      // Only fetch if this is a new wrong answer we haven't fetched for
      if (lastWrongAnswerFetched !== selectedAnswer) {
        setLastWrongAnswerFetched(selectedAnswer)
        // Pass existing messages as conversation history
        fetchCoaching('wrong_answer', '', messages, selectedAnswer)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, coachingAvailable, coachingMode, selectedAnswer, lastWrongAnswerFetched])

  const fetchCoaching = async (
    trigger: 'stuck' | 'followup' | 'wrong_answer',
    studentMessage: string,
    conversationHistory: ChatMessage[],
    wrongAnswer?: string | null
  ) => {
    setLoading(true)
    setError(null)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token

      if (!accessToken) {
        setError('Session expired. Please sign in again.')
        return
      }

      const requestBody: Record<string, unknown> = {
        contest_code: contestCode,
        contest_question_number: contestQuestionNumber,
        coaching_trigger: trigger,
        student_message: studentMessage,
        conversation_history: conversationHistory,
      }

      // Include selected_answer for wrong_answer trigger
      if (trigger === 'wrong_answer' && wrongAnswer) {
        requestBody.selected_answer = wrongAnswer
      }

      const response = await fetch('/.netlify/functions/socratic-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      })

      const result: CoachingResponse = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to get coaching.')
        return
      }

      if (!result.available) {
        setError(result.message || 'Coaching is not available for this question yet.')
        return
      }

      if (result.coach_message) {
        setMessages(prev => [...prev, { role: 'coach', content: result.coach_message! }])
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    const trimmedInput = studentInput.trim()
    if (!trimmedInput || loading) return

    const studentMessage: ChatMessage = { role: 'student', content: trimmedInput }
    const historyBeforeStudentMessage = messages

    setMessages(prev => [...prev, studentMessage])
    setStudentInput('')

    // Follow-up always uses 'followup' trigger regardless of initial mode
    await fetchCoaching('followup', trimmedInput, historyBeforeStudentMessage, null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }


  const resetCoaching = () => {
    setMessages([])
    setError(null)
    setHasFetchedStuck(false)
    setLastWrongAnswerFetched(null)
    setStudentInput('')
  }

  const renderMessages = () => (
    <div className="flex-1 overflow-y-auto space-y-3 mb-3 max-h-72">
      {messages.map((msg, index) => (
        <div
          key={`${msg.role}-${index}`}
          className={`flex gap-2 ${msg.role === 'student' ? 'flex-row-reverse' : ''}`}
        >
          {msg.role === 'coach' && (
            <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
              <Lightbulb size={14} className="text-yellow-600" />
            </div>
          )}
          <div
            className={`max-w-[85%] rounded-lg p-2.5 text-sm ${
              msg.role === 'coach'
                ? 'bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-tl-none'
                : 'bg-blue-50 border border-blue-200 text-blue-900 rounded-tr-none'
            }`}
          >
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>
        </div>
      ))}

      {loading && (
        <div className="flex gap-2">
          <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
            <Lightbulb size={14} className="text-yellow-600" />
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg rounded-tl-none p-2.5">
            <Loader2 size={16} className="animate-spin text-yellow-600" />
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )

  const renderInput = () => (
    <div className="border-t border-gray-200 pt-3 space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={studentInput}
          onChange={(e) => setStudentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your thinking here..."
          disabled={loading}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSendMessage}
          disabled={loading || !studentInput.trim()}
          className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Send coaching response"
          title="Send"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )

  const renderCoachingContent = () => {
    if (error && messages.length === 0) {
      return (
        <div className="space-y-3">
          <p className="text-red-600 text-sm">{error}</p>
          {coachingAvailable && (
            <button
              onClick={() => {
                setError(null)
                if (coachingMode === 'stuck') {
                  setHasFetchedStuck(false)
                } else {
                  setLastWrongAnswerFetched(null)
                }
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Try again
            </button>
          )}
        </div>
      )
    }

    return (
      <div className="flex flex-col h-full">
        {messages.length === 0 && loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 size={24} className="animate-spin text-yellow-600" />
            <span className="ml-2 text-sm text-gray-600">Getting coaching...</span>
          </div>
        ) : (
          renderMessages()
        )}

        {error && messages.length > 0 && (
          <p className="text-red-600 text-xs mb-2">{error}</p>
        )}

        {messages.length > 0 && renderInput()}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <button
        onClick={() => {
          onToggle()
          if (!isOpen) resetCoaching()
        }}
        className={`w-full flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${
          isOpen ? 'bg-yellow-100 hover:bg-yellow-200' : 'bg-gray-50 hover:bg-gray-100'
        }`}
        aria-label="Start coaching"
        title="Get help"
      >
        <Lightbulb size={20} className={isOpen ? 'text-yellow-600' : 'text-gray-500'} />
      </button>

      {isOpen && (
        <div className="p-4 border-t border-gray-200">
          {!coachingAvailable ? (
            <p className="text-gray-500 text-sm italic">
              Coaching is not available for this question yet.
            </p>
          ) : (
            renderCoachingContent()
          )}
        </div>
      )}
    </div>
  )
}
