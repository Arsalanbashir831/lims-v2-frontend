import { API_ROUTES } from "@/constants/api-routes"
import { api } from "@/lib/api/api"
import { TokenStorage, LoginResponse, User } from "@/lib/auth/token-storage"
import { UserRole } from "@/lib/schemas/user"

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  role: UserRole
}

export class AuthService {
  // Login using Django backend
  static async login(credentials: LoginCredentials): Promise<{ user: User; tokens: any }> {
    try {
      const response = await api.post(API_ROUTES.AUTH.LOGIN, {
        json: credentials,
      }).json<LoginResponse>()
      
      if (response.status === "success" && response.data) {
        const { access_token, refresh_token, token_type, expires_in, refresh_expires_in, user } = response.data
        
        // Store tokens and user data
        const tokens = {
          accessToken: access_token,
          refreshToken: refresh_token,
          tokenType: token_type,
          expiresIn: expires_in,
          refreshExpiresIn: refresh_expires_in
        }
        
        TokenStorage.setTokens(tokens, user)
        
        return { user, tokens }
      } else {
        throw new Error(response.message || "Login failed")
      }
    } catch (error: any) {
      if (error.response) {
        const errorData = await error.response.json()
        throw new Error(errorData.message || errorData.error || "Login failed")
      } else if (error.message) {
        throw new Error(error.message)
      } else {
        throw new Error("Login failed. Please try again.")
      }
    }
  }

  // Logout using Django backend
  static async logout(): Promise<void> {
    try {
      const refreshToken = TokenStorage.getRefreshToken()
      if (refreshToken) {
        await api.post(API_ROUTES.AUTH.LOGOUT, {
          json: { refresh_token: refreshToken }
        })
      }
    } catch (error) {
      console.error("Logout error:", error)
      // Continue with local logout even if backend call fails
    } finally {
      TokenStorage.clearTokens()
    }
  }

  // Register new user
  static async register(data: RegisterData): Promise<{ message: string }> {
    try {
      const response = await api.post(API_ROUTES.AUTH.REGISTER, {
        json: data,
      }).json<{ status: string; message: string }>()
      
      if (response.status === "success") {
        return { message: response.message }
      } else {
        throw new Error(response.message || "Registration failed")
      }
    } catch (error: any) {
      if (error.response) {
        const errorData = await error.response.json()
        throw new Error(errorData.message || errorData.error || "Registration failed")
      } else if (error.message) {
        throw new Error(error.message)
      } else {
        throw new Error("Registration failed. Please try again.")
      }
    }
  }

  // Verify token with backend and get user profile
  static async verifyToken(): Promise<User | null> {
    try {
      const accessToken = TokenStorage.getAccessToken()
      if (!accessToken) return null

      const response = await api.get(API_ROUTES.AUTH.VERIFY_TOKEN, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }).json<{
        status: string
        message: string
        data: {
          user: {
            id: string
            username: string
            email: string
            first_name: string
            last_name: string
            full_name: string
            role: string
            is_active: boolean
          }
          token_info: {
            expires_at: string
            issued_at: string
          }
        }
      }>()
      
      if (response.status === "success" && response.data?.user) {
        return {
          id: response.data.user.id,
          username: response.data.user.username,
          email: response.data.user.email,
          first_name: response.data.user.first_name,
          last_name: response.data.user.last_name,
          full_name: response.data.user.full_name,
          role: response.data.user.role,
          is_active: response.data.user.is_active,
          last_login: "", // Not provided in verify response
        }
      }
      return null
    } catch (error) {
      console.error("Token verification failed:", error)
      return null
    }
  }

  // Refresh access token
  static async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = TokenStorage.getRefreshToken()
      if (!refreshToken) return false

      const response = await api.post(API_ROUTES.AUTH.REFRESH_TOKEN, {
        json: { refresh_token: refreshToken }
      }).json<{
        status: string
        message: string
        data: {
          access_token: string
          refresh_token: string
          token_type: string
          expires_in: number
          refresh_expires_in: number
        }
      }>()
      
      if (response.status === "success" && response.data) {
        const { access_token, refresh_token, token_type, expires_in, refresh_expires_in } = response.data
        
        // Store the new tokens
        TokenStorage.setTokensOnly(access_token, refresh_token)
        return true
      }
      return false
    } catch (error) {
      console.error("Token refresh failed:", error)
      return false
    }
  }

  // Get current user from storage
  static getCurrentUser(): User | null {
    return TokenStorage.getUser()
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return TokenStorage.hasValidTokens()
  }

  // Get user role
  static getUserRole(): UserRole | null {
    const user = TokenStorage.getUser()
    return (user?.role as UserRole) || null
  }
}
