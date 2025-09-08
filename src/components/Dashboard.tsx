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
  LogOut,
  Menu,
  X,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  HardDrive
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { formatCurrency, formatNumber, formatPercent, formatTimeAgo, formatSOL } from '../lib/utils'
import lokiApi, { type Trade, type Position, type WalletSignalsResponse } from '../lib/api'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import HealthStatus from './HealthStatus'

interface DashboardProps {
  onLogout?: () => void
}

export default function Dashboard({ onLogout }: DashboardProps = {}) {
  const queryClient = useQueryClient()
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  const { data: positions = [] as Position[], isLoading: positionsLoading, isFetching: positionsFetching } = useQuery({
    queryKey: ['positions'],
    queryFn: async () => {
      const res = await lokiApi.getPositions()
      // Filter out closed positions
      return res.data.filter((p: any) => p.status !== 'CLOSED')
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

  const { data: walletSignals, isLoading: signalsLoading, isFetching: signalsFetching } = useQuery({
    queryKey: ['wallet-signals'],
    queryFn: async () => {
      const res = await lokiApi.getWalletSignals()
      return res.data
    },
    refetchInterval: autoRefresh ? 5000 : false,
    staleTime: 3000,
  })

  const { data: volumeInfo, isLoading: volumeLoading, isFetching: volumeFetching } = useQuery({
    queryKey: ['volume-info'],
    queryFn: async () => {
      const res = await lokiApi.getVolumeInfo()
      return res.data
    },
    refetchInterval: autoRefresh ? 30000 : false,
    staleTime: 25000,
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
    if (!chartData || typeof chartData !== 'object') return []
    
    // Filter out non-date keys and sort by date
    const entries = Object.entries(chartData)
      .filter(([key]) => {
        // Check if the key looks like a date (YYYY-MM-DD format)
        return /^\d{4}-\d{2}-\d{2}$/.test(key)
      })
      .sort(([a], [b]) => a.localeCompare(b))
    
    return entries.map(([date, data]: [string, any]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      profit: data.profit || 0,
      loss: -(data.loss || 0),
      net: (data.profit || 0) - (data.loss || 0),
      trades: data.trades || 0,
      buys: data.buys || 0,
      sells: data.sells || 0
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
      <header className="glass-effect border-b border-gray-800/50 sticky top-0 z-50">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-pink-900/10"></div>
        <div className="container mx-auto px-4 py-3 relative">
          <div className="flex items-center justify-between">
            {/* Logo and Status - Always visible */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500 blur-xl opacity-30 animate-pulse"></div>
                <div className="relative p-2 sm:p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30 glow-border">
                  <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                </div>
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-white neon-text">
                  LOKI
                </h1>
                <div className="flex items-center space-x-2">
                  <div className={`relative w-2 h-2 rounded-full ${status?.bot?.running ? 'bg-green-400' : 'bg-red-400'}`}>
                    {status?.bot?.running && (
                      <div className="absolute inset-0 bg-green-400 rounded-full animate-ping"></div>
                    )}
                  </div>
                  <span className="text-xs font-mono ${status?.bot?.running ? 'text-green-400' : 'text-red-400'} hidden sm:inline">
                    {status?.bot?.running ? 'ONLINE' : 'OFFLINE'}
                    {status?.bot?.paused && ' | PAUSED'}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 border-t border-gray-800/50 shadow-2xl" style={{ background: 'rgb(17, 17, 17)', backdropFilter: 'blur(10px)' }}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-pink-900/10"></div>
                <div className="relative p-4 space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className="w-full justify-start bg-gray-900/50 hover:bg-gray-800/70 border border-gray-800"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin text-green-400' : 'text-gray-400'}`} />
                  <span className={autoRefresh ? 'text-green-400' : 'text-gray-400'}>
                    {autoRefresh ? 'Live Updates On' : 'Live Updates Off'}
                  </span>
                </Button>
                
                {status?.bot?.paused ? (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      resumeMutation.mutate()
                      setMobileMenuOpen(false)
                    }}
                    disabled={resumeMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Resume Trading
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      pauseMutation.mutate()
                      setMobileMenuOpen(false)
                    }}
                    disabled={pauseMutation.isPending}
                    className="w-full border-yellow-600/50 hover:bg-yellow-600/10 hover:text-yellow-600"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Trading
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    emergencyStopMutation.mutate()
                    setMobileMenuOpen(false)
                  }}
                  disabled={emergencyStopMutation.isPending}
                  className="w-full bg-red-900/20 border-red-600/50 hover:bg-red-600/30 text-red-400 hover:text-red-300"
                >
                  <StopCircle className="h-4 w-4 mr-2" />
                  Emergency Stop
                </Button>
                
                {onLogout && (
                  <>
                    <div className="h-px bg-gray-800 my-2"></div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onLogout()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full justify-start bg-gray-900/50 hover:bg-gray-800/70 border border-gray-800 text-gray-300 hover:text-white"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="relative overflow-hidden glass-effect border-gray-800/50 animated-border">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 to-transparent opacity-50"></div>
            {statusFetching && !isFirstLoad && (
              <div className="absolute top-2 right-2 z-10">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
              </div>
            )}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Wallet Balance</CardTitle>
              <div className="p-2 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                <Wallet className="h-4 w-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  {formatNumber(status?.wallet?.balance || 0, 4)}
                </span>
                <span className="text-lg text-gray-500 ml-1">SOL</span>
              </div>
              <div className="flex items-center mt-2 space-x-1">
                <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-xs text-gray-500 font-mono">
                  {status?.wallet?.address?.slice(0, 6)}...{status?.wallet?.address?.slice(-4)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden glass-effect border-gray-800/50 animated-border">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-transparent opacity-50"></div>
            {statusFetching && !isFirstLoad && (
              <div className="absolute top-2 right-2 z-10">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
              </div>
            )}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Total Trades</CardTitle>
              <div className="p-2 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
                <Activity className="h-4 w-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  {status?.bot?.totalTrades || 0}
                </span>
              </div>
              <div className="flex items-center mt-2 space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-green-400 font-medium">
                    {status?.statistics?.successful || 0} successful
                  </span>
                </div>
                {status?.statistics?.failed ? (
                  <div className="flex items-center space-x-1">
                    <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                    <span className="text-xs text-red-400 font-medium">
                      {status?.statistics?.failed} failed
                    </span>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden glass-effect border-gray-800/50 animated-border">
            <div className={`absolute inset-0 bg-gradient-to-br ${(metrics?.analysis?.netProfit || status?.bot?.totalProfitLoss || 0) >= 0 ? 'from-green-900/5' : 'from-red-900/5'} to-transparent opacity-50`}></div>
            {(metricsFetching || statusFetching) && !isFirstLoad && (
              <div className="absolute top-2 right-2 z-10">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
              </div>
            )}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className={`text-xs font-semibold uppercase tracking-wider ${(metrics?.analysis?.netProfit || status?.bot?.totalProfitLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>Net Profit</CardTitle>
              <div className={`p-2 rounded-lg border ${(metrics?.analysis?.netProfit || status?.bot?.totalProfitLoss || 0) >= 0 ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20' : 'bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/20'}`}>
                <DollarSign className={`h-4 w-4 ${(metrics?.analysis?.netProfit || status?.bot?.totalProfitLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${(metrics?.analysis?.netProfit || status?.bot?.totalProfitLoss || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatSOL(metrics?.analysis?.netProfit || status?.bot?.totalProfitLoss || 0)}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  Win rate: <span className="font-medium text-gray-400">{formatNumber(metrics?.analysis?.winRate || status?.statistics?.winRate || 0, 1)}%</span>
                </span>
                <span className="text-xs text-gray-500">
                  PF: <span className="font-medium text-gray-400">{formatNumber(metrics?.analysis?.profitFactor || 0, 2)}</span>
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden glass-effect border-gray-800/50 animated-border">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 to-transparent opacity-50"></div>
            {positionsFetching && !isFirstLoad && (
              <div className="absolute top-2 right-2 z-10">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
              </div>
            )}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Open Positions</CardTitle>
              <div className="p-2 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                <TrendingUp className="h-4 w-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  {positions?.length || 0}
                </span>
              </div>
              <div className="flex items-center mt-2 space-x-1">
                <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
                <p className="text-xs text-gray-500">
                  Total value: <span className="font-medium text-purple-300">{formatSOL(
                    positions?.reduce((sum: number, p: any) => sum + (p.currentValue || 0), 0) || 0
                  )}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Health Status Panel */}
        <HealthStatus health={detailedHealth} isLoading={healthLoading} isFetching={healthFetching && !isFirstLoad} />

        {/* DB Volume Card */}
        {volumeInfo && (
          <Card className="relative overflow-hidden glass-effect border-gray-800/50 animated-border">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/5 to-transparent opacity-50"></div>
            {volumeFetching && !isFirstLoad && (
              <div className="absolute top-4 right-4 z-10">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
              </div>
            )}
            <CardHeader className="pb-4 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30">
                    <HardDrive className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">Database Volume</CardTitle>
                    <CardDescription className="text-gray-500 text-xs">Storage usage and capacity</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    {volumeInfo.volume.usagePercent}
                  </p>
                  <p className="text-xs text-gray-500">Used</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-effect rounded-lg p-3 border border-gray-800/50 group hover:border-indigo-500/30 transition-all">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Total</span>
                  </div>
                  <p className="text-lg font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                    {volumeInfo.volume.totalGB} GB
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatNumber(volumeInfo.volume.totalBytes / 1024 / 1024 / 1024, 2)} GiB
                  </p>
                </div>
                <div className="glass-effect rounded-lg p-3 border border-gray-800/50 group hover:border-indigo-500/30 transition-all">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Used</span>
                  </div>
                  <p className="text-lg font-bold bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                    {volumeInfo.volume.usedGB} GB
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatNumber(volumeInfo.volume.usedBytes / 1024 / 1024 / 1024, 2)} GiB
                  </p>
                </div>
                <div className="glass-effect rounded-lg p-3 border border-gray-800/50 group hover:border-indigo-500/30 transition-all">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Available</span>
                  </div>
                  <p className="text-lg font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                    {volumeInfo.volume.availableGB} GB
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatNumber(volumeInfo.volume.availableBytes / 1024 / 1024 / 1024, 2)} GiB
                  </p>
                </div>
                <div className="glass-effect rounded-lg p-3 border border-gray-800/50 group hover:border-indigo-500/30 transition-all">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                    <span className="text-xs text-gray-400 uppercase tracking-wider">DB Size</span>
                  </div>
                  <p className="text-lg font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    {volumeInfo.volume.databaseSizeMB} MB
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatNumber(volumeInfo.volume.databaseSize / 1024 / 1024, 2)} MiB
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Volume Path</span>
                  <span className="text-gray-400 font-mono">{volumeInfo.volumePath}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Fly App</span>
                  <span className="text-gray-400">{volumeInfo.flyApp}</span>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Storage Usage</span>
                    <span className="text-gray-400">{volumeInfo.volume.usagePercent}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                      style={{ width: volumeInfo.volume.usagePercent }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chart */}
        <Card className="relative overflow-hidden glass-effect border-gray-800/50 animated-border">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 to-transparent opacity-50"></div>
          {chartFetching && !isFirstLoad && (
            <div className="absolute top-4 right-4 z-10">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
            </div>
          )}
          <CardHeader className="pb-4 relative">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">Performance Overview</CardTitle>
                <CardDescription className="text-gray-500 text-xs">Daily profit/loss trends</CardDescription>
              </div>
              {formattedChartData.length > 0 && (
                <div className="text-right">
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {formatSOL(formattedChartData.reduce((sum, d) => sum + d.net, 0))}
                  </p>
                  <p className="text-xs text-gray-500">Last 7 days</p>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            {formattedChartData.length > 0 ? (
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
                    tickFormatter={(value) => `${value} SOL`}
                  />
                  <Tooltip 
                    formatter={(value: any) => formatSOL(value)}
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
            ) : (
              <div className="flex items-center justify-center h-[350px] text-gray-500">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No chart data available</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Data will appear once trades are made</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Open Positions */}
          <Card className="relative glass-effect border-gray-800/50 animated-border">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 to-transparent opacity-50"></div>
            {positionsFetching && !isFirstLoad && (
              <div className="absolute top-4 right-4 z-10">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
              </div>
            )}
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">Open Positions</CardTitle>
                  <CardDescription className="text-gray-500 text-xs">Currently held tokens</CardDescription>
                </div>
                {positions && positions.length > 0 && (
                  <div className="px-2 py-1 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full border border-purple-500/20">
                    <span className="text-xs font-medium text-purple-400">{positions.length} active</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {positions && positions.length > 0 ? (
                  positions.slice(0, 5).map((position: Position, index: number) => (
                    <div 
                      key={position.token_address} 
                      className="p-3 rounded-lg glass-effect border border-gray-800/50"
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
                            <span>Entry: {formatSOL(position.entryValue || position.cost_basis || 0)}</span>
                            <span className="text-gray-600">•</span>
                            <span>Current: {formatSOL(position.currentValue || 0)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-bold ${position.profitLossPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatPercent(position.profitLossPercent || 0)}
                          </div>
                          <div className={`text-xs ${position.profitLoss >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
                            {formatSOL(position.profitLoss || 0)}
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
          <Card className="relative glass-effect border-gray-800/50 animated-border">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-transparent opacity-50"></div>
            {tradesFetching && !isFirstLoad && (
              <div className="absolute top-4 right-4 z-10">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
              </div>
            )}
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">Recent Trades</CardTitle>
                  <CardDescription className="text-gray-500 text-xs">Latest trading activity</CardDescription>
                </div>
                {trades?.trades && trades.trades.length > 0 && (
                  <div className="px-2 py-1 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full border border-blue-500/20">
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
                      className="p-3 rounded-lg glass-effect border border-gray-800/50"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              trade.action === 'BUY' 
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {trade.action}
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {`${trade.token_address.slice(0, 6)}...${trade.token_address.slice(-4)}`}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatTimeAgo(trade.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-300">
                            {formatNumber(trade.amount_sol, 4)} SOL
                          </p>
                          {trade.token_amount > 0 && (
                            <p className="text-xs text-gray-500">
                              {formatNumber(trade.token_amount, 2)} tokens
                            </p>
                          )}
                          {trade.status === 'FAILED' && (
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

        {/* Wallet Signals */}
        <Card className="relative glass-effect border-gray-800/50 animated-border">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/5 to-transparent opacity-50"></div>
          {signalsFetching && !isFirstLoad && (
            <div className="absolute top-4 right-4 z-10">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
            </div>
          )}
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-1">Tracked Wallet Signals</CardTitle>
                <CardDescription className="text-gray-500 text-xs">
                  Recent buy/sell activity from {walletSignals?.trackedWallet ? `${walletSignals.trackedWallet.slice(0, 6)}...${walletSignals.trackedWallet.slice(-4)}` : 'tracked wallet'}
                </CardDescription>
              </div>
              {walletSignals?.count ? (
                <div className="px-2 py-1 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-full border border-yellow-500/20">
                  <span className="text-xs font-medium text-yellow-400">{walletSignals.count} signals</span>
                </div>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="relative max-h-[400px] overflow-y-auto scrollbar-custom">
              <div className="space-y-3 pr-3">
                {walletSignals?.signals && walletSignals.signals.length > 0 ? (
                  walletSignals.signals.map((signal, index) => (
                    <div 
                      key={signal.fullSignature || signal.signature}
                      className="p-3 rounded-lg glass-effect border border-gray-800/50 mr-1"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {signal.action === 'BUY' ? (
                              <ArrowUpRight className="h-4 w-4 text-green-400" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-red-400" />
                            )}
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              signal.action === 'BUY' 
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {signal.action}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Zap className="h-3 w-3 text-yellow-400" />
                            <span className="text-xs text-yellow-400 font-medium">{signal.dex}</span>
                          </div>
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                              <span className="text-gray-500">{signal.action === 'BUY' ? 'Spent:' : 'Sold:'}</span>
                              <span className="font-mono text-white">
                                {formatNumber(signal.tokenIn.amount, 6)} {signal.tokenIn.symbol}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                              <span className="text-gray-500">{signal.action === 'BUY' ? 'Got:' : 'Received:'}</span>
                              <span className="font-mono text-white">
                                {formatNumber(signal.tokenOut.amount, 2)} {signal.tokenOut.symbol}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                              {formatTimeAgo(signal.timestamp)}
                            </p>
                            <a 
                              href={`https://solscan.io/tx/${signal.fullSignature}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-purple-400"
                            >
                              View TX →
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
                ) : (
                  <div className="text-center py-8">
                    <Zap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No signals yet</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Signals will appear as the tracked wallet trades</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
