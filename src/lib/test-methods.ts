import { z } from "zod"
import { API_ROUTES } from "@/constants/api-routes"
import { api } from "./api/ky"

// API response schemas
const TestMethodSchema = z.object({
  id: z.string(),
  test_name: z.string(),
  test_description: z.string().nullable().optional(),
  test_columns: z.array(z.string()),
  comments: z.string().nullable().optional(),
  is_active: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  version: z.number().optional(),
  created_by: z.number().optional(),
  updated_by: z.number().optional(),
  created_by_name: z.string().optional(),
  updated_by_name: z.string().optional(),
  column_count: z.number().optional(),
})

const TestMethodListResponseSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(TestMethodSchema),
})

// TypeScript types
export type TestMethod = z.infer<typeof TestMethodSchema>

export type CreateTestMethodData = {
  test_name: string
  test_description?: string
  test_columns: string[]
  comments?: string
  is_active?: boolean
}

export type UpdateTestMethodData = Partial<CreateTestMethodData>

// API client
export const testMethodService = {
  async getAll(page: number = 1): Promise<{ results: TestMethod[]; count: number; next: string | null; previous: string | null }> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.ALL_TEST_METHODS, {
      searchParams: { is_active: true, page }
    }).json()
    const validated = TestMethodListResponseSchema.parse(response)
    return {
      results: validated.results,
      count: validated.count,
      next: validated.next ?? null,
      previous: validated.previous ?? null,
    }
  },

  async getById(id: string): Promise<TestMethod> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.TEST_METHOD_BY_ID(id)).json()
    return TestMethodSchema.parse(response)
  },

  async create(data: CreateTestMethodData): Promise<TestMethod> {
    const response = await api.post(API_ROUTES.Lab_MANAGERS.ADD_TEST_METHOD, {
      json: data
    }).json()
    return TestMethodSchema.parse(response)
  },

  async update(id: string, data: UpdateTestMethodData): Promise<TestMethod> {
    const response = await api.put(API_ROUTES.Lab_MANAGERS.UPDATE_TEST_METHOD(id), {
      json: data
    }).json()
    return TestMethodSchema.parse(response)
  },

  async delete(id: string): Promise<void> {
    await api.delete(API_ROUTES.Lab_MANAGERS.DELETE_TEST_METHOD(id))
  },

  async search(query: string, page: number = 1): Promise<{ results: TestMethod[]; count: number; next: string | null; previous: string | null }> {
    const url = `${API_ROUTES.Lab_MANAGERS.SEARCH_TEST_METHODS}?q=${query}&page=${page}`
    const response = await api.get(url).json()
    const validated = TestMethodListResponseSchema.parse(response)
    return {
      results: validated.results,
      count: validated.count,
      next: validated.next ?? null,
      previous: validated.previous ?? null,
    }
  },
}