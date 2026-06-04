import { Flag, CheckCircle, SkipForward } from 'lucide-react'
import type { ContestProgress } from '../types/database'

interface ProgressIndicatorProps {
  progress: ContestProgress
  onReviewFlagged: () => void
}

export function ProgressIndicator({ progress, onReviewFlagged }: ProgressIndicatorProps) {
  return (
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
        {progress.flagged > 0 && (
          <span className="flex items-center gap-1">
            <Flag size={14} className="text-orange-500" />
            <span>{progress.flagged} flagged</span>
          </span>
        )}
      </div>

      {progress.flagged > 0 && (
        <button
          onClick={onReviewFlagged}
          className="flex items-center gap-1 px-2 py-1 text-xs text-orange-600 bg-orange-50 rounded hover:bg-orange-100 transition-colors"
        >
          <Flag size={12} />
          Review flagged
        </button>
      )}
    </div>
  )
}
