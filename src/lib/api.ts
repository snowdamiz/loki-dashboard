import axios from 'axios'

// Get API URL from environment or use default
const API_URL = import.meta.env.VITE_API_URL || 'https://loki-late-paper-3992.fly.dev'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// API Types
export interface BotStatus {
  bot: {
    running: boolean
    connected?: boolean
    paused: boolean
    isPaused?: boolean  // Keep for backward compatibility
    emergencyStop: boolean
    trackedWallet?: string
    mode?: string
  }
  statistics: {
    totalTrades: number
    successfulTrades: number
    failedTrades: number
    totalProfit: number
    totalLoss: number
  }
  wallet: {
    address: string
    balance: number
  }
  safety: any
  exitStrategy: any
}

export interface Trade {
  id: number
  timestamp: number
  token_address: string
  token_symbol?: string
  side: 'BUY' | 'SELL'
  amount: number
  price: number
  sol_amount: number
  profit_loss?: number
  status: string
  error?: string
}

export interface Position {
  token_address: string
  token_symbol?: string
  amount: number
  entry_price: number
  current_price?: number
  currentValue?: number
  entryValue?: number
  profitLoss?: number
  profitLossPercent?: number
  timestamp: number
}

export interface Metrics {
  current: any
  history: any[]
  analysis: {
    totalTrades: number
    winningTrades: number
    losingTrades: number
    winRate: number
    totalProfit: number
    totalLoss: number
    netProfit: number
    profitFactor: number
  }
}

export interface ServiceHealth {
  name: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  latency?: number
  lastCheck: number
  details?: Record<string, any>
}

export interface HealthMetrics {
  memoryUsage: {
    rss: number
    heapTotal: number
    heapUsed: number
    external: number
    percentage: number
  }
  cpuUsage: {
    user: number
    system: number
  }
}

export interface DetailedHealth {
  overall: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: number
  uptime: number
  services: {
    websocket?: ServiceHealth
    solanaRpc?: ServiceHealth
    database?: ServiceHealth
    jupiterApi?: ServiceHealth
    dexScreener?: ServiceHealth
    monitoring?: ServiceHealth
    [key: string]: ServiceHealth | undefined
  }
  metrics: HealthMetrics
}

// API Functions
export const lokiApi = {
  // Health & Status
  getHealth: () => api.get('/health'),
  getDetailedHealth: () => api.get<DetailedHealth>('/health/detailed'),
  getStatus: () => api.get<BotStatus>('/status'),
  getConfig: () => api.get('/config'),
  getRateLimits: () => api.get('/rate-limits'),

  // Trading Data
  getTrades: (limit = 50, offset = 0) => 
    api.get<{ trades: Trade[], total: number }>('/trades', { params: { limit, offset } }),
  getTrade: (id: number) => api.get<Trade>(`/trades/${id}`),
  getPositions: () => api.get<Position[]>('/positions'),
  getPosition: (token: string) => api.get<Position>(`/positions/${token}`),

  // Metrics
  getMetrics: () => api.get<Metrics>('/metrics'),
  getChartData: (days = 7) => 
    api.get('/metrics/chart', { params: { days } }),

  // Control
  pause: () => api.post('/control/pause'),
  resume: () => api.post('/control/resume'),
  emergencyStop: () => api.post('/control/emergency-stop'),
  clearQueue: () => api.post('/control/clear-queue'),
  updateConfig: (path: string, value: any) => 
    api.post('/control/config', { path, value }),

  // Wallet
  getWalletBalance: () => api.get('/wallet/balance'),
  getTrackedWallet: () => api.get('/wallet/tracked'),

  // Tokens
  getTokenInfo: (address: string) => api.get(`/tokens/${address}`),
  getTrendingTokens: () => api.get('/tokens/trending'),

  // Circuit Breaker
  getCircuitBreakerStatus: () => api.get('/circuit-breaker'),
  resetCircuitBreaker: () => api.post('/circuit-breaker/reset'),
  tripCircuitBreaker: (reason: string) => 
    api.post('/circuit-breaker/trip', { reason }),
}

export default lokiApi
