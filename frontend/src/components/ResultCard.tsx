import { useEffect, useRef } from 'react'
import type { PredictResponse } from '../lib/api'
import { Clock, Zap } from 'lucide-react'

interface ResultCardProps {
  result: PredictResponse
}

const EMOJI: Record<string, string> = { positive: '😊', negative: '😤', neutral: '😐' }
const LABEL: Record<string, string> = { positive: 'Positive', negative: 'Negative', neutral: 'Neutral' }

const sentClass = (s: string) =>
  s === 'positive' ? 'pos' : s === 'negative' ? 'neg' : 'neu'

const sentColor: Record<string, string> = {
  positive: 'text-pos bg-pos/10 border-pos/25',
  negative: 'text-neg bg-neg/10 border-neg/25',
  neutral:  'text-neu bg-neu/10 border-neu/25',
}

const barColor: Record<string, string> = {
  positive: 'from-pos to-emerald-300',
  negative: 'from-neg to-rose-300',
  neutral:  'from-neu to-yellow-300',
}

export function ResultCard({ result }: ResultCardProps) {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.width = '0%'
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (barRef.current) barRef.current.style.width = `${Math.round(result.confidence * 100)}%`
        }, 50)
      })
    }
  }, [result])

  const sc = sentClass(result.sentiment)
  const pct = Math.round(result.confidence * 100)

  return (
    <div className="bg-bg-2 border border-white/10 rounded-2xl p-7 mb-7 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Sentiment Result</div>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-[15px] ${sentColor[result.sentiment]}`}>
            <span className="text-xl">{EMOJI[result.sentiment]}</span>
            {LABEL[result.sentiment]}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-1">Confidence</div>
          <div className="font-mono text-3xl font-medium text-white">{pct}%</div>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="mb-6">
        <div className="h-1.5 bg-bg-3 rounded-full overflow-hidden">
          <div
            ref={barRef}
            className={`h-full rounded-full bg-gradient-to-r ${barColor[result.sentiment]} transition-all duration-700 ease-out`}
            style={{ width: '0%' }}
          />
        </div>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {(['positive', 'negative', 'neutral'] as const).map(s => (
          <div key={s} className="bg-bg-3 border border-white/[0.06] rounded-xl p-3">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">{s}</div>
            <div className={`font-mono text-base font-medium ${sentColor[s].split(' ')[0]}`}>
              {(result.scores[s] * 100).toFixed(1)}%
            </div>
            <div className="mt-1.5 h-1 bg-bg-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${barColor[s]}`}
                style={{ width: `${(result.scores[s] * 100).toFixed(1)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Key phrases */}
      {result.key_phrases.length > 0 && (
        <div className="mb-5">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-2.5">Key Phrases Detected</div>
          <div className="flex flex-wrap gap-2">
            {result.key_phrases.map((phrase, i) => {
              const ps = result.phrase_sentiments[i] || result.sentiment
              return (
                <span
                  key={i}
                  className={`font-mono text-xs px-2.5 py-1 rounded border ${sentColor[ps]}`}
                >
                  {phrase}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 pt-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Clock size={11} />
          {result.processing_time_ms.toFixed(0)}ms
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Zap size={11} />
          LinearSVC · TF-IDF
        </div>
        <div className={`ml-auto text-xs font-mono font-medium ${sentColor[result.sentiment].split(' ')[0]}`}>
          {sc.toUpperCase()}
        </div>
      </div>
    </div>
  )
}
