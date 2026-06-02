import { useState } from 'react'
import { Lightbulb, ChevronDown, ChevronUp, BookOpen, HelpCircle, ListChecks, FileText } from 'lucide-react'
import type { Solution, GuidedStep } from '../types/database'

interface CoachingPanelProps {
  solution: Solution | null
  isOpen: boolean
  onToggle: () => void
}

interface ExpandableSection {
  title: string
  icon: React.ReactNode
  content: React.ReactNode
  available: boolean
}

export function CoachingPanel({ solution, isOpen, onToggle }: CoachingPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const toggleSection = (title: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(title)) {
      newExpanded.delete(title)
    } else {
      newExpanded.add(title)
    }
    setExpandedSections(newExpanded)
  }

  const coachingAvailable = solution?.coaching_available ?? false

  const sections: ExpandableSection[] = [
    {
      title: 'Hint 1',
      icon: <HelpCircle size={16} />,
      content: solution?.hint_1,
      available: !!solution?.hint_1,
    },
    {
      title: 'Hint 2',
      icon: <HelpCircle size={16} />,
      content: solution?.hint_2,
      available: !!solution?.hint_2,
    },
    {
      title: 'Guided Steps',
      icon: <ListChecks size={16} />,
      content: solution?.guided_steps ? (
        <ol className="list-decimal list-inside space-y-2">
          {(solution.guided_steps as GuidedStep[]).map((step, index) => (
            <li key={index} className="text-gray-700">
              {step.text}
            </li>
          ))}
        </ol>
      ) : null,
      available: !!solution?.guided_steps && (solution.guided_steps as GuidedStep[]).length > 0,
    },
    {
      title: 'Detailed Solution',
      icon: <FileText size={16} />,
      content: solution?.detailed_solution_text,
      available: !!solution?.detailed_solution_text,
    },
    {
      title: 'PSG Solution',
      icon: <BookOpen size={16} />,
      content: solution?.psg_solution_text,
      available: !!solution?.psg_solution_text,
    },
  ]

  const availableSections = sections.filter(s => s.available)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Coaching Toggle Button */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
          isOpen
            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
        }`}
        aria-label="Start coaching"
        title="Start coaching"
      >
        <Lightbulb size={20} className={isOpen ? 'text-yellow-600' : 'text-gray-500'} />
      </button>

      {/* Coaching Content */}
      {isOpen && (
        <div className="p-4 border-t border-gray-200">
          {!coachingAvailable ? (
            <p className="text-gray-500 text-sm italic">
              Coaching is not available for this question yet.
            </p>
          ) : availableSections.length === 0 ? (
            <p className="text-gray-500 text-sm italic">
              No coaching content available.
            </p>
          ) : (
            <div className="space-y-2">
              {availableSections.map((section) => (
                <div key={section.title} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      {section.icon}
                      {section.title}
                    </div>
                    {expandedSections.has(section.title) ? (
                      <ChevronUp size={16} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-500" />
                    )}
                  </button>
                  {expandedSections.has(section.title) && (
                    <div className="px-3 py-3 text-sm text-gray-700 bg-white">
                      {typeof section.content === 'string' ? (
                        <p className="whitespace-pre-wrap">{section.content}</p>
                      ) : (
                        section.content
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
