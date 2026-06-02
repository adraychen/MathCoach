import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { LogOut, Users, UserPlus, GraduationCap, BarChart3, X, Loader2 } from 'lucide-react'

export function AdminPortal() {
  const { profile, signOut } = useAuth()
  const [showCreateTeacher, setShowCreateTeacher] = useState(false)
  const [teacherForm, setTeacherForm] = useState({
    displayName: '',
    email: '',
    password: '',
  })
  const [creating, setCreating] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const cards = [
    { title: 'Teachers', icon: Users, color: 'bg-blue-500', action: () => {} },
    { title: 'Students', icon: GraduationCap, color: 'bg-green-500', action: () => {} },
    { title: 'Create Teacher', icon: UserPlus, color: 'bg-purple-500', action: () => setShowCreateTeacher(true) },
    { title: 'Create Student', icon: UserPlus, color: 'bg-orange-500', action: () => {} },
    { title: 'Student Statistics', icon: BarChart3, color: 'bg-pink-500', action: () => {} },
  ]

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token

      if (!accessToken) {
        setErrorMessage('Session expired. Please sign in again.')
        setCreating(false)
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
          password: teacherForm.password,
          display_name: teacherForm.displayName,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setErrorMessage(result.error || 'Failed to create teacher account')
        setCreating(false)
        return
      }

      setSuccessMessage('Teacher account created.')
      setTeacherForm({ displayName: '', email: '', password: '' })
    } catch (err) {
      setErrorMessage('Network error. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const closeCreateTeacher = () => {
    setShowCreateTeacher(false)
    setTeacherForm({ displayName: '', email: '', password: '' })
    setSuccessMessage('')
    setErrorMessage('')
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
              {successMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {errorMessage}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temporary Password
                </label>
                <input
                  type="password"
                  value={teacherForm.password}
                  onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Minimum 6 characters"
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
                  disabled={creating}
                  className="flex-1 px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creating && <Loader2 size={16} className="animate-spin" />}
                  {creating ? 'Creating...' : 'Create Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
