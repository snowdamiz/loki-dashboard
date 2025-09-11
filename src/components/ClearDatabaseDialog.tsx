import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  RefreshCw,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import { Button } from './ui/button'
import lokiApi from '../lib/api'

interface ClearDatabaseDialogProps {
  show: boolean
  onClose: () => void
}

export default function ClearDatabaseDialog({ show, onClose }: ClearDatabaseDialogProps) {
  const queryClient = useQueryClient()

  const clearDatabaseMutation = useMutation({
    mutationFn: lokiApi.clearDatabase,
    onSuccess: () => {
      // Invalidate all queries to refresh the data
      queryClient.invalidateQueries()
      onClose()
    }
  })

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md rounded-xl border border-red-500/20 bg-gray-900/95 p-6 shadow-2xl">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-900/10 to-transparent opacity-50"></div>
        <div className="relative">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-white">Clear Database?</h3>
          </div>
          <p className="text-sm text-gray-400 mb-6">
            This action will permanently delete all data including:
          </p>
          <ul className="text-sm text-gray-500 space-y-1 mb-6 ml-4">
            <li className="flex items-center space-x-2">
              <span className="w-1 h-1 bg-red-400 rounded-full"></span>
              <span>All trade history</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1 h-1 bg-red-400 rounded-full"></span>
              <span>All positions</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1 h-1 bg-red-400 rounded-full"></span>
              <span>All wallet signals</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1 h-1 bg-red-400 rounded-full"></span>
              <span>All metrics and statistics</span>
            </li>
          </ul>
          <p className="text-xs text-red-400 font-semibold mb-6">
            ⚠️ This action cannot be undone!
          </p>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="flex-1 border-gray-600 hover:bg-gray-800"
              disabled={clearDatabaseMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => clearDatabaseMutation.mutate()}
              disabled={clearDatabaseMutation.isPending}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {clearDatabaseMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Data
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
