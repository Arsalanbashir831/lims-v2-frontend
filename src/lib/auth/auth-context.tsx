"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AuthService } from '@/services/auth.service'
import { TokenStorage, User } from '@/lib/auth/token-storage'
import { UserRole } from '@/lib/schemas/user'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: { email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  register: (data: { username: string; email: string; password: string; role: UserRole }) => Promise<void>
  refreshToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null)

  const isAuthenticated = !!user && AuthService.isAuthenticated()

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = TokenStorage.getUser()
        const hasValidTokens = TokenStorage.hasValidTokens()

        if (storedUser && hasValidTokens) {
          // Verify token with backend and get user profile
          const verifiedUser = await AuthService.verifyToken()
          if (verifiedUser) {
            setUser(verifiedUser)
            setupTokenRefresh()
          } else {
            // Token invalid, try to refresh
            const refreshed = await AuthService.refreshToken()
            if (refreshed) {
              // After refresh, verify the new token to get user info
              const newVerifiedUser = await AuthService.verifyToken()
              if (newVerifiedUser) {
                setUser(newVerifiedUser)
                setupTokenRefresh()
              } else {
                TokenStorage.clearTokens()
              }
            } else {
              // Refresh failed, clear tokens
              TokenStorage.clearTokens()
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        TokenStorage.clearTokens()
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Setup automatic token refresh
  const setupTokenRefresh = () => {
    // Clear existing timer
    if (refreshTimer) {
      clearInterval(refreshTimer)
    }

    // Check if token needs refresh every 30 seconds
    const timer = setInterval(async () => {
      if (TokenStorage.shouldRefreshToken()) {
        try {
          const refreshed = await AuthService.refreshToken()
          if (!refreshed) {
            // Refresh failed, logout
            await logout()
          }
        } catch (error) {
          console.error('Auto refresh failed:', error)
          await logout()
        }
      }
    }, 30000)

    setRefreshTimer(timer)
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (refreshTimer) {
        clearInterval(refreshTimer)
      }
    }
  }, [refreshTimer])

  const login = async (credentials: { email: string; password: string }) => {
    try {
      setIsLoading(true)
      const { user: loggedInUser } = await AuthService.login(credentials)
      setUser(loggedInUser)
      setupTokenRefresh()
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await AuthService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      if (refreshTimer) {
        clearInterval(refreshTimer)
        setRefreshTimer(null)
      }
    }
  }

  const register = async (data: { username: string; email: string; password: string; role: UserRole }) => {
    try {
      setIsLoading(true)
      await AuthService.register(data)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshed = await AuthService.refreshToken()
      if (refreshed) {
        // After refresh, verify the new token to get user info
        const newVerifiedUser = await AuthService.verifyToken()
        if (newVerifiedUser) {
          setUser(newVerifiedUser)
          return true
        } else {
          TokenStorage.clearTokens()
          return false
        }
      }
      return false
    } catch (error) {
      console.error('Manual refresh failed:', error)
      return false
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    refreshToken
  }

  return (
    <AuthContext.Provider value={value}>
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
