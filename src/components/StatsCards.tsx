import React from 'react'
import { 
  Activity, 
  DollarSign, 
  TrendingUp,
  Wallet
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { formatNumber, formatSOL } from '../lib/utils'
import type { Position } from '../lib/api'

interface StatsCardsProps {
  status: any
  metrics: any
  positions: Position[]
  statusFetching: boolean
  metricsFetching: boolean
  positionsFetching: boolean
  isFirstLoad: boolean
}

export default function StatsCards({ 
  status, 
  metrics, 
  positions, 
  statusFetching, 
  metricsFetching, 
  positionsFetching, 
  isFirstLoad 
}: StatsCardsProps) {
  return (
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
  )
}
