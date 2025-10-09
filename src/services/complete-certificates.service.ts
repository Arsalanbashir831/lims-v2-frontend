import { api } from "@/lib/api/api"
import {
  CompleteCertificateResponse,
  CompleteCertificateListResponse,
  CreateCompleteCertificateData,
  UpdateCompleteCertificateData,
} from "@/lib/schemas/complete-certificate"

export const completeCertificateService = {
  async getAll(page: number = 1): Promise<CompleteCertificateListResponse> {
    const response = await api.get(`complete-certificates?page=${page}`).json()
    return response as CompleteCertificateListResponse
  },

  async getById(id: string): Promise<CompleteCertificateResponse> {
    const response = await api.get(`complete-certificates/${id}`).json()
    return response as CompleteCertificateResponse
  },

  async create(data: CreateCompleteCertificateData): Promise<CompleteCertificateResponse> {
    const response = await api.post("complete-certificates", { json: data }).json()
    return response as CompleteCertificateResponse
  },

  async update(id: string, data: UpdateCompleteCertificateData): Promise<CompleteCertificateResponse> {
    const response = await api.patch(`complete-certificates/${id}`, { json: data }).json()
    return response as CompleteCertificateResponse
  },

  async delete(id: string): Promise<void> {
    await api.delete(`complete-certificates/${id}`)
  },

  async search(query: string, page: number = 1): Promise<CompleteCertificateListResponse> {
    const response = await api.get(`complete-certificates/search?q=${query}&page=${page}`).json()
    return response as CompleteCertificateListResponse
  },
}

export type {
  CompleteCertificateResponse,
  CompleteCertificateListResponse,
  CreateCompleteCertificateData,
  UpdateCompleteCertificateData,
}
