import React from 'react'
import { 
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { formatNumber, formatTimeAgo } from '../lib/utils'
import type { WalletSignalsResponse } from '../lib/api'

interface WalletSignalsProps {
  walletSignals: WalletSignalsResponse | undefined
  signalsFetching: boolean
  isFirstLoad: boolean
}

export default function WalletSignals({ walletSignals, signalsFetching, isFirstLoad }: WalletSignalsProps) {
  return (
    <Card className="relative rounded-xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm">
      {signalsFetching && !isFirstLoad && (
        <div className="absolute top-4 right-4 z-10">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-ping"></div>
        </div>
      )}
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-white mb-1">Tracked Wallet Signals</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Recent buy/sell activity from {walletSignals?.trackedWallet ? `${walletSignals.trackedWallet.slice(0, 6)}...${walletSignals.trackedWallet.slice(-4)}` : 'tracked wallet'}
            </CardDescription>
          </div>
          {walletSignals?.count ? (
            <div className="px-2 py-1 bg-gray-800/50 rounded-full">
              <span className="text-xs font-medium text-gray-400">{walletSignals.count} signals</span>
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative max-h-[400px] overflow-y-auto scrollbar-custom">
          <div className="space-y-3 pr-3">
            {walletSignals?.signals && walletSignals.signals.length > 0 ? (
              walletSignals.signals.map((signal, index) => (
                <div 
                  key={signal.fullSignature || signal.signature}
                  className="p-3 rounded-lg bg-gray-800/50 border border-gray-800 mr-1"
                >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {signal.action === 'BUY' ? (
                          <ArrowUpRight className="h-4 w-4 text-green-400" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-400" />
                        )}
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          signal.action === 'BUY' 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {signal.action}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Zap className="h-3 w-3 text-yellow-400" />
                        <span className="text-xs text-yellow-400 font-medium">{signal.dex}</span>
                      </div>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <span className="text-gray-500">{signal.action === 'BUY' ? 'Spent:' : 'Sold:'}</span>
                          <span className="font-mono text-white">
                            {formatNumber(signal.tokenIn.amount, 6)} {signal.tokenIn.symbol}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <span className="text-gray-500">{signal.action === 'BUY' ? 'Got:' : 'Received:'}</span>
                          <span className="font-mono text-white">
                            {formatNumber(signal.tokenOut.amount, 2)} {signal.tokenOut.symbol}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          {formatTimeAgo(signal.timestamp)}
                        </p>
                        <a 
                          href={`https://solscan.io/tx/${signal.fullSignature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-purple-400"
                        >
                          View TX →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
            ) : (
              <div className="text-center py-8">
                <Zap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No signals yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Signals will appear as the tracked wallet trades</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
