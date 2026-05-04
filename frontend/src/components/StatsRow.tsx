interface StatsRowProps {
  stats: { positive: number; negative: number; neutral: number; total: number }
}

export function StatsRow({ stats }: StatsRowProps) {
  const cards = [
    { label: 'Positive', value: stats.positive, color: 'text-pos', border: 'border-pos/20', pct: stats.total ? Math.round((stats.positive / stats.total) * 100) : 0 },
    { label: 'Negative', value: stats.negative, color: 'text-neg', border: 'border-neg/20', pct: stats.total ? Math.round((stats.negative / stats.total) * 100) : 0 },
    { label: 'Neutral',  value: stats.neutral,  color: 'text-neu', border: 'border-neu/20', pct: stats.total ? Math.round((stats.neutral  / stats.total) * 100) : 0 },
  ]

  return (
    <div className="grid grid-cols-3 gap-3 mb-8">
      {cards.map(c => (
        <div key={c.label} className={`bg-bg-2 border ${c.border} rounded-xl p-4 text-center`}>
          <div className={`font-mono text-2xl font-bold ${c.color}`}>{c.value}</div>
          <div className="text-gray-400 text-xs mt-1">{c.label}</div>
          {stats.total > 0 && (
            <div className="text-gray-600 font-mono text-[10px] mt-1">{c.pct}%</div>
          )}
        </div>
      ))}
    </div>
  )
}
