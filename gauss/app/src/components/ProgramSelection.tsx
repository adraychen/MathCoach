import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { UserHeader } from './UserHeader'
import { BookOpen, Loader2, Home } from 'lucide-react'
import type { Program } from '../types/database'

interface ProgramRow {
  id: string
  program_code: string
  program_name: string
  description: string | null
  grade: number
  program_type: string
}

interface AssignmentRow {
  program_id: string
  program: ProgramRow
}

interface ProgramSelectionProps {
  onSelect: (program: Program) => void
}

export function ProgramSelection({ onSelect }: ProgramSelectionProps) {
  const { user } = useAuth()
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchAssignedPrograms()
    }
  }, [user?.id])

  const fetchAssignedPrograms = async () => {
    if (!user?.id) return

    setLoading(true)
    setError(null)

    try {
      // Fetch student's program assignments with program details
      const { data, error: fetchError } = await supabase
        .from('student_program_assignments')
        .select(`
          program_id,
          program:mathcoach_programs (
            id,
            program_code,
            program_name,
            description,
            grade,
            program_type
          )
        `)
        .eq('student_id', user.id)
        .eq('active', true)

      if (fetchError) throw fetchError

      const assignments = (data || []) as unknown as AssignmentRow[]
      const assignedPrograms: Program[] = assignments
        .filter(a => a.program)
        .map(a => ({
          id: a.program.id,
          program_code: a.program.program_code,
          program_name: a.program.program_name,
          description: a.program.description,
          grade: a.program.grade,
          program_type: a.program.program_type,
          active: true,
        }))

      setPrograms(assignedPrograms)

      // Auto-select if only one program
      if (assignedPrograms.length === 1) {
        onSelect(assignedPrograms[0])
      }
    } catch (err) {
      console.error('Error fetching programs:', err)
      setError(err instanceof Error ? err.message : 'Failed to load programs')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading programs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (programs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-2xl mx-auto p-4">
          {/* Header with home button and user info */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => fetchAssignedPrograms()}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors bg-white border border-gray-200"
              aria-label="Home"
              title="Refresh programs"
            >
              <Home size={20} className="text-gray-600" />
            </button>
            <div className="flex-1">
              <UserHeader />
            </div>
          </div>

          <div className="flex items-center justify-center mt-20">
            <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <BookOpen size={48} className="text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No Programs Assigned</h2>
              <p className="text-gray-600">
                You have not been assigned to any programs yet. Please contact your teacher or administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If auto-selected (1 program), this won't render
  // This UI shows when there are multiple programs
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header with home button and user info */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => fetchAssignedPrograms()}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors bg-white border border-gray-200"
            aria-label="Home"
            title="Refresh programs"
          >
            <Home size={20} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <UserHeader />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Select Program</h1>
          <p className="text-gray-600">Choose a program to continue</p>
        </div>

        <div className="space-y-4">
          {programs.map(program => (
            <button
              key={program.id}
              onClick={() => onSelect(program)}
              className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {program.program_name}
                  </h3>
                  {program.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {program.description}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
