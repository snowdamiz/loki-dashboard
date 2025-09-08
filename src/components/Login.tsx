import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Activity, Lock, Mail, AlertCircle, Sparkles, Shield, Zap } from 'lucide-react'

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<boolean>
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await onLogin(email, password)
      if (!success) {
        setError('Invalid email or password')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="animated-bg cyber-grid">
        <div className="orb orb-purple w-96 h-96 top-0 left-0" style={{ animationDelay: '0s' }}></div>
        <div className="orb orb-blue w-80 h-80 bottom-0 right-0" style={{ animationDelay: '2s' }}></div>
        <div className="orb orb-pink w-64 h-64 top-1/2 left-1/2" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="flex justify-center mb-8 animate-pulse">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500 blur-3xl opacity-20 animate-pulse"></div>
            <div className="relative p-5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl border border-purple-500/30 glow-border">
              <Activity className="h-14 w-14 text-purple-400" />
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-pulse" />
            </div>
          </div>
        </div>
        
        <Card className="glass-effect border-gray-800/50 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-6 relative">
            <div className="absolute top-0 right-0 p-4">
              <Shield className="h-5 w-5 text-purple-400/50" />
            </div>
            <CardTitle className="text-3xl text-center text-white font-bold neon-text">
              LOKI TRADING
            </CardTitle>
            <CardDescription className="text-center text-gray-400 flex items-center justify-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span>Secure Access Portal</span>
              <Zap className="h-4 w-4 text-yellow-400" />
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400 z-10" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400 z-10" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 transition-colors rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    <span>Authenticating...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Sparkles className="h-5 w-5 mr-2" />
                    ACCESS DASHBOARD
                    <Sparkles className="h-5 w-5 ml-2" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-8 space-y-2">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
            <Shield className="h-3 w-3 text-green-400" />
            <span>256-bit SSL Encrypted</span>
            <span className="text-gray-600">•</span>
            <span>Secure Authentication</span>
          </p>
          <p className="text-xs text-purple-400/50 font-mono">
            LOKI TRADING SYSTEM v2.0
          </p>
        </div>
      </div>
    </div>
  )
}
