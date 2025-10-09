import { API_ROUTES } from "@/constants/api-routes"
import { api } from "@/lib/api/api"
import {
  SampleLotResponse,
  SampleLotListResponse,
  CreateSampleLotData,
  UpdateSampleLotData,
} from "@/lib/schemas/sample-lot"

export const sampleLotService = {
  async getAll(page: number = 1): Promise<SampleLotListResponse> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.ALL_SAMPLE_LOTS, { searchParams: { page: page.toString() } }).json()
    return response as SampleLotListResponse
  },

  async getById(id: string): Promise<SampleLotResponse> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.SAMPLE_LOT_BY_ID(id)).json()
    return response as SampleLotResponse
  },

  async create(data: CreateSampleLotData): Promise<SampleLotResponse> {
    const response = await api.post(API_ROUTES.Lab_MANAGERS.ADD_SAMPLE_LOT, { json: data }).json()
    return response as SampleLotResponse
  },

  async update(id: string, data: UpdateSampleLotData): Promise<SampleLotResponse> {
    const response = await api.put(API_ROUTES.Lab_MANAGERS.UPDATE_SAMPLE_LOT(id), { json: data }).json()
    return response as SampleLotResponse
  },

  async delete(id: string): Promise<void> {
    await api.delete(API_ROUTES.Lab_MANAGERS.DELETE_SAMPLE_LOT(id))
  },

  async search(query: string, page: number = 1): Promise<SampleLotListResponse> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.SEARCH_SAMPLE_LOTS, { searchParams: { q: query, page: page.toString() } }).json()
    return response as SampleLotListResponse
  },

  async getByJobDocumentId(jobDocumentId: string): Promise<{ data: any[], total: number, job_info: any }> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.GET_SAMPLE_LOTS_BY_JOB_ID(jobDocumentId)).json<{
      status: string
      data: any[]
      total: number
      job_info: any
    }>()
    
    if (response.status === "success") {
      return {
        data: response.data,
        total: response.total,
        job_info: response.job_info
      }
    }
    
    throw new Error("Failed to get sample lots by job document ID")
  },
}

export type {
  SampleLotResponse,
  SampleLotListResponse,
  CreateSampleLotData,
  UpdateSampleLotData,
}
