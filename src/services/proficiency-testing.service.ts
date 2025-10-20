import { API_ROUTES } from "@/constants/api-routes"
import { api } from "@/lib/api/api"
import {
  ProficiencyTestingResponse,
  ProficiencyTestingListResponse,
  CreateProficiencyTestingData,
  UpdateProficiencyTestingData,
} from "@/lib/schemas/proficiency-testing"

export type ProficiencyTesting = ProficiencyTestingResponse

type PaginationInfo = {
  current_page: number
  limit: number
  total_records: number
  total_pages: number
  has_next: boolean
}

export const proficiencyTestingService = {
  async getAll(page: number = 1): Promise<{ results: ProficiencyTesting[]; count: number; next: string | null; previous: string | null; pagination?: PaginationInfo }> {
    const endpoint = `${API_ROUTES.Lab_MANAGERS.ALL_PROF_TESTS}?page=${page}`
    const response = await api.get(endpoint).json<ProficiencyTestingListResponse>()
    
    // Transform to expected format
    return {
      results: response.data ?? response.results ?? [],
      count: response.pagination?.total_records ?? response.count ?? 0,
      next: response.pagination?.has_next ? 'next' : null,
      previous: (response.pagination?.current_page ?? 1) > 1 ? 'prev' : null,
      pagination: response.pagination
    }
  },

  async getById(id: string): Promise<ProficiencyTestingResponse> {
    const endpoint = API_ROUTES.Lab_MANAGERS.PROF_TEST_BY_ID(id)
    const response = await api.get(endpoint).json<{ data: unknown } | unknown>()
    const responseData = response && typeof response === 'object' && 'data' in response ? response.data : response
    return responseData as ProficiencyTestingResponse
  },

  async create(data: CreateProficiencyTestingData): Promise<ProficiencyTestingResponse> {
    const endpoint = API_ROUTES.Lab_MANAGERS.ADD_PROF_TEST
    const response = await api.post(endpoint, { json: data }).json<{ data: unknown } | unknown>()
    const responseData = response && typeof response === 'object' && 'data' in response ? response.data : response
    return responseData as ProficiencyTestingResponse
  },

  async update(id: string, data: UpdateProficiencyTestingData): Promise<ProficiencyTestingResponse> {
    const endpoint = API_ROUTES.Lab_MANAGERS.UPDATE_PROF_TEST(id)
    const response = await api.put(endpoint, { json: data }).json<{ data: unknown } | unknown>()
    const responseData = response && typeof response === 'object' && 'data' in response ? response.data : response
    return responseData as ProficiencyTestingResponse
  },

  async delete(id: string): Promise<void> {
    await api.delete(API_ROUTES.Lab_MANAGERS.DELETE_PROF_TEST(id))
  },

  async search(query: string, page: number = 1): Promise<{ results: ProficiencyTesting[]; count: number; next: string | null; previous: string | null; pagination?: PaginationInfo }> {
    const endpoint = `${API_ROUTES.Lab_MANAGERS.SEARCH_PROF_TESTS}?description=${query}&page=${page}`
    const response = await api.get(endpoint).json<ProficiencyTestingListResponse>()
    
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
  ProficiencyTestingResponse,
  ProficiencyTestingListResponse,
  CreateProficiencyTestingData,
  UpdateProficiencyTestingData,
}
