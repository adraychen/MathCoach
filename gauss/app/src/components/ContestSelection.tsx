import { ArrowLeft, Play, PlayCircle, CheckCircle, Clock, Circle } from 'lucide-react'
import type { Contest, ContestSession } from '../types/database'

interface ContestSelectionProps {
  contests: Contest[]
  sessions: ContestSession[]
  onSelect: (contestCode: string) => void
  onBack: () => void
}

type ContestStatus = 'not_started' | 'in_progress' | 'completed'

interface ContestWithStatus extends Contest {
  status: ContestStatus
  session: ContestSession | null
  questionsAnswered: number
  score: number | null
}

export function ContestSelection({ contests, sessions, onSelect, onBack }: ContestSelectionProps) {
  // Build contest list with status info
  const contestsWithStatus: ContestWithStatus[] = contests.map(contest => {
    const session = sessions.find(s => s.contest_id === contest.id) || null

    let status: ContestStatus = 'not_started'
    let questionsAnswered = 0
    let score: number | null = null

    if (session) {
      if (session.status === 'completed') {
        status = 'completed'
        questionsAnswered = session.total_questions
        score = session.total_questions > 0
          ? Math.round((session.correct_count / session.total_questions) * 100)
          : 0
      } else if (session.status === 'in_progress') {
        status = 'in_progress'
        questionsAnswered = session.correct_count + session.wrong_count + session.skipped_count
      }
    }

    return {
      ...contest,
      status,
      session,
      questionsAnswered,
      score,
    }
  })

  const getStatusBadge = (status: ContestStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
            <CheckCircle size={12} />
            Completed
          </span>
        )
      case 'in_progress':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
            <Clock size={12} />
            In Progress
          </span>
        )
      default:
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
            <Circle size={12} />
            Not Started
          </span>
        )
    }
  }

  const getActionButton = (contest: ContestWithStatus) => {
    if (contest.status === 'in_progress') {
      return (
        <button
          onClick={() => onSelect(contest.contest_code)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <PlayCircle size={16} />
          Continue
        </button>
      )
    }

    return (
      <button
        onClick={() => onSelect(contest.contest_code)}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
      >
        <Play size={16} />
        {contest.status === 'completed' ? 'Retry' : 'Start'}
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Select Contest</h1>
        </div>

        {/* Contest List */}
        <div className="space-y-3">
          {contestsWithStatus.map(contest => (
            <div
              key={contest.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {contest.title}
                    </h3>
                    {getStatusBadge(contest.status)}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {contest.status !== 'not_started' && (
                      <span>
                        {contest.questionsAnswered} questions answered
                      </span>
                    )}
                    {contest.score !== null && (
                      <span className="font-medium text-green-600">
                        Score: {contest.score}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="ml-4">
                  {getActionButton(contest)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {contests.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            No contests available.
          </div>
        )}
      </div>
    </div>
  )
}
