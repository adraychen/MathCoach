import { useState, useEffect } from 'react'
import { Lightbulb, BookOpen, Eye, Loader2, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Solution } from '../types/database'

interface CoachingPanelProps {
  solution: Solution | null
  isOpen: boolean
  onToggle: () => void
  setCode: string
  practiceQuestionNumber: number
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
  const [coachMessage, setCoachMessage] = useState<string | null>(null)
  const [showFullSolution, setShowFullSolution] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)

  const coachingAvailable = solution?.coaching_available ?? false
  const sourceQuestion = solution?.source_question

  // Reset state when question changes
  useEffect(() => {
    setCoachMessage(null)
    setShowFullSolution(false)
    setError(null)
    setHasFetched(false)
  }, [practiceQuestionNumber])

  // Fetch coaching when panel opens
  useEffect(() => {
    if (isOpen && coachingAvailable && !hasFetched && !loading) {
      fetchCoaching()
    }
  }, [isOpen, coachingAvailable, hasFetched])

  const fetchCoaching = async () => {
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

      const response = await fetch('/.netlify/functions/socratic-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          set_code: setCode,
          practice_question_number: practiceQuestionNumber,
          coaching_trigger: 'stuck',
          student_message: '',
          conversation_history: [],
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
        setCoachMessage(result.coach_message)
      }

      setHasFetched(true)
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetCoaching = () => {
    setCoachMessage(null)
    setShowFullSolution(false)
    setError(null)
    setHasFetched(false)
  }

  const handleRetry = () => {
    setHasFetched(false)
    fetchCoaching()
  }

  const renderCoachingContent = () => {
    // Loading state
    if (loading) {
      return (
        <div className="flex items-center justify-center py-4">
          <Loader2 size={24} className="animate-spin text-yellow-600" />
          <span className="ml-2 text-sm text-gray-600">Getting coaching...</span>
        </div>
      )
    }

    // Error state
    if (error) {
      return (
        <div className="space-y-3">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
      )
    }

    // Show full solution view
    if (showFullSolution) {
      return (
        <div className="space-y-4">
          {sourceQuestion?.official_solution && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-gray-800 text-sm font-medium mb-2">Official Solution:</p>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">
                {sourceQuestion.official_solution}
              </p>
            </div>
          )}
          {solution?.psg_solution_text && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={14} className="text-amber-600" />
                <p className="text-amber-800 text-sm font-medium">PSG Solution:</p>
              </div>
              <p className="text-amber-700 text-sm whitespace-pre-wrap">
                {solution.psg_solution_text}
              </p>
            </div>
          )}
          <button
            onClick={resetCoaching}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Start over
          </button>
        </div>
      )
    }

    // Coach message view (chat-style)
    if (coachMessage) {
      return (
        <div className="space-y-4">
          {/* Coach message bubble */}
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
              <Lightbulb size={16} className="text-yellow-600" />
            </div>
            <div className="flex-1 bg-yellow-50 border border-yellow-200 rounded-lg rounded-tl-none p-3">
              <p className="text-yellow-800 text-sm whitespace-pre-wrap">
                {coachMessage}
              </p>
            </div>
          </div>

          {/* Disabled student input */}
          <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
            <input
              type="text"
              disabled
              placeholder="Follow-up coaching coming next."
              className="w-full bg-transparent text-sm text-gray-400 placeholder-gray-400 outline-none cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleRetry}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
            >
              <RefreshCw size={14} />
              I'm still stuck
            </button>

            <button
              onClick={() => setShowFullSolution(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              <Eye size={16} />
              Show full solution
            </button>
          </div>
        </div>
      )
    }

    // Default: waiting to fetch
    return (
      <p className="text-gray-500 text-sm italic">
        Click above to get coaching help.
      </p>
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
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
          isOpen
            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
        }`}
        aria-label="Start coaching"
        title="I'm stuck - help me start"
      >
        <Lightbulb size={20} className={isOpen ? 'text-yellow-600' : 'text-gray-500'} />
        <span className="text-sm font-medium">
          {isOpen ? 'Coaching' : "I'm stuck"}
        </span>
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
