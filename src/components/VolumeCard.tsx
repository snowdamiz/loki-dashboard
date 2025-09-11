import React from 'react'
import { HardDrive } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { formatNumber } from '../lib/utils'

interface VolumeCardProps {
  volumeInfo: any
  volumeFetching: boolean
  isFirstLoad: boolean
}

export default function VolumeCard({ volumeInfo, volumeFetching, isFirstLoad }: VolumeCardProps) {
  if (!volumeInfo) return null

  return (
    <Card className="relative rounded-xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm">
      {volumeFetching && !isFirstLoad && (
        <div className="absolute top-4 right-4 z-10">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-ping"></div>
        </div>
      )}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gray-800/50 rounded-xl">
              <HardDrive className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-white mb-1">Database Volume</CardTitle>
              <CardDescription className="text-sm text-gray-500">Storage usage and capacity</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">
              {volumeInfo.volume.usagePercent}
            </p>
            <p className="text-xs text-gray-500">Used</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <p className="text-base font-semibold text-white">
              {volumeInfo.volume.totalGB} GB
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              {formatNumber(volumeInfo.volume.totalBytes / 1024 / 1024 / 1024, 2)} GiB
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="text-xs text-gray-500">Used</span>
            </div>
            <p className="text-base font-semibold text-white">
              {volumeInfo.volume.usedGB} GB
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              {formatNumber(volumeInfo.volume.usedBytes / 1024 / 1024 / 1024, 2)} GiB
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="text-xs text-gray-500">Available</span>
            </div>
            <p className="text-base font-semibold text-white">
              {volumeInfo.volume.availableGB} GB
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              {formatNumber(volumeInfo.volume.availableBytes / 1024 / 1024 / 1024, 2)} GiB
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="text-xs text-gray-500">DB Size</span>
            </div>
            <p className="text-base font-semibold text-white">
              {volumeInfo.volume.databaseSizeMB} MB
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              {formatNumber(volumeInfo.volume.databaseSize / 1024 / 1024, 2)} MiB
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Volume Path</span>
            <span className="text-gray-400 font-mono">{volumeInfo.volumePath}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Fly App</span>
            <span className="text-gray-400">{volumeInfo.flyApp}</span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Storage Usage</span>
              <span className="text-gray-400">{volumeInfo.volume.usagePercent}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                style={{ width: volumeInfo.volume.usagePercent }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
