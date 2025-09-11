import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import lokiApi, { type Position } from '../lib/api'
import HealthStatus from './HealthStatus'
import Header from './Header'
import ClearDatabaseDialog from './ClearDatabaseDialog'
import StatsCards from './StatsCards'
import VolumeCard from './VolumeCard'
import PerformanceChart from './PerformanceChart'
import OpenPositions from './OpenPositions'
import RecentTrades from './RecentTrades'
import WalletSignals from './WalletSignals'

interface DashboardProps {
  onLogout?: () => void
}

export default function Dashboard({ onLogout }: DashboardProps = {}) {
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
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
      <ClearDatabaseDialog 
        show={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
      />

      {/* Header Component */}
      <Header 
        status={status}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        onLogout={onLogout}
        onClearDatabase={() => setShowClearConfirm(true)}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Stats Cards */}
        <StatsCards 
          status={status}
          metrics={metrics}
          positions={positions}
          statusFetching={statusFetching}
          metricsFetching={metricsFetching}
          positionsFetching={positionsFetching}
          isFirstLoad={isFirstLoad}
        />

        {/* Health Status Panel */}
        <HealthStatus health={detailedHealth} isLoading={healthLoading} isFetching={healthFetching && !isFirstLoad} />

        {/* DB Volume Card */}
        <VolumeCard 
          volumeInfo={volumeInfo}
          volumeFetching={volumeFetching}
          isFirstLoad={isFirstLoad}
        />

        {/* Performance Chart */}
        <PerformanceChart 
          chartData={chartData}
          chartFetching={chartFetching}
          isFirstLoad={isFirstLoad}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Open Positions */}
          <OpenPositions 
            positions={positions}
            positionsFetching={positionsFetching}
            isFirstLoad={isFirstLoad}
          />

          {/* Recent Trades */}
          <RecentTrades 
            trades={trades}
            tradesFetching={tradesFetching}
            isFirstLoad={isFirstLoad}
          />
        </div>

        {/* Wallet Signals */}
        <WalletSignals 
          walletSignals={walletSignals}
          signalsFetching={signalsFetching}
          isFirstLoad={isFirstLoad}
        />
      </main>
    </div>
  )
}
