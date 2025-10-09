import { ROUTES } from "@/constants/routes"
import ky, { HTTPError } from "ky"
import { TokenStorage } from "@/lib/auth/token-storage"

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.2:8000/api"

// Create a base API client
const baseApi = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 15000,
  retry: { limit: 1 },
  hooks: {
    beforeRequest: [
      async (request) => {
        // Add authentication token
        const accessToken = TokenStorage.getAccessToken()
        if (accessToken) {
          request.headers.set("Authorization", `Bearer ${accessToken}`)
        }
        request.headers.set("Accept", "application/json")
        request.headers.set("Content-Type", "application/json")
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        if (response.status === 401) {
          // Handle unauthorized - redirect to login
          TokenStorage.clearTokens()
          window.location.href = ROUTES.AUTH.LOGIN
        }
      },
    ],
  },
})

export const api = baseApi

// Helper function to make authenticated API calls
export async function authenticatedApiCall<T>(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
    json?: any
    searchParams?: Record<string, string | number>
  } = {}
) {
  const { method = "GET", json, searchParams } = options
  
  const requestOptions: any = {
    method,
  }
  
  if (json) {
    requestOptions.json = json
  }
  
  if (searchParams) {
    requestOptions.searchParams = searchParams
  }
  
  return api(endpoint, requestOptions).json<T>()
}

export type ApiClient = typeof api
