import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import { LoginScreen } from './components/LoginScreen'
import { ResetPasswordScreen } from './components/ResetPasswordScreen'
import { AdminPortal } from './pages/AdminPortal'
import { TeacherPortal } from './pages/TeacherPortal'
import { ProgramSelection } from './components/ProgramSelection'
import { StudentDashboard } from './components/StudentDashboard'
import { Loader2 } from 'lucide-react'
import type { Program } from './types/database'

function StudentPortal() {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)

  if (!selectedProgram) {
    return <ProgramSelection onSelect={setSelectedProgram} />
  }

  return (
    <StudentDashboard
      program={selectedProgram}
      onBackToPrograms={() => setSelectedProgram(null)}
    />
  )
}

function ErrorScreen({ message }: { message: string }) {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200 max-w-md">
        <p className="text-red-600 font-medium mb-4">{message}</p>
        <button
          onClick={signOut}
          className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

function AppContent() {
  const { user, profile, profileStatus, loading } = useAuth()

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login if not authenticated
  if (!user) {
    return <LoginScreen />
  }

  // Handle profile status
  if (!profileStatus) {
    return <ErrorScreen message="Your account profile is not set up. Please contact the administrator." />
  }

  if (profileStatus.status === 'no_profile') {
    return <ErrorScreen message="Your account profile is not set up. Please contact the administrator." />
  }

  if (profileStatus.status === 'inactive') {
    return <ErrorScreen message="This account is inactive. Please contact the administrator." />
  }

  if (profileStatus.status === 'not_approved') {
    return <ErrorScreen message="This account is not approved." />
  }

  // Route based on role
  if (!profile) {
    return <ErrorScreen message="Your account profile is not set up. Please contact the administrator." />
  }

  switch (profile.role) {
    case 'admin':
      return <AdminPortal />
    case 'teacher':
      return <TeacherPortal />
    case 'student':
      return <StudentPortal />
    default:
      return <ErrorScreen message="Unknown account role. Please contact the administrator." />
  }
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordScreen />} />
          <Route path="*" element={<AppContent />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
