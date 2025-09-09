import { ROUTES } from "@/constants/routes"
import ky, { HTTPError } from "ky"
import { getSession } from "next-auth/react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api"

// Create a base API client
const baseApi = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 15000,
  retry: { limit: 1 },
  hooks: {
    beforeRequest: [
      async (request) => {
        // Get session for authentication
        const session = await getSession()
        if (session?.user) {
          // Add any custom headers if needed
          request.headers.set("Accept", "application/json")
          // Note: NextAuth handles cookies automatically for same-origin requests
        }
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        if (response.status === 401) {
          // Handle unauthorized - redirect to login
          window.location.href = ROUTES.AUTH.LOGIN
        }
      },
    ],
  },
})

export const api = baseApi

// Helper function to get session for API calls
export async function getApiSession() {
  return await getSession()
}

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
