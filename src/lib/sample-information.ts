import { API_ROUTES } from "@/constants/api-routes"
import { api } from "./api/api"
import {
  SampleInformationResponseSchema,
  SampleInformationListResponseSchema,
  SampleInformationResponse,
  CreateSampleInformationData,
  UpdateSampleInformationData,
} from "@/lib/schemas/sample-information"

export type SampleInformation = {
  job_id: string
  project_name: string | null | undefined
  client_id: string
  client_name?: string
  end_user: string | null | undefined
  receive_date: string | null | undefined
  remarks?: string | null | undefined
  sample_count?: number
  is_active: boolean
}

// Re-export types from schema
export type { SampleInformationResponse }

function mapToUi(item: SampleInformationResponse): SampleInformation {
  return {
    job_id: item.job_id,
    project_name: (item as any).project_name ?? null,
    client_id: (item as any).client_id ?? "",
    client_name: (item as any).client_name ?? "",
    end_user: (item as any).end_user ?? null,
    receive_date: (item as any).receive_date ?? null,
    remarks: (item as any).remarks ?? null,
    sample_count: (item as any).sample_count ?? 0,
    is_active: (item as any).is_active !== false,
  }
}

export const sampleInformationService = {
  async getAll(page: number = 1): Promise<{ results: SampleInformation[]; count: number; next: string | null; previous: string | null }> {
    const endpoint = API_ROUTES.Lab_MANAGERS.ALL_SAMPLE_INFORMATION.replace(/^\//, "")
    const response = await api.get(endpoint, { searchParams: { page: page.toString() } }).json()
    const validated = SampleInformationListResponseSchema.parse(response)
    return {
      results: validated.results.map(mapToUi),
      count: validated.count,
      next: (validated.next as any) ?? null,
      previous: (validated.previous as any) ?? null,
    }
  },

  async getById(id: string): Promise<SampleInformationResponse> {
    const endpoint = API_ROUTES.Lab_MANAGERS.SAMPLE_INFORMATION_BY_ID(id).replace(/^\//, "")
    const response = await api.get(endpoint).json()
    return SampleInformationResponseSchema.parse(response)
  },

  async create(data: CreateSampleInformationData): Promise<SampleInformationResponse> {
    const endpoint = API_ROUTES.Lab_MANAGERS.ADD_SAMPLE_INFORMATION.replace(/^\//, "")
    const response = await api.post(endpoint, { json: data }).json()
    return SampleInformationResponseSchema.parse(response)
  },

  async update(id: string, data: UpdateSampleInformationData): Promise<SampleInformationResponse> {
    const endpoint = API_ROUTES.Lab_MANAGERS.UPDATE_SAMPLE_INFORMATION(id).replace(/^\//, "")
    const response = await api.patch(endpoint, { json: data }).json()
    return SampleInformationResponseSchema.parse(response)
  },

  async delete(id: string): Promise<void> {
    const endpoint = API_ROUTES.Lab_MANAGERS.DELETE_SAMPLE_INFORMATION(id).replace(/^\//, "")
    await api.delete(endpoint)
  },

  async search(query: string, page: number = 1): Promise<{ results: SampleInformation[]; count: number; next: string | null; previous: string | null }> {
    const endpoint = API_ROUTES.Lab_MANAGERS.SEARCH_SAMPLE_INFORMATION.replace(/^\//, "")
    const response = await api.get(endpoint, { searchParams: { q: query, page: page.toString() } }).json()
    const validated = SampleInformationListResponseSchema.parse(response)
    return {
      results: validated.results.map(mapToUi),
      count: validated.count,
      next: (validated.next as any) ?? null,
      previous: (validated.previous as any) ?? null,
    }
  },

  async getCompleteSampleInformation(id: string): Promise<{ job: any, lots: any[] }> {
    const endpoint = API_ROUTES.Lab_MANAGERS.SAMPLE_INFORMATION_COMPLETE_INFO(id).replace(/^\//, "")
    const response = await api.get(endpoint).json()
    return response as { job: any, lots: any[] }
  },
}
export type { CreateSampleInformationData, UpdateSampleInformationData }

