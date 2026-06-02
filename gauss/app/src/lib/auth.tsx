import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface UserProfile {
  id: string
  username: string | null
  display_name: string | null
  role: 'student' | 'admin' | 'teacher'
  active: boolean
  must_change_password: boolean
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  signIn: (identifier: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STUDENT_EMAIL_DOMAIN = '@student.gauss.local'

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load profile for a user - try profiles table first, fallback to student_profiles
  const loadProfile = async (userId: string): Promise<UserProfile | null> => {
    // Try profiles table first
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, display_name, role, active, must_change_password')
      .eq('id', userId)
      .single()

    if (!profileError && profileData) {
      return profileData as UserProfile
    }

    // Fallback to student_profiles table
    const { data: studentData, error: studentError } = await supabase
      .from('student_profiles')
      .select('id, username, display_name, role, active, must_change_password')
      .eq('id', userId)
      .single()

    if (!studentError && studentData) {
      return studentData as UserProfile
    }

    console.error('Error loading profile:', profileError || studentError)
    return null
  }

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setSession(session)
          setUser(session.user)
          const userProfile = await loadProfile(session.user.id)
          setProfile(userProfile)
        }
      } catch (err) {
        console.error('Auth init error:', err)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          const userProfile = await loadProfile(session.user.id)
          setProfile(userProfile)
        } else {
          setProfile(null)
        }

        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (identifier: string, password: string): Promise<{ error: string | null }> => {
    setError(null)

    // Determine if identifier is email or username
    let email: string
    if (isEmail(identifier)) {
      // Use email directly
      email = identifier.toLowerCase()
    } else {
      // Convert username to internal email
      email = `${identifier.toLowerCase()}${STUDENT_EMAIL_DOMAIN}`
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      const errorMessage = signInError.message === 'Invalid login credentials'
        ? 'Invalid username or password'
        : signInError.message
      setError(errorMessage)
      return { error: errorMessage }
    }

    if (data.user) {
      const userProfile = await loadProfile(data.user.id)

      if (!userProfile) {
        await supabase.auth.signOut()
        const errorMessage = 'Account not found. Please contact your administrator.'
        setError(errorMessage)
        return { error: errorMessage }
      }

      if (!userProfile.active) {
        await supabase.auth.signOut()
        const errorMessage = 'This account is inactive.'
        setError(errorMessage)
        return { error: errorMessage }
      }

      setProfile(userProfile)
    }

    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
    setError(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
