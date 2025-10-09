import { api } from "@/lib/api/api"
import {
  SampleLotResponse,
  SampleLotListResponse,
  CreateSampleLotData,
  UpdateSampleLotData,
} from "@/lib/schemas/sample-lot"

export const sampleLotService = {
  async getAll(page: number = 1): Promise<SampleLotListResponse> {
    const response = await api.get(`sample-lots?page=${page}`).json()
    return response as SampleLotListResponse
  },

  async getById(id: string): Promise<SampleLotResponse> {
    const response = await api.get(`sample-lots/${id}`).json()
    return response as SampleLotResponse
  },

  async create(data: CreateSampleLotData): Promise<SampleLotResponse> {
    const response = await api.post("sample-lots", { json: data }).json()
    return response as SampleLotResponse
  },

  async update(id: string, data: UpdateSampleLotData): Promise<SampleLotResponse> {
    const response = await api.patch(`sample-lots/${id}`, { json: data }).json()
    return response as SampleLotResponse
  },

  async delete(id: string): Promise<void> {
    await api.delete(`sample-lots/${id}`)
  },

  async search(query: string, page: number = 1): Promise<SampleLotListResponse> {
    const response = await api.get(`sample-lots/search?q=${query}&page=${page}`).json()
    return response as SampleLotListResponse
  },
}

export type {
  SampleLotResponse,
  SampleLotListResponse,
  CreateSampleLotData,
  UpdateSampleLotData,
}
