import { useState } from 'react'
import { Navbar } from './components/Navbar'
import { StatsRow } from './components/StatsRow'
import { TextInput } from './components/TextInput'
import { ResultCard } from './components/ResultCard'
import { HistoryPanel } from './components/HistoryPanel'
import { TrendChart } from './components/TrendChart'
import { useSentiment } from './hooks/useSentiment'
import type { HistoryItem } from './lib/api'

type Tab = 'history' | 'chart'

export default function App() {
  const { result, loading, error, history, stats, analyze, clearHistory } = useSentiment()
  const [activeTab, setActiveTab] = useState<Tab>('history')
  const [, setText] = useState('')

  const handleAnalyze = (t: string) => {
    setText(t)
    analyze(t)
  }

  const handleSelectHistory = (item: HistoryItem) => {
    setText(item.text)
    analyze(item.text)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-bg relative">
      {/* Grain overlay */}
      <div className="fixed inset-0 grain opacity-40 pointer-events-none z-0" />

      {/* Radial glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-[0.04] pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse, #7c6ef5 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-20">
        <Navbar />

        {/* Hero */}
        <div className="text-center pb-12 pt-2">
          <div className="inline-block font-mono text-[11px] text-accent-2 border border-accent/30 rounded-full px-4 py-1.5 mb-5 tracking-widest bg-accent/5">
            REAL-TIME SENTIMENT INTELLIGENCE
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-none mb-4">
            Decode the{' '}
            <span className="text-gradient">emotional tone</span>
            <br />of any text
          </h1>
          <p className="text-gray-400 max-w-md mx-auto text-base leading-relaxed">
            Powered by LinearSVC + TF-IDF NLP pipeline. Instant sentiment analysis
            with confidence scoring and key phrase extraction.
          </p>
        </div>

        <StatsRow stats={stats} />

        <TextInput onAnalyze={handleAnalyze} loading={loading} />

        {error && (
          <div className="mb-7 px-4 py-3 rounded-xl border border-neg/30 bg-neg/10 text-neg text-sm">
            ⚠ {error}
          </div>
        )}

        {result && <ResultCard result={result} />}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/[0.07] mb-6">
          {(['history', 'chart'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
                activeTab === tab
                  ? 'text-accent-2 border-accent-2'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}
            >
              {tab === 'history' ? `Analysis History (${history.length})` : 'Trend Chart'}
            </button>
          ))}
        </div>

        {activeTab === 'history' ? (
          <HistoryPanel history={history} onClear={clearHistory} onSelect={handleSelectHistory} />
        ) : (
          <div className="bg-bg-2 border border-white/[0.07] rounded-2xl p-6">
            <TrendChart history={history} stats={stats} />
          </div>
        )}
      </div>
    </div>
  )
}
