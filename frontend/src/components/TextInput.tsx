import { useState, useRef } from 'react'
import { Send, X, Loader2 } from 'lucide-react'

const EXAMPLES = [
  { label: '😊 Positive', text: 'The new product update is absolutely fantastic! It solved all my problems instantly and the support team was incredibly helpful.' },
  { label: '😤 Negative', text: 'This service is absolutely terrible. I waited 3 hours and nobody helped me. Complete waste of money and time.' },
  { label: '😐 Neutral',  text: 'The package arrived on Tuesday. The item was as described in the listing. Shipping took five business days.' },
  { label: '🤔 Mixed',    text: 'I have mixed feelings about this product. The design is beautiful but the performance is really disappointing.' },
]

interface TextInputProps {
  onAnalyze: (text: string) => void
  loading: boolean
}

export function TextInput({ onAnalyze, loading }: TextInputProps) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const MAX = 2000

  const handleSubmit = () => {
    const t = text.trim()
    if (t && !loading) onAnalyze(t)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit()
  }

  return (
    <div className="bg-bg-2 border border-white/10 rounded-2xl p-7 mb-7">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
        Enter Text to Analyze
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value.slice(0, MAX))}
          onKeyDown={handleKey}
          placeholder="Paste your text here — product reviews, customer feedback, social posts, emails..."
          rows={5}
          className="w-full bg-bg-3 border border-white/[0.07] rounded-xl text-[15px] text-white placeholder-gray-600 p-4 resize-y outline-none focus:border-accent/60 transition-colors leading-relaxed font-syne"
        />
        <span className="absolute bottom-3 right-3 font-mono text-[10px] text-gray-700">
          {text.length} / {MAX}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mt-4 mb-5">
        {EXAMPLES.map(ex => (
          <button
            key={ex.label}
            onClick={() => { setText(ex.text); textareaRef.current?.focus() }}
            className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-gray-400 bg-bg-3 hover:border-accent/40 hover:text-accent-2 transition-all whitespace-nowrap"
          >
            {ex.label}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || loading}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-[15px] tracking-wide
            bg-gradient-to-r from-accent to-purple-500 text-white
            hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
          ) : (
            <><Send size={15} /> Analyze Sentiment</>
          )}
        </button>
        {text && (
          <button
            onClick={() => setText('')}
            className="px-4 py-3.5 rounded-xl border border-white/10 text-gray-400 hover:border-white/20 hover:text-white transition-all"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <p className="text-[11px] text-gray-700 mt-3 text-center">
        Ctrl+Enter to analyze · LinearSVC model · ~50ms inference
      </p>
    </div>
  )
}
