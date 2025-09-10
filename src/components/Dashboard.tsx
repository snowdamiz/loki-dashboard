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
  HardDrive,
  Trash2,
  AlertTriangle
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
  const [showClearConfirm, setShowClearConfirm] = useState(false)

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

  const clearDatabaseMutation = useMutation({
    mutationFn: lokiApi.clearDatabase,
    onSuccess: () => {
      // Invalidate all queries to refresh the data
      queryClient.invalidateQueries()
      setShowClearConfirm(false)
    }
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
      {/* Clear Database Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative mx-4 w-full max-w-md rounded-xl border border-red-500/20 bg-gray-900/95 p-6 shadow-2xl">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-900/10 to-transparent opacity-50"></div>
            <div className="relative">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">Clear Database?</h3>
              </div>
              <p className="text-sm text-gray-400 mb-6">
                This action will permanently delete all data including:
              </p>
              <ul className="text-sm text-gray-500 space-y-1 mb-6 ml-4">
                <li className="flex items-center space-x-2">
                  <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                  <span>All trade history</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                  <span>All positions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                  <span>All wallet signals</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                  <span>All metrics and statistics</span>
                </li>
              </ul>
              <p className="text-xs text-red-400 font-semibold mb-6">
                ⚠️ This action cannot be undone!
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 border-gray-600 hover:bg-gray-800"
                  disabled={clearDatabaseMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => clearDatabaseMutation.mutate()}
                  disabled={clearDatabaseMutation.isPending}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {clearDatabaseMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Clearing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Data
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modern Redesigned Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section - Simplified */}
            <div className="flex items-center space-x-3">
              <Activity className="h-5 w-5 text-purple-400" />
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  LOKI
                </h1>
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                  status?.bot?.running 
                    ? status?.bot?.paused 
                      ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                      : 'bg-green-500/10 text-green-500 border border-green-500/20'
                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}>
                  {status?.bot?.running ? (status?.bot?.paused ? 'PAUSED' : 'LIVE') : 'OFFLINE'}
                </span>
              </div>
            </div>

            {/* Desktop Controls - Redesigned */}
            <div className="hidden lg:flex items-center space-x-2">
              {/* Live Updates Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  autoRefresh 
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                    : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  {autoRefresh && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  )}
                  <RefreshCw className={`h-3.5 w-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
                  <span>{autoRefresh ? 'Live' : 'Paused'}</span>
                </div>
              </button>

              {/* Trading Controls Group */}
              <div className="flex items-center bg-gray-900/50 rounded-lg p-1 border border-gray-800">
                {status?.bot?.paused ? (
                  <Button
                    size="sm"
                    onClick={() => resumeMutation.mutate()}
                    disabled={resumeMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 h-auto rounded-md"
                  >
                    <Play className="h-3.5 w-3.5 mr-1.5" />
                    Resume
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => pauseMutation.mutate()}
                    disabled={pauseMutation.isPending}
                    className="bg-gray-800 hover:bg-yellow-600/20 text-yellow-500 hover:text-yellow-400 text-xs px-3 py-1.5 h-auto rounded-md border-0"
                  >
                    <Pause className="h-3.5 w-3.5 mr-1.5" />
                    Pause
                  </Button>
                )}
                <div className="w-px h-6 bg-gray-700 mx-1" />
                <Button
                  size="sm"
                  onClick={() => emergencyStopMutation.mutate()}
                  disabled={emergencyStopMutation.isPending}
                  className="bg-transparent hover:bg-red-600/20 text-red-500 hover:text-red-400 text-xs px-3 py-1.5 h-auto rounded-md border-0"
                >
                  <StopCircle className="h-3.5 w-3.5 mr-1.5" />
                  Stop
                </Button>
              </div>

              {/* Actions Dropdown Menu */}
              <div className="relative group">
                <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-medium transition-all border border-gray-700">
                  <Menu className="h-3.5 w-3.5" />
                  <span>Actions</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-gray-900 border border-gray-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100">
                  <div className="p-1">
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      disabled={clearDatabaseMutation.isPending}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs rounded-md hover:bg-orange-600/10 text-orange-400 hover:text-orange-300 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Clear Database</span>
                    </button>
                    {onLogout && (
                      <>
                        <div className="h-px bg-gray-800 my-1" />
                        <button
                          onClick={onLogout}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-xs rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>Logout</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button - Redesigned */}
            <div className="lg:hidden flex items-center space-x-2">
              {/* Mobile Live Indicator */}
              {autoRefresh && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="relative p-2 rounded-lg bg-gray-900/50 border border-gray-800 text-gray-400 hover:text-white transition-all"
              >
                <div className="relative w-6 h-6">
                  <span className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${mobileMenuOpen ? 'rotate-180 opacity-0' : 'rotate-0 opacity-100'}`}>
                    <Menu className="h-5 w-5" />
                  </span>
                  <span className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${mobileMenuOpen ? 'rotate-0 opacity-100' : '-rotate-180 opacity-0'}`}>
                    <X className="h-5 w-5" />
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Redesigned Slide Down */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="border-t border-gray-800/50 bg-black/60 backdrop-blur-xl">
            <div className="container mx-auto px-4 py-4">
              {/* Mobile Controls - Simplified Color Scheme */}
              <div className="space-y-2">
                {/* Live Updates Toggle */}
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    autoRefresh 
                      ? 'bg-gray-800 text-white border border-gray-700' 
                      : 'bg-gray-900/50 text-gray-400 border border-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                    <span>Live Updates</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    autoRefresh 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-gray-800 text-gray-500'
                  }`}>
                    {autoRefresh ? 'ON' : 'OFF'}
                  </span>
                </button>

                {/* Trading Control */}
                <div className="grid grid-cols-2 gap-2">
                  {status?.bot?.paused ? (
                    <Button
                      onClick={() => {
                        resumeMutation.mutate()
                        setMobileMenuOpen(false)
                      }}
                      disabled={resumeMutation.isPending}
                      className="col-span-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Resume Trading
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        pauseMutation.mutate()
                        setMobileMenuOpen(false)
                      }}
                      disabled={pauseMutation.isPending}
                      className="bg-gray-900/50 border-gray-700 hover:bg-gray-800 text-gray-300"
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  )}
                  {!status?.bot?.paused && (
                    <Button
                      onClick={() => {
                        emergencyStopMutation.mutate()
                        setMobileMenuOpen(false)
                      }}
                      disabled={emergencyStopMutation.isPending}
                      className="bg-gray-900/50 border-gray-700 hover:bg-gray-800 text-gray-300"
                    >
                      <StopCircle className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  )}
                </div>

                {/* Danger Zone */}
                <div className="pt-2 mt-2 border-t border-gray-800">
                  <p className="text-xs text-gray-500 mb-2 px-1">Danger Zone</p>
                  <button
                    onClick={() => {
                      setShowClearConfirm(true)
                      setMobileMenuOpen(false)
                    }}
                    disabled={clearDatabaseMutation.isPending}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 hover:bg-gray-800 text-gray-300 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Clear Database</span>
                  </button>
                </div>

                {/* Logout */}
                {onLogout && (
                  <button
                    onClick={() => {
                      onLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800 hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="relative rounded-xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm">
            {statusFetching && !isFirstLoad && (
              <div className="absolute top-2 right-2 z-10">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-ping"></div>
              </div>
            )}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Wallet Balance</CardTitle>
              <div className="p-2 bg-gray-800/50 rounded-lg">
                <Wallet className="h-4 w-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {formatNumber(status?.wallet?.balance || 0, 4)}
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

          <Card className="relative rounded-xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm">
            {statusFetching && !isFirstLoad && (
              <div className="absolute top-2 right-2 z-10">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-ping"></div>
              </div>
            )}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Trades</CardTitle>
              <div className="p-2 bg-gray-800/50 rounded-lg">
                <Activity className="h-4 w-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {status?.bot?.totalTrades || 0}
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

          <Card className="relative rounded-xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm">
            {(metricsFetching || statusFetching) && !isFirstLoad && (
              <div className="absolute top-2 right-2 z-10">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-ping"></div>
              </div>
            )}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Net Profit</CardTitle>
              <div className="p-2 bg-gray-800/50 rounded-lg">
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

          <Card className="relative rounded-xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm">
            {positionsFetching && !isFirstLoad && (
              <div className="absolute top-2 right-2 z-10">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-ping"></div>
              </div>
            )}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Open Positions</CardTitle>
              <div className="p-2 bg-gray-800/50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {positions?.length || 0}
              </div>
              <div className="flex items-center mt-2 space-x-1">
                <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
                <p className="text-xs text-gray-500">
                  Total value: <span className="font-medium text-gray-400">{formatSOL(
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
          <Card className="relative rounded-xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm">
            {volumeFetching && !isFirstLoad && (
              <div className="absolute top-4 right-4 z-10">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-ping"></div>
              </div>
            )}
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gray-800/50 rounded-xl">
                    <HardDrive className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-white mb-1">Database Volume</CardTitle>
                    <CardDescription className="text-sm text-gray-500">Storage usage and capacity</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    {volumeInfo.volume.usagePercent}
                  </p>
                  <p className="text-xs text-gray-500">Used</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="text-xs text-gray-500">Total</span>
                  </div>
                  <p className="text-base font-semibold text-white">
                    {volumeInfo.volume.totalGB} GB
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {formatNumber(volumeInfo.volume.totalBytes / 1024 / 1024 / 1024, 2)} GiB
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="text-xs text-gray-500">Used</span>
                  </div>
                  <p className="text-base font-semibold text-white">
                    {volumeInfo.volume.usedGB} GB
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {formatNumber(volumeInfo.volume.usedBytes / 1024 / 1024 / 1024, 2)} GiB
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="text-xs text-gray-500">Available</span>
                  </div>
                  <p className="text-base font-semibold text-white">
                    {volumeInfo.volume.availableGB} GB
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {formatNumber(volumeInfo.volume.availableBytes / 1024 / 1024 / 1024, 2)} GiB
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="text-xs text-gray-500">DB Size</span>
                  </div>
                  <p className="text-base font-semibold text-white">
                    {volumeInfo.volume.databaseSizeMB} MB
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
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
        <Card className="relative rounded-xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm">
          {chartFetching && !isFirstLoad && (
            <div className="absolute top-4 right-4 z-10">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-ping"></div>
            </div>
          )}
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-white mb-1">Performance Overview</CardTitle>
                <CardDescription className="text-sm text-gray-500">Daily profit/loss trends</CardDescription>
              </div>
              {formattedChartData.length > 0 && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
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
          <Card className="relative rounded-xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm">
            {positionsFetching && !isFirstLoad && (
              <div className="absolute top-4 right-4 z-10">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-ping"></div>
              </div>
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-white mb-1">Open Positions</CardTitle>
                  <CardDescription className="text-sm text-gray-500">Currently held tokens</CardDescription>
                </div>
                {positions && positions.length > 0 && (
                  <div className="px-2 py-1 bg-gray-800/50 rounded-full">
                    <span className="text-xs font-medium text-gray-400">{positions.length} active</span>
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
                      className="p-3 rounded-lg bg-gray-800/50 border border-gray-800"
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
          <Card className="relative rounded-xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm">
            {tradesFetching && !isFirstLoad && (
              <div className="absolute top-4 right-4 z-10">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-ping"></div>
              </div>
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-white mb-1">Recent Trades</CardTitle>
                  <CardDescription className="text-sm text-gray-500">Latest trading activity</CardDescription>
                </div>
                {trades?.trades && trades.trades.length > 0 && (
                  <div className="px-2 py-1 bg-gray-800/50 rounded-full">
                    <span className="text-xs font-medium text-gray-400">{trades.total} total</span>
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
                      className="p-3 rounded-lg bg-gray-800/50 border border-gray-800"
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
        <Card className="relative rounded-xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm">
          {signalsFetching && !isFirstLoad && (
            <div className="absolute top-4 right-4 z-10">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-ping"></div>
            </div>
          )}
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-white mb-1">Tracked Wallet Signals</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  Recent buy/sell activity from {walletSignals?.trackedWallet ? `${walletSignals.trackedWallet.slice(0, 6)}...${walletSignals.trackedWallet.slice(-4)}` : 'tracked wallet'}
                </CardDescription>
              </div>
              {walletSignals?.count ? (
                <div className="px-2 py-1 bg-gray-800/50 rounded-full">
                  <span className="text-xs font-medium text-gray-400">{walletSignals.count} signals</span>
                </div>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative max-h-[400px] overflow-y-auto scrollbar-custom">
              <div className="space-y-3 pr-3">
                {walletSignals?.signals && walletSignals.signals.length > 0 ? (
                  walletSignals.signals.map((signal, index) => (
                    <div 
                      key={signal.fullSignature || signal.signature}
                      className="p-3 rounded-lg bg-gray-800/50 border border-gray-800 mr-1"
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
