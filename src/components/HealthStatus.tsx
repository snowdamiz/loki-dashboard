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
  HardDrive
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { formatNumber } from '../lib/utils'
import type { DetailedHealth, ServiceHealth } from '../lib/api'

interface HealthStatusProps {
  health: DetailedHealth | undefined
  isLoading: boolean
  isFetching?: boolean
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'unhealthy':
      return <XCircle className="h-4 w-4 text-red-500" />
    case 'degraded':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy':
      return 'text-green-500 bg-green-500/10 border-green-500/20'
    case 'unhealthy':
      return 'text-red-500 bg-red-500/10 border-red-500/20'
    case 'degraded':
      return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
    default:
      return 'text-gray-500 bg-gray-500/10 border-gray-500/20'
  }
}

const getServiceIcon = (serviceName: string) => {
  const name = serviceName.toLowerCase()
  if (name.includes('websocket')) return <Wifi className="h-5 w-5" />
  if (name.includes('database')) return <Database className="h-5 w-5" />
  if (name.includes('solana') || name.includes('rpc')) return <Globe className="h-5 w-5" />
  if (name.includes('jupiter')) return <Zap className="h-5 w-5" />
  if (name.includes('dex')) return <Activity className="h-5 w-5" />
  if (name.includes('monitor')) return <Monitor className="h-5 w-5" />
  return <Globe className="h-5 w-5" />
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

const ServiceCard: React.FC<{ service: ServiceHealth; serviceName: string; isFetching?: boolean }> = ({ service, serviceName, isFetching }) => {
  const statusColor = getStatusColor(service.status)
  
  return (
    <Card className="relative bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-colors">
      {isFetching && (
        <div className="absolute top-2 right-2 z-10">
          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping"></div>
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
              {getServiceIcon(serviceName)}
            </div>
            <div>
              <CardTitle className="text-sm font-medium">{service.name}</CardTitle>
              {service.latency !== undefined && service.latency > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  <Clock className="inline h-3 w-3 mr-1" />
                  {service.latency}ms
                </p>
              )}
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full flex items-center space-x-1 border ${statusColor}`}>
            {getStatusIcon(service.status)}
            <span className="text-xs font-medium capitalize">{service.status}</span>
          </div>
        </div>
      </CardHeader>
      {service.details && Object.keys(service.details).length > 0 && (
        <CardContent className="pt-0">
          <div className="text-xs space-y-1">
            {service.details.connected !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-500">Connected:</span>
                <span className={service.details.connected ? 'text-green-500' : 'text-red-500'}>
                  {service.details.connected ? 'Yes' : 'No'}
                </span>
              </div>
            )}
            {service.details.endpoint && (
              <div className="flex justify-between">
                <span className="text-gray-500">Endpoint:</span>
                <span className="text-gray-400 truncate max-w-[150px]" title={service.details.endpoint}>
                  {service.details.endpoint.replace(/https?:\/\//, '').split('/')[0]}
                </span>
              </div>
            )}
            {service.details.slot && (
              <div className="flex justify-between">
                <span className="text-gray-500">Slot:</span>
                <span className="text-gray-400">{service.details.slot.toLocaleString()}</span>
              </div>
            )}
            {service.details.subscriptions !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-500">Subscriptions:</span>
                <span className="text-gray-400">{service.details.subscriptions}</span>
              </div>
            )}
            {service.details.statusCode && (
              <div className="flex justify-between">
                <span className="text-gray-500">Status Code:</span>
                <span className={service.details.statusCode === 200 ? 'text-green-500' : 'text-yellow-500'}>
                  {service.details.statusCode}
                </span>
              </div>
            )}
            {service.details.cacheStatus && (
              <div className="flex justify-between">
                <span className="text-gray-500">Cache:</span>
                <span className="text-gray-400 capitalize">{service.details.cacheStatus}</span>
              </div>
            )}
            {service.details.dryRun !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-500">Mode:</span>
                <span className={service.details.dryRun ? 'text-yellow-500' : 'text-green-500'}>
                  {service.details.dryRun ? 'Dry Run' : 'Live'}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
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

  const overallStatusColor = getStatusColor(health.overall)

  return (
    <div className="space-y-6">
      {/* Overall Health Status */}
      <Card className="relative bg-gray-900/50 border-gray-800">
        {isFetching && !isLoading && (
          <div className="absolute top-4 right-4 z-10">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
          </div>
        )}
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <Activity className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Overall system status and metrics</CardDescription>
              </div>
            </div>
            <div className={`px-3 py-2 rounded-full flex items-center space-x-2 border ${overallStatusColor}`}>
              {getStatusIcon(health.overall)}
              <span className="text-sm font-medium capitalize">{health.overall}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-xs text-gray-500">Uptime</span>
              </div>
              <p className="text-lg font-semibold text-white mt-1">
                {formatUptime(health.uptime)}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <HardDrive className="h-4 w-4 text-gray-500" />
                <span className="text-xs text-gray-500">Memory</span>
              </div>
              <p className="text-lg font-semibold text-white mt-1">
                {formatBytes(health.metrics.memoryUsage.heapUsed)}
              </p>
              <p className="text-xs text-gray-500">
                {health.metrics.memoryUsage.percentage.toFixed(1)}% used
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Cpu className="h-4 w-4 text-gray-500" />
                <span className="text-xs text-gray-500">CPU User</span>
              </div>
              <p className="text-lg font-semibold text-white mt-1">
                {(health.metrics.cpuUsage.user / 1000).toFixed(1)}s
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Cpu className="h-4 w-4 text-gray-500" />
                <span className="text-xs text-gray-500">CPU System</span>
              </div>
              <p className="text-lg font-semibold text-white mt-1">
                {(health.metrics.cpuUsage.system / 1000).toFixed(1)}s
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Status Grid */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Service Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(health.services).map(([key, service]) => 
            service ? (
              <ServiceCard key={key} service={service} serviceName={key} isFetching={isFetching && !isLoading} />
            ) : null
          )}
        </div>
      </div>
    </div>
  )
}
