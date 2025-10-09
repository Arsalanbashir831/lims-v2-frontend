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
    const response = await api.get(`sample-preparations?page=${page}`).json()
    return response as SamplePreparationListResponse
  },

  async getById(id: string): Promise<SamplePreparationResponse> {
    const response = await api.get(`sample-preparations/${id}`).json()
    return response as SamplePreparationResponse
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

  async search(query: string, page: number = 1): Promise<SamplePreparationListResponse> {
    const response = await api.get(`sample-preparations/search?q=${query}&page=${page}`).json()
    return response as SamplePreparationListResponse
  },

  // Specimen CRUD
  async getSpecimenById(id: string): Promise<SpecimenResponse> {
    const response = await api.get(`specimens/${id}`).json()
    return response as SpecimenResponse
  },

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
