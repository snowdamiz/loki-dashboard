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
    connected: boolean
    paused: boolean
    mode: string
    trackedWallet: string
    totalTrades: number
    totalProfitLoss: number
    openPositions: number
    errors: number
    startTime: number
    lastTradeTime: number
  }
  statistics: {
    totalProcessed: number
    successful: number
    failed: number
    skipped: number
    winRate: number
    queueSize: number
    isProcessing: boolean
  }
  wallet: {
    address: string
    balance: number
  }
  safety: {
    dailyTrades: number
    dailyLoss: number
    consecutiveLosses: number
    positionCount: number
    totalExposure: number
    isEmergencyStopped: boolean
  }
  exitStrategy: {
    monitoredPositions: number
    activeAlerts: any[]
  }
}

export interface Trade {
  id: number
  timestamp: number
  created_at: number
  token_address: string
  action: 'BUY' | 'SELL'
  amount_sol: number
  price: number
  token_amount: number
  status: string
  tx_signature: string
  reason: string | null
  gas_cost: number | null
  risk_score: number | null
  slippage: number | null
}

export interface Position {
  token_address: string
  token_symbol?: string
  amount: number
  entry_price: number
  current_price: number
  currentPrice?: number  // For backward compatibility
  currentValue: number
  entryValue: number
  profitLoss: number
  profitLossPercent: number
  profit_loss?: number
  cost_basis: number
  status: 'OPEN' | 'CLOSED'
  timestamp: number
  updated_at?: number
  last_updated?: number
  exit_price?: number
  exit_timestamp?: number
  hasPriceUpdate?: boolean
  trade_count?: number
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

export interface DetailedHealth {
  overall: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: number
  uptime: number
  services: {
    websocket: ServiceHealth
    solanaRpc: ServiceHealth
    database: ServiceHealth
    jupiterApi: ServiceHealth
    dexScreener: ServiceHealth
    monitoring: ServiceHealth
  }
  metrics: {
    memoryUsage: {
      rss: number
      heapTotal: number
      heapUsed: number
      external: number
      percentage: number
      arrayBuffers?: number
    }
    memoryDetails?: {
      v8HeapStats: {
        totalHeapSize: number
        totalPhysicalSize: number
        usedHeapSize: number
        heapSizeLimit: number
        availableSize: number
      }
      systemMemory?: {
        total: number
        free: number
        used: number
        usagePercent: number
      }
      health: {
        status: string
        message: string
      }
    }
    applicationData?: {
      walletMonitor: {
        recentSignals: number
      }
      positionManager: {
        openPositions: number
      }
      tradeProcessor: {
        totalProcessed: number
        successful: number
        failed: number
      }
    }
    cpuUsage?: {
      user: number
      system: number
    }
  }
}

export interface WalletSignal {
  timestamp: number
  time: string
  action: 'BUY' | 'SELL'
  signature: string
  fullSignature: string
  tokenIn: {
    address: string
    amount: number
    symbol: string
  }
  tokenOut: {
    address: string
    amount: number
    symbol: string
  }
  dex: string
  pool?: string
}

export interface WalletSignalsResponse {
  count: number
  signals: WalletSignal[]
  trackedWallet: string
}

export interface VolumeInfo {
  flyApp: string
  volumePath: string
  volume: {
    totalBytes: number
    totalGB: string
    usedBytes: number
    usedGB: string
    availableBytes: number
    availableGB: string
    usagePercent: string
    databaseSize: number
    databaseSizeMB: string
  }
  timestamp: string
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
  closePosition: (token: string, reason?: string) =>
    api.post(`/control/positions/${token}/close`, { reason: reason || 'Manual close via dashboard' }),

  // Wallet
  getWalletBalance: () => api.get('/wallet/balance'),
  getTrackedWallet: () => api.get('/wallet/tracked'),
  getWalletSignals: () => api.get<WalletSignalsResponse>('/wallet/signals'),

  // Tokens
  getTokenInfo: (address: string) => api.get(`/tokens/${address}`),
  getTrendingTokens: () => api.get('/tokens/trending'),

  // Circuit Breaker
  getCircuitBreakerStatus: () => api.get('/circuit-breaker'),
  resetCircuitBreaker: () => api.post('/circuit-breaker/reset'),
  tripCircuitBreaker: (reason: string) => 
    api.post('/circuit-breaker/trip', { reason }),

  // System
  getVolumeInfo: () => api.get<VolumeInfo>('/system/volume'),

  // Database
  clearDatabase: () => api.delete('/database/clear-all?confirm=yes-clear-all-data'),
  downloadDatabase: (hours?: number) => {
    const params = hours ? { hours } : {}
    return api.get('/database/download', { 
      params,
      responseType: 'blob',
      headers: {
        'Accept': 'application/zip'
      }
    })
  },
}

export default lokiApi
