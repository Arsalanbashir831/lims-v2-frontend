import { api } from "@/lib/api/api"
import {
  ProficiencyTestingResponse,
  ProficiencyTestingListResponse,
  CreateProficiencyTestingData,
  UpdateProficiencyTestingData,
} from "@/lib/schemas/proficiency-testing"

export type ProficiencyTesting = ProficiencyTestingResponse

export const proficiencyTestingService = {
  async getAll(page: number = 1): Promise<ProficiencyTestingListResponse> {
    const response = await api.get(`proficiency-testing?page=${page}`).json()
    return response as ProficiencyTestingListResponse
  },

  async getById(id: string): Promise<ProficiencyTestingResponse> {
    const response = await api.get(`proficiency-testing/${id}`).json()
    return response as ProficiencyTestingResponse
  },

  async create(data: CreateProficiencyTestingData): Promise<ProficiencyTestingResponse> {
    const response = await api.post("proficiency-testing", { json: data }).json()
    return response as ProficiencyTestingResponse
  },

  async update(id: string, data: UpdateProficiencyTestingData): Promise<ProficiencyTestingResponse> {
    const response = await api.patch(`proficiency-testing/${id}`, { json: data }).json()
    return response as ProficiencyTestingResponse
  },

  async delete(id: string): Promise<void> {
    await api.delete(`proficiency-testing/${id}`)
  },

  async search(query: string, page: number = 1): Promise<ProficiencyTestingListResponse> {
    const response = await api.get(`proficiency-testing/search?q=${query}&page=${page}`).json()
    return response as ProficiencyTestingListResponse
  },
}

export type {
  ProficiencyTestingResponse,
  ProficiencyTestingListResponse,
  CreateProficiencyTestingData,
  UpdateProficiencyTestingData,
}
