import { api } from "./api/ky"
import { z } from "zod"
import { API_ROUTES } from "@/constants/api-routes"

// Schema
export const ProficiencyTestSchema = z.object({
  id: z.string(),
  description: z.string(),
  lastTestDate: z.string().nullable().optional(),
  nextScheduledDate: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  provider1: z.string().nullable().optional(),
  provider2: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export const ProficiencyTestListSchema = z.object({
  count: z.number(),
  next: z.string().nullable().optional(),
  previous: z.string().nullable().optional(),
  results: z.array(ProficiencyTestSchema),
})

export type ProficiencyTest = z.infer<typeof ProficiencyTestSchema>
export type ProficiencyTestListResponse = z.infer<typeof ProficiencyTestListSchema>

export type CreateProficiencyTestData = {
  description: string
  lastTestDate?: string
  nextScheduledDate?: string
  dueDate?: string
  provider1?: string
  provider2?: string
  status?: string
  remarks?: string
}

export type UpdateProficiencyTestData = Partial<CreateProficiencyTestData>

export const proficiencyTestService = {
  async getAll(page: number = 1): Promise<{ results: ProficiencyTest[]; count: number; next: string | null; previous: string | null }> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.ALL_PROF_TESTS, {
      searchParams: { page, is_active: true }
    }).json()
    const validated = ProficiencyTestListSchema.parse(response)
    return {
      results: validated.results,
      count: validated.count,
      next: validated.next ?? null,
      previous: validated.previous ?? null,
    }
  },

  async getById(id: string | number): Promise<ProficiencyTest> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.PROF_TEST_BY_ID(String(id))).json()
    return ProficiencyTestSchema.parse(response)
  },

  async create(data: CreateProficiencyTestData): Promise<ProficiencyTest> {
    const response = await api.post(API_ROUTES.Lab_MANAGERS.ADD_PROF_TEST, { json: data }).json()
    return ProficiencyTestSchema.parse(response)
  },

  async update(id: string | number, data: UpdateProficiencyTestData): Promise<ProficiencyTest> {
    const response = await api.patch(API_ROUTES.Lab_MANAGERS.UPDATE_PROF_TEST(String(id)), { json: data }).json()
    return ProficiencyTestSchema.parse(response)
  },

  async delete(id: string | number): Promise<void> {
    await api.delete(API_ROUTES.Lab_MANAGERS.DELETE_PROF_TEST(String(id)))
  },

  async search(query: string, page: number = 1): Promise<{ results: ProficiencyTest[]; count: number; next: string | null; previous: string | null }> {
    // Use searchParams so spaces are encoded as '+' rather than '%20' to match backend behavior
    const response = await api.get(API_ROUTES.Lab_MANAGERS.SEARCH_PROF_TESTS, {
      searchParams: { q: query, page }
    }).json()
    const validated = ProficiencyTestListSchema.parse(response)
    return {
      results: validated.results,
      count: validated.count,
      next: validated.next ?? null,
      previous: validated.previous ?? null,
    }
  },
}

