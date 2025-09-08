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
      return 'text-green-400 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30'
    case 'unhealthy':
      return 'text-red-400 bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/30'
    case 'degraded':
      return 'text-yellow-400 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
    default:
      return 'text-gray-400 bg-gradient-to-br from-gray-500/10 to-gray-600/10 border-gray-500/30'
  }
}

const getServiceIcon = (serviceName: string) => {
  const name = serviceName.toLowerCase()
  if (name.includes('websocket')) return <Wifi className="h-5 w-5 text-purple-500" />
  if (name.includes('database')) return <Database className="h-5 w-5 text-purple-500" />
  if (name.includes('solana') || name.includes('rpc')) return <Globe className="h-5 w-5 text-purple-500" />
  if (name.includes('jupiter')) return <Zap className="h-5 w-5 text-purple-500" />
  if (name.includes('dex')) return <Activity className="h-5 w-5 text-purple-500" />
  if (name.includes('monitor')) return <Monitor className="h-5 w-5 text-purple-500" />
  return <Globe className="h-5 w-5 text-purple-500" />
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
    <Card className="relative glass-effect border-gray-800/50 animated-border card-hover-lift group">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      {isFetching && (
        <div className="absolute top-2 right-2 z-10">
          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping"></div>
        </div>
      )}
      <CardHeader className="pb-3 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
              {getServiceIcon(serviceName)}
            </div>
            <div>
              <CardTitle className="text-xs font-semibold text-purple-400 uppercase tracking-wider">{service.name}</CardTitle>
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
      <Card className="relative glass-effect border-gray-800/50 animated-border card-hover-lift">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 to-transparent opacity-50"></div>
        {isFetching && !isLoading && (
          <div className="absolute top-4 right-4 z-10">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
          </div>
        )}
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
                <Activity className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-xs font-semibold text-purple-400 uppercase tracking-wider">System Health</CardTitle>
                <CardDescription className="text-gray-500 text-xs">Overall system status and metrics</CardDescription>
              </div>
            </div>
            <div className={`px-3 py-2 rounded-full flex items-center space-x-2 border ${overallStatusColor}`}>
              {getStatusIcon(health.overall)}
              <span className="text-sm font-medium capitalize">{health.overall}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-effect rounded-lg p-3 border border-gray-800/50 group hover:border-purple-500/30 transition-all">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="h-3 w-3 text-purple-400" />
                <span className="text-xs text-gray-400 uppercase tracking-wider">Uptime</span>
              </div>
              <p className="text-lg font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                {formatUptime(health.uptime)}
              </p>
            </div>
            <div className="glass-effect rounded-lg p-3 border border-gray-800/50 group hover:border-purple-500/30 transition-all">
              <div className="flex items-center space-x-2 mb-1">
                <HardDrive className="h-3 w-3 text-purple-400" />
                <span className="text-xs text-gray-400 uppercase tracking-wider">Memory</span>
              </div>
              <p className="text-lg font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                {formatBytes(health.metrics.memoryUsage.heapUsed)}
              </p>
              <p className="text-xs text-gray-500">
                {health.metrics.memoryUsage.percentage.toFixed(1)}% used
              </p>
            </div>
            <div className="glass-effect rounded-lg p-3 border border-gray-800/50 group hover:border-purple-500/30 transition-all">
              <div className="flex items-center space-x-2 mb-1">
                <Cpu className="h-3 w-3 text-purple-400" />
                <span className="text-xs text-gray-400 uppercase tracking-wider">CPU User</span>
              </div>
              <p className="text-lg font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                {(health.metrics.cpuUsage.user / 1000).toFixed(1)}s
              </p>
            </div>
            <div className="glass-effect rounded-lg p-3 border border-gray-800/50 group hover:border-purple-500/30 transition-all">
              <div className="flex items-center space-x-2 mb-1">
                <Cpu className="h-3 w-3 text-purple-400" />
                <span className="text-xs text-gray-400 uppercase tracking-wider">CPU System</span>
              </div>
              <p className="text-lg font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                {(health.metrics.cpuUsage.system / 1000).toFixed(1)}s
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Status Grid */}
      <div>
        <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-4">Service Status</h3>
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
