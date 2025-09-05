import { api } from "./api/ky"
import { z } from "zod"
import { API_ROUTES } from "@/constants/api-routes"

export const CalibrationTestSchema = z.object({
  id: z.string(),
  equipmentName: z.string(),
  equipmentSerial: z.string().nullable().optional(),
  calibrationVendor: z.string().nullable().optional(),
  calibrationDate: z.string().nullable().optional(),
  calibrationDueDate: z.string().nullable().optional(),
  calibrationCertification: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
  createdBy: z.string().nullable().optional(),
  updatedBy: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export const CalibrationTestListSchema = z.object({
  count: z.number(),
  next: z.string().nullable().optional(),
  previous: z.string().nullable().optional(),
  results: z.array(CalibrationTestSchema),
})

export type CalibrationTest = z.infer<typeof CalibrationTestSchema>
export type CalibrationTestListResponse = z.infer<typeof CalibrationTestListSchema>

export type CreateCalibrationTestData = {
  equipmentName: string
  equipmentSerial?: string
  calibrationVendor?: string
  calibrationDate?: string
  calibrationDueDate?: string
  calibrationCertification?: string
  remarks?: string
  createdBy?: string
  updatedBy?: string
}

export type UpdateCalibrationTestData = Partial<CreateCalibrationTestData>

export const calibrationTestService = {
  async getAll(page: number = 1): Promise<{ results: CalibrationTest[]; count: number; next: string | null; previous: string | null }> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.ALL_CALIBRATION_TESTS, {
      searchParams: { page, is_active: true }
    }).json()
    const validated = CalibrationTestListSchema.parse(response)
    return {
      results: validated.results,
      count: validated.count,
      next: validated.next ?? null,
      previous: validated.previous ?? null,
    }
  },

  async getById(id: string | number): Promise<CalibrationTest> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.CALIBRATION_TEST_BY_ID(String(id))).json()
    return CalibrationTestSchema.parse(response)
  },

  async create(data: CreateCalibrationTestData): Promise<CalibrationTest> {
    const response = await api.post(API_ROUTES.Lab_MANAGERS.ADD_CALIBRATION_TEST, { json: data }).json()
    return CalibrationTestSchema.parse(response)
  },

  async update(id: string | number, data: UpdateCalibrationTestData): Promise<CalibrationTest> {
    const response = await api.patch(API_ROUTES.Lab_MANAGERS.UPDATE_CALIBRATION_TEST(String(id)), { json: data }).json()
    return CalibrationTestSchema.parse(response)
  },

  async delete(id: string | number): Promise<void> {
    await api.delete(API_ROUTES.Lab_MANAGERS.DELETE_CALIBRATION_TEST(String(id)))
  },

  async search(query: string, page: number = 1): Promise<{ results: CalibrationTest[]; count: number; next: string | null; previous: string | null }> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.SEARCH_CALIBRATION_TESTS, {
      searchParams: { q: query, page }
    }).json()
    const validated = CalibrationTestListSchema.parse(response)
    return {
      results: validated.results,
      count: validated.count,
      next: validated.next ?? null,
      previous: validated.previous ?? null,
    }
  },
}

