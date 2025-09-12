import React from 'react'
import SectionHeader from '../Shared/SectionHeader'
import HealthStatus from '../HealthStatus'
import VolumeCard from '../VolumeCard'
import { Button } from '../ui/button'
import { Download, Trash2 } from 'lucide-react'
import type { DetailedHealth, VolumeInfo } from '../../lib/api'

interface SystemProps {
  detailedHealth: DetailedHealth | undefined
  volumeInfo: VolumeInfo | undefined
  healthFetching: boolean
  volumeFetching: boolean
  onClearDatabase: () => void
  onDownloadDatabase: (hours: number) => void
  isDownloading: boolean
}

export default function System({
  detailedHealth,
  volumeInfo,
  healthFetching,
  volumeFetching,
  onClearDatabase,
  onDownloadDatabase,
  isDownloading
}: SystemProps) {
  const [downloadHours, setDownloadHours] = React.useState(24)

  return (
    <div className="space-y-6">
      {/* System Health */}
      <div>
        <SectionHeader 
          title="System Health" 
          subtitle="Service status and performance monitoring"
        />
        <HealthStatus 
          health={detailedHealth}
          isLoading={false}
          isFetching={healthFetching}
        />
      </div>

      {/* Database Volume */}
      <div>
        <SectionHeader 
          title="Database Storage" 
          subtitle="Volume usage and capacity information"
        />
        <VolumeCard 
          volumeInfo={volumeInfo}
          volumeFetching={volumeFetching}
          isFirstLoad={false}
        />
      </div>

      {/* System Actions */}
      <div>
        <SectionHeader 
          title="System Actions" 
          subtitle="Database management and maintenance"
        />
        <div className="space-y-4">
          {/* Download Database */}
          <div className="flex items-center space-x-4 p-4 rounded-xl border border-gray-800 bg-gray-900/30">
            <Download className="h-5 w-5 text-purple-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Download Database</p>
              <p className="text-xs text-gray-500">Export trading data for analysis</p>
            </div>
            <select
              value={downloadHours}
              onChange={(e) => setDownloadHours(Number(e.target.value))}
              className="text-sm bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-gray-300 focus:outline-none focus:border-purple-500"
            >
              <option value={1}>1 hour</option>
              <option value={6}>6 hours</option>
              <option value={12}>12 hours</option>
              <option value={24}>24 hours</option>
              <option value={48}>48 hours</option>
              <option value={72}>72 hours</option>
              <option value={168}>1 week</option>
            </select>
            <Button
              onClick={() => onDownloadDatabase(downloadHours)}
              disabled={isDownloading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>
          </div>

          {/* Clear Database */}
          <div className="flex items-center space-x-4 p-4 rounded-xl border border-gray-800 bg-gray-900/30">
            <Trash2 className="h-5 w-5 text-orange-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Clear Database</p>
              <p className="text-xs text-gray-500">Remove all trading history (cannot be undone)</p>
            </div>
            <Button
              onClick={onClearDatabase}
              variant="destructive"
              className="bg-orange-600 hover:bg-orange-700"
            >
              Clear Database
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}