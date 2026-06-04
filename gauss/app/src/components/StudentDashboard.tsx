import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { UserHeader } from './UserHeader'
import { ContestSelection } from './ContestSelection'
import { PracticeScreen } from './PracticeScreen'
import { BookOpen, Play, PlayCircle, List, CheckCircle, XCircle, SkipForward, Flag, TrendingUp, TrendingDown, Loader2 } from 'lucide-react'
import type { Contest, ContestSession, DashboardStats, TopicPerformance } from '../types/database'

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
  started_at: string
  completed_at: string | null
}

export function StudentDashboard() {
  const { user } = useAuth()
  const [view, setView] = useState<View>('dashboard')
  const [selectedContestCode, setSelectedContestCode] = useState<string | null>(null)
  const [contests, setContests] = useState<Contest[]>([])
  const [sessions, setSessions] = useState<ContestSession[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [strongTopics, setStrongTopics] = useState<TopicPerformance[]>([])
  const [weakTopics, setWeakTopics] = useState<TopicPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData()
    }
  }, [user?.id])

  const fetchDashboardData = async () => {
    if (!user?.id) return

    setLoading(true)
    setError(null)

    try {
      // Fetch contests
      const { data: contestsData, error: contestsError } = await supabase
        .from('gauss_contests')
        .select('*')
        .order('display_order', { ascending: true })
        .order('title', { ascending: true })

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
      let totalQuestions = 0

      mappedSessions.forEach(s => {
        totalCorrect += s.correct_count
        totalWrong += s.wrong_count
        totalSkipped += s.skipped_count
        totalFlagged += s.flagged_count
        if (s.status === 'completed') {
          totalQuestions += s.total_questions
        }
      })

      const averageScore = totalQuestions > 0
        ? Math.round((totalCorrect / totalQuestions) * 100)
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

          // Filter topics with at least 2 attempts
          const significantTopics = topics.filter(t => t.attempted_count >= 2)

          // Sort by accuracy rate
          const sorted = [...significantTopics].sort((a, b) => b.accuracy_rate - a.accuracy_rate)

          setStrongTopics(sorted.slice(0, 3))
          setWeakTopics(sorted.slice(-3).reverse())
        }
      } catch {
        // Topic views may not exist yet - that's okay
      }

    } catch (err) {
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
        <UserHeader />

        {/* Program Card */}
        <div className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center gap-3">
            <BookOpen size={32} />
            <div>
              <h2 className="text-2xl font-bold">Grade 7 Gauss Contest</h2>
              <p className="text-blue-100">Waterloo Mathematics Competition Practice</p>
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

        {/* Dashboard Stats */}
        {stats && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Progress</h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.contestsStarted}</div>
                <div className="text-xs text-blue-700">Contests Started</div>
              </div>

              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.contestsCompleted}</div>
                <div className="text-xs text-purple-700">Completed</div>
              </div>

              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.totalCorrect}</div>
                <div className="text-xs text-green-700">Total Correct</div>
              </div>

              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{stats.averageScore}%</div>
                <div className="text-xs text-orange-700">Average Score</div>
              </div>
            </div>

            {stats.currentInProgress && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">In Progress:</span> {stats.currentInProgress}
                </p>
              </div>
            )}

            <div className="mt-4 grid grid-cols-4 gap-2 text-center text-sm">
              <div className="flex items-center justify-center gap-1 text-green-600">
                <CheckCircle size={14} />
                <span>{stats.totalCorrect}</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-red-600">
                <XCircle size={14} />
                <span>{stats.totalWrong}</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-yellow-600">
                <SkipForward size={14} />
                <span>{stats.totalSkipped}</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-orange-600">
                <Flag size={14} />
                <span>{stats.totalFlagged}</span>
              </div>
            </div>
          </div>
        )}

        {/* Topic Performance */}
        {(strongTopics.length > 0 || weakTopics.length > 0) && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {strongTopics.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={18} className="text-green-600" />
                  <h4 className="font-semibold text-gray-800">Strongest Topics</h4>
                </div>
                <ul className="space-y-2">
                  {strongTopics.map((t, i) => (
                    <li key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">{t.topic}</span>
                      <span className="text-green-600 font-medium">{Math.round(t.accuracy_rate * 100)}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {weakTopics.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown size={18} className="text-orange-600" />
                  <h4 className="font-semibold text-gray-800">Topics to Improve</h4>
                </div>
                <ul className="space-y-2">
                  {weakTopics.map((t, i) => (
                    <li key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">{t.topic}</span>
                      <span className="text-orange-600 font-medium">{Math.round(t.accuracy_rate * 100)}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {strongTopics.length === 0 && weakTopics.length === 0 && stats && stats.totalCorrect + stats.totalWrong > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center text-gray-500 text-sm">
            Topic performance will appear after you answer more questions.
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
