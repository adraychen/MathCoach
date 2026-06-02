import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

export interface UserProfile {
  id: string
  username: string | null
  display_name: string
  role: 'student' | 'admin' | 'teacher'
  active: boolean
  approval_status: 'approved' | 'disabled'
  must_change_password: boolean
}

export type ProfileStatus =
  | { status: 'ok'; profile: UserProfile }
  | { status: 'no_profile' }
  | { status: 'inactive' }
  | { status: 'not_approved' }

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  profileStatus: ProfileStatus | null
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
  const [profileStatus, setProfileStatus] = useState<ProfileStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load profile for a user
  const loadProfile = async (userId: string): Promise<ProfileStatus> => {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, display_name, role, active, approval_status, must_change_password')
      .eq('id', userId)
      .single()

    if (profileError || !profileData) {
      console.error('Error loading profile:', profileError)
      return { status: 'no_profile' }
    }

    const userProfile = profileData as UserProfile

    if (!userProfile.active) {
      return { status: 'inactive' }
    }

    if (userProfile.approval_status !== 'approved') {
      return { status: 'not_approved' }
    }

    return { status: 'ok', profile: userProfile }
  }

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setSession(session)
          setUser(session.user)
          const status = await loadProfile(session.user.id)
          setProfileStatus(status)
          if (status.status === 'ok') {
            setProfile(status.profile)
          }
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
          const status = await loadProfile(session.user.id)
          setProfileStatus(status)
          if (status.status === 'ok') {
            setProfile(status.profile)
          } else {
            setProfile(null)
          }
        } else {
          setProfile(null)
          setProfileStatus(null)
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
      email = identifier.toLowerCase()
    } else {
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
      const status = await loadProfile(data.user.id)
      setProfileStatus(status)

      if (status.status === 'ok') {
        setProfile(status.profile)
      } else {
        setProfile(null)
      }
    }

    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
    setProfileStatus(null)
    setError(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, profileStatus, loading, error, signIn, signOut }}>
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
