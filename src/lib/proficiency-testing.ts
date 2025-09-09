import { api } from "./api/api"
import { API_ROUTES } from "@/constants/api-routes"
import {
  ProficiencyTestingResponseSchema,
  ProficiencyTestingListResponseSchema,
  ProficiencyTestingResponse as ProficiencyTest,
  CreateProficiencyTestingData as CreateProficiencyTestData,
  UpdateProficiencyTestingData as UpdateProficiencyTestData,
} from "@/lib/schemas/proficiency-testing"

export type { ProficiencyTest }
export type { CreateProficiencyTestData, UpdateProficiencyTestData }

export const proficiencyTestService = {
  async getAll(page: number = 1): Promise<{ results: ProficiencyTest[]; count: number; next: string | null; previous: string | null }> {
    const endpoint = API_ROUTES.Lab_MANAGERS.ALL_PROF_TESTS.replace(/^\//, "")
    const response = await api.get(endpoint, {
      searchParams: { page: page.toString() }
    }).json()
    const validated = ProficiencyTestingListResponseSchema.parse(response)
    return {
      results: validated.results,
      count: validated.count,
      next: (validated.next as any) ?? null,
      previous: (validated.previous as any) ?? null,
    }
  },

  async getById(id: string | number): Promise<ProficiencyTest> {
    const endpoint = API_ROUTES.Lab_MANAGERS.PROF_TEST_BY_ID(String(id)).replace(/^\//, "")
    const response = await api.get(endpoint).json()
    return ProficiencyTestingResponseSchema.parse(response)
  },

  async create(data: CreateProficiencyTestData): Promise<ProficiencyTest> {
    const endpoint = API_ROUTES.Lab_MANAGERS.ADD_PROF_TEST.replace(/^\//, "")
    const response = await api.post(endpoint, { json: data }).json()
    return ProficiencyTestingResponseSchema.parse(response)
  },

  async update(id: string | number, data: UpdateProficiencyTestData): Promise<ProficiencyTest> {
    const endpoint = API_ROUTES.Lab_MANAGERS.UPDATE_PROF_TEST(String(id)).replace(/^\//, "")
    const response = await api.patch(endpoint, { json: data }).json()
    return ProficiencyTestingResponseSchema.parse(response)
  },

  async delete(id: string | number): Promise<void> {
    const endpoint = API_ROUTES.Lab_MANAGERS.DELETE_PROF_TEST(String(id)).replace(/^\//, "")
    await api.delete(endpoint)
  },

  async search(query: string, page: number = 1): Promise<{ results: ProficiencyTest[]; count: number; next: string | null; previous: string | null }> {
    const endpoint = API_ROUTES.Lab_MANAGERS.SEARCH_PROF_TESTS.replace(/^\//, "")
    const response = await api.get(endpoint, {
      searchParams: { q: query, page: page.toString() }
    }).json()
    const validated = ProficiencyTestingListResponseSchema.parse(response)
    return {
      results: validated.results,
      count: validated.count,
      next: (validated.next as any) ?? null,
      previous: (validated.previous as any) ?? null,
    }
  },
}

