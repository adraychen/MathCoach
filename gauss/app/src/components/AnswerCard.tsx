import { SkipForward, X, ChevronLeft, ChevronRight, ThumbsUp, FastForward } from 'lucide-react'
import type { AnswerChoice, QuestionState } from '../types/database'

interface AnswerCardProps {
  currentQuestionNumber: number
  totalQuestions: number
  questionState: QuestionState
  onSelectAnswer: (answer: AnswerChoice) => void
  onSkip: () => void
  onNextSkipped: () => void
  onPrevious: () => void
  onNext: () => void
  canGoPrevious: boolean
  canGoNext: boolean
  showCorrectAnimation?: boolean
  skippedCount: number
}

const ANSWER_CHOICES: AnswerChoice[] = ['A', 'B', 'C', 'D', 'E']

export function AnswerCard({
  currentQuestionNumber,
  totalQuestions,
  questionState,
  onSelectAnswer,
  onSkip,
  onNextSkipped,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  showCorrectAnimation = false,
  skippedCount,
}: AnswerCardProps) {
  const { status, wrong_answers } = questionState
  const isWrong = status === 'wrong'
  const isCorrect = status === 'correct'
  const isAnswered = isCorrect || isWrong

  const getButtonStyle = (choice: AnswerChoice) => {
    const baseStyle = "w-11 h-11 rounded-lg font-semibold text-base transition-all duration-200 border-2 relative flex items-center justify-center"

    // This choice was a wrong answer attempt
    if (wrong_answers.includes(choice)) {
      return `${baseStyle} bg-red-100 border-red-400 text-red-700 cursor-not-allowed`
    }

    // Question answered correctly - disable all remaining
    if (isCorrect) {
      return `${baseStyle} bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed`
    }

    // Available for selection
    return `${baseStyle} bg-white border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer`
  }

  const handleAnswerClick = (choice: AnswerChoice) => {
    // Don't allow if already correct or if this choice was already tried
    if (isCorrect || wrong_answers.includes(choice)) {
      return
    }
    onSelectAnswer(choice)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2 relative">
      {/* Thumbs up animation */}
      {showCorrectAnimation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="animate-thumbs-up">
            <ThumbsUp size={48} className="text-green-500 fill-green-100" />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        {/* Left: Navigation and Question label */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous question"
          >
            <ChevronLeft size={18} />
          </button>
          <span className={`text-sm font-bold min-w-[70px] text-center px-2 py-0.5 rounded animate-pulse-subtle ${
            currentQuestionNumber % 2 === 1
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            Q{currentQuestionNumber} / {totalQuestions}
          </span>
          <button
            onClick={onNext}
            disabled={!canGoNext}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next question"
          >
            <ChevronRight size={18} />
          </button>
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
              {wrong_answers.includes(choice) && (
                <X
                  size={14}
                  className="absolute -top-1 -right-1 text-red-600 bg-white rounded-full"
                  strokeWidth={3}
                />
              )}
            </button>
          ))}
        </div>

        {/* Right: Skip and Next Skipped buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onSkip}
            disabled={isAnswered}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Skip question"
          >
            <SkipForward size={14} />
            Skip
          </button>
          {skippedCount > 0 && (
            <button
              onClick={onNextSkipped}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors"
              aria-label="Go to next skipped question"
            >
              <FastForward size={14} />
              Skipped ({skippedCount})
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
