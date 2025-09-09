import { api } from "./api/api"
import { API_ROUTES } from "@/constants/api-routes"
import {
  CalibrationTestingResponseSchema,
  CalibrationTestingListResponseSchema,
  CalibrationTestingResponse as CalibrationTest,
  CreateCalibrationTestingData as CreateCalibrationTestData,
  UpdateCalibrationTestingData as UpdateCalibrationTestData,
} from "@/lib/schemas/calibration-testing"

export type { CalibrationTest }
export type { CreateCalibrationTestData, UpdateCalibrationTestData }

export const calibrationTestService = {
  async getAll(page: number = 1): Promise<{ results: CalibrationTest[]; count: number; next: string | null; previous: string | null }> {
    const endpoint = API_ROUTES.Lab_MANAGERS.ALL_CALIBRATION_TESTS.replace(/^\//, "")
    const response = await api.get(endpoint, {
      searchParams: { page: page.toString() }
    }).json()
    const validated = CalibrationTestingListResponseSchema.parse(response)
    return {
      results: validated.results,
      count: validated.count,
      next: (validated.next as any) ?? null,
      previous: (validated.previous as any) ?? null,
    }
  },

  async getById(id: string | number): Promise<CalibrationTest> {
    const endpoint = API_ROUTES.Lab_MANAGERS.CALIBRATION_TEST_BY_ID(String(id)).replace(/^\//, "")
    const response = await api.get(endpoint).json()
    return CalibrationTestingResponseSchema.parse(response)
  },

  async create(data: CreateCalibrationTestData): Promise<CalibrationTest> {
    const endpoint = API_ROUTES.Lab_MANAGERS.ADD_CALIBRATION_TEST.replace(/^\//, "")
    const response = await api.post(endpoint, { json: data }).json()
    return CalibrationTestingResponseSchema.parse(response)
  },

  async update(id: string | number, data: UpdateCalibrationTestData): Promise<CalibrationTest> {
    const endpoint = API_ROUTES.Lab_MANAGERS.UPDATE_CALIBRATION_TEST(String(id)).replace(/^\//, "")
    const response = await api.patch(endpoint, { json: data }).json()
    return CalibrationTestingResponseSchema.parse(response)
  },

  async delete(id: string | number): Promise<void> {
    const endpoint = API_ROUTES.Lab_MANAGERS.DELETE_CALIBRATION_TEST(String(id)).replace(/^\//, "")
    await api.delete(endpoint)
  },

  async search(query: string, page: number = 1): Promise<{ results: CalibrationTest[]; count: number; next: string | null; previous: string | null }> {
    const endpoint = API_ROUTES.Lab_MANAGERS.SEARCH_CALIBRATION_TESTS.replace(/^\//, "")
    const response = await api.get(endpoint, {
      searchParams: { q: query, page: page.toString() }
    }).json()
    const validated = CalibrationTestingListResponseSchema.parse(response)
    return {
      results: validated.results,
      count: validated.count,
      next: (validated.next as any) ?? null,
      previous: (validated.previous as any) ?? null,
    }
  },
}

