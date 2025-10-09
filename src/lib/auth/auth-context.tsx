"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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

// Query keys for consistent caching
export const AUTH_QUERY_KEYS = {
  user: ['auth', 'user'] as const,
  verify: ['auth', 'verify'] as const,
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Initialize authentication state based on stored tokens
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return TokenStorage.hasValidTokens()
    }
    return false
  })
  const queryClient = useQueryClient()

  // Query for user profile with caching
  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: AUTH_QUERY_KEYS.user,
    queryFn: async () => {
      const accessToken = TokenStorage.getAccessToken()
      if (!accessToken) return null
      
      const userProfile = await AuthService.verifyToken()
      return userProfile
    },
    enabled: !!TokenStorage.getAccessToken(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 errors
      if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
        return false
      }
      return failureCount < 2
    },
  })

  // Update authentication state when user data changes
  useEffect(() => {
    if (user && !userError) {
      setIsAuthenticated(true)
    } else if (userError) {
      // Only set to false if there's an actual error (like 401)
      if (userError && typeof userError === 'object' && 'status' in userError && userError.status === 401) {
        setIsAuthenticated(false)
        TokenStorage.clearTokens()
      }
    } else if (!user && !userLoading) {
      // Only set to false if we're not loading and have no user
      const hasTokens = TokenStorage.hasValidTokens()
      if (!hasTokens) {
        setIsAuthenticated(false)
      }
    }
  }, [user, userError, userLoading])

  // Login mutation with cache invalidation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const result = await AuthService.login(credentials)
      return result
    },
    onSuccess: (result) => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user })
      queryClient.setQueryData(AUTH_QUERY_KEYS.user, result.user)
    },
    onError: (error) => {
      console.error('Login failed:', error)
    }
  })

  // Logout mutation with cache clearing
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await AuthService.logout()
    },
    onSuccess: () => {
      // Clear all auth-related cache
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.user })
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.verify })
      // Clear all other cached data
      queryClient.clear()
    }
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: { username: string; email: string; password: string; role: UserRole }) => {
      return await AuthService.register(data)
    },
    onError: (error) => {
      console.error('Registration failed:', error)
    }
  })

  // Refresh token mutation
  const refreshTokenMutation = useMutation({
    mutationFn: async () => {
      return await AuthService.refreshToken()
    },
    onSuccess: (success) => {
      if (success) {
        // Invalidate user query to refetch with new token
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user })
      }
    }
  })

  // Auto-refresh token before expiry
  useEffect(() => {
    const setupTokenRefresh = () => {
      const refreshInterval = setInterval(async () => {
        if (TokenStorage.shouldRefreshToken()) {
          await refreshTokenMutation.mutateAsync()
        }
      }, 60000) // Check every minute

      return () => clearInterval(refreshInterval)
    }

    const cleanup = setupTokenRefresh()
    return cleanup
  }, [refreshTokenMutation])

  const login = async (credentials: { email: string; password: string }) => {
    await loginMutation.mutateAsync(credentials)
  }

  const logout = async () => {
    await logoutMutation.mutateAsync()
  }

  const register = async (data: { username: string; email: string; password: string; role: UserRole }) => {
    await registerMutation.mutateAsync(data)
  }

  const refreshToken = async (): Promise<boolean> => {
    try {
      await refreshTokenMutation.mutateAsync()
      return true
    } catch {
      return false
    }
  }

  const isLoading = userLoading || loginMutation.isPending || logoutMutation.isPending || registerMutation.isPending

  const value: AuthContextType = {
    user: user || null,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    refreshToken,
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
