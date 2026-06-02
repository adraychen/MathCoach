import { Flag, SkipForward, X } from 'lucide-react'
import type { AnswerChoice, QuestionState } from '../types/database'

interface AnswerCardProps {
  currentQuestionNumber: number
  totalQuestions: number
  questionState: QuestionState
  onSelectAnswer: (answer: AnswerChoice) => void
  onSkip: () => void
  onFlag: () => void
}

const ANSWER_CHOICES: AnswerChoice[] = ['A', 'B', 'C', 'D', 'E']

export function AnswerCard({
  currentQuestionNumber,
  totalQuestions,
  questionState,
  onSelectAnswer,
  onSkip,
  onFlag,
}: AnswerCardProps) {
  const { selectedAnswer, isCorrect, isFlagged } = questionState
  const hasWrongAnswer = selectedAnswer !== null && isCorrect === false

  const getButtonStyle = (choice: AnswerChoice) => {
    const baseStyle = "w-11 h-11 rounded-lg font-semibold text-base transition-all duration-200 border-2 relative flex items-center justify-center"

    // Wrong answer selected on this choice - show with X
    if (choice === selectedAnswer && hasWrongAnswer) {
      return `${baseStyle} bg-red-100 border-red-400 text-red-700`
    }

    // Not answered yet or answered wrong (other choices still available)
    if (!selectedAnswer || hasWrongAnswer) {
      return `${baseStyle} bg-white border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer`
    }

    // Correct answer was selected - disable all
    return `${baseStyle} bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed`
  }

  const handleAnswerClick = (choice: AnswerChoice) => {
    // Allow clicking if no answer yet, or if previous answer was wrong
    if (!selectedAnswer || hasWrongAnswer) {
      onSelectAnswer(choice)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Question label */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm font-semibold text-gray-700">
            Q{currentQuestionNumber} / {totalQuestions}
          </span>
          {isFlagged && (
            <Flag size={14} className="text-orange-500" fill="currentColor" />
          )}
        </div>

        {/* Middle: Answer choices */}
        <div className="flex items-center gap-2">
          {ANSWER_CHOICES.map((choice) => (
            <button
              key={choice}
              onClick={() => handleAnswerClick(choice)}
              className={getButtonStyle(choice)}
              aria-label={`Answer ${choice}`}
            >
              {choice}
              {choice === selectedAnswer && hasWrongAnswer && (
                <X
                  size={14}
                  className="absolute -top-1 -right-1 text-red-600 bg-white rounded-full"
                  strokeWidth={3}
                />
              )}
            </button>
          ))}
        </div>

        {/* Right: Skip and Flag buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onSkip}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            aria-label="Skip question"
          >
            <SkipForward size={14} />
            Skip
          </button>
          <button
            onClick={onFlag}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              isFlagged
                ? 'text-orange-700 bg-orange-100 hover:bg-orange-200'
                : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
            }`}
            aria-label="Flag for review"
          >
            <Flag size={14} />
            Flag
          </button>
        </div>
      </div>
    </div>
  )
}
