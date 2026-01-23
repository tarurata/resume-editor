'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  loading: boolean
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // On initial load, check localStorage for a token.
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        setToken(storedToken)
      }
    } catch (error) {
      console.error('Failed to read token from localStorage', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Listen for storage changes from other tabs/windows.
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token') {
        setToken(event.newValue)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
