import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { UserHeader } from './UserHeader'
import { PracticeScreen } from './PracticeScreen'
import { BookOpen, Play, PlayCircle, Loader2, Home, CheckCircle, Clock, Circle } from 'lucide-react'
import type { Contest, ContestSession, TopicPerformance, Program } from '../types/database'

type View = 'dashboard' | 'contest'

interface ContestRow {
  id: string
  contest_code: string
  title: string
  grade: number
  question_pdf_filename: string | null
  display_order: number
}

interface SessionRow {
  id: string
  contest_id: string
  status: string
  current_question_number: number
  total_questions: number
  correct_count: number
  wrong_count: number
  skipped_count: number
  flagged_count: number
  score: number | null
  started_at: string
  completed_at: string | null
}

interface StudentDashboardProps {
  program: Program
  onBackToPrograms?: () => void
}

export function StudentDashboard({ program, onBackToPrograms }: StudentDashboardProps) {
  const { user } = useAuth()
  const [view, setView] = useState<View>('dashboard')
  const [selectedContestCode, setSelectedContestCode] = useState<string | null>(null)
  const [contests, setContests] = useState<Contest[]>([])
  const [sessions, setSessions] = useState<ContestSession[]>([])
  const [allTopics, setAllTopics] = useState<TopicPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id && program?.id) {
      fetchDashboardData()
    }
  }, [user?.id, program?.id])

  const fetchDashboardData = async () => {
    if (!user?.id || !program?.id) return

    setLoading(true)
    setError(null)

    try {
      // Fetch contests filtered by program grade and type (only active)
      const { data: contestsData, error: contestsError } = await supabase
        .from('gauss_contests')
        .select('*')
        .eq('grade', program.grade)
        .eq('active', true)
        .order('display_order', { ascending: true })

      if (contestsError) throw contestsError

      const contestsList = (contestsData || []) as ContestRow[]
      setContests(contestsList.map(c => ({
        id: c.id,
        contest_code: c.contest_code,
        title: c.title,
        grade: c.grade,
        question_pdf_filename: c.question_pdf_filename,
        display_order: c.display_order || 0,
      })))

      // Fetch user's sessions
      const { data: sessionsData, error: sessionsError } = await (supabase
        .from('gauss_contest_sessions') as any)
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })

      if (sessionsError) throw sessionsError

      const sessionsList = (sessionsData || []) as SessionRow[]
      const mappedSessions: ContestSession[] = sessionsList.map(s => ({
        id: s.id,
        user_id: user.id,
        contest_id: s.contest_id,
        status: s.status as ContestSession['status'],
        current_question_number: s.current_question_number,
        total_questions: s.total_questions,
        correct_count: s.correct_count,
        wrong_count: s.wrong_count,
        skipped_count: s.skipped_count,
        flagged_count: s.flagged_count,
        score: s.score,
        started_at: s.started_at,
        completed_at: s.completed_at,
      }))
      setSessions(mappedSessions)

      // Fetch topic performance
      try {
        const { data: topicData, error: topicError } = await (supabase
          .from('gauss_student_primary_topic_performance') as any)
          .select('*')
          .eq('user_id', user.id)

        if (!topicError && topicData && topicData.length > 0) {
          const topics = (topicData as any[]).map(t => ({
            topic: t.primary_topic,
            attempted_count: t.attempted_count,
            correct_count: t.correct_count,
            wrong_count: t.wrong_count,
            accuracy_rate: parseFloat(t.accuracy_rate) || 0,
          }))

          // Filter topics with at least 2 attempts and sort from strongest to weakest
          const significantTopics = topics.filter(t => t.attempted_count >= 2)
          const sorted = [...significantTopics].sort((a, b) => b.accuracy_rate - a.accuracy_rate)

          setAllTopics(sorted)
        }
      } catch {
        // Topic views may not exist yet - that's okay
      }

    } catch (err) {
      console.error('Dashboard error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectContest = (contestCode: string) => {
    setSelectedContestCode(contestCode)
    setView('contest')
  }

  const handleBackToDashboard = () => {
    setView('dashboard')
    setSelectedContestCode(null)
    fetchDashboardData()
  }

  // Contest view
  if (view === 'contest' && selectedContestCode) {
    return (
      <div>
        <PracticeScreen
          contestCode={selectedContestCode}
          onBack={handleBackToDashboard}
        />
      </div>
    )
  }

  // Dashboard view
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  // Helper to get contest status
  const getContestStatus = (contestId: string) => {
    const session = sessions.find(s => s.contest_id === contestId)
    if (!session) return 'not_started'
    if (session.status === 'completed') return 'completed'
    if (session.status === 'in_progress') return 'in_progress'
    return 'not_started'
  }

  const getStatusBadge = (status: string) => {
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header with back button */}
        <div className="flex items-center gap-3">
          {onBackToPrograms && (
            <button
              onClick={onBackToPrograms}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors bg-white border border-gray-200"
              aria-label="Back to programs"
            >
              <Home size={20} className="text-gray-600" />
            </button>
          )}
          <div className="flex-1">
            <UserHeader />
          </div>
        </div>

        {/* Program Card */}
        <div className="mt-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center gap-3">
            <BookOpen size={32} />
            <div>
              <h2 className="text-2xl font-bold">{program.program_name}</h2>
              {program.description && (
                <p className="text-blue-100">{program.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contests and Topics */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Contests Panel - Left Half */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contests</h3>

            {contests.length > 0 ? (
              <div className="space-y-3">
                {contests.map((contest) => {
                  const status = getContestStatus(contest.id)
                  return (
                    <div
                      key={contest.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-800 truncate">
                            {contest.title}
                          </span>
                        </div>
                        {getStatusBadge(status)}
                      </div>
                      <div className="ml-3 flex-shrink-0">
                        {status === 'in_progress' ? (
                          <button
                            onClick={() => handleSelectContest(contest.contest_code)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            <PlayCircle size={14} />
                            Continue
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSelectContest(contest.contest_code)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            <Play size={14} />
                            {status === 'completed' ? 'Retry' : 'Start'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center">
                No contests available yet.
              </p>
            )}
          </div>

          {/* Topic Performance Panel - Right Half */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Topic Performance</h3>

            {allTopics.length > 0 ? (
              <ul className="space-y-2">
                {allTopics.map((t, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700">{t.topic}</span>
                    <span className={`font-medium ${
                      t.accuracy_rate >= 0.7 ? 'text-green-600' :
                      t.accuracy_rate >= 0.4 ? 'text-yellow-600' : 'text-orange-600'
                    }`}>
                      {Math.round(t.accuracy_rate * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm text-center">
                Topic performance will appear after you answer more questions.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
