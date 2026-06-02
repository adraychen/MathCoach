import { Flag, SkipForward, Check, X } from 'lucide-react'
import type { AnswerChoice, QuestionState } from '../types/database'

interface AnswerCardProps {
  currentQuestionNumber: number
  totalQuestions: number
  questionState: QuestionState
  correctAnswer: AnswerChoice
  onSelectAnswer: (answer: AnswerChoice) => void
  onSkip: () => void
  onFlag: () => void
}

const ANSWER_CHOICES: AnswerChoice[] = ['A', 'B', 'C', 'D', 'E']

export function AnswerCard({
  currentQuestionNumber,
  totalQuestions,
  questionState,
  correctAnswer,
  onSelectAnswer,
  onSkip,
  onFlag,
}: AnswerCardProps) {
  const { selectedAnswer, isCorrect, isSkipped, isFlagged } = questionState
  const hasAnswered = selectedAnswer !== null

  const getButtonStyle = (choice: AnswerChoice) => {
    const baseStyle = "w-14 h-14 rounded-lg font-semibold text-lg transition-all duration-200 border-2"

    if (!hasAnswered) {
      return `${baseStyle} bg-white border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer`
    }

    if (choice === selectedAnswer) {
      if (isCorrect) {
        return `${baseStyle} bg-green-100 border-green-500 text-green-700`
      } else {
        return `${baseStyle} bg-red-100 border-red-500 text-red-700`
      }
    }

    if (choice === correctAnswer && !isCorrect) {
      return `${baseStyle} bg-green-50 border-green-400 text-green-600`
    }

    return `${baseStyle} bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Question Progress */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Question {currentQuestionNumber} of {totalQuestions}
        </h3>
        <div className="flex items-center gap-2">
          {isSkipped && (
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
              Skipped
            </span>
          )}
          {isFlagged && (
            <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded">
              Flagged
            </span>
          )}
          {hasAnswered && (
            <span className={`flex items-center gap-1 px-2 py-1 text-xs rounded ${
              isCorrect
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {isCorrect ? <Check size={14} /> : <X size={14} />}
              {isCorrect ? 'Correct' : 'Incorrect'}
            </span>
          )}
        </div>
      </div>

      {/* Answer Choices */}
      <div className="flex items-center justify-center gap-3 mb-4">
        {ANSWER_CHOICES.map((choice) => (
          <button
            key={choice}
            onClick={() => !hasAnswered && onSelectAnswer(choice)}
            disabled={hasAnswered}
            className={getButtonStyle(choice)}
            aria-label={`Answer ${choice}`}
          >
            {choice}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3 pt-3 border-t border-gray-100">
        <button
          onClick={onSkip}
          disabled={hasAnswered}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Skip question"
        >
          <SkipForward size={16} />
          Skip
        </button>
        <button
          onClick={onFlag}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
            isFlagged
              ? 'text-orange-700 bg-orange-100 hover:bg-orange-200'
              : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
          }`}
          aria-label="Flag for review"
        >
          <Flag size={16} />
          {isFlagged ? 'Flagged' : 'Flag'}
        </button>
      </div>
    </div>
  )
}
