import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { LogOut, Users, UserPlus, GraduationCap, BarChart3, X, Loader2, ChevronRight, Check } from 'lucide-react'

interface Teacher {
  id: string
  display_name: string
  email: string
  student_count?: number
}

interface Program {
  id: string
  program_code: string
  program_name: string
  grade: number
}

interface Student {
  id: string
  display_name: string
  email: string
  username: string | null
  login_type: 'email' | 'username'
  active: boolean
  must_change_password: boolean
  teacher_id: string | null
  teacher_name: string | null
  programs: Program[]
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

  // Teachers List state
  const [showTeachersList, setShowTeachersList] = useState(false)
  const [teachersList, setTeachersList] = useState<Teacher[]>([])
  const [loadingTeachersList, setLoadingTeachersList] = useState(false)

  // Students List state
  const [showStudentsList, setShowStudentsList] = useState(false)
  const [studentsList, setStudentsList] = useState<Student[]>([])
  const [loadingStudentsList, setLoadingStudentsList] = useState(false)
  const [allPrograms, setAllPrograms] = useState<Program[]>([])
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([])

  // Edit Student state
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [editTeacherId, setEditTeacherId] = useState<string>('')
  const [editProgramIds, setEditProgramIds] = useState<string[]>([])
  const [savingStudent, setSavingStudent] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')

  const cards = [
    { title: 'Teachers', icon: Users, color: 'bg-blue-500', action: () => openTeachersList() },
    { title: 'Students', icon: GraduationCap, color: 'bg-green-500', action: () => openStudentsList() },
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

  // Open Teachers List
  const openTeachersList = async () => {
    setShowTeachersList(true)
    setLoadingTeachersList(true)

    try {
      // Get all teachers
      const { data: teachersData, error: teachersError } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .eq('role', 'teacher')
        .order('display_name')

      if (teachersError) throw teachersError

      // Get student counts per teacher
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('student_teacher_assignments')
        .select('teacher_id')
        .eq('active', true)

      if (assignmentsError) throw assignmentsError

      // Count students per teacher
      const countMap: Record<string, number> = {}
      const assignments = assignmentsData as { teacher_id: string }[] | null
      assignments?.forEach(a => {
        countMap[a.teacher_id] = (countMap[a.teacher_id] || 0) + 1
      })

      const teachers = teachersData as { id: string; display_name: string; email: string }[] | null
      const teachersWithCounts = (teachers || []).map(t => ({
        ...t,
        student_count: countMap[t.id] || 0
      }))

      setTeachersList(teachersWithCounts)
    } catch (err) {
      console.error('Error loading teachers:', err)
    } finally {
      setLoadingTeachersList(false)
    }
  }

  // Open Students List
  const openStudentsList = async () => {
    setShowStudentsList(true)
    setLoadingStudentsList(true)

    try {
      // Load all programs
      const { data: programsData, error: programsError } = await supabase
        .from('mathcoach_programs')
        .select('id, program_code, program_name, grade')
        .eq('active', true)
        .order('grade')

      if (programsError) throw programsError
      const programs = programsData as Program[] | null
      setAllPrograms(programs || [])

      // Load all teachers
      const { data: teachersData, error: teachersError } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .eq('role', 'teacher')
        .eq('active', true)
        .order('display_name')

      if (teachersError) throw teachersError
      const teachers = teachersData as { id: string; display_name: string; email: string }[] | null
      setAllTeachers(teachers || [])

      // Load all students
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('id, display_name, email, username, login_type, active, must_change_password')
        .eq('role', 'student')
        .order('display_name')

      if (studentsError) throw studentsError
      const studentsRaw = studentsData as { id: string; display_name: string; email: string; username: string | null; login_type: 'email' | 'username'; active: boolean; must_change_password: boolean }[] | null

      // Load student-teacher assignments
      const { data: teacherAssignments, error: taError } = await supabase
        .from('student_teacher_assignments')
        .select('student_id, teacher_id')
        .eq('active', true)

      if (taError) throw taError
      const taList = teacherAssignments as { student_id: string; teacher_id: string }[] | null

      // Load student-program assignments
      const { data: programAssignments, error: paError } = await supabase
        .from('student_program_assignments')
        .select('student_id, program_id')
        .eq('active', true)

      if (paError) throw paError
      const paList = programAssignments as { student_id: string; program_id: string }[] | null

      // Build teacher lookup
      const teacherMap: Record<string, { id: string; name: string }> = {}
      teachers?.forEach(t => {
        teacherMap[t.id] = { id: t.id, name: t.display_name }
      })

      // Build student-teacher map
      const studentTeacherMap: Record<string, string> = {}
      taList?.forEach(a => {
        studentTeacherMap[a.student_id] = a.teacher_id
      })

      // Build student-programs map
      const studentProgramsMap: Record<string, string[]> = {}
      paList?.forEach(a => {
        if (!studentProgramsMap[a.student_id]) {
          studentProgramsMap[a.student_id] = []
        }
        studentProgramsMap[a.student_id].push(a.program_id)
      })

      // Build program lookup
      const programMap: Record<string, Program> = {}
      programs?.forEach(p => {
        programMap[p.id] = p
      })

      // Combine data
      const students: Student[] = (studentsRaw || []).map(s => {
        const teacherId = studentTeacherMap[s.id] || null
        const programIds = studentProgramsMap[s.id] || []
        return {
          id: s.id,
          display_name: s.display_name,
          email: s.email,
          username: s.username,
          login_type: s.login_type,
          active: s.active,
          must_change_password: s.must_change_password,
          teacher_id: teacherId,
          teacher_name: teacherId && teacherMap[teacherId] ? teacherMap[teacherId].name : null,
          programs: programIds.map(pid => programMap[pid]).filter(Boolean)
        }
      })

      setStudentsList(students)
    } catch (err) {
      console.error('Error loading students:', err)
    } finally {
      setLoadingStudentsList(false)
    }
  }

  // Start editing a student
  const startEditStudent = (student: Student) => {
    setEditingStudent(student)
    setEditTeacherId(student.teacher_id || '')
    setEditProgramIds(student.programs.map(p => p.id))
    setEditError('')
    setEditSuccess('')
  }

  // Save student changes
  const saveStudentChanges = async () => {
    if (!editingStudent) return

    setSavingStudent(true)
    setEditError('')
    setEditSuccess('')

    try {
      // Update teacher assignment
      if (editTeacherId !== (editingStudent.teacher_id || '')) {
        // Deactivate current assignment
        if (editingStudent.teacher_id) {
          await (supabase
            .from('student_teacher_assignments') as any)
            .update({ active: false, ended_at: new Date().toISOString() })
            .eq('student_id', editingStudent.id)
            .eq('active', true)
        }

        // Create new assignment
        if (editTeacherId) {
          await (supabase
            .from('student_teacher_assignments') as any)
            .insert({
              student_id: editingStudent.id,
              teacher_id: editTeacherId,
              active: true,
              assigned_at: new Date().toISOString()
            })
        }
      }

      // Update program assignments
      const currentProgramIds = editingStudent.programs.map(p => p.id)
      const programsToAdd = editProgramIds.filter(id => !currentProgramIds.includes(id))
      const programsToRemove = currentProgramIds.filter(id => !editProgramIds.includes(id))

      // Remove old programs
      for (const programId of programsToRemove) {
        await (supabase
          .from('student_program_assignments') as any)
          .update({ active: false })
          .eq('student_id', editingStudent.id)
          .eq('program_id', programId)
      }

      // Add new programs
      for (const programId of programsToAdd) {
        await (supabase
          .from('student_program_assignments') as any)
          .insert({
            student_id: editingStudent.id,
            program_id: programId,
            active: true,
            assigned_at: new Date().toISOString()
          })
      }

      setEditSuccess('Changes saved successfully')

      // Refresh students list
      await openStudentsList()

      // Close edit mode after a short delay
      setTimeout(() => {
        setEditingStudent(null)
      }, 1000)

    } catch (err) {
      console.error('Error saving changes:', err)
      setEditError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setSavingStudent(false)
    }
  }

  // Toggle program selection
  const toggleProgram = (programId: string) => {
    if (editProgramIds.includes(programId)) {
      setEditProgramIds(editProgramIds.filter(id => id !== programId))
    } else {
      setEditProgramIds([...editProgramIds, programId])
    }
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

      {/* Teachers List Modal */}
      {showTeachersList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Teachers</h2>
              <button
                onClick={() => setShowTeachersList(false)}
                className="p-1 text-gray-500 hover:text-gray-700 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loadingTeachersList ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-blue-500" />
                </div>
              ) : teachersList.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No teachers found</p>
              ) : (
                <div className="space-y-2">
                  {teachersList.map(teacher => (
                    <div
                      key={teacher.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{teacher.display_name}</p>
                        <p className="text-sm text-gray-500">{teacher.email}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                          {teacher.student_count} student{teacher.student_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Students List Modal */}
      {showStudentsList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Students</h2>
              <button
                onClick={() => { setShowStudentsList(false); setEditingStudent(null); }}
                className="p-1 text-gray-500 hover:text-gray-700 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loadingStudentsList ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-green-500" />
                </div>
              ) : studentsList.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No students found</p>
              ) : (
                <div className="space-y-3">
                  {studentsList.map(student => (
                    <div
                      key={student.id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      {/* Student Row */}
                      <div
                        className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                        onClick={() => editingStudent?.id === student.id ? setEditingStudent(null) : startEditStudent(student)}
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{student.display_name}</p>
                          <p className="text-sm text-gray-500">
                            {student.login_type === 'username' ? student.username : student.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              Teacher: {student.teacher_name || <span className="text-orange-500">Not assigned</span>}
                            </p>
                            <p className="text-sm text-gray-600">
                              Programs: {student.programs.length > 0
                                ? student.programs.map(p => p.program_name).join(', ')
                                : <span className="text-orange-500">None</span>
                              }
                            </p>
                          </div>
                          <ChevronRight
                            size={20}
                            className={`text-gray-400 transition-transform ${editingStudent?.id === student.id ? 'rotate-90' : ''}`}
                          />
                        </div>
                      </div>

                      {/* Edit Panel */}
                      {editingStudent?.id === student.id && (
                        <div className="p-4 bg-white border-t border-gray-200 space-y-4">
                          {editError && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                              {editError}
                            </div>
                          )}
                          {editSuccess && (
                            <div className="p-2 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                              {editSuccess}
                            </div>
                          )}

                          {/* Student Status */}
                          <div className="flex flex-wrap items-center gap-3 py-2 px-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">
                              {student.username ? `@${student.username}` : student.email}
                            </span>
                            <span className="text-gray-500 capitalize">{student.login_type}</span>
                            {student.active ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Inactive
                              </span>
                            )}
                            {student.must_change_password ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Must Change Password
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Password Set
                              </span>
                            )}
                          </div>

                          {/* Teacher Assignment */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Assigned Teacher
                            </label>
                            <select
                              value={editTeacherId}
                              onChange={(e) => setEditTeacherId(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              <option value="">No teacher assigned</option>
                              {allTeachers.map(t => (
                                <option key={t.id} value={t.id}>{t.display_name}</option>
                              ))}
                            </select>
                          </div>

                          {/* Program Assignments */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Assigned Programs
                            </label>
                            <div className="space-y-2">
                              {allPrograms.map(program => (
                                <label
                                  key={program.id}
                                  className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={editProgramIds.includes(program.id)}
                                    onChange={() => toggleProgram(program.id)}
                                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                  />
                                  <span className="text-gray-800">{program.program_name}</span>
                                  <span className="text-sm text-gray-500">({program.program_code})</span>
                                </label>
                              ))}
                              {allPrograms.length === 0 && (
                                <p className="text-sm text-gray-500">No programs available</p>
                              )}
                            </div>
                          </div>

                          {/* Save Button */}
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingStudent(null)}
                              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={saveStudentChanges}
                              disabled={savingStudent}
                              className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                              {savingStudent ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Check size={16} />
                              )}
                              Save Changes
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
