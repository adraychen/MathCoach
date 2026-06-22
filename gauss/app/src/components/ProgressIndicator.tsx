import { useState } from 'react'
import { CheckCircle, SkipForward, Send } from 'lucide-react'
import type { ContestProgress } from '../types/database'

interface ProgressIndicatorProps {
  progress: ContestProgress
  onComplete: () => void
  isCompleting?: boolean
}

export function ProgressIndicator({ progress, onComplete, isCompleting }: ProgressIndicatorProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleCompleteClick = () => {
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    setShowConfirm(false)
    onComplete()
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  return (
    <>
      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2 text-sm">
        <div className="flex items-center gap-4 text-gray-600">
          <span className="flex items-center gap-1">
            <CheckCircle size={14} className="text-green-500" />
            <span>{progress.answered} / {progress.total} answered</span>
          </span>
          {progress.skipped > 0 && (
            <span className="flex items-center gap-1">
              <SkipForward size={14} className="text-yellow-500" />
              <span>{progress.skipped} skipped</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCompleteClick}
            disabled={isCompleting}
            className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Send size={12} />
            Complete
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Complete Contest?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Are you sure you want to submit your contest? Your score will be calculated and you won't be able to change your answers.
            </p>
            {progress.answered < progress.total && (
              <p className="text-orange-600 text-sm mb-4">
                You have {progress.total - progress.answered} unanswered question{progress.total - progress.answered > 1 ? 's' : ''}.
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
