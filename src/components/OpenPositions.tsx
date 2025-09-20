import React, { useState } from 'react'
import { TrendingUp, X, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { formatNumber, formatSOL, formatPercent } from '../lib/utils'
import lokiApi, { type Position } from '../lib/api'
import { Button } from './ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'
import { useToast } from './ui/use-toast'

interface OpenPositionsProps {
  positions: Position[]
  positionsFetching: boolean
  isFirstLoad: boolean
  onPositionClosed?: () => void
}

export default function OpenPositions({ positions, positionsFetching, isFirstLoad, onPositionClosed }: OpenPositionsProps) {
  const { toast } = useToast()
  const [closingPosition, setClosingPosition] = useState<string | null>(null)
  const [confirmClose, setConfirmClose] = useState<Position | null>(null)

  const handleClosePosition = async () => {
    if (!confirmClose) return

    setClosingPosition(confirmClose.token_address)
    try {
      const response = await lokiApi.closePosition(confirmClose.token_address)
      
      toast({
        title: "Position Closed Successfully",
        description: `Closed ${confirmClose.token_symbol || confirmClose.token_address.slice(0, 8)}... for ${formatSOL(response.data.solReceived || 0)}`,
        variant: "default",
      })

      // Refresh positions
      if (onPositionClosed) {
        onPositionClosed()
      }
    } catch (error: any) {
      console.error('Failed to close position:', error)
      toast({
        title: "Failed to Close Position",
        description: error.response?.data?.error || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setClosingPosition(null)
      setConfirmClose(null)
    }
  }
  return (
    <>
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
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className={`text-sm font-bold ${position.profitLossPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercent(position.profitLossPercent || 0)}
                      </div>
                      <div className={`text-xs ${position.profitLoss >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
                        {formatSOL(position.profitLoss || 0)}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmClose(position)}
                      disabled={closingPosition === position.token_address}
                      className="h-8 w-8 p-0 border-gray-700 hover:bg-red-900/20 hover:border-red-700"
                    >
                      {closingPosition === position.token_address ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
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

    {/* Confirmation Dialog */}
    <AlertDialog 
      open={!!confirmClose} 
      onOpenChange={(open) => {
        // Don't allow closing while action is in progress
        if (!open && closingPosition !== confirmClose?.token_address) {
          setConfirmClose(null)
        }
      }}
    >
      <AlertDialogContent className="bg-gray-900 border-gray-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Close Position</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            Are you sure you want to close this position?
            {confirmClose && (
              <div className="mt-4 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Token:</span>
                    <span className="text-sm text-white font-medium">
                      {confirmClose.token_symbol || `${confirmClose.token_address.slice(0, 8)}...`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Amount:</span>
                    <span className="text-sm text-white">{formatNumber(confirmClose.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Current Value:</span>
                    <span className="text-sm text-white">{formatSOL(confirmClose.currentValue || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">P&L:</span>
                    <span className={`text-sm font-semibold ${confirmClose.profitLossPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatSOL(confirmClose.profitLoss || 0)} ({formatPercent(confirmClose.profitLossPercent || 0)})
                    </span>
                  </div>
                </div>
                {confirmClose.profitLoss < 0 && (
                  <div className="mt-3 flex items-center space-x-2 text-yellow-500">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-xs">This position is currently at a loss</span>
                  </div>
                )}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            className="bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
            disabled={closingPosition === confirmClose?.token_address}
            onClick={() => setConfirmClose(null)}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleClosePosition}
            disabled={closingPosition === confirmClose?.token_address}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {closingPosition === confirmClose?.token_address ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Closing...
              </>
            ) : (
              'Close Position'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
