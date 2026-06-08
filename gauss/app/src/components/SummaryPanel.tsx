import { CheckCircle, XCircle, SkipForward, Flag, RotateCcw } from 'lucide-react'
import type { ContestProgress } from '../types/database'

interface SummaryPanelProps {
  progress: ContestProgress
  onRestart: () => void
  onReviewFlagged: () => void
  onReviewWrong: () => void
}

export function SummaryPanel({ progress, onRestart, onReviewFlagged, onReviewWrong }: SummaryPanelProps) {
  const scorePercent = progress.total > 0
    ? Math.round((progress.correct / progress.total) * 100)
    : 0

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
        Contest Complete
      </h2>

      {/* Score */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-blue-600 mb-1">
          {scorePercent}%
        </div>
        <div className="text-sm text-gray-500">
          {progress.correct} of {progress.total} correct on first try
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
          <CheckCircle size={20} className="text-green-500" />
          <div>
            <div className="text-lg font-semibold text-green-700">{progress.correct}</div>
            <div className="text-xs text-green-600">First Try</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
          <XCircle size={20} className="text-red-500" />
          <div>
            <div className="text-lg font-semibold text-red-700">{progress.wrong}</div>
            <div className="text-xs text-red-600">Needed Help</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
          <SkipForward size={20} className="text-yellow-500" />
          <div>
            <div className="text-lg font-semibold text-yellow-700">{progress.skipped}</div>
            <div className="text-xs text-yellow-600">Skipped</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
          <Flag size={20} className="text-orange-500" />
          <div>
            <div className="text-lg font-semibold text-orange-700">{progress.flagged}</div>
            <div className="text-xs text-orange-600">Flagged</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {progress.flagged > 0 && (
          <button
            onClick={onReviewFlagged}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-orange-700 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors"
          >
            <Flag size={16} />
            Review {progress.flagged} flagged question{progress.flagged > 1 ? 's' : ''}
          </button>
        )}

        {progress.wrong > 0 && (
          <button
            onClick={onReviewWrong}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
          >
            <XCircle size={16} />
            Review {progress.wrong} question{progress.wrong > 1 ? 's' : ''} that needed help
          </button>
        )}

        <button
          onClick={onRestart}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RotateCcw size={16} />
          Start over
        </button>
      </div>
    </div>
  )
}
