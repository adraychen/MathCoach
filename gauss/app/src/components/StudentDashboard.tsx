import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { UserHeader } from './UserHeader'
import { ContestSelection } from './ContestSelection'
import { PracticeScreen } from './PracticeScreen'
import { BookOpen, Play, PlayCircle, List, Loader2, Home, ChevronDown, ChevronUp, Check } from 'lucide-react'
import type { Contest, ContestSession, DashboardStats, TopicPerformance, Program } from '../types/database'

type View = 'dashboard' | 'contest-selection' | 'contest'

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
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [allTopics, setAllTopics] = useState<TopicPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showContestList, setShowContestList] = useState(false)

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

      // Calculate stats
      const completedSessions = mappedSessions.filter(s => s.status === 'completed')
      const inProgressSessions = mappedSessions.filter(s => s.status === 'in_progress')
      const uniqueContestsStarted = new Set(mappedSessions.map(s => s.contest_id)).size

      let totalCorrect = 0
      let totalWrong = 0
      let totalSkipped = 0
      let totalFlagged = 0
      let totalScore = 0

      mappedSessions.forEach(s => {
        totalCorrect += s.correct_count
        totalWrong += s.wrong_count
        totalSkipped += s.skipped_count
        totalFlagged += s.flagged_count
        if (s.status === 'completed' && s.score !== null) {
          totalScore += s.score
        }
      })

      // Average score: total score / (completed contests * 150 max points) * 100
      // Max score per contest: Part A (50) + Part B (60) + Part C (40) = 150
      const maxPossibleScore = completedSessions.length * 150
      const averageScore = maxPossibleScore > 0
        ? Math.round((totalScore / maxPossibleScore) * 100)
        : 0

      // Find current in-progress contest
      let currentInProgress: string | null = null
      if (inProgressSessions.length > 0) {
        const inProgressContestId = inProgressSessions[0].contest_id
        const contest = contestsList.find(c => c.id === inProgressContestId)
        currentInProgress = contest?.title || null
      }

      setStats({
        contestsStarted: uniqueContestsStarted,
        contestsCompleted: completedSessions.length,
        totalContests: contestsList.length,
        currentInProgress,
        totalCorrect,
        totalWrong,
        totalSkipped,
        totalFlagged,
        averageScore,
      })

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

  const handleStartContest = () => {
    // Find the first contest that isn't completed
    const completedContestIds = new Set(
      sessions.filter(s => s.status === 'completed').map(s => s.contest_id)
    )

    const nextContest = contests.find(c => !completedContestIds.has(c.id))

    if (nextContest) {
      setSelectedContestCode(nextContest.contest_code)
      setView('contest')
    } else if (contests.length > 0) {
      // All completed - start the first one again
      setSelectedContestCode(contests[0].contest_code)
      setView('contest')
    }
  }

  const handleContinueContest = () => {
    const inProgressSession = sessions.find(s => s.status === 'in_progress')
    if (inProgressSession) {
      const contest = contests.find(c => c.id === inProgressSession.contest_id)
      if (contest) {
        setSelectedContestCode(contest.contest_code)
        setView('contest')
      }
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

  // Contest selection view
  if (view === 'contest-selection') {
    return (
      <ContestSelection
        contests={contests}
        sessions={sessions}
        onSelect={handleSelectContest}
        onBack={() => setView('dashboard')}
      />
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

  const hasInProgressContest = sessions.some(s => s.status === 'in_progress')

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

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={handleStartContest}
            disabled={contests.length === 0}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Play size={20} />
            <span className="font-medium">Start Contest</span>
          </button>

          <button
            onClick={handleContinueContest}
            disabled={!hasInProgressContest}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <PlayCircle size={20} />
            <span className="font-medium">Continue Contest</span>
          </button>

          <button
            onClick={() => setView('contest-selection')}
            disabled={contests.length === 0}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <List size={20} />
            <span className="font-medium">Select Contest</span>
          </button>
        </div>

        {/* Dashboard Stats and Topics */}
        {stats && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Your Progress Panel - Left Half */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Progress</h3>

              <button
                onClick={() => setShowContestList(!showContestList)}
                className="w-full text-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.contestsCompleted} / {stats.totalContests}
                  </div>
                  {showContestList ? (
                    <ChevronUp size={20} className="text-blue-600" />
                  ) : (
                    <ChevronDown size={20} className="text-blue-600" />
                  )}
                </div>
                <div className="text-xs text-blue-700">Contests Completed</div>
              </button>

              {showContestList && (
                <div className="mt-3 space-y-1 max-h-48 overflow-y-auto">
                  {contests.map((contest) => {
                    const isCompleted = sessions.some(
                      s => s.contest_id === contest.id && s.status === 'completed'
                    )
                    return (
                      <div
                        key={contest.id}
                        className={`flex items-center justify-between p-2 rounded text-sm ${
                          isCompleted ? 'bg-green-50' : 'bg-gray-50'
                        }`}
                      >
                        <span className={isCompleted ? 'text-green-700' : 'text-gray-600'}>
                          {contest.title}
                        </span>
                        {isCompleted && (
                          <Check size={16} className="text-green-600" />
                        )}
                      </div>
                    )
                  })}
                </div>
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
        )}

        {/* No contests fallback */}
        {contests.length === 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500">
            No contests are available yet.
          </div>
        )}
      </div>
    </div>
  )
}
