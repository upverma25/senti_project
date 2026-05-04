import type { HistoryItem } from '../lib/api'
import { Trash2 } from 'lucide-react'

interface HistoryPanelProps {
  history: HistoryItem[]
  onClear: () => void
  onSelect: (item: HistoryItem) => void
}

const dotColor: Record<string, string> = {
  positive: 'bg-pos',
  negative: 'bg-neg',
  neutral:  'bg-neu',
}

const labelStyle: Record<string, string> = {
  positive: 'text-pos bg-pos/10',
  negative: 'text-neg bg-neg/10',
  neutral:  'text-neu bg-neu/10',
}

export function HistoryPanel({ history, onClear, onSelect }: HistoryPanelProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-10 text-gray-600 text-sm">
        No analyses yet. Enter some text above to get started.
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-gray-500 uppercase tracking-widest">
          {history.length} {history.length === 1 ? 'Analysis' : 'Analyses'}
        </span>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-neg transition-colors"
        >
          <Trash2 size={12} /> Clear All
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {history.map(item => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="w-full text-left bg-bg-2 border border-white/[0.06] rounded-xl px-4 py-3.5 flex items-center gap-3 hover:border-white/15 transition-colors group"
          >
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor[item.result.sentiment]}`} />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white truncate">
                {item.text.slice(0, 70)}{item.text.length > 70 ? '…' : ''}
              </div>
              <div className="text-[11px] text-gray-600 font-mono mt-0.5">
                {item.timestamp.toLocaleTimeString()}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="font-mono text-xs text-gray-500">
                {Math.round(item.result.confidence * 100)}%
              </span>
              <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${labelStyle[item.result.sentiment]}`}>
                {item.result.sentiment.slice(0, 3)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
