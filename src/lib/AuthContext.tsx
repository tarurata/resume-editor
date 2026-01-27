'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'

interface AuthContextType {
  isAuthenticated: boolean
  loading: boolean
  userId: string | null
  login: (token: string) => void
  logout: () => void
}

interface JwtPayload {
  sub: string
  // Add other claims as needed, e.g., exp, iat
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // On initial load, check localStorage for a token and extract userId.
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        setToken(storedToken)
        const decoded = jwtDecode<JwtPayload>(storedToken)
        setUserId(decoded.sub)
      }
    } catch (error) {
      console.error('Failed to read or decode token from localStorage', error)
      // Clear out any invalid state
      localStorage.removeItem('token')
      setToken(null)
      setUserId(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Listen for storage changes from other tabs/windows.
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token') {
        const newToken = event.newValue
        setToken(newToken)
        if (newToken) {
          try {
            const decoded = jwtDecode<JwtPayload>(newToken)
            setUserId(decoded.sub)
          } catch (error) {
            console.error('Failed to decode new token from storage event', error)
            setUserId(null)
          }
        } else {
          setUserId(null)
        }
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const login = (newToken: string) => {
    try {
      const decoded = jwtDecode<JwtPayload>(newToken)
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUserId(decoded.sub)
    } catch (error) {
      console.error('Failed to decode token on login', error)
      // Do not set invalid token
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUserId(null)
  }

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, userId, login, logout }}>
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
