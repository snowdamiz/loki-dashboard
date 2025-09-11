import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Activity, 
  Play,
  Pause,
  StopCircle,
  RefreshCw,
  LogOut,
  Menu,
  X,
  Trash2
} from 'lucide-react'
import { Button } from './ui/button'
import lokiApi from '../lib/api'

interface HeaderProps {
  status: any
  autoRefresh: boolean
  setAutoRefresh: (value: boolean) => void
  onLogout?: () => void
  onClearDatabase: () => void
}

export default function Header({ 
  status, 
  autoRefresh, 
  setAutoRefresh, 
  onLogout, 
  onClearDatabase 
}: HeaderProps) {
  const queryClient = useQueryClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Mutations
  const pauseMutation = useMutation({
    mutationFn: lokiApi.pause,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['status'] })
  })

  const resumeMutation = useMutation({
    mutationFn: lokiApi.resume,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['status'] })
  })

  const emergencyStopMutation = useMutation({
    mutationFn: lokiApi.emergencyStop,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['status'] })
  })

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

          {/* Desktop Controls - Redesigned */}
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

            {/* Trading Controls Group */}
            <div className="flex items-center bg-gray-900/50 rounded-lg p-1 border border-gray-800">
              {status?.bot?.paused ? (
                <Button
                  size="sm"
                  onClick={() => resumeMutation.mutate()}
                  disabled={resumeMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 h-auto rounded-md"
                >
                  <Play className="h-3.5 w-3.5 mr-1.5" />
                  Resume
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => pauseMutation.mutate()}
                  disabled={pauseMutation.isPending}
                  className="bg-gray-800 hover:bg-yellow-600/20 text-yellow-500 hover:text-yellow-400 text-xs px-3 py-1.5 h-auto rounded-md border-0"
                >
                  <Pause className="h-3.5 w-3.5 mr-1.5" />
                  Pause
                </Button>
              )}
              <div className="w-px h-6 bg-gray-700 mx-1" />
              <Button
                size="sm"
                onClick={() => emergencyStopMutation.mutate()}
                disabled={emergencyStopMutation.isPending}
                className="bg-transparent hover:bg-red-600/20 text-red-500 hover:text-red-400 text-xs px-3 py-1.5 h-auto rounded-md border-0"
              >
                <StopCircle className="h-3.5 w-3.5 mr-1.5" />
                Stop
              </Button>
            </div>

            {/* Actions Dropdown Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-medium transition-all border border-gray-700">
                <Menu className="h-3.5 w-3.5" />
                <span>Actions</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 rounded-lg bg-gray-900 border border-gray-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100">
                <div className="p-1">
                  <button
                    onClick={onClearDatabase}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs rounded-md hover:bg-orange-600/10 text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Clear Database</span>
                  </button>
                  {onLogout && (
                    <>
                      <div className="h-px bg-gray-800 my-1" />
                      <button
                        onClick={onLogout}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-xs rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Logout</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
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

      {/* Mobile Menu - Redesigned Slide Down */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
        mobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="border-t border-gray-800/50 bg-black/60 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4">
            {/* Mobile Controls - Simplified Color Scheme */}
            <div className="space-y-2">
              {/* Live Updates Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
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

              {/* Trading Control */}
              <div className="grid grid-cols-2 gap-2">
                {status?.bot?.paused ? (
                  <Button
                    onClick={() => {
                      resumeMutation.mutate()
                      setMobileMenuOpen(false)
                    }}
                    disabled={resumeMutation.isPending}
                    className="col-span-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Resume Trading
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      pauseMutation.mutate()
                      setMobileMenuOpen(false)
                    }}
                    disabled={pauseMutation.isPending}
                    className="bg-gray-900/50 border-gray-700 hover:bg-gray-800 text-gray-300"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                )}
                {!status?.bot?.paused && (
                  <Button
                    onClick={() => {
                      emergencyStopMutation.mutate()
                      setMobileMenuOpen(false)
                    }}
                    disabled={emergencyStopMutation.isPending}
                    className="bg-gray-900/50 border-gray-700 hover:bg-gray-800 text-gray-300"
                  >
                    <StopCircle className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                )}
              </div>

              {/* Danger Zone */}
              <div className="pt-2 mt-2 border-t border-gray-800">
                <p className="text-xs text-gray-500 mb-2 px-1">Danger Zone</p>
                <button
                  onClick={() => {
                    onClearDatabase()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 hover:bg-gray-800 text-gray-300 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Clear Database</span>
                </button>
              </div>

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
