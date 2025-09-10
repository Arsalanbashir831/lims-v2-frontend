import { api } from "./api/api"
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
    const response = await api.get(`sample-preparations?page=${page}`).json()
    return response as SamplePreparationListResponse
  },

  async getById(id: string): Promise<SamplePreparationResponse> {
    const response = await api.get(`sample-preparations/${id}`).json()
    return response as SamplePreparationResponse
  },

  async search(
    query: string, 
    page: number = 1,
    filters?: {
      jobId?: string
      clientName?: string
      projectName?: string
      specimenId?: string
      dateFrom?: string
      dateTo?: string
    }
  ): Promise<SamplePreparationListResponse> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString()
    })

    if (filters) {
      if (filters.jobId) params.append('jobId', filters.jobId)
      if (filters.clientName) params.append('clientName', filters.clientName)
      if (filters.projectName) params.append('projectName', filters.projectName)
      if (filters.specimenId) params.append('specimenId', filters.specimenId)
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.append('dateTo', filters.dateTo)
    }

    const response = await api.get(`sample-preparations/search?${params.toString()}`).json()
    return response as SamplePreparationListResponse
  },

  async create(data: CreateSamplePreparationData): Promise<SamplePreparationResponse> {
    const response = await api.post("sample-preparations", { json: data }).json()
    return response as SamplePreparationResponse
  },

  async update(id: string, data: UpdateSamplePreparationData): Promise<SamplePreparationResponse> {
    const response = await api.patch(`sample-preparations/${id}`, { json: data }).json()
    return response as SamplePreparationResponse
  },

  async delete(id: string): Promise<void> {
    await api.delete(`sample-preparations/${id}`)
  },

  // Specimen CRUD
  async createSpecimen(data: CreateSpecimenData): Promise<SpecimenResponse> {
    const response = await api.post("specimens", { json: data }).json()
    return response as SpecimenResponse
  },

  async updateSpecimen(id: string, data: UpdateSpecimenData): Promise<SpecimenResponse> {
    const response = await api.patch(`specimens/${id}`, { json: data }).json()
    return response as SpecimenResponse
  },

  async deleteSpecimen(id: string): Promise<void> {
    await api.delete(`specimens/${id}`)
  },

  async getSpecimen(id: string): Promise<SpecimenResponse> {
    const response = await api.get(`specimens/${id}`).json()
    return response as SpecimenResponse
  },
}
