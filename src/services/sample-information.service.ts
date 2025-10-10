import { API_ROUTES } from "@/constants/api-routes"
import { api } from "@/lib/api/api"
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
  sample_lots_count?: number
  is_active: boolean
}

// Re-export types from schema
export type { SampleInformationResponse }

function mapToUi(item: SampleInformationResponse): SampleInformation {
  return {
    job_id: item.job_id,
    project_name: (item as any).project_name ?? null,
    client_id: (item as any).client_id ?? "",
    client_name: (item as any).client_info?.client_name ?? (item as any).client_name ?? "",
    end_user: (item as any).end_user ?? null,
    receive_date: (item as any).receive_date ?? null,
    remarks: (item as any).remarks ?? null,
    sample_lots_count: (item as any).sample_lots_count ?? 0,
    is_active: (item as any).is_active !== false,
  }
}

export const sampleInformationService = {
  async getAll(page: number = 1): Promise<{ results: SampleInformation[]; count: number; next: string | null; previous: string | null }> {
    const endpoint = API_ROUTES.Lab_MANAGERS.ALL_SAMPLE_INFORMATION
    const response = await api.get(endpoint, { searchParams: { page: page.toString() } }).json<{
      status: string
      data: any[]
      pagination: {
        current_page: number
        limit: number
        total_records: number
        total_pages: number
        has_next: boolean
      }
    }>()
    
    // Extract the data field from Django response
    if (response.status === "success" && response.data) {
      return {
        results: response.data.map((item: any) => ({
          ...mapToUi(item),
          id: item.id || item._id, // Ensure id field is included
        })),
        count: response.pagination.total_records,
        next: response.pagination.has_next ? 'next' : null,
        previous: response.pagination.current_page > 1 ? 'prev' : null,
      }
    }
    
    throw new Error("Failed to get sample information")
  },

  async getById(id: string): Promise<SampleInformationResponse> {
    const endpoint = API_ROUTES.Lab_MANAGERS.SAMPLE_INFORMATION_BY_ID(id)
    const response = await api.get(endpoint).json<{
      status: string
      data: {
        id: string
        job_id: string
        client_id: string
        client_info: {
          client_id: string
          client_name: string
          company_name: string
          email: string
          phone: string
        }
        project_name: string
        end_user: string
        receive_date: string
        received_by: string
        remarks: string
        job_created_at: string
        created_at: string
        updated_at: string
      }
    }>()
    
    // Extract the data field from Django response
    if (response.status === "success" && response.data) {
      // Map Django response to our SampleInformationResponse format
      const sampleInfoData: SampleInformationResponse = {
        id: response.data.id,
        job_id: response.data.job_id,
        client_id: response.data.client_id,
        client_name: response.data.client_info.client_name,
        project_name: response.data.project_name,
        end_user: response.data.end_user,
        receive_date: response.data.receive_date,
        received_by: response.data.received_by,
        remarks: response.data.remarks,
        is_active: true,
        created_at: response.data.created_at,
        updated_at: response.data.updated_at,
        sample_lots_count: 0 // Not provided in detail response
      }
      return sampleInfoData
    }
    
    throw new Error("Failed to get sample information")
  },

  async create(data: CreateSampleInformationData): Promise<SampleInformationResponse> {
    const endpoint = API_ROUTES.Lab_MANAGERS.ADD_SAMPLE_INFORMATION
    const response = await api.post(endpoint, { json: data }).json<{
      status: string
      message: string
      data: {
        id: string
        job_id: string
        project_name: string
        client_name: string
      }
    }>()
    
    // Extract the data field from Django response
    if (response.status === "success" && response.data) {
      // Map Django response to our SampleInformationResponse format
      const sampleInfoData: SampleInformationResponse = {
        id: response.data.id,
        job_id: response.data.job_id,
        project_name: response.data.project_name,
        client_id: "", // Not provided in create response
        client_name: response.data.client_name,
        end_user: undefined,
        receive_date: undefined,
        remarks: undefined,
        sample_lots_count: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: undefined
      }
      return sampleInfoData
    }
    
    throw new Error(response.message || "Failed to create sample information")
  },

  async update(id: string, data: UpdateSampleInformationData): Promise<SampleInformationResponse> {
    const endpoint = API_ROUTES.Lab_MANAGERS.UPDATE_SAMPLE_INFORMATION(id)
    const response = await api.put(endpoint, { json: data }).json<{
      status: string
      message: string
      data: {
        id: string
        job_id: string
        project_name: string
        client_name: string
      }
    }>()
    
    // Extract the data field from Django response
    if (response.status === "success" && response.data) {
      // Map Django response to our SampleInformationResponse format
      const sampleInfoData: SampleInformationResponse = {
        id: response.data.id,
        job_id: response.data.job_id,
        project_name: response.data.project_name,
        client_id: "", // Not provided in update response
        client_name: response.data.client_name,
        end_user: undefined,
        receive_date: undefined,
        remarks: undefined,
        sample_lots_count: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      return sampleInfoData
    }
    
    throw new Error(response.message || "Failed to update sample information")
  },

  async delete(id: string): Promise<void> {
    const endpoint = API_ROUTES.Lab_MANAGERS.DELETE_SAMPLE_INFORMATION(id)
    await api.delete(endpoint)
  },

  async search(query: string, page: number = 1): Promise<{ results: any[]; count: number; next: string | null; previous: string | null }> {
    const endpoint = API_ROUTES.Lab_MANAGERS.SEARCH_SAMPLE_INFORMATION
    const response = await api.get(endpoint, { searchParams: { job_id: query, page: page.toString() } }).json<{
      status: string
      data: any[]
      total: number
      filters_applied?: any
    }>()
    
    // Extract the data field from Django response
    if (response.status === "success" && response.data) {
      return {
        results: response.data.map((item: any) => ({
          ...mapToUi(item),
          id: item.id || item._id, // Ensure id field is included
        })),
        count: response.total,
        next: null, // Simplified for now
        previous: null, // Simplified for now
      }
    }
    
    throw new Error("Failed to search sample information")
  },

  async getCompleteSampleInformation(id: string): Promise<{ job: any, lots: any[] }> {
    const endpoint = API_ROUTES.Lab_MANAGERS.SAMPLE_INFORMATION_COMPLETE_INFO(id)
    const response = await api.get(endpoint).json()
    return response as { job: any, lots: any[] }
  },
}
export type { CreateSampleInformationData, UpdateSampleInformationData }
