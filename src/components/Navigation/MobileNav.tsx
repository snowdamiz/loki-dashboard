import React from 'react'
import { cn } from '../../lib/utils'
import { 
  LayoutDashboard, 
  TrendingUp, 
  Wallet, 
  Monitor
} from 'lucide-react'
import type { TabType } from './TabNav'

interface MobileNavProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const tabs = [
  { id: 'overview' as TabType, label: 'Overview', icon: LayoutDashboard },
  { id: 'trading' as TabType, label: 'Trading', icon: TrendingUp },
  { id: 'positions' as TabType, label: 'Positions', icon: Wallet },
  { id: 'system' as TabType, label: 'System', icon: Monitor },
]

export default function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  return (
    <>
      {/* Mobile Bottom Navigation Bar - Only navigation needed on mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-gray-800">
        <div className="grid grid-cols-4 h-16 relative">
          {tabs.map((tab, index) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center space-y-1 transition-all",
                  isActive 
                    ? "text-purple-400" 
                    : "text-gray-500 hover:text-gray-300"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 transition-all",
                  isActive && "scale-110"
                )} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            )
          })}
          {/* Active indicator - positioned based on active tab */}
          <div 
            className="absolute bottom-0 h-0.5 bg-purple-500 rounded-full transition-all duration-300 ease-in-out"
            style={{
              width: '48px',
              left: `calc(${tabs.findIndex(tab => tab.id === activeTab) * 25}% + 12.5% - 24px)`
            }}
          />
        </div>
      </div>
    </>
  )
}