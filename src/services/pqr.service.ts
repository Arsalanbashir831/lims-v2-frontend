import { api } from "@/lib/api/api"
import {
  PQRResponse,
  PQRListResponse,
  CreatePQRData,
  UpdatePQRData,
} from "@/lib/schemas/pqr"

export const pqrService = {
  async getAll(page: number = 1): Promise<PQRListResponse> {
    const response = await api.get(`pqr?page=${page}`).json()
    return response as PQRListResponse
  },

  async getById(id: string): Promise<PQRResponse> {
    const response = await api.get(`pqr/${id}`).json()
    return response as PQRResponse
  },

  async create(data: CreatePQRData): Promise<PQRResponse> {
    const response = await api.post("pqr", { json: data }).json()
    return response as PQRResponse
  },

  async update(id: string, data: UpdatePQRData): Promise<PQRResponse> {
    const response = await api.patch(`pqr/${id}`, { json: data }).json()
    return response as PQRResponse
  },

  async delete(id: string): Promise<void> {
    await api.delete(`pqr/${id}`)
  },

  async search(query: string, page: number = 1): Promise<PQRListResponse> {
    const response = await api.get(`pqr/search?q=${query}&page=${page}`).json()
    return response as PQRListResponse
  },
}

export type {
  PQRResponse,
  PQRListResponse,
  CreatePQRData,
  UpdatePQRData,
}
