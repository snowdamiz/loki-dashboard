import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import lokiApi, { type Position } from '../lib/api'
import Header from './Header'
import ClearDatabaseDialog from './ClearDatabaseDialog'
import TabNav, { type TabType } from './Navigation/TabNav'
import MobileNav from './Navigation/MobileNav'
import Overview from './Pages/Overview'
import Trading from './Pages/Trading'
import Positions from './Pages/Positions'
import System from './Pages/System'

interface DashboardProps {
  onLogout?: () => void
}

export default function Dashboard({ onLogout }: DashboardProps = {}) {
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [isDownloading, setIsDownloading] = useState(false)
  
  const queryClient = useQueryClient()

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

  // Mutations for bot control
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

  // Download database handler
  const handleDownloadDatabase = async (hours: number) => {
    try {
      setIsDownloading(true)
      const response = await lokiApi.downloadDatabase(hours)
      
      // Create blob from response
      const blob = new Blob([response.data], { type: 'application/zip' })
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `loki-data-${hours}h-${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download database:', error)
    } finally {
      setIsDownloading(false)
    }
  }

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
      />

      {/* Tab Navigation */}
      <div className="container mx-auto px-4 py-2">
        <TabNav 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        />
        <MobileNav 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-2 sm:py-4 lg:py-6 pb-20 lg:pb-8">
        {activeTab === 'overview' && (
          <Overview
            status={status}
            metrics={metrics}
            positions={positions}
            trades={trades}
            statusFetching={statusFetching}
            metricsFetching={metricsFetching}
            positionsFetching={positionsFetching}
            tradesFetching={tradesFetching}
            onPause={() => pauseMutation.mutate()}
            onResume={() => resumeMutation.mutate()}
            onEmergencyStop={() => emergencyStopMutation.mutate()}
            isPausing={pauseMutation.isPending}
            isResuming={resumeMutation.isPending}
            isStopping={emergencyStopMutation.isPending}
          />
        )}
        
        {activeTab === 'trading' && (
          <Trading
            chartData={chartData}
            trades={trades}
            metrics={metrics}
            chartFetching={chartFetching}
            tradesFetching={tradesFetching}
            metricsFetching={metricsFetching}
          />
        )}
        
        {activeTab === 'positions' && (
          <Positions
            positions={positions}
            walletSignals={walletSignals}
            positionsFetching={positionsFetching}
            signalsFetching={signalsFetching}
          />
        )}
        
        {activeTab === 'system' && (
          <System
            detailedHealth={detailedHealth}
            volumeInfo={volumeInfo}
            healthFetching={healthFetching}
            volumeFetching={volumeFetching}
            onClearDatabase={() => setShowClearConfirm(true)}
            onDownloadDatabase={handleDownloadDatabase}
            isDownloading={isDownloading}
          />
        )}
      </main>
    </div>
  )
}
