import { useState } from 'react'
import { Lightbulb, ChevronRight, BookOpen, Eye } from 'lucide-react'
import type { Solution } from '../types/database'

interface CoachingPanelProps {
  solution: Solution | null
  isOpen: boolean
  onToggle: () => void
}

type CoachingStep = 'start' | 'reasoning' | 'strategy' | 'solution' | 'full'

export function CoachingPanel({ solution, isOpen, onToggle }: CoachingPanelProps) {
  const [currentStep, setCurrentStep] = useState<CoachingStep>('start')
  const [showFullSolution, setShowFullSolution] = useState(false)

  const coachingAvailable = solution?.coaching_available ?? false
  const sourceQuestion = solution?.source_question

  const resetCoaching = () => {
    setCurrentStep('start')
    setShowFullSolution(false)
  }

  const advanceStep = () => {
    switch (currentStep) {
      case 'start':
        setCurrentStep('reasoning')
        break
      case 'reasoning':
        setCurrentStep('strategy')
        break
      case 'strategy':
        setCurrentStep('solution')
        break
      case 'solution':
        setCurrentStep('full')
        break
    }
  }

  const renderSocraticContent = () => {
    if (!sourceQuestion) {
      return (
        <p className="text-gray-500 text-sm italic">
          No coaching content available.
        </p>
      )
    }

    switch (currentStep) {
      case 'start':
        return (
          <div className="space-y-4">
            <p className="text-gray-700 text-sm">
              Let's work through this problem together. Ready to start?
            </p>
            <button
              onClick={advanceStep}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
            >
              <ChevronRight size={16} />
              Let's begin
            </button>
          </div>
        )

      case 'reasoning':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-800 text-sm font-medium mb-1">Think about this:</p>
              <p className="text-blue-700 text-sm">
                {sourceQuestion.reasoning_summary || 'What is the main idea behind this problem? What information do you have, and what are you trying to find?'}
              </p>
            </div>
            <button
              onClick={advanceStep}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
            >
              <ChevronRight size={16} />
              I've thought about it
            </button>
          </div>
        )

      case 'strategy':
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-purple-800 text-sm font-medium mb-1">Strategy hint:</p>
              <p className="text-purple-700 text-sm">
                {sourceQuestion.solution_pattern || 'Try breaking down the problem into smaller steps. What approach might work here?'}
              </p>
            </div>
            {sourceQuestion.archetype && (
              <div className="text-xs text-gray-500">
                Problem type: <span className="font-medium">{sourceQuestion.archetype}</span>
              </div>
            )}
            <button
              onClick={advanceStep}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
            >
              <ChevronRight size={16} />
              Show me more guidance
            </button>
          </div>
        )

      case 'solution':
        return (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm font-medium mb-1">Guided approach:</p>
              <p className="text-green-700 text-sm whitespace-pre-wrap">
                {sourceQuestion.reasoning_summary && sourceQuestion.solution_pattern
                  ? `Based on the reasoning: ${sourceQuestion.reasoning_summary}\n\nApply this strategy: ${sourceQuestion.solution_pattern}`
                  : 'Work through the problem step by step using the strategy above.'}
              </p>
            </div>
            <button
              onClick={() => setShowFullSolution(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              <Eye size={16} />
              Show full solution
            </button>
          </div>
        )

      case 'full':
        return (
          <div className="space-y-4">
            {showFullSolution && sourceQuestion.official_solution && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-gray-800 text-sm font-medium mb-2">Official Solution:</p>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                  {sourceQuestion.official_solution}
                </p>
              </div>
            )}
            {solution?.psg_solution_text && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={14} className="text-amber-600" />
                  <p className="text-amber-800 text-sm font-medium">PSG Solution:</p>
                </div>
                <p className="text-amber-700 text-sm whitespace-pre-wrap">
                  {solution.psg_solution_text}
                </p>
              </div>
            )}
            <button
              onClick={resetCoaching}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Start over
            </button>
          </div>
        )
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Coaching Toggle Button */}
      <button
        onClick={() => {
          onToggle()
          if (!isOpen) {
            resetCoaching()
          }
        }}
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
          ) : (
            renderSocraticContent()
          )}
        </div>
      )}
    </div>
  )
}
