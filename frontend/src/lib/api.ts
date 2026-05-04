import axios from 'axios'

export type Sentiment = 'positive' | 'negative' | 'neutral'

export interface PredictResponse {
  sentiment: Sentiment
  confidence: number
  scores: {
    positive: number
    negative: number
    neutral: number
  }
  key_phrases: string[]
  phrase_sentiments: string[]
  processing_time_ms: number
}

export interface ModelInfo {
  model: string
  vectorizer: string
  trained: boolean
  accuracy: number
  train_samples: number
  classes: string[]
}

export interface HistoryItem {
  id: string
  text: string
  result: PredictResponse
  timestamp: Date
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
})

export async function predictSentiment(text: string): Promise<PredictResponse> {
  const { data } = await api.post<PredictResponse>('/predict', { text })
  return data
}

export async function getModelInfo(): Promise<ModelInfo> {
  const { data } = await api.get<ModelInfo>('/model-info')
  return data
}

export async function healthCheck(): Promise<boolean> {
  try {
    const { data } = await axios.get('/health')
    return data.status === 'healthy'
  } catch {
    return false
  }
}
