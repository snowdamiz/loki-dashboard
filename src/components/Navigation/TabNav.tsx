import React from 'react'
import { cn } from '../../lib/utils'
import { 
  LayoutDashboard, 
  TrendingUp, 
  Wallet, 
  Monitor,
  Settings
} from 'lucide-react'

export type TabType = 'overview' | 'trading' | 'positions' | 'system'

interface TabNavProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  className?: string
}

const tabs = [
  { id: 'overview' as TabType, label: 'Overview', icon: LayoutDashboard },
  { id: 'trading' as TabType, label: 'Trading', icon: TrendingUp },
  { id: 'positions' as TabType, label: 'Positions', icon: Wallet },
  { id: 'system' as TabType, label: 'System', icon: Monitor },
]

export default function TabNav({ activeTab, onTabChange, className }: TabNavProps) {
  return (
    <div className={cn("hidden lg:flex items-center space-x-1 bg-gray-900/50 rounded-lg p-1 border border-gray-800", className)}>
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
              isActive 
                ? "bg-purple-600/20 text-purple-400 border border-purple-500/30" 
                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}