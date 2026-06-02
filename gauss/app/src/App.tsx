import { AuthProvider, useAuth } from './lib/auth'
import { PracticeScreen } from './components/PracticeScreen'
import { LoginScreen } from './components/LoginScreen'
import { Loader2 } from 'lucide-react'

function AppContent() {
  const { user, profile, loading } = useAuth()

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
  if (!user || !profile) {
    return <LoginScreen />
  }

  // Show inactive message
  if (!profile.active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <p className="text-red-600 font-medium">This account is inactive.</p>
          <p className="text-gray-500 text-sm mt-2">Please contact your administrator.</p>
        </div>
      </div>
    )
  }

  // Show practice screen for students
  return <PracticeScreen setCode="G7gauss1" />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
