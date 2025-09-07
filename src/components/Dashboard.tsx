import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Activity, 
  DollarSign, 
  TrendingUp,
  Play,
  Pause,
  StopCircle,
  RefreshCw,
  Wallet,
  LogOut
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { formatCurrency, formatNumber, formatPercent, formatTimeAgo } from '../lib/utils'
import lokiApi, { type Trade } from '../lib/api'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import HealthStatus from './HealthStatus'

interface DashboardProps {
  onLogout?: () => void
}

export default function Dashboard({ onLogout }: DashboardProps = {}) {
  const queryClient = useQueryClient()
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [isFirstLoad, setIsFirstLoad] = useState(true)

  // Queries with staleTime to prevent unnecessary refetches
  const { data: status = {} as any, isLoading: statusLoading, isFetching: statusFetching, isSuccess: statusSuccess } = useQuery({
    queryKey: ['status'],
    queryFn: async () => {
      const res = await lokiApi.getStatus()
      return res.data
    },
    refetchInterval: autoRefresh ? 5000 : false,
    staleTime: 3000,
  })

  // Track when first load completes
  useEffect(() => {
    if (statusSuccess && isFirstLoad) {
      setIsFirstLoad(false)
    }
  }, [statusSuccess, isFirstLoad])

  const { data: trades = {} as any, isLoading: tradesLoading, isFetching: tradesFetching } = useQuery({
    queryKey: ['trades'],
    queryFn: async () => {
      const res = await lokiApi.getTrades(20)
      return res.data
    },
    refetchInterval: autoRefresh ? 10000 : false,
    staleTime: 8000,
  })

  const { data: positions = [] as any[], isLoading: positionsLoading, isFetching: positionsFetching } = useQuery({
    queryKey: ['positions'],
    queryFn: async () => {
      const res = await lokiApi.getPositions()
      return res.data
    },
    refetchInterval: autoRefresh ? 10000 : false,
    staleTime: 8000,
  })

  const { data: metrics = {} as any, isLoading: metricsLoading, isFetching: metricsFetching } = useQuery({
    queryKey: ['metrics'],
    queryFn: async () => {
      const res = await lokiApi.getMetrics()
      return res.data
    },
    refetchInterval: autoRefresh ? 30000 : false,
    staleTime: 25000,
  })

  const { data: chartData = {} as any, isLoading: chartLoading, isFetching: chartFetching } = useQuery({
    queryKey: ['chart'],
    queryFn: async () => {
      const res = await lokiApi.getChartData(7)
      return res.data
    },
    refetchInterval: autoRefresh ? 60000 : false,
    staleTime: 50000,
  })

  const { data: detailedHealth, isLoading: healthLoading, isFetching: healthFetching } = useQuery({
    queryKey: ['health-detailed'],
    queryFn: async () => {
      const res = await lokiApi.getDetailedHealth()
      return res.data
    },
    refetchInterval: autoRefresh ? 15000 : false,
    staleTime: 12000,
  })

  // Mutations
  const pauseMutation = useMutation({
    mutationFn: lokiApi.pause,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['status'] })
  })

  const resumeMutation = useMutation({
    mutationFn: lokiApi.resume,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['status'] })
  })

  const emergencyStopMutation = useMutation({
    mutationFn: lokiApi.emergencyStop,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['status'] })
  })

  // Format chart data
  const formattedChartData = React.useMemo(() => {
    if (!chartData) return []
    return Object.entries(chartData).map(([date, data]: [string, any]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      profit: data.profit,
      loss: -data.loss,
      net: data.profit - data.loss,
      trades: data.trades
    }))
  }, [chartData])

  // Only show spinner on the very first load ever
  if (isFirstLoad && statusLoading && !status?.bot) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <Activity className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Loki
                  </h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${status?.bot?.running ? 'bg-green-400' : 'bg-red-400'} ${status?.bot?.running ? 'animate-pulse' : ''}`}></div>
                    <span className="text-xs text-gray-400 font-medium">
                      {status?.bot?.running ? 'ACTIVE' : 'INACTIVE'}
                      {status?.bot?.paused && ' • PAUSED'}
                      {status?.bot?.emergencyStop && ' • EMERGENCY STOP'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="relative"
              >
                <RefreshCw className={`h-4 w-4 mr-2 transition-transform duration-1000 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Live' : 'Paused'}
                {autoRefresh && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                )}
              </Button>
              <div className="h-8 w-px bg-border" />
              {status?.bot?.paused ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => resumeMutation.mutate()}
                  disabled={resumeMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Resume Trading
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pauseMutation.mutate()}
                  disabled={pauseMutation.isPending}
                  className="border-yellow-600/50 hover:bg-yellow-600/10 hover:text-yellow-600"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => emergencyStopMutation.mutate()}
                disabled={emergencyStopMutation.isPending}
                className="border-red-600/50 hover:bg-red-600/10 hover:text-red-600"
              >
                <StopCircle className="h-4 w-4 mr-2" />
                Emergency Stop
              </Button>
              {onLogout && (
                <>
                  <div className="h-8 w-px bg-border" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    className="text-gray-400 hover:text-white"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-300">
            {statusFetching && !isFirstLoad && (
              <div className="absolute top-2 right-2 z-10">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
              </div>
            )}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Wallet Balance</CardTitle>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Wallet className="h-4 w-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {formatNumber(status?.wallet?.balance || 0, 4)}
                <span className="text-lg text-gray-500 ml-1">SOL</span>
              </div>
              <p className="text-xs text-gray-500 mt-2 font-mono">
                {status?.wallet?.address?.slice(0, 6)}...{status?.wallet?.address?.slice(-4)}
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-300">
            {statusFetching && !isFirstLoad && (
              <div className="absolute top-2 right-2 z-10">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
              </div>
            )}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Trades</CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Activity className="h-4 w-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {status?.statistics?.totalTrades || 0}
              </div>
              <div className="flex items-center mt-2">
                <span className="text-xs text-green-400 font-medium">
                  {status?.statistics?.successfulTrades || 0} successful
                </span>
                {status?.statistics?.failedTrades ? (
                  <span className="text-xs text-red-400 font-medium ml-2">
                    • {status?.statistics?.failedTrades} failed
                  </span>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-300">
            {metricsFetching && !isFirstLoad && (
              <div className="absolute top-2 right-2 z-10">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              </div>
            )}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Net Profit</CardTitle>
              <div className={`p-2 rounded-lg ${(metrics?.analysis?.netProfit || 0) >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <DollarSign className={`h-4 w-4 ${(metrics?.analysis?.netProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${(metrics?.analysis?.netProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(metrics?.analysis?.netProfit || 0)}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  Win rate: <span className="font-medium text-gray-400">{formatNumber(metrics?.analysis?.winRate || 0, 1)}%</span>
                </span>
                <span className="text-xs text-gray-500">
                  PF: <span className="font-medium text-gray-400">{formatNumber(metrics?.analysis?.profitFactor || 0, 2)}</span>
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-300">
            {positionsFetching && !isFirstLoad && (
              <div className="absolute top-2 right-2 z-10">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-ping"></div>
              </div>
            )}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Open Positions</CardTitle>
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <TrendingUp className="h-4 w-4 text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {positions?.length || 0}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Total value: <span className="font-medium text-gray-400">{formatCurrency(
                  positions?.reduce((sum: number, p: any) => sum + (p.currentValue || 0), 0) || 0
                )}</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Health Status Panel */}
        <HealthStatus health={detailedHealth} isLoading={healthLoading} isFetching={healthFetching && !isFirstLoad} />

        {/* Chart */}
        {formattedChartData.length > 0 && (
          <Card className="relative overflow-hidden bg-gray-900 border-gray-800">
            {chartFetching && !isFirstLoad && (
              <div className="absolute top-4 right-4 z-10">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
              </div>
            )}
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-white">Performance Overview</CardTitle>
                  <CardDescription className="text-gray-500">Daily profit/loss trends</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-400">
                    {formatCurrency(formattedChartData.reduce((sum, d) => sum + d.net, 0))}
                  </p>
                  <p className="text-xs text-gray-500">Last 7 days</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={formattedChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#9ca3af" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      border: '1px solid rgba(31, 41, 55, 1)',
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)'
                    }}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    stackId="1"
                    stroke="#10b981" 
                    fillOpacity={1}
                    fill="url(#colorProfit)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="loss" 
                    stackId="1"
                    stroke="#ef4444" 
                    fillOpacity={1}
                    fill="url(#colorLoss)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Open Positions */}
          <Card className="relative bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-300">
            {positionsFetching && !isFirstLoad && (
              <div className="absolute top-4 right-4 z-10">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-ping"></div>
              </div>
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-white">Open Positions</CardTitle>
                  <CardDescription className="text-gray-500">Currently held tokens</CardDescription>
                </div>
                {positions && positions.length > 0 && (
                  <div className="px-2 py-1 bg-orange-500/10 rounded-full border border-orange-500/20">
                    <span className="text-xs font-medium text-orange-400">{positions.length} active</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {positions && positions.length > 0 ? (
                  positions.slice(0, 5).map((position: any, index: number) => (
                    <div 
                      key={position.token_address} 
                      className="p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 transition-all duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-semibold text-white">
                              {position.token_symbol || `${position.token_address.slice(0, 6)}...`}
                            </p>
                            <span className="text-xs text-gray-500">
                              {formatNumber(position.amount)} tokens
                            </span>
                          </div>
                          <div className="mt-1 flex items-center space-x-3 text-xs text-gray-500">
                            <span>Entry: {formatCurrency(position.entry_price)}</span>
                            <span className="text-gray-600">•</span>
                            <span>Current: {formatCurrency(position.current_price || position.entry_price)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-bold ${position.profitLossPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatPercent(position.profitLossPercent || 0)}
                          </div>
                          <div className={`text-xs ${position.profitLoss >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
                            {formatCurrency(position.profitLoss || 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No open positions</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Trades */}
          <Card className="relative bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-300">
            {tradesFetching && !isFirstLoad && (
              <div className="absolute top-4 right-4 z-10">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
              </div>
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-white">Recent Trades</CardTitle>
                  <CardDescription className="text-gray-500">Latest trading activity</CardDescription>
                </div>
                {trades?.trades && trades.trades.length > 0 && (
                  <div className="px-2 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                    <span className="text-xs font-medium text-blue-400">{trades.total} total</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trades?.trades && trades.trades.length > 0 ? (
                  trades.trades.slice(0, 5).map((trade: Trade, index: number) => (
                    <div 
                      key={trade.id} 
                      className="p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 transition-all duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              trade.side === 'BUY' 
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {trade.side}
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {trade.token_symbol || `${trade.token_address.slice(0, 6)}...`}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatTimeAgo(trade.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-300">
                            {formatNumber(trade.sol_amount, 4)} SOL
                          </p>
                          {trade.profit_loss !== undefined && (
                            <p className={`text-xs font-medium ${
                              trade.profit_loss >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {trade.profit_loss >= 0 ? '+' : ''}{formatCurrency(trade.profit_loss)}
                            </p>
                          )}
                          {trade.status === 'error' && (
                            <p className="text-xs text-red-400 mt-1">Failed</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No recent trades</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
