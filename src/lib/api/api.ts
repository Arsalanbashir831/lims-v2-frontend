import { ROUTES } from "@/constants/routes"
import ky from "ky"
import { TokenStorage } from "@/lib/auth/token-storage"

const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` || "http://localhost:8000/api"

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
        
        // Only set Content-Type for JSON requests, not for FormData
        if (!(request.body instanceof FormData)) {
          request.headers.set("Content-Type", "application/json")
        }
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
    json?: Record<string, unknown>
    body?: FormData
    searchParams?: Record<string, string | number>
  } = {}
) {
  const { method = "GET", json, body, searchParams } = options
  
  const requestOptions: Record<string, unknown> = {
    method,
  }
  
  if (json) {
    requestOptions.json = json
  }
  
  if (body) {
    requestOptions.body = body
  }
  
  if (searchParams) {
    requestOptions.searchParams = searchParams
  }
  
  return api(endpoint, requestOptions).json<T>()
}

// Helper function specifically for FormData uploads
export async function uploadWithFormData<T>(
  endpoint: string,
  formData: FormData,
  method: "POST" | "PUT" | "PATCH" = "POST"
): Promise<T> {
  try {
    // Create a new request without the base API client to avoid JSON parsing issues
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
    const fullUrl = `${API_BASE_URL}/${endpoint}`
    
    // Get the access token
    const accessToken = TokenStorage.getAccessToken()
    
    const response = await fetch(fullUrl, {
      method,
      body: formData,
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'Accept': 'application/json',
        // Don't set Content-Type for FormData - let the browser set it with boundary
      },
    })
    
    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    
    // Get the response text first to handle potential encoding issues
    const responseText = await response.text()
    
    // Try to parse as JSON
    try {
      const jsonResponse = JSON.parse(responseText)
      return jsonResponse as T
    } catch (parseError) {
      // If JSON parsing fails, throw a more descriptive error
      throw new Error(`Invalid response format: ${responseText.substring(0, 200)}...`)
    }
  } catch (error: unknown) {
    // Handle specific error cases
    if (error instanceof Error && error.message?.includes("utf-8 codec can't decode")) {
      throw new Error("Invalid image file format. Please ensure the image is a valid PNG, JPG, or JPEG file.")
    }
    if (error instanceof Error && error.message?.includes("Invalid response format")) {
      throw new Error("Server returned an invalid response. Please check your image file and try again.")
    }
    throw error
  }
}

// Example usage for FormData uploads:
// const formData = new FormData()
// formData.append('operator_name', 'John Doe')
// formData.append('operator_id', 'WELD-001')
// formData.append('iqama', '1234567890')
// if (profileImage) {
//   formData.append('profile_image', profileImage)
// }
// const result = await uploadWithFormData('/welders/', formData, 'POST')

export type ApiClient = typeof api
