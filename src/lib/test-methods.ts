import { API_ROUTES } from "@/constants/api-routes"
import { api } from "./api/api"
import {
  TestMethodResponseSchema,
  TestMethodListResponseSchema,
  TestMethodResponse as TestMethod,
  CreateTestMethodData,
  UpdateTestMethodData,
} from "@/lib/schemas/test-method"

export type { TestMethod }
export type { CreateTestMethodData, UpdateTestMethodData }

export const testMethodService = {
  async getAll(page: number = 1): Promise<{ results: TestMethod[]; count: number; next: string | null; previous: string | null }> {
    const endpoint = API_ROUTES.Lab_MANAGERS.ALL_TEST_METHODS.replace(/^\//, "")
    const response = await api.get(endpoint, {
      searchParams: { page: page.toString() }
    }).json()
    const validated = TestMethodListResponseSchema.parse(response)
    return {
      results: validated.results,
      count: validated.count,
      next: (validated.next as any) ?? null,
      previous: (validated.previous as any) ?? null,
    }
  },

  async getById(id: string): Promise<TestMethod> {
    const endpoint = API_ROUTES.Lab_MANAGERS.TEST_METHOD_BY_ID(id).replace(/^\//, "")
    const response = await api.get(endpoint).json()
    return TestMethodResponseSchema.parse(response)
  },

  async create(data: CreateTestMethodData): Promise<TestMethod> {
    const endpoint = API_ROUTES.Lab_MANAGERS.ADD_TEST_METHOD.replace(/^\//, "")
    const response = await api.post(endpoint, {
      json: data
    }).json()
    return TestMethodResponseSchema.parse(response)
  },

  async update(id: string, data: UpdateTestMethodData): Promise<TestMethod> {
    const endpoint = API_ROUTES.Lab_MANAGERS.UPDATE_TEST_METHOD(id).replace(/^\//, "")
    const response = await api.patch(endpoint, {
      json: data
    }).json()
    return TestMethodResponseSchema.parse(response)
  },

  async delete(id: string): Promise<void> {
    const endpoint = API_ROUTES.Lab_MANAGERS.DELETE_TEST_METHOD(id).replace(/^\//, "")
    await api.delete(endpoint)
  },

  async search(query: string, page: number = 1): Promise<{ results: TestMethod[]; count: number; next: string | null; previous: string | null }> {
    const endpoint = API_ROUTES.Lab_MANAGERS.SEARCH_TEST_METHODS.replace(/^\//, "")
    const response = await api.get(endpoint, {
      searchParams: { q: query, page: page.toString() }
    }).json()
    const validated = TestMethodListResponseSchema.parse(response)
    return {
      results: validated.results,
      count: validated.count,
      next: (validated.next as any) ?? null,
      previous: (validated.previous as any) ?? null,
    }
  },
}