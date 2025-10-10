import { API_ROUTES } from "@/constants/api-routes"
import { api } from "@/lib/api/api"
import {
  SamplePreparationResponse,
  SamplePreparationListResponse,
  CreateSamplePreparationData,
  UpdateSamplePreparationData,
  SpecimenResponse,
  CreateSpecimenData,
  UpdateSpecimenData,
} from "@/lib/schemas/sample-preparation"

export const samplePreparationService = {
  // Sample Preparation CRUD
  async getAll(page: number = 1): Promise<SamplePreparationListResponse> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.ALL_SAMPLE_PREPARATIONS, { 
      searchParams: { page: page.toString() } 
    }).json<{
      status: string
      data: any[]
      total: number
    }>()
    
    if (response.status === "success" && response.data) {
      return {
        status: response.status,
        data: response.data,
        total: response.total,
      }
    }
    
    throw new Error("Failed to get sample preparations")
  },

  async getById(id: string): Promise<SamplePreparationResponse> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.SAMPLE_PREPARATION_BY_ID(id)).json<{
      status: string
      data: any
    }>()
    
    if (response.status === "success" && response.data) {
      return response.data
    }
    
    throw new Error("Failed to get sample preparation")
  },

  async create(data: CreateSamplePreparationData): Promise<SamplePreparationResponse> {
    const response = await api.post(API_ROUTES.Lab_MANAGERS.ADD_SAMPLE_PREPARATION, { json: data }).json()
    return response as SamplePreparationResponse
  },

  async update(id: string, data: UpdateSamplePreparationData): Promise<SamplePreparationResponse> {
    const response = await api.put(API_ROUTES.Lab_MANAGERS.UPDATE_SAMPLE_PREPARATION(id), { json: data }).json()
    return response as SamplePreparationResponse
  },

  async delete(id: string): Promise<void> {
    await api.delete(API_ROUTES.Lab_MANAGERS.DELETE_SAMPLE_PREPARATION(id))
  },

  async search(query: string, page: number = 1, filters?: any): Promise<SamplePreparationListResponse> {
    const searchParams: Record<string, string> = { q: query, page: page.toString() }
    
    // Add filter parameters if provided
    if (filters) {
      if (filters.jobId) searchParams.job_id = filters.jobId
      if (filters.clientName) searchParams.client_name = filters.clientName
      if (filters.projectName) searchParams.project_name = filters.projectName
      if (filters.specimenId) searchParams.specimen_id = filters.specimenId
      if (filters.dateFrom) searchParams.date_from = filters.dateFrom
      if (filters.dateTo) searchParams.date_to = filters.dateTo
    }
    
    const response = await api.get(API_ROUTES.Lab_MANAGERS.SEARCH_SAMPLE_PREPARATIONS, { 
      searchParams 
    }).json<{
      status: string
      data: any[]
      total: number
    }>()
    
    if (response.status === "success" && response.data) {
      return {
        status: response.status,
        data: response.data,
        total: response.total,
      }
    }
    
    throw new Error("Failed to search sample preparations")
  },

  // Specimen CRUD
  async getSpecimenById(id: string): Promise<SpecimenResponse> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.SPECIMEN_BY_ID(id)).json()
    return response as SpecimenResponse
  },

  async createSpecimen(data: CreateSpecimenData): Promise<SpecimenResponse> {
    const response = await api.post(API_ROUTES.Lab_MANAGERS.ADD_SPECIMEN, { json: data }).json()
    return response as SpecimenResponse
  },

  async updateSpecimen(id: string, data: UpdateSpecimenData): Promise<SpecimenResponse> {
    const response = await api.put(API_ROUTES.Lab_MANAGERS.UPDATE_SPECIMEN(id), { json: data }).json()
    return response as SpecimenResponse
  },

  async deleteSpecimen(id: string): Promise<void> {
    await api.delete(API_ROUTES.Lab_MANAGERS.DELETE_SPECIMEN(id))
  },

  // Get sample preparations by job ID
  async getByJobId(jobId: string): Promise<{
    status: string
    data: any[]
    total: number
    job_oid: string
    job_id: string
    project_name: string
    client_name: string
  }> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.GET_SAMPLE_PREPARATIONS_BY_JOB_ID(jobId)).json<{
      status: string
      data: any[]
      total: number
      job_oid: string
      job_id: string
      project_name: string
      client_name: string
    }>()
    
    if (response.status === "success") {
      return response
    }
    
    throw new Error("Failed to get sample preparations by job ID")
  },
}

export type {
  SamplePreparationResponse,
  SamplePreparationListResponse,
  CreateSamplePreparationData,
  UpdateSamplePreparationData,
  SpecimenResponse,
  CreateSpecimenData,
  UpdateSpecimenData,
}
