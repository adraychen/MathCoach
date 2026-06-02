import { useState, type FormEvent } from 'react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { Loader2 } from 'lucide-react'

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function LoginScreen() {
  const { signIn, error: authError } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false)
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState<string | null>(null)
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!identifier.trim()) {
      setError('Please enter your username or email')
      setLoading(false)
      return
    }

    if (!password) {
      setError('Please enter your password')
      setLoading(false)
      return
    }

    const result = await signIn(identifier.trim(), password)

    if (result.error) {
      setError(result.error)
    }

    setLoading(false)
  }

  const handleForgotPassword = async () => {
    setForgotPasswordMessage(null)
    setError(null)

    const trimmedIdentifier = identifier.trim()

    if (!trimmedIdentifier) {
      setError('Please enter your username or email first')
      return
    }

    setForgotPasswordLoading(true)

    if (isEmail(trimmedIdentifier)) {
      // Email user - send reset email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        trimmedIdentifier,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      )

      if (resetError) {
        console.error('Reset password error:', resetError)
      }

      // Always show same message to not reveal if email exists
      setForgotPasswordMessage(
        'If this email is registered, a password reset link will be sent.'
      )
    } else {
      // Username user - cannot use email reset
      setForgotPasswordMessage(
        'This account does not use email password reset. Please contact your teacher or administrator to reset your password.'
      )
    }

    setForgotPasswordLoading(false)
    setForgotPasswordMode(false)
  }

  const displayError = error || authError

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Gauss AI Coach
          </h1>
          <p className="text-gray-600">
            Sign in to start practicing
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Identifier Field (Username or Email) */}
          <div className="mb-4">
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
              Username or Email
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your username or email"
              autoComplete="username"
              autoFocus
              disabled={loading || forgotPasswordLoading}
            />
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading || forgotPasswordLoading}
            />
          </div>

          {/* Forgot Password Link */}
          <div className="mb-4 text-right">
            {forgotPasswordMode ? (
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setForgotPasswordMode(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                  disabled={forgotPasswordLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={forgotPasswordLoading}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  {forgotPasswordLoading && <Loader2 size={14} className="animate-spin" />}
                  Send reset link
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setForgotPasswordMode(true)}
                className="text-sm text-blue-600 hover:text-blue-800"
                disabled={loading}
              >
                Forgot password?
              </button>
            )}
          </div>

          {/* Error Message */}
          {displayError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{displayError}</p>
            </div>
          )}

          {/* Forgot Password Message */}
          {forgotPasswordMessage && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">{forgotPasswordMessage}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || forgotPasswordLoading}
            className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Contact your teacher if you need help signing in.
        </p>
      </div>
    </div>
  )
}
