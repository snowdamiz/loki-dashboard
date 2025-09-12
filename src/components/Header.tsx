import React, { useState } from 'react'
import { 
  Activity, 
  RefreshCw,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { Button } from './ui/button'

interface HeaderProps {
  status: any
  autoRefresh: boolean
  setAutoRefresh: (value: boolean) => void
  onLogout?: () => void
}

export default function Header({ 
  status, 
  autoRefresh, 
  setAutoRefresh, 
  onLogout
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)


  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section - Simplified */}
          <div className="flex items-center space-x-3">
            <Activity className="h-5 w-5 text-purple-400" />
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                LOKI
              </h1>
              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                status?.bot?.running 
                  ? status?.bot?.paused 
                    ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                    : 'bg-green-500/10 text-green-500 border border-green-500/20'
                  : 'bg-red-500/10 text-red-500 border border-red-500/20'
              }`}>
                {status?.bot?.running ? (status?.bot?.paused ? 'PAUSED' : 'LIVE') : 'OFFLINE'}
              </span>
            </div>
          </div>

          {/* Desktop Controls - Simplified */}
          <div className="hidden lg:flex items-center space-x-2">
            {/* Live Updates Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                autoRefresh 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                {autoRefresh && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                )}
                <RefreshCw className={`h-3.5 w-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
                <span>{autoRefresh ? 'Live' : 'Paused'}</span>
              </div>
            </button>

            {/* Logout Button */}
            {onLogout && (
              <Button
                size="sm"
                onClick={onLogout}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs px-3 py-1.5 h-auto rounded-md border border-gray-700"
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
                Logout
              </Button>
            )}
          </div>

          {/* Mobile Menu Button - Redesigned */}
          <div className="lg:hidden flex items-center space-x-2">
            {/* Mobile Live Indicator */}
            {autoRefresh && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative p-2 rounded-lg bg-gray-900/50 border border-gray-800 text-gray-400 hover:text-white transition-all"
            >
              <div className="relative w-6 h-6">
                <span className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${mobileMenuOpen ? 'rotate-180 opacity-0' : 'rotate-0 opacity-100'}`}>
                  <Menu className="h-5 w-5" />
                </span>
                <span className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${mobileMenuOpen ? 'rotate-0 opacity-100' : '-rotate-180 opacity-0'}`}>
                  <X className="h-5 w-5" />
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Simplified */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
        mobileMenuOpen ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="border-t border-gray-800/50 bg-black/60 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="space-y-2">
              {/* Live Updates Toggle */}
              <button
                onClick={() => {
                  setAutoRefresh(!autoRefresh)
                  setMobileMenuOpen(false)
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  autoRefresh 
                    ? 'bg-gray-800 text-white border border-gray-700' 
                    : 'bg-gray-900/50 text-gray-400 border border-gray-800'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                  <span>Live Updates</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  autoRefresh 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-gray-800 text-gray-500'
                }`}>
                  {autoRefresh ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Logout */}
              {onLogout && (
                <button
                  onClick={() => {
                    onLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800 hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
