import React from 'react'
import SectionHeader from '../Shared/SectionHeader'
import OpenPositions from '../OpenPositions'
import WalletSignals from '../WalletSignals'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { formatSOL, formatPercent, formatNumber } from '../../lib/utils'
import { PieChart, BarChart, TrendingUp, AlertTriangle } from 'lucide-react'
import type { Position, WalletSignalsResponse } from '../../lib/api'

interface PositionsProps {
  positions: Position[]
  walletSignals: WalletSignalsResponse | undefined
  positionsFetching: boolean
  signalsFetching: boolean
}

export default function Positions({
  positions,
  walletSignals,
  positionsFetching,
  signalsFetching
}: PositionsProps) {
  // Callback to refresh positions after closing
  const handlePositionClosed = () => {
    // This will trigger a refresh in the parent component
    // The parent should handle the actual refresh logic
    window.dispatchEvent(new CustomEvent('positionClosed'))
  }
  // Calculate portfolio analytics
  const totalValue = positions?.reduce((sum, p) => sum + (p.currentValue || 0), 0) || 0
  const totalCost = positions?.reduce((sum, p) => sum + (p.entryValue || p.cost_basis || 0), 0) || 0
  const totalPL = positions?.reduce((sum, p) => sum + (p.profitLoss || 0), 0) || 0
  const avgPLPercent = positions?.length > 0 
    ? positions.reduce((sum, p) => sum + (p.profitLossPercent || 0), 0) / positions.length 
    : 0
  
  const winners = positions?.filter(p => p.profitLoss > 0) || []
  const losers = positions?.filter(p => p.profitLoss < 0) || []

  return (
    <div className="space-y-6">
      {/* Portfolio Analytics */}
      <div>
        <SectionHeader 
          title="Portfolio Analytics" 
          subtitle="Position distribution and performance"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Portfolio Value */}
          <Card className="rounded-xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Portfolio Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">
                    {formatSOL(totalValue)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {positions?.length || 0} positions
                  </p>
                </div>
                <PieChart className="h-8 w-8 text-purple-400/20" />
              </div>
            </CardContent>
          </Card>

          {/* Total P&L */}
          <Card className="rounded-xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Total P&L
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className={`text-2xl font-bold ${totalPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatSOL(totalPL)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatPercent(totalCost > 0 ? (totalPL / totalCost) * 100 : 0)}
                  </p>
                </div>
                <TrendingUp className={`h-8 w-8 ${totalPL >= 0 ? 'text-green-400/20' : 'text-red-400/20'}`} />
              </div>
            </CardContent>
          </Card>

          {/* Winners/Losers */}
          <Card className="rounded-xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Win/Loss Ratio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">
                    {winners.length}/{losers.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {positions?.length > 0 
                      ? `${formatNumber((winners.length / positions.length) * 100, 1)}% winning`
                      : 'No positions'
                    }
                  </p>
                </div>
                <BarChart className="h-8 w-8 text-blue-400/20" />
              </div>
            </CardContent>
          </Card>

          {/* Average P&L */}
          <Card className="rounded-xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Average P&L
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className={`text-2xl font-bold ${avgPLPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercent(avgPLPercent)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Per position
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-400/20" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Open Positions - Full Width */}
      <div>
        <SectionHeader 
          title="Open Positions" 
          subtitle="Currently held tokens and their performance"
        />
        <OpenPositions 
          positions={positions}
          positionsFetching={positionsFetching}
          isFirstLoad={false}
          onPositionClosed={handlePositionClosed}
        />
      </div>

      {/* Wallet Signals */}
      <div>
        <SectionHeader 
          title="Wallet Signals" 
          subtitle="Trading signals from tracked wallet"
        />
        <WalletSignals 
          walletSignals={walletSignals}
          signalsFetching={signalsFetching}
          isFirstLoad={false}
        />
      </div>
    </div>
  )
}