import React from 'react'
import SectionHeader from '../Shared/SectionHeader'
import PerformanceChart from '../PerformanceChart'
import RecentTrades from '../RecentTrades'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { formatNumber, formatSOL } from '../../lib/utils'
import { TrendingUp, TrendingDown, Activity, Award } from 'lucide-react'

interface TradingProps {
  chartData: any
  trades: any
  metrics: any
  chartFetching: boolean
  tradesFetching: boolean
  metricsFetching: boolean
}

export default function Trading({
  chartData,
  trades,
  metrics,
  chartFetching,
  tradesFetching,
  metricsFetching
}: TradingProps) {
  return (
    <div className="space-y-6">
      {/* Trading Analytics */}
      <div>
        <SectionHeader 
          title="Trading Analytics" 
          subtitle="Performance metrics and statistics"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Win Rate */}
          <Card className="rounded-xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Win Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(metrics?.analysis?.winRate || 0, 1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {metrics?.analysis?.winningTrades || 0}/{metrics?.analysis?.totalTrades || 0} wins
                  </p>
                </div>
                <Award className="h-8 w-8 text-green-400/20" />
              </div>
            </CardContent>
          </Card>

          {/* Total Profit */}
          <Card className="rounded-xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Total Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-500">
                    {formatSOL(metrics?.analysis?.totalProfit || 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    From {metrics?.analysis?.winningTrades || 0} trades
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400/20" />
              </div>
            </CardContent>
          </Card>

          {/* Total Loss */}
          <Card className="rounded-xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Total Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-500">
                    {formatSOL(metrics?.analysis?.totalLoss || 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    From {metrics?.analysis?.losingTrades || 0} trades
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-400/20" />
              </div>
            </CardContent>
          </Card>

          {/* Profit Factor */}
          <Card className="rounded-xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Profit Factor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(metrics?.analysis?.profitFactor || 0, 2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Profit/Loss ratio
                  </p>
                </div>
                <Activity className="h-8 w-8 text-purple-400/20" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Performance Chart */}
      <div>
        <SectionHeader 
          title="Performance Chart" 
          subtitle="Daily profit and loss visualization"
        />
        <PerformanceChart 
          chartData={chartData}
          chartFetching={chartFetching}
          isFirstLoad={false}
        />
      </div>

      {/* Recent Trades - Full Width */}
      <div>
        <SectionHeader 
          title="Trade History" 
          subtitle="Complete list of recent trading activity"
        />
        <RecentTrades 
          trades={trades}
          tradesFetching={tradesFetching}
          isFirstLoad={false}
        />
      </div>
    </div>
  )
}