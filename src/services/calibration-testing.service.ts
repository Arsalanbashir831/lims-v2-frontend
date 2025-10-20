import { API_ROUTES } from "@/constants/api-routes"
import { api } from "@/lib/api/api"
import {
  CalibrationTestingResponse,
  CalibrationTestingListResponse,
  CreateCalibrationTestingData,
  UpdateCalibrationTestingData,
} from "@/lib/schemas/calibration-testing"

export type CalibrationTesting = CalibrationTestingResponse

type PaginationInfo = {
  current_page: number
  limit: number
  total_records: number
  total_pages: number
  has_next: boolean
}

export const calibrationTestingService = {
  async getAll(page: number = 1): Promise<{ results: CalibrationTesting[]; count: number; next: string | null; previous: string | null; pagination?: PaginationInfo }> {
    const endpoint = `${API_ROUTES.Lab_MANAGERS.ALL_CALIBRATION_TESTS}?page=${page}`
    const response = await api.get(endpoint).json<CalibrationTestingListResponse>()
    
    // Transform to expected format
    return {
      results: response.data ?? response.results ?? [],
      count: response.pagination?.total_records ?? response.count ?? 0,
      next: response.pagination?.has_next ? 'next' : null,
      previous: (response.pagination?.current_page ?? 1) > 1 ? 'prev' : null,
      pagination: response.pagination
    }
  },

  async getById(id: string): Promise<CalibrationTestingResponse> {
    const endpoint = API_ROUTES.Lab_MANAGERS.CALIBRATION_TEST_BY_ID(id)
    const response = await api.get(endpoint).json<{ data: unknown } | unknown>()
    const responseData = response && typeof response === 'object' && 'data' in response ? response.data : response
    return responseData as CalibrationTestingResponse
  },

  async create(data: CreateCalibrationTestingData): Promise<CalibrationTestingResponse> {
    const endpoint = API_ROUTES.Lab_MANAGERS.ADD_CALIBRATION_TEST
    const response = await api.post(endpoint, { json: data }).json<{ data: unknown } | unknown>()
    const responseData = response && typeof response === 'object' && 'data' in response ? response.data : response
    return responseData as CalibrationTestingResponse
  },

  async update(id: string, data: UpdateCalibrationTestingData): Promise<CalibrationTestingResponse> {
    const endpoint = API_ROUTES.Lab_MANAGERS.UPDATE_CALIBRATION_TEST(id)
    const response = await api.put(endpoint, { json: data }).json<{ data: unknown } | unknown>()
    const responseData = response && typeof response === 'object' && 'data' in response ? response.data : response
    return responseData as CalibrationTestingResponse
  },

  async delete(id: string): Promise<void> {
    await api.delete(API_ROUTES.Lab_MANAGERS.DELETE_CALIBRATION_TEST(id))
  },

  async search(query: string, page: number = 1): Promise<{ results: CalibrationTesting[]; count: number; next: string | null; previous: string | null; pagination?: PaginationInfo }> {
    const endpoint = `${API_ROUTES.Lab_MANAGERS.SEARCH_CALIBRATION_TESTS}?equipment_name=${query}&page=${page}`
    const response = await api.get(endpoint).json<CalibrationTestingListResponse>()
    
    // Transform to expected format
    return {
      results: response.data ?? response.results ?? [],
      count: response.pagination?.total_records ?? response.count ?? 0,
      next: response.pagination?.has_next ? 'next' : null,
      previous: (response.pagination?.current_page ?? 1) > 1 ? 'prev' : null,
      pagination: response.pagination
    }
  },
}

export type {
  CalibrationTestingResponse,
  CalibrationTestingListResponse,
  CreateCalibrationTestingData,
  UpdateCalibrationTestingData,
}
