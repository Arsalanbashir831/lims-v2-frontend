import { api } from '@/lib/api/api'
import { API_ROUTES } from '@/constants/api-routes'

// Job interfaces based on the API response
export interface Job {
  id: string
  job_id: string
  client_id: string
  client_name: string
  project_name: string
  receive_date: string
  received_by: string | null
  remarks: string | null
  sample_lots_count: number
  job_created_at: string
  created_at: string
  updated_at: string
}

export interface JobsResponse {
  status: string
  data: Job[]
  pagination: {
    current_page: number
    limit: number
    total_records: number
    total_pages: number
    has_next: boolean
  }
}

export interface JobsSearchParams {
  page?: number
  limit?: number
  search?: string
  job_id?: string
}

class JobsService {
  async getAll(params: JobsSearchParams = {}): Promise<JobsResponse> {
    const searchParams = new URLSearchParams()
    
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.job_id) searchParams.append('job_id', params.job_id)

    const url = params.job_id 
      ? `${API_ROUTES.Lab_MANAGERS.SEARCH_SAMPLE_INFORMATION}?${searchParams.toString()}`
      : `${API_ROUTES.Lab_MANAGERS.ALL_SAMPLE_INFORMATION}?${searchParams.toString()}`

    const response = await api.get(url).json<JobsResponse>()
    return response
  }

  async search(query: string, params: JobsSearchParams = {}): Promise<JobsResponse> {
    return this.getAll({ ...params, job_id: query })
  }

  async getById(id: string): Promise<{ status: string; data: Job }> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.SAMPLE_INFORMATION_BY_ID(id)).json<{ status: string; data: Job }>()
    return response
  }
}

export const jobsService = new JobsService()
