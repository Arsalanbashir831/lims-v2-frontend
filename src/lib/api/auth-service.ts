import { signIn, signOut, getSession } from "next-auth/react"
import { UserRole } from "@/lib/schemas/user"
import { API_ROUTES } from "@/constants/api-routes"
import { api } from "./client"

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  role: UserRole
}

export class AuthService {
  // Login using NextAuth
  static async login(credentials: LoginCredentials) {
    const result = await signIn('credentials', {
      username: credentials.username,
      password: credentials.password,
      redirect: false,
    })
    
    if (result?.error) {
      throw new Error(result.error)
    }
    
    return result
  }

  // Logout using NextAuth
  static async logout() {
    await signOut({ redirect: false })
  }

  // Get current session
  static async getSession() {
    return await getSession()
  }

  // Register new user
  static async register(data: RegisterData) {
    try {
      const response = await api.post(API_ROUTES.AUTH.REGISTER, {
        json: data,
      }).json()
      
      return response
    } catch (error: any) {
      // Handle different types of errors
      if (error.response) {
        const errorData = await error.response.json()
        throw new Error(errorData.error || errorData.message || 'Registration failed')
      } else if (error.message) {
        throw new Error(error.message)
      } else {
        throw new Error('Registration failed. Please try again.')
      }
    }
  }
  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession()
    return !!session?.user
  }

  // Get user role
  static async getUserRole(): Promise<UserRole | null> {
    const session = await this.getSession()
    return (session?.user?.role as UserRole) || null
  }
}
