import React from 'react'
import { Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { formatNumber, formatTimeAgo } from '../lib/utils'
import type { Trade } from '../lib/api'

interface RecentTradesProps {
  trades: any
  tradesFetching: boolean
  isFirstLoad: boolean
}

export default function RecentTrades({ trades, tradesFetching, isFirstLoad }: RecentTradesProps) {
  return (
    <Card className="relative rounded-xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm">
      {tradesFetching && !isFirstLoad && (
        <div className="absolute top-4 right-4 z-10">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-ping"></div>
        </div>
      )}
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-white mb-1">Recent Trades</CardTitle>
            <CardDescription className="text-sm text-gray-500">Latest trading activity</CardDescription>
          </div>
          {trades?.trades && trades.trades.length > 0 && (
            <div className="px-2 py-1 bg-gray-800/50 rounded-full">
              <span className="text-xs font-medium text-gray-400">{trades.total} total</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {trades?.trades && trades.trades.length > 0 ? (
            trades.trades.slice(0, 5).map((trade: Trade, index: number) => (
              <div 
                key={trade.id} 
                className="p-3 rounded-lg bg-gray-800/50 border border-gray-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        trade.action === 'BUY' 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {trade.action}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {`${trade.token_address.slice(0, 6)}...${trade.token_address.slice(-4)}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTimeAgo(trade.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-300">
                      {formatNumber(trade.amount_sol, 4)} SOL
                    </p>
                    {trade.token_amount > 0 && (
                      <p className="text-xs text-gray-500">
                        {formatNumber(trade.token_amount, 2)} tokens
                      </p>
                    )}
                    {trade.status === 'FAILED' && (
                      <p className="text-xs text-red-400 mt-1">Failed</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No recent trades</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
