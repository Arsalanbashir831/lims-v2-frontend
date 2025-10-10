import { API_ROUTES } from "@/constants/api-routes"
import { api } from "@/lib/api/api"
import {
  TestMethodResponse,
  TestMethodListResponse,
  CreateTestMethodData,
  UpdateTestMethodData,
} from "@/lib/schemas/test-method"

export const testMethodService = {
  async getAll(page: number = 1): Promise<TestMethodListResponse> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.ALL_TEST_METHODS, { 
      searchParams: { page: page.toString() } 
    }).json<{
      status: string
      data: TestMethodResponse[]
      pagination: {
        current_page: number
        limit: number
        total_records: number
        total_pages: number
        has_next: boolean
      }
    }>()

    // Extract the data field from Django response
    if (response.status === "success" && response.data) {
      return {
        results: response.data,
        count: response.pagination.total_records,
        next: response.pagination.has_next ? `page=${page + 1}` : null,
        previous: page > 1 ? `page=${page - 1}` : null
      }
    }
    
    throw new Error("Failed to get test methods")
  },

  async getById(id: string): Promise<TestMethodResponse> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.TEST_METHOD_BY_ID(id)).json<{
      status: string
      data: TestMethodResponse
    }>()

    // Extract the data field from Django response
    if (response.status === "success" && response.data) {
      return response.data
    }
    
    throw new Error("Failed to get test method")
  },

  async create(data: CreateTestMethodData): Promise<TestMethodResponse> {
    const response = await api.post(API_ROUTES.Lab_MANAGERS.ADD_TEST_METHOD, { json: data }).json<{
      status: string
      data: TestMethodResponse
    }>()

    // Extract the data field from Django response
    if (response.status === "success" && response.data) {
      return response.data
    }
    
    throw new Error("Failed to create test method")
  },

  async update(id: string, data: UpdateTestMethodData): Promise<TestMethodResponse> {
    const response = await api.put(API_ROUTES.Lab_MANAGERS.UPDATE_TEST_METHOD(id), { json: data }).json<{
      status: string
      data: TestMethodResponse
    }>()

    // Extract the data field from Django response
    if (response.status === "success" && response.data) {
      return response.data
    }
    
    throw new Error("Failed to update test method")
  },

  async delete(id: string): Promise<void> {
    await api.delete(API_ROUTES.Lab_MANAGERS.DELETE_TEST_METHOD(id))
  },

  async search(query: string, page: number = 1): Promise<TestMethodListResponse> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.SEARCH_TEST_METHODS, { 
      searchParams: { test_name: query, page: page.toString() } 
    }).json<{
      status: string
      data: TestMethodResponse[]
      total: number
      filters_applied: {
        test_name: string
        test_description: string
        hasImage: string
      }
    }>()

    // Extract the data field from Django response
    if (response.status === "success" && response.data) {
      return {
        results: response.data,
        count: response.total,
        next: null, // Search doesn't provide pagination URLs
        previous: null
      }
    }
    
    throw new Error("Failed to search test methods")
  },
}

export type {
  TestMethodResponse,
  TestMethodListResponse,
  CreateTestMethodData,
  UpdateTestMethodData,
}
