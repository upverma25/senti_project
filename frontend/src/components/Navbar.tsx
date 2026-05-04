import { Activity, Cpu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { healthCheck } from '../lib/api'

export function Navbar() {
  const [healthy, setHealthy] = useState<boolean | null>(null)

  useEffect(() => {
    healthCheck().then(setHealthy)
    const interval = setInterval(() => healthCheck().then(setHealthy), 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <nav className="flex items-center justify-between py-5 border-b border-white/[0.07] mb-10">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
          <Activity size={16} className="text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight">
          Sentiment<span className="text-accent-2">AI</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-bg-2">
          <Cpu size={12} className="text-accent-2" />
          <span className="font-mono text-[11px] text-gray-400 tracking-wide">LinearSVC</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-bg-2">
          <div className={`w-2 h-2 rounded-full ${
            healthy === null ? 'bg-yellow-400 animate-pulse' :
            healthy ? 'bg-pos' : 'bg-neg'
          }`} />
          <span className="font-mono text-[11px] text-gray-400">
            {healthy === null ? 'connecting' : healthy ? 'api online' : 'api offline'}
          </span>
        </div>
      </div>
    </nav>
  )
}
