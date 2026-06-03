import { useState, useEffect, useRef } from 'react'
import { Lightbulb, Loader2, Send } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Solution } from '../types/database'

interface CoachingPanelProps {
  solution: Solution | null
  isOpen: boolean
  onToggle: () => void
  setCode: string
  practiceQuestionNumber: number
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
  can_show_solution?: boolean
}

export function CoachingPanel({
  solution,
  isOpen,
  onToggle,
  setCode,
  practiceQuestionNumber,
}: CoachingPanelProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [hasFetched, setHasFetched] = useState(false)
  const [studentInput, setStudentInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const coachingAvailable = solution?.coaching_available ?? false

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Reset state when question changes
  useEffect(() => {
    setMessages([])
    setError(null)
    setHasFetched(false)
    setStudentInput('')
  }, [practiceQuestionNumber])

  // Fetch initial coaching when panel opens
  useEffect(() => {
    if (isOpen && coachingAvailable && !hasFetched && !loading) {
      fetchCoaching('stuck', '', [])
    }
  }, [isOpen, coachingAvailable, hasFetched])

  const fetchCoaching = async (
    trigger: 'stuck' | 'followup',
    studentMessage: string,
    conversationHistory: ChatMessage[]
  ) => {
    setLoading(true)
    setError(null)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token

      if (!accessToken) {
        setError('Session expired. Please sign in again.')
        setLoading(false)
        return
      }

      // Convert conversation history to API format
      const apiHistory = conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      }))

      const response = await fetch('/.netlify/functions/socratic-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          set_code: setCode,
          practice_question_number: practiceQuestionNumber,
          coaching_trigger: trigger,
          student_message: studentMessage,
          conversation_history: apiHistory,
        }),
      })

      const result: CoachingResponse = await response.json()

      if (!response.ok) {
        setError((result as any).error || 'Failed to get coaching')
        setLoading(false)
        return
      }

      if (!result.available) {
        setError(result.message || 'Coaching is not available for this question.')
      } else if (result.coach_message) {
        setMessages(prev => [...prev, { role: 'coach', content: result.coach_message! }])
      }

      setHasFetched(true)
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    const trimmedInput = studentInput.trim()
    if (!trimmedInput || loading) return

    // Add student message to chat
    const newStudentMessage: ChatMessage = { role: 'student', content: trimmedInput }
    const updatedMessages = [...messages, newStudentMessage]
    setMessages(updatedMessages)
    setStudentInput('')

    // Call API for followup
    await fetchCoaching('followup', trimmedInput, updatedMessages)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const resetCoaching = () => {
    setMessages([])
    setError(null)
    setHasFetched(false)
    setStudentInput('')
  }

  const renderCoachingContent = () => {
    // Error state
    if (error && messages.length === 0) {
      return (
        <div className="space-y-3">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={() => {
              setError(null)
              setHasFetched(false)
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Try again
          </button>
        </div>
      )
    }

    // Chat view
    return (
      <div className="flex flex-col h-full">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-3 max-h-64">
          {messages.map((msg, index) => (
            <div
              key={index}
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
                    ? 'bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-tl-none'
                    : 'bg-blue-50 border border-blue-200 text-blue-800 rounded-tr-none'
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

        {/* Input area */}
        {messages.length > 0 && (
          <div className="border-t border-gray-200 pt-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={studentInput}
                onChange={(e) => setStudentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your thinking here..."
                disabled={loading}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !studentInput.trim()}
                className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Initial loading state */}
        {messages.length === 0 && loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 size={24} className="animate-spin text-yellow-600" />
            <span className="ml-2 text-sm text-gray-600">Getting coaching...</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Coaching Toggle Button */}
      <button
        onClick={() => {
          onToggle()
          if (!isOpen) {
            resetCoaching()
          }
        }}
        className={`w-full flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${
          isOpen
            ? 'bg-yellow-100 hover:bg-yellow-200'
            : 'bg-gray-50 hover:bg-gray-100'
        }`}
        aria-label="Start coaching"
        title="Get help"
      >
        <Lightbulb size={20} className={isOpen ? 'text-yellow-600' : 'text-gray-500'} />
      </button>

      {/* Coaching Content */}
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
