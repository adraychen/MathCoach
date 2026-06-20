import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { LogOut, Users, BookOpen, Loader2, ChevronRight, ArrowLeft, FileText } from 'lucide-react'

interface Student {
  id: string
  display_name: string
  programs: StudentProgram[]
}

interface StudentProgram {
  program_id: string
  program_name: string
  program_code: string
  contests_completed: number
  total_contests: number
  average_score: number | null
}

interface Program {
  id: string
  program_code: string
  program_name: string
  grade: number
}

interface Contest {
  id: string
  contest_code: string
  title: string
  grade: number
  question_count: number
}

interface Question {
  id: string
  contest_question_number: number
  correct_answer: string
  question_text: string | null
  options: Record<string, string> | null
  visual_description: string | null
  official_solution: string | null
}

interface SourceYearGrade {
  year: number
  grade: number
  question_count: number
}

interface SourceQuestion {
  id: string
  year: number
  grade: number
  question_number: number
  correct_answer: string
  question_text: string | null
  options: Record<string, string> | null
  visual_description: string | null
  official_solution: string | null
}

type ActiveView = 'dashboard' | 'students' | 'programs' | 'contests' | 'questions' | 'solutions' | 'solution-questions'

export function TeacherPortal() {
  const { profile, signOut } = useAuth()
  const [activeView, setActiveView] = useState<ActiveView>('dashboard')

  // Students state
  const [students, setStudents] = useState<Student[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null)

  // Programs state
  const [programs, setPrograms] = useState<Program[]>([])
  const [loadingPrograms, setLoadingPrograms] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)

  // Contests state
  const [contests, setContests] = useState<Contest[]>([])
  const [loadingContests, setLoadingContests] = useState(false)
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null)

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)

  // Solutions state
  const [sourceYearGrades, setSourceYearGrades] = useState<SourceYearGrade[]>([])
  const [loadingSolutions, setLoadingSolutions] = useState(false)
  const [selectedYearGrade, setSelectedYearGrade] = useState<SourceYearGrade | null>(null)
  const [sourceQuestions, setSourceQuestions] = useState<SourceQuestion[]>([])
  const [loadingSourceQuestions, setLoadingSourceQuestions] = useState(false)

  const cards = [
    { title: 'My Students', icon: Users, color: 'bg-blue-500', action: () => setActiveView('students') },
    { title: 'Programs', icon: BookOpen, color: 'bg-purple-500', action: () => setActiveView('programs') },
    { title: 'Solutions', icon: FileText, color: 'bg-green-500', action: () => setActiveView('solutions') },
  ]

  useEffect(() => {
    if (activeView === 'students' && profile?.id) {
      loadStudents()
    } else if (activeView === 'programs' && profile?.id) {
      loadPrograms()
    } else if (activeView === 'solutions') {
      loadSolutions()
    }
  }, [activeView, profile?.id])

  const loadStudents = async () => {
    if (!profile?.id) return
    setLoadingStudents(true)

    try {
      // Get student assignments for this teacher
      const { data: assignmentsData, error: assignError } = await supabase
        .from('student_teacher_assignments')
        .select('student_id')
        .eq('teacher_id', profile.id)
        .eq('active', true)

      if (assignError) throw assignError
      const assignments = assignmentsData as { student_id: string }[] | null

      if (!assignments || assignments.length === 0) {
        setStudents([])
        setLoadingStudents(false)
        return
      }

      const studentIds = assignments.map(a => a.student_id)

      // Get student profiles
      const { data: profilesData, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', studentIds)

      if (profileError) throw profileError
      const profilesList = profilesData as { id: string; display_name: string }[] | null

      // Get student program assignments
      const { data: programAssignments, error: paError } = await supabase
        .from('student_program_assignments')
        .select('student_id, program_id')
        .in('student_id', studentIds)
        .eq('active', true)

      if (paError) throw paError
      const paList = programAssignments as { student_id: string; program_id: string }[] | null

      // Get all programs
      const programIds = [...new Set(paList?.map(p => p.program_id) || [])]
      let programsMap: Record<string, { program_name: string; program_code: string }> = {}

      if (programIds.length > 0) {
        const { data: programsData } = await supabase
          .from('mathcoach_programs')
          .select('id, program_name, program_code')
          .in('id', programIds)

        const programs = programsData as { id: string; program_name: string; program_code: string }[] | null
        programs?.forEach(p => {
          programsMap[p.id] = { program_name: p.program_name, program_code: p.program_code }
        })
      }

      // Get contest sessions for performance data
      const { data: sessionsData } = await supabase
        .from('gauss_contest_sessions')
        .select('user_id, contest_id, status, score')
        .in('user_id', studentIds)

      const sessions = sessionsData as { user_id: string; contest_id: string; status: string; score: number | null }[] | null

      // Get contests to map to programs
      const { data: contestsData } = await supabase
        .from('gauss_contests')
        .select('id, contest_code')
        .eq('active', true)

      const contestsList = contestsData as { id: string; contest_code: string }[] | null

      // Map contest_code to program_code (e.g., G7gauss2024 -> G7gauss)
      const contestToProgramCode: Record<string, string> = {}
      contestsList?.forEach(c => {
        // Extract program code (e.g., G7gauss from G7gauss2024)
        const match = c.contest_code.match(/^(G\d+gauss)/)
        if (match) {
          contestToProgramCode[c.id] = match[1]
        }
      })

      // Build students with performance
      const studentList: Student[] = (profilesList || []).map(p => {
        const studentProgramIds = paList?.filter(pa => pa.student_id === p.id).map(pa => pa.program_id) || []
        const studentSessions = sessions?.filter(s => s.user_id === p.id) || []

        const programs: StudentProgram[] = studentProgramIds.map(programId => {
          const program = programsMap[programId]
          if (!program) return null

          // Find contests for this program
          const programContestIds = contestsList
            ?.filter(c => contestToProgramCode[c.id] === program.program_code)
            .map(c => c.id) || []

          const programSessions = studentSessions.filter(s => programContestIds.includes(s.contest_id))
          const completedSessions = programSessions.filter(s => s.status === 'completed')
          const scores = completedSessions.map(s => s.score).filter((s): s is number => s !== null)
          const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null

          return {
            program_id: programId,
            program_name: program.program_name,
            program_code: program.program_code,
            contests_completed: completedSessions.length,
            total_contests: programContestIds.length,
            average_score: avgScore
          }
        }).filter((p): p is StudentProgram => p !== null)

        return {
          id: p.id,
          display_name: p.display_name,
          programs
        }
      })

      setStudents(studentList)
    } catch (err) {
      console.error('Error loading students:', err)
    }

    setLoadingStudents(false)
  }

  const loadPrograms = async () => {
    if (!profile?.id) return
    setLoadingPrograms(true)

    try {
      // Get student assignments for this teacher
      const { data: assignmentsData } = await supabase
        .from('student_teacher_assignments')
        .select('student_id')
        .eq('teacher_id', profile.id)
        .eq('active', true)

      const assignments = assignmentsData as { student_id: string }[] | null
      if (!assignments || assignments.length === 0) {
        setPrograms([])
        setLoadingPrograms(false)
        return
      }

      const studentIds = assignments.map(a => a.student_id)

      // Get program assignments for these students
      // Query each student individually to work with RLS
      let allProgramIds: string[] = []
      for (const studentId of studentIds) {
        const { data: pa, error: paError } = await supabase
          .from('student_program_assignments')
          .select('program_id')
          .eq('student_id', studentId)
          .eq('active', true)

        if (paError) {
          console.error('Error loading program assignments for student:', studentId, paError)
        }
        const paData = pa as { program_id: string }[] | null
        if (paData) {
          allProgramIds.push(...paData.map(p => p.program_id))
        }
      }

      const programIds = [...new Set(allProgramIds)]
      console.log('Program IDs:', programIds)

      if (programIds.length === 0) {
        setPrograms([])
        setLoadingPrograms(false)
        return
      }

      // Get programs
      const { data: programsData, error: progError } = await supabase
        .from('mathcoach_programs')
        .select('id, program_code, program_name, grade')
        .in('id', programIds)
        .eq('active', true)
        .order('grade')

      if (progError) {
        console.error('Error loading programs:', progError)
      }
      console.log('Programs data:', programsData)

      setPrograms((programsData as Program[]) || [])
    } catch (err) {
      console.error('Error loading programs:', err)
    }

    setLoadingPrograms(false)
  }

  const loadContests = async (program: Program) => {
    setSelectedProgram(program)
    setActiveView('contests')
    setLoadingContests(true)

    try {
      // Get contests matching this program's code
      const { data: contestsData } = await supabase
        .from('gauss_contests')
        .select('id, contest_code, title, grade')
        .like('contest_code', `${program.program_code}%`)
        .eq('active', true)
        .order('contest_code', { ascending: false })

      const contestsList = contestsData as { id: string; contest_code: string; title: string; grade: number }[] | null

      // Get question counts for each contest
      const contestsWithCounts: Contest[] = []
      for (const contest of contestsList || []) {
        const { count } = await supabase
          .from('gauss_questions')
          .select('id', { count: 'exact', head: true })
          .eq('contest_id', contest.id)

        contestsWithCounts.push({
          ...contest,
          question_count: count || 0
        })
      }

      setContests(contestsWithCounts)
    } catch (err) {
      console.error('Error loading contests:', err)
    }

    setLoadingContests(false)
  }

  const loadQuestions = async (contest: Contest) => {
    setSelectedContest(contest)
    setActiveView('questions')
    setLoadingQuestions(true)

    try {
      // Get questions for this contest with source info
      const { data: questionsData } = await supabase
        .from('gauss_questions')
        .select('id, contest_question_number, correct_answer, source_year, source_grade, source_question_number')
        .eq('contest_id', contest.id)
        .order('contest_question_number')

      const questionsList = questionsData as {
        id: string
        contest_question_number: number
        correct_answer: string
        source_year: number | null
        source_grade: number | null
        source_question_number: number | null
      }[] | null

      // If no questions in gauss_questions, try to load directly from gauss_source_questions
      if (!questionsList || questionsList.length === 0) {
        // Extract year and grade from contest_code (e.g., G7gauss2023 -> grade 7, year 2023)
        const gradeMatch = contest.contest_code.match(/G(\d+)/)
        const yearMatch = contest.contest_code.match(/(\d{4})$/)

        if (gradeMatch && yearMatch) {
          const grade = parseInt(gradeMatch[1])
          const year = parseInt(yearMatch[1])

          const { data: sourceData } = await supabase
            .from('gauss_source_questions')
            .select('id, question_number, correct_answer, question_text, options, visual_description, official_solution')
            .eq('year', year)
            .eq('grade', grade)
            .order('question_number')

          if (sourceData && sourceData.length > 0) {
            const questions: Question[] = sourceData.map((s: any) => ({
              id: s.id,
              contest_question_number: s.question_number,
              correct_answer: s.correct_answer,
              question_text: s.question_text,
              options: s.options,
              visual_description: s.visual_description,
              official_solution: s.official_solution
            }))
            setQuestions(questions)
            setLoadingQuestions(false)
            return
          }
        }

        setQuestions([])
        setLoadingQuestions(false)
        return
      }

      // Get source questions data
      const questions: Question[] = []
      for (const q of questionsList || []) {
        let question_text: string | null = null
        let official_solution: string | null = null

        let options: Record<string, string> | null = null
        let visual_description: string | null = null

        if (q.source_year && q.source_grade && q.source_question_number) {
          const { data: sourceData } = await supabase
            .from('gauss_source_questions')
            .select('question_text, options, visual_description, official_solution')
            .eq('year', q.source_year)
            .eq('grade', q.source_grade)
            .eq('question_number', q.source_question_number)
            .single()

          if (sourceData) {
            const source = sourceData as { question_text: string | null; options: Record<string, string> | null; visual_description: string | null; official_solution: string | null }
            question_text = source.question_text
            options = source.options
            visual_description = source.visual_description
            official_solution = source.official_solution
          }
        }

        questions.push({
          id: q.id,
          contest_question_number: q.contest_question_number,
          correct_answer: q.correct_answer,
          question_text,
          options,
          visual_description,
          official_solution
        })
      }

      setQuestions(questions)
    } catch (err) {
      console.error('Error loading questions:', err)
    }

    setLoadingQuestions(false)
  }

  const goBack = () => {
    if (activeView === 'questions') {
      setActiveView('contests')
      setSelectedContest(null)
    } else if (activeView === 'contests') {
      setActiveView('programs')
      setSelectedProgram(null)
    } else {
      setActiveView('dashboard')
    }
  }

  const renderDashboard = () => (
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
  )

  const renderStudents = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">My Students</h2>
        <button onClick={() => setActiveView('dashboard')} className="text-blue-600 hover:text-blue-800 text-sm">
          Back to Dashboard
        </button>
      </div>

      {loadingStudents ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-blue-500" />
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No students assigned yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {students.map((student) => (
            <div key={student.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => setExpandedStudentId(expandedStudentId === student.id ? null : student.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <span className="font-medium text-gray-800">{student.display_name}</span>
                <ChevronRight
                  size={20}
                  className={`text-gray-400 transition-transform ${expandedStudentId === student.id ? 'rotate-90' : ''}`}
                />
              </button>

              {expandedStudentId === student.id && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  {student.programs.length === 0 ? (
                    <p className="text-gray-500 text-sm">No programs assigned</p>
                  ) : (
                    <div className="space-y-2">
                      {student.programs.map((program) => (
                        <div key={program.program_id} className="flex items-center justify-between py-2 px-3 bg-white rounded border border-gray-200">
                          <span className="text-gray-700">{program.program_name}</span>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600">
                              {program.contests_completed}/{program.total_contests} contests
                            </span>
                            {program.average_score !== null && (
                              <span className="font-medium text-blue-600">
                                Avg: {Math.round(program.average_score)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderPrograms = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Programs</h2>
        <button onClick={() => setActiveView('dashboard')} className="text-blue-600 hover:text-blue-800 text-sm">
          Back to Dashboard
        </button>
      </div>

      {loadingPrograms ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-purple-500" />
        </div>
      ) : programs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No programs found for your students.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {programs.map((program) => (
            <button
              key={program.id}
              onClick={() => loadContests(program)}
              className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-800">{program.program_name}</p>
                <p className="text-sm text-gray-500">{program.program_code}</p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          ))}
        </div>
      )}
    </div>
  )

  const renderContests = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="p-1 hover:bg-gray-200 rounded">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Contests</h2>
            <p className="text-sm text-gray-500">{selectedProgram?.program_name}</p>
          </div>
        </div>
      </div>

      {loadingContests ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-purple-500" />
        </div>
      ) : contests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-600">No contests found for this program.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {contests.map((contest) => (
            <button
              key={contest.id}
              onClick={() => loadQuestions(contest)}
              className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-800">{contest.title}</p>
                <p className="text-sm text-gray-500">{contest.contest_code}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{contest.question_count} questions</span>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )

  const renderQuestions = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="p-1 hover:bg-gray-200 rounded">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Questions</h2>
            <p className="text-sm text-gray-500">{selectedContest?.title}</p>
          </div>
        </div>
      </div>

      {loadingQuestions ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-purple-500" />
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-600">No questions found for this contest.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((question) => (
            <div key={question.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-2">
                <span className="font-medium text-gray-800">Q{question.contest_question_number}</span>
                <span className="text-sm font-medium text-green-600">Answer: {question.correct_answer}</span>
              </div>
              {question.question_text && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-600 mb-1">Question:</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{question.question_text}</p>
                </div>
              )}
              {question.visual_description && question.visual_description.toLowerCase() !== 'none' && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm font-medium text-blue-700 mb-1">Visual Description:</p>
                  <p className="text-blue-800 text-sm whitespace-pre-wrap">{question.visual_description}</p>
                </div>
              )}
              {question.options && (
                <div className="mb-3 flex flex-wrap gap-4">
                  {['A', 'B', 'C', 'D', 'E'].map(letter => (
                    question.options?.[letter] && (
                      <span key={letter} className="text-gray-700">
                        ({letter}) {question.options[letter]}
                      </span>
                    )
                  ))}
                </div>
              )}
              {question.official_solution && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-600 mb-1">Official Solution:</p>
                  <pre className="text-gray-700 text-sm whitespace-pre-wrap font-mono">{question.official_solution}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Teacher Portal</h1>
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
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'students' && renderStudents()}
        {activeView === 'programs' && renderPrograms()}
        {activeView === 'contests' && renderContests()}
        {activeView === 'questions' && renderQuestions()}
      </main>
    </div>
  )
}
