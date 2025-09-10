import React from 'react'
import { 
  Activity, 
  Database, 
  Globe, 
  Zap,
  Wifi,
  Monitor,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Cpu,
  HardDrive,
  Server,
  MemoryStick,
  Gauge,
  Package
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { formatNumber } from '../lib/utils'
import type { DetailedHealth, ServiceHealth } from '../lib/api'

interface HealthStatusProps {
  health: DetailedHealth | undefined
  isLoading: boolean
  isFetching?: boolean
}


const getServiceIcon = (serviceName: string) => {
  const name = serviceName.toLowerCase()
  if (name.includes('websocket')) return <Wifi className="h-3.5 w-3.5 text-gray-400" />
  if (name.includes('database')) return <Database className="h-3.5 w-3.5 text-gray-400" />
  if (name.includes('solana') || name.includes('rpc')) return <Globe className="h-3.5 w-3.5 text-gray-400" />
  if (name.includes('jupiter')) return <Zap className="h-3.5 w-3.5 text-gray-400" />
  if (name.includes('dex')) return <Activity className="h-3.5 w-3.5 text-gray-400" />
  if (name.includes('monitor')) return <Monitor className="h-3.5 w-3.5 text-gray-400" />
  return <Globe className="h-3.5 w-3.5 text-gray-400" />
}

const formatUptime = (seconds: number) => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

const formatBytes = (bytes: number) => {
  const mb = bytes / 1024 / 1024
  return `${mb.toFixed(1)} MB`
}

const formatMemory = (value: number, isGB: boolean = false) => {
  if (isGB) {
    // Value is already in GB
    if (value < 1) {
      return `${(value * 1024).toFixed(0)} MB`
    }
    return `${value.toFixed(2)} GB`
  }
  // Value is in bytes
  return formatBytes(value)
}

const ServiceCard: React.FC<{ service: ServiceHealth; serviceName: string; isFetching?: boolean }> = ({ service, serviceName, isFetching }) => {
  
  // Determine primary metric to display
  const getPrimaryMetric = () => {
    if (service.latency !== undefined && service.latency > 0) {
      return { value: `${service.latency}ms`, label: 'Latency' }
    }
    if (service.details?.slot) {
      return { value: `${(service.details.slot / 1000).toFixed(0)}k`, label: 'Slot' }
    }
    if (service.details?.subscriptions !== undefined) {
      return { value: service.details.subscriptions.toString(), label: 'Subs' }
    }
    return { value: service.status, label: 'Status' }
  }

  const primaryMetric = getPrimaryMetric()
  
  return (
    <div className="relative rounded-xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm">
      {isFetching && (
        <div className="absolute top-2 right-2 z-10">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-ping"></div>
        </div>
      )}
      
      <div className="flex flex-col h-full">
        {/* Header matching top cards */}
        <div className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{service.name}</h3>
          <div className="p-2 bg-gray-800/50 rounded-lg">
            {getServiceIcon(serviceName)}
          </div>
        </div>
        
        {/* Content matching top cards */}
        <div className="px-4 pb-4">
          <div className="text-2xl font-bold text-white">
            {primaryMetric.value}
          </div>
          <div className="flex items-center mt-2 space-x-2">
            <div className={`w-1 h-1 rounded-full ${
              service.status === 'healthy' ? 'bg-green-400 animate-pulse' :
              service.status === 'unhealthy' ? 'bg-red-400' :
              service.status === 'degraded' ? 'bg-yellow-400' :
              'bg-gray-400'
            }`} />
            <p className="text-xs text-gray-500">
              {primaryMetric.label}: <span className={`font-medium ${
                service.status === 'healthy' ? 'text-green-400' :
                service.status === 'unhealthy' ? 'text-red-400' :
                service.status === 'degraded' ? 'text-yellow-400' :
                'text-gray-400'
              }`}>{service.status}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HealthStatus({ health, isLoading, isFetching }: HealthStatusProps) {
  if (isLoading || !health) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-20 bg-gray-800 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-32 bg-gray-800 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Health Status - Simplified */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm p-6">
        {isFetching && !isLoading && (
          <div className="absolute top-4 right-4 z-10">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-ping"></div>
          </div>
        )}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">System Health</h2>
            <p className="text-sm text-gray-500">Overall system status and performance metrics</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              health.overall === 'healthy' ? 'bg-green-500' :
              health.overall === 'unhealthy' ? 'bg-red-500' :
              health.overall === 'degraded' ? 'bg-yellow-500' :
              'bg-gray-500'
            } ${health.overall === 'healthy' ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-medium text-gray-300 capitalize">{health.overall}</span>
          </div>
        </div>
        
        {/* Basic Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center space-x-1.5 mb-1">
              <Clock className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs text-gray-500">Uptime</span>
            </div>
            <p className="text-base font-semibold text-white">
              {formatUptime(health.uptime)}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center space-x-1.5 mb-1">
              <HardDrive className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs text-gray-500">Heap Memory</span>
            </div>
            <p className="text-base font-semibold text-white">
              {formatBytes(health.metrics.memoryUsage.heapUsed)}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              {health.metrics.memoryUsage.percentage.toFixed(1)}% used
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center space-x-1.5 mb-1">
              <Cpu className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs text-gray-500">CPU User</span>
            </div>
            <p className="text-base font-semibold text-white">
              {health.metrics.cpuUsage ? `${(health.metrics.cpuUsage.user / 1000000).toFixed(2)}s` : 'N/A'}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center space-x-1.5 mb-1">
              <Cpu className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs text-gray-500">CPU System</span>
            </div>
            <p className="text-base font-semibold text-white">
              {health.metrics.cpuUsage ? `${(health.metrics.cpuUsage.system / 1000000).toFixed(2)}s` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Detailed Memory Information */}
        {health.metrics.memoryDetails && (
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Memory Details</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center space-x-1.5 mb-1">
                  <MemoryStick className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-xs text-gray-500">V8 Heap</span>
                </div>
                <p className="text-base font-semibold text-white">
                  {formatBytes(health.metrics.memoryDetails.v8HeapStats.usedHeapSize)}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  of {formatBytes(health.metrics.memoryDetails.v8HeapStats.heapSizeLimit)}
                </p>
              </div>
              {health.metrics.memoryDetails.systemMemory && (
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <Server className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-xs text-gray-500">System Memory</span>
                  </div>
                  <p className="text-base font-semibold text-white">
                    {formatMemory(health.metrics.memoryDetails.systemMemory.used, true)}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {health.metrics.memoryDetails.systemMemory.usagePercent.toFixed(1)}% of {formatMemory(health.metrics.memoryDetails.systemMemory.total, true)}
                  </p>
                </div>
              )}
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center space-x-1.5 mb-1">
                  <Gauge className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-xs text-gray-500">Memory Health</span>
                </div>
                <p className={`text-base font-semibold ${
                  health.metrics.memoryDetails.health.status === 'healthy' ? 'text-green-400' :
                  health.metrics.memoryDetails.health.status === 'warning' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {health.metrics.memoryDetails.health.status}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {health.metrics.memoryDetails.health.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Application Data */}
        {health.metrics.applicationData && (
          <div className="space-y-3 mt-4">
            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Application Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center space-x-1.5 mb-1">
                  <Activity className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-xs text-gray-500">Wallet Monitor</span>
                </div>
                <p className="text-base font-semibold text-white">
                  {health.metrics.applicationData.walletMonitor.recentSignals || 0}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">Recent signals</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center space-x-1.5 mb-1">
                  <Package className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-xs text-gray-500">Position Manager</span>
                </div>
                <p className="text-base font-semibold text-white">
                  {health.metrics.applicationData.positionManager.openPositions}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">Open positions</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center space-x-1.5 mb-1">
                  <Zap className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-xs text-gray-500">Trade Processor</span>
                </div>
                <p className="text-base font-semibold text-white">
                  {health.metrics.applicationData.tradeProcessor.successful}/{health.metrics.applicationData.tradeProcessor.totalProcessed}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Success rate: {health.metrics.applicationData.tradeProcessor.totalProcessed > 0 
                    ? `${((health.metrics.applicationData.tradeProcessor.successful / health.metrics.applicationData.tradeProcessor.totalProcessed) * 100).toFixed(1)}%`
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Service Status Grid - Cleaner */}
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-4">Service Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(health.services).map(([key, service]) => (
            <ServiceCard key={key} service={service} serviceName={key} isFetching={isFetching && !isLoading} />
          ))}
        </div>
      </div>
    </div>
  )
}
