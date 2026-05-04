import { useState, useCallback } from 'react'
import { predictSentiment, type PredictResponse, type HistoryItem } from '../lib/api'

interface SentimentState {
  result: PredictResponse | null
  loading: boolean
  error: string | null
  history: HistoryItem[]
  stats: { positive: number; negative: number; neutral: number; total: number }
}

export function useSentiment() {
  const [state, setState] = useState<SentimentState>({
    result: null,
    loading: false,
    error: null,
    history: [],
    stats: { positive: 0, negative: 0, neutral: 0, total: 0 },
  })

  const analyze = useCallback(async (text: string) => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const result = await predictSentiment(text)
      const item: HistoryItem = {
        id: crypto.randomUUID(),
        text,
        result,
        timestamp: new Date(),
      }
      setState(s => ({
        ...s,
        result,
        loading: false,
        history: [item, ...s.history].slice(0, 20),
        stats: {
          ...s.stats,
          [result.sentiment]: s.stats[result.sentiment] + 1,
          total: s.stats.total + 1,
        },
      }))
      return result
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed. Is the backend running?'
      setState(s => ({ ...s, loading: false, error: msg }))
      return null
    }
  }, [])

  const clearResult = useCallback(() => {
    setState(s => ({ ...s, result: null, error: null }))
  }, [])

  const clearHistory = useCallback(() => {
    setState(s => ({ ...s, history: [], stats: { positive: 0, negative: 0, neutral: 0, total: 0 } }))
  }, [])

  return { ...state, analyze, clearResult, clearHistory }
}
