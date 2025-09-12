import React from 'react'
import { Wallet, DollarSign, TrendingUp, Activity, Clock } from 'lucide-react'
import MetricCard from '../Shared/MetricCard'
import SectionHeader from '../Shared/SectionHeader'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { formatNumber, formatSOL, formatTimeAgo } from '../../lib/utils'
import type { Position, Trade } from '../../lib/api'

interface OverviewProps {
  status: any
  metrics: any
  positions: Position[]
  trades: any
  statusFetching: boolean
  metricsFetching: boolean
  positionsFetching: boolean
  tradesFetching: boolean
  onPause: () => void
  onResume: () => void
  onEmergencyStop: () => void
  isPausing: boolean
  isResuming: boolean
  isStopping: boolean
}

export default function Overview({
  status,
  metrics,
  positions,
  trades,
  statusFetching,
  metricsFetching,
  positionsFetching,
  tradesFetching,
  onPause,
  onResume,
  onEmergencyStop,
  isPausing,
  isResuming,
  isStopping
}: OverviewProps) {
  // Calculate 24h performance (mock for now, would need historical data)
  const dayChange = metrics?.analysis?.netProfit ? 
    ((metrics.analysis.netProfit / (status?.wallet?.balance || 1)) * 100).toFixed(2) : 
    "0.00"

  return (
    <div className="space-y-6">
      {/* Key Metrics Section */}
      <div>
        <SectionHeader 
          title="Key Metrics" 
          subtitle="Essential trading performance indicators"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Wallet Balance"
            value={`${formatNumber(status?.wallet?.balance || 0, 4)} SOL`}
            subtitle={status?.wallet?.address ? 
              `${status.wallet.address.slice(0, 6)}...${status.wallet.address.slice(-4)}` : 
              'Not connected'
            }
            icon={Wallet}
            iconColor="text-purple-400"
            isFetching={statusFetching}
          />
          
          <MetricCard
            title="Net Profit/Loss"
            value={formatSOL(metrics?.analysis?.netProfit || status?.bot?.totalProfitLoss || 0)}
            subtitle={`Win rate: ${formatNumber(metrics?.analysis?.winRate || 0, 1)}%`}
            icon={DollarSign}
            iconColor={
              (metrics?.analysis?.netProfit || status?.bot?.totalProfitLoss || 0) >= 0 
                ? 'text-green-400' 
                : 'text-red-400'
            }
            valueColor={
              (metrics?.analysis?.netProfit || status?.bot?.totalProfitLoss || 0) >= 0 
                ? 'text-green-500' 
                : 'text-red-500'
            }
            isFetching={metricsFetching || statusFetching}
          />
          
          <MetricCard
            title="Active Positions"
            value={positions?.length || 0}
            subtitle={`Value: ${formatSOL(
              positions?.reduce((sum: number, p: any) => sum + (p.currentValue || 0), 0) || 0
            )}`}
            icon={TrendingUp}
            iconColor="text-blue-400"
            isFetching={positionsFetching}
          />
          
          <MetricCard
            title="24h Performance"
            value={`${dayChange}%`}
            subtitle={`${status?.bot?.totalTrades || 0} trades today`}
            icon={Clock}
            iconColor="text-yellow-400"
            valueColor={parseFloat(dayChange) >= 0 ? 'text-green-500' : 'text-red-500'}
            isFetching={statusFetching}
          />
        </div>
      </div>

      {/* Live Activity Feed */}
      <div>
        <SectionHeader 
          title="Live Trading Activity" 
          subtitle="Recent trades and market actions"
          action={
            trades?.trades?.length > 0 && (
              <span className="text-xs text-gray-400">
                {trades.total} total trades
              </span>
            )
          }
        />
        <Card className="rounded-xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm">
          <CardContent className="p-4">
            {trades?.trades && trades.trades.length > 0 ? (
              <div className="space-y-2">
                {trades.trades.slice(0, 5).map((trade: Trade) => (
                  <div 
                    key={trade.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-800 hover:border-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        trade.action === 'BUY' 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {trade.action}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {`${trade.token_address.slice(0, 6)}...${trade.token_address.slice(-4)}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTimeAgo(trade.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-300">
                        {formatNumber(trade.amount_sol, 4)} SOL
                      </p>
                      {trade.status === 'FAILED' && (
                        <p className="text-xs text-red-400">Failed</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No recent trades</p>
                <p className="text-xs text-gray-600 mt-1">Trades will appear here as they execute</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <SectionHeader 
          title="Quick Actions" 
          subtitle="Control your trading bot"
        />
        <div className="flex flex-wrap gap-3">
          {status?.bot?.paused ? (
            <Button
              onClick={onResume}
              disabled={isResuming}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isResuming ? 'Resuming...' : '▶️ Resume Trading'}
            </Button>
          ) : (
            <Button
              onClick={onPause}
              disabled={isPausing}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {isPausing ? 'Pausing...' : '⏸️ Pause Trading'}
            </Button>
          )}
          
          <Button
            onClick={onEmergencyStop}
            disabled={isStopping}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            {isStopping ? 'Stopping...' : '🛑 Emergency Stop'}
          </Button>
        </div>
      </div>
    </div>
  )
}