import { LogOut, User } from 'lucide-react'
import { useAuth } from '../lib/auth'

export function UserHeader() {
  const { profile, signOut } = useAuth()

  const displayName = profile?.display_name || profile?.username || 'Student'

  return (
    <div className="flex items-center justify-end bg-white rounded-lg shadow-sm border border-gray-200 px-3 py-1.5">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User size={14} className="text-gray-400" />
          <span>{displayName}</span>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          title="Sign out"
        >
          <LogOut size={12} />
          Sign out
        </button>
      </div>
    </div>
  )
}
