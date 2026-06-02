import { LogOut, User } from 'lucide-react'
import { useAuth } from '../lib/auth'

export function UserHeader() {
  const { profile, signOut } = useAuth()

  const displayName = profile?.display_name || profile?.username || 'Student'

  return (
    <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold text-gray-800">Gauss AI Coach</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User size={16} className="text-gray-400" />
          <span>{displayName}</span>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          title="Sign out"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </div>
  )
}
