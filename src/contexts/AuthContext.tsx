import React, { createContext, useState, useContext, useEffect } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check for existing session on mount
  useEffect(() => {
    const authToken = localStorage.getItem('loki_auth_token')
    const authExpiry = localStorage.getItem('loki_auth_expiry')
    
    if (authToken && authExpiry) {
      const expiryTime = parseInt(authExpiry)
      if (Date.now() < expiryTime) {
        setIsAuthenticated(true)
      } else {
        // Clear expired session
        localStorage.removeItem('loki_auth_token')
        localStorage.removeItem('loki_auth_expiry')
      }
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Get credentials from environment variables
    const validEmail = import.meta.env.VITE_AUTH_EMAIL || 'admin@loki.bot'
    const validPassword = import.meta.env.VITE_AUTH_PASSWORD || 'changeme123'

    // Check credentials
    if (email === validEmail && password === validPassword) {
      // Create a simple token (in production, this would be a JWT from the server)
      const token = btoa(`${email}:${Date.now()}`)
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      
      // Store in localStorage
      localStorage.setItem('loki_auth_token', token)
      localStorage.setItem('loki_auth_expiry', expiryTime.toString())
      
      setIsAuthenticated(true)
      return true
    }
    
    return false
  }

  const logout = () => {
    localStorage.removeItem('loki_auth_token')
    localStorage.removeItem('loki_auth_expiry')
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
