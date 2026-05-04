import { Doughnut, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js'
import type { HistoryItem } from '../lib/api'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

interface TrendChartProps {
  history: HistoryItem[]
  stats: { positive: number; negative: number; neutral: number; total: number }
}

export function TrendChart({ history, stats }: TrendChartProps) {
  if (stats.total === 0) {
    return (
      <div className="text-center py-10 text-gray-600 text-sm">
        No data yet. Analyze some text to see your trends.
      </div>
    )
  }

  const doughnutData = {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [{
      data: [stats.positive, stats.negative, stats.neutral],
      backgroundColor: ['rgba(34,211,160,0.8)', 'rgba(240,86,106,0.8)', 'rgba(245,166,35,0.8)'],
      borderColor: ['#22d3a0', '#f0566a', '#f5a623'],
      borderWidth: 2,
      hoverOffset: 6,
    }],
  }

  const last10 = history.slice(0, 10).reverse()
  const barData = {
    labels: last10.map((_, i) => `#${i + 1}`),
    datasets: [{
      label: 'Confidence %',
      data: last10.map(h => Math.round(h.result.confidence * 100)),
      backgroundColor: last10.map(h =>
        h.result.sentiment === 'positive' ? 'rgba(34,211,160,0.6)' :
        h.result.sentiment === 'negative' ? 'rgba(240,86,106,0.6)' : 'rgba(245,166,35,0.6)'
      ),
      borderColor: last10.map(h =>
        h.result.sentiment === 'positive' ? '#22d3a0' :
        h.result.sentiment === 'negative' ? '#f0566a' : '#f5a623'
      ),
      borderWidth: 1,
      borderRadius: 4,
    }],
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-4">Distribution</div>
        <div className="relative h-52">
          <Doughnut
            data={doughnutData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              cutout: '65%',
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: ctx => ` ${ctx.label}: ${ctx.raw} (${stats.total ? Math.round((ctx.raw as number) / stats.total * 100) : 0}%)`,
                  },
                },
              },
            }}
          />
        </div>
        <div className="flex justify-center gap-4 mt-3">
          {[
            { label: 'Positive', color: '#22d3a0', val: stats.positive },
            { label: 'Negative', color: '#f0566a', val: stats.negative },
            { label: 'Neutral',  color: '#f5a623', val: stats.neutral  },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 text-xs text-gray-400">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
              {l.label} ({l.val})
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-4">Confidence History</div>
        <div className="relative h-52">
          <Bar
            data={barData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: { ticks: { color: '#555577', font: { family: 'JetBrains Mono', size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } },
                y: { min: 0, max: 100, ticks: { color: '#555577', font: { family: 'JetBrains Mono', size: 10 }, callback: v => v + '%' }, grid: { color: 'rgba(255,255,255,0.05)' } },
              },
              plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: ctx => ` ${ctx.raw}% confidence` } },
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}
