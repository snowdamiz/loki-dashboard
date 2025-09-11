import React from 'react'
import { TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { formatNumber, formatSOL, formatPercent } from '../lib/utils'
import type { Position } from '../lib/api'

interface OpenPositionsProps {
  positions: Position[]
  positionsFetching: boolean
  isFirstLoad: boolean
}

export default function OpenPositions({ positions, positionsFetching, isFirstLoad }: OpenPositionsProps) {
  return (
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
  )
}
