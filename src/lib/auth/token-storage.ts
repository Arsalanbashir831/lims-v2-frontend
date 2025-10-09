import { setCookie, removeCookie, getCookie, setAuthCookies, clearAuthCookies, getAuthTokens } from '@/lib/cookies'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  refreshExpiresIn: number
}

export interface User {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  role: string
  is_active: boolean
  last_login: string
}

export interface LoginResponse {
  status: string
  message: string
  data: {
    access_token: string
    refresh_token: string
    token_type: string
    expires_in: number
    refresh_expires_in: number
    user: User
  }
}

export class TokenStorage {
  private static readonly ACCESS_TOKEN_KEY = 'accessToken'
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken'
  private static readonly TOKEN_EXPIRY_KEY = 'tokenExpiry'
  private static readonly USER_KEY = 'user'

  static setTokens(tokens: AuthTokens, user: User): void {
    // Store tokens in cookies
    setAuthCookies(tokens.accessToken, tokens.refreshToken)
    
    // Store expiry time in localStorage for auto-refresh logic
    if (typeof window !== 'undefined') {
      const expiryTime = Date.now() + (tokens.expiresIn * 1000)
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString())
      localStorage.setItem(this.USER_KEY, JSON.stringify(user))
    }
  }

  static setTokensOnly(accessToken: string, refreshToken: string): void {
    // Store tokens in cookies
    setAuthCookies(accessToken, refreshToken)
    
    // Update expiry time in localStorage for auto-refresh logic
    if (typeof window !== 'undefined') {
      const expiryTime = Date.now() + (15 * 60 * 1000) // 15 minutes default
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString())
    }
  }

  static getAccessToken(): string | null {
    return getCookie(this.ACCESS_TOKEN_KEY)
  }

  static getRefreshToken(): string | null {
    return getCookie(this.REFRESH_TOKEN_KEY)
  }

  static getTokens(): { accessToken: string | null; refreshToken: string | null } {
    return getAuthTokens()
  }

  static getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(this.USER_KEY)
      return userStr ? JSON.parse(userStr) : null
    }
    return null
  }

  static isTokenExpired(): boolean {
    if (typeof window !== 'undefined') {
      const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY)
      if (!expiryTime) return true
      
      // Check if token expires in next 30 seconds (refresh buffer)
      const bufferTime = 30 * 1000
      return Date.now() >= (parseInt(expiryTime) - bufferTime)
    }
    return true
  }

  static shouldRefreshToken(): boolean {
    if (typeof window !== 'undefined') {
      const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY)
      if (!expiryTime) return false
      
      // Refresh if token expires in next 2 minutes
      const refreshBuffer = 2 * 60 * 1000
      return Date.now() >= (parseInt(expiryTime) - refreshBuffer)
    }
    return false
  }

  static clearTokens(): void {
    clearAuthCookies()
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_EXPIRY_KEY)
      localStorage.removeItem(this.USER_KEY)
    }
  }

  static hasValidTokens(): boolean {
    const { accessToken, refreshToken } = this.getTokens()
    return !!(accessToken && refreshToken && !this.isTokenExpired())
  }
}
