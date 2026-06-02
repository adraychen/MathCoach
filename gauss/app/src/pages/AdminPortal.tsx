import { useAuth } from '../lib/auth'
import { LogOut, Users, UserPlus, GraduationCap, BarChart3 } from 'lucide-react'

export function AdminPortal() {
  const { profile, signOut } = useAuth()

  const cards = [
    { title: 'Teachers', icon: Users, color: 'bg-blue-500' },
    { title: 'Students', icon: GraduationCap, color: 'bg-green-500' },
    { title: 'Create Teacher', icon: UserPlus, color: 'bg-purple-500' },
    { title: 'Create Student', icon: UserPlus, color: 'bg-orange-500' },
    { title: 'Student Statistics', icon: BarChart3, color: 'bg-pink-500' },
  ]

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
    </div>
  )
}
