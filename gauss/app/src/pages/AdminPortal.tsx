import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { LogOut, Users, UserPlus, GraduationCap, BarChart3, X, Loader2 } from 'lucide-react'

interface Teacher {
  id: string
  display_name: string
  email: string
}

export function AdminPortal() {
  const { profile, signOut } = useAuth()

  // Create Teacher state
  const [showCreateTeacher, setShowCreateTeacher] = useState(false)
  const [teacherForm, setTeacherForm] = useState({
    displayName: '',
    email: '',
  })
  const [creatingTeacher, setCreatingTeacher] = useState(false)
  const [teacherSuccessMessage, setTeacherSuccessMessage] = useState('')
  const [teacherErrorMessage, setTeacherErrorMessage] = useState('')

  // Create Student state
  const [showCreateStudent, setShowCreateStudent] = useState(false)
  const [studentForm, setStudentForm] = useState({
    displayName: '',
    loginType: 'username' as 'email' | 'username',
    email: '',
    username: '',
    password: '',
    teacherId: '',
  })
  const [creatingStudent, setCreatingStudent] = useState(false)
  const [studentSuccessMessage, setStudentSuccessMessage] = useState('')
  const [studentErrorMessage, setStudentErrorMessage] = useState('')
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loadingTeachers, setLoadingTeachers] = useState(false)

  const cards = [
    { title: 'Teachers', icon: Users, color: 'bg-blue-500', action: () => {} },
    { title: 'Students', icon: GraduationCap, color: 'bg-green-500', action: () => {} },
    { title: 'Create Teacher', icon: UserPlus, color: 'bg-purple-500', action: () => setShowCreateTeacher(true) },
    { title: 'Create Student', icon: UserPlus, color: 'bg-orange-500', action: () => openCreateStudent() },
    { title: 'Student Statistics', icon: BarChart3, color: 'bg-pink-500', action: () => {} },
  ]

  // Load teachers when Create Student modal opens
  const openCreateStudent = async () => {
    setShowCreateStudent(true)
    setLoadingTeachers(true)

    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, email')
      .eq('role', 'teacher')
      .eq('active', true)
      .eq('approval_status', 'approved')
      .order('display_name')

    if (!error && data) {
      setTeachers(data)
    }
    setLoadingTeachers(false)
  }

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingTeacher(true)
    setTeacherErrorMessage('')
    setTeacherSuccessMessage('')

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token

      if (!accessToken) {
        setTeacherErrorMessage('Session expired. Please sign in again.')
        setCreatingTeacher(false)
        return
      }

      const response = await fetch('/.netlify/functions/create-teacher-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          email: teacherForm.email,
          display_name: teacherForm.displayName,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setTeacherErrorMessage(result.error || 'Failed to create teacher account')
        setCreatingTeacher(false)
        return
      }

      setTeacherSuccessMessage('Teacher account created. An invitation email has been sent.')
      setTeacherForm({ displayName: '', email: '' })
    } catch (err) {
      setTeacherErrorMessage('Network error. Please try again.')
    } finally {
      setCreatingTeacher(false)
    }
  }

  const closeCreateTeacher = () => {
    setShowCreateTeacher(false)
    setTeacherForm({ displayName: '', email: '' })
    setTeacherSuccessMessage('')
    setTeacherErrorMessage('')
  }

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingStudent(true)
    setStudentErrorMessage('')
    setStudentSuccessMessage('')

    // Validate required fields
    if (!studentForm.displayName.trim()) {
      setStudentErrorMessage('Display name is required')
      setCreatingStudent(false)
      return
    }

    if (!studentForm.password) {
      setStudentErrorMessage('Password is required')
      setCreatingStudent(false)
      return
    }

    if (!studentForm.teacherId) {
      setStudentErrorMessage('Please select a teacher')
      setCreatingStudent(false)
      return
    }

    if (studentForm.loginType === 'email' && !studentForm.email.trim()) {
      setStudentErrorMessage('Email is required for email login type')
      setCreatingStudent(false)
      return
    }

    if (studentForm.loginType === 'username' && !studentForm.username.trim()) {
      setStudentErrorMessage('Username is required for username login type')
      setCreatingStudent(false)
      return
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token

      if (!accessToken) {
        setStudentErrorMessage('Session expired. Please sign in again.')
        setCreatingStudent(false)
        return
      }

      const response = await fetch('/.netlify/functions/create-student-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          display_name: studentForm.displayName,
          password: studentForm.password,
          login_type: studentForm.loginType,
          email: studentForm.loginType === 'email' ? studentForm.email : undefined,
          username: studentForm.loginType === 'username' ? studentForm.username : undefined,
          teacher_id: studentForm.teacherId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setStudentErrorMessage(result.error || 'Failed to create student account')
        setCreatingStudent(false)
        return
      }

      setStudentSuccessMessage('Student account created.')
      setStudentForm({
        displayName: '',
        loginType: 'username',
        email: '',
        username: '',
        password: '',
        teacherId: '',
      })
    } catch (err) {
      setStudentErrorMessage('Network error. Please try again.')
    } finally {
      setCreatingStudent(false)
    }
  }

  const closeCreateStudent = () => {
    setShowCreateStudent(false)
    setStudentForm({
      displayName: '',
      loginType: 'username',
      email: '',
      username: '',
      password: '',
      teacherId: '',
    })
    setStudentSuccessMessage('')
    setStudentErrorMessage('')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Portal</h1>
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
      </main>

      {/* Create Teacher Modal */}
      {showCreateTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Create Teacher Account</h2>
              <button
                onClick={closeCreateTeacher}
                className="p-1 text-gray-500 hover:text-gray-700 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="p-4 space-y-4">
              {teacherSuccessMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  {teacherSuccessMessage}
                </div>
              )}

              {teacherErrorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {teacherErrorMessage}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teacher Name
                </label>
                <input
                  type="text"
                  value={teacherForm.displayName}
                  onChange={(e) => setTeacherForm({ ...teacherForm, displayName: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Jane Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teacher Email
                </label>
                <input
                  type="email"
                  value={teacherForm.email}
                  onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="teacher@example.com"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCreateTeacher}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTeacher}
                  className="flex-1 px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creatingTeacher && <Loader2 size={16} className="animate-spin" />}
                  {creatingTeacher ? 'Creating...' : 'Create Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Student Modal */}
      {showCreateStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Create Student Account</h2>
              <button
                onClick={closeCreateStudent}
                className="p-1 text-gray-500 hover:text-gray-700 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-4 space-y-4">
              {studentSuccessMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  {studentSuccessMessage}
                </div>
              )}

              {studentErrorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {studentErrorMessage}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Display Name
                </label>
                <input
                  type="text"
                  value={studentForm.displayName}
                  onChange={(e) => setStudentForm({ ...studentForm, displayName: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Login Type
                </label>
                <select
                  value={studentForm.loginType}
                  onChange={(e) => setStudentForm({ ...studentForm, loginType: e.target.value as 'email' | 'username' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="username">Username</option>
                  <option value="email">Email</option>
                </select>
              </div>

              {studentForm.loginType === 'email' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Email
                  </label>
                  <input
                    type="email"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="student@example.com"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={studentForm.username}
                    onChange={(e) => setStudentForm({ ...studentForm, username: e.target.value.toLowerCase() })}
                    required
                    pattern="^[a-z0-9_-]+$"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="john_doe"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Lowercase letters, numbers, underscores, and hyphens only
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temporary Password
                </label>
                <input
                  type="password"
                  value={studentForm.password}
                  onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Teacher
                </label>
                {loadingTeachers ? (
                  <div className="flex items-center gap-2 text-gray-500 py-2">
                    <Loader2 size={16} className="animate-spin" />
                    Loading teachers...
                  </div>
                ) : (
                  <select
                    value={studentForm.teacherId}
                    onChange={(e) => setStudentForm({ ...studentForm, teacherId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select a teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.display_name} ({teacher.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCreateStudent}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingStudent || loadingTeachers}
                  className="flex-1 px-4 py-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creatingStudent && <Loader2 size={16} className="animate-spin" />}
                  {creatingStudent ? 'Creating...' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
