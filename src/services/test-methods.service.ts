import { api } from "@/lib/api/api"
import {
  TestMethodResponse,
  TestMethodListResponse,
  CreateTestMethodData,
  UpdateTestMethodData,
} from "@/lib/schemas/test-method"

export const testMethodService = {
  async getAll(page: number = 1): Promise<TestMethodListResponse> {
    const response = await api.get(`test-methods?page=${page}`).json()
    return response as TestMethodListResponse
  },

  async getById(id: string): Promise<TestMethodResponse> {
    const response = await api.get(`test-methods/${id}`).json()
    return response as TestMethodResponse
  },

  async create(data: CreateTestMethodData): Promise<TestMethodResponse> {
    const response = await api.post("test-methods", { json: data }).json()
    return response as TestMethodResponse
  },

  async update(id: string, data: UpdateTestMethodData): Promise<TestMethodResponse> {
    const response = await api.patch(`test-methods/${id}`, { json: data }).json()
    return response as TestMethodResponse
  },

  async delete(id: string): Promise<void> {
    await api.delete(`test-methods/${id}`)
  },

  async search(query: string, page: number = 1): Promise<TestMethodListResponse> {
    const response = await api.get(`test-methods/search?q=${query}&page=${page}`).json()
    return response as TestMethodListResponse
  },
}

export type {
  TestMethodResponse,
  TestMethodListResponse,
  CreateTestMethodData,
  UpdateTestMethodData,
}
