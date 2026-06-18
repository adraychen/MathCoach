import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { LogOut, Users, BarChart3, Loader2 } from 'lucide-react'

interface Student {
  id: string
  display_name: string
  username: string | null
  email: string | null
  login_type: string
  active: boolean
  must_change_password: boolean
  assigned_at: string
}

export function TeacherPortal() {
  const { profile, signOut } = useAuth()
  const [activeView, setActiveView] = useState<'dashboard' | 'students' | 'statistics'>('dashboard')
  const [students, setStudents] = useState<Student[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)

  const cards = [
    { title: 'My Students', icon: Users, color: 'bg-blue-500', action: () => setActiveView('students') },
    { title: 'Student Statistics', icon: BarChart3, color: 'bg-purple-500', action: () => setActiveView('statistics') },
  ]

  useEffect(() => {
    if (activeView === 'students' && profile?.id) {
      loadStudents()
    }
  }, [activeView, profile?.id])

  const loadStudents = async () => {
    if (!profile?.id) return

    setLoadingStudents(true)

    try {
      // First get student assignments
      const { data: assignmentsData, error: assignError } = await supabase
        .from('student_teacher_assignments')
        .select('student_id, assigned_at')
        .eq('teacher_id', profile.id)
        .eq('active', true)
        .order('assigned_at', { ascending: false })

      if (assignError) {
        console.error('Error loading assignments:', assignError)
        setLoadingStudents(false)
        return
      }

      const assignments = assignmentsData as { student_id: string; assigned_at: string }[] | null

      if (!assignments || assignments.length === 0) {
        setStudents([])
        setLoadingStudents(false)
        return
      }

      // Then get student profiles
      const studentIds = assignments.map(a => a.student_id)
      const { data: profilesData, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, username, email, login_type, active, must_change_password')
        .in('id', studentIds)

      if (profileError) {
        console.error('Error loading profiles:', profileError)
        setLoadingStudents(false)
        return
      }

      const profilesList = profilesData as {
        id: string
        display_name: string
        username: string | null
        email: string | null
        login_type: string
        active: boolean
        must_change_password: boolean
      }[] | null

      // Combine data
      const studentList = assignments
        .map(assignment => {
          const studentProfile = profilesList?.find(p => p.id === assignment.student_id)
          if (!studentProfile) return null
          return {
            ...studentProfile,
            assigned_at: assignment.assigned_at,
          }
        })
        .filter((s): s is Student => s !== null)

      setStudents(studentList)
    } catch (err) {
      console.error('Error loading students:', err)
    }

    setLoadingStudents(false)
  }

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <button
          key={card.title}
          onClick={card.action}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left"
        >
          <div className={`inline-flex p-3 rounded-lg ${card.color} text-white mb-4`}>
            <card.icon size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{card.title}</h3>
        </button>
      ))}
    </div>
  )

  const renderStudents = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">My Students</h2>
        <button
          onClick={() => setActiveView('dashboard')}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Back to Dashboard
        </button>
      </div>

      {loadingStudents ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-blue-500" />
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No students assigned yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Username</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Email</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Login Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Password</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Assigned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-800">{student.display_name}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {student.username ? `@${student.username}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {student.email && !student.email.endsWith('@student.gauss.local')
                      ? student.email
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 capitalize">
                    {student.login_type}
                  </td>
                  <td className="px-4 py-3">
                    {student.active ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {student.must_change_password ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Must Change
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Set
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">
                    {new Date(student.assigned_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  const renderStatistics = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Student Statistics</h2>
        <button
          onClick={() => setActiveView('dashboard')}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Back to Dashboard
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">Statistics coming soon.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Teacher Portal</h1>
            <p className="text-gray-600">Welcome, {profile?.display_name}</p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'students' && renderStudents()}
        {activeView === 'statistics' && renderStatistics()}
      </main>
    </div>
  )
}
