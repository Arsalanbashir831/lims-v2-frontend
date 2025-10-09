import { api } from "@/lib/api/api"
import {
  CalibrationTestingResponse,
  CalibrationTestingListResponse,
  CreateCalibrationTestingData,
  UpdateCalibrationTestingData,
} from "@/lib/schemas/calibration-testing"

export type CalibrationTesting = CalibrationTestingResponse

export const calibrationTestingService = {
  async getAll(page: number = 1): Promise<CalibrationTestingListResponse> {
    const response = await api.get(`calibration-testing?page=${page}`).json()
    return response as CalibrationTestingListResponse
  },

  async getById(id: string): Promise<CalibrationTestingResponse> {
    const response = await api.get(`calibration-testing/${id}`).json()
    return response as CalibrationTestingResponse
  },

  async create(data: CreateCalibrationTestingData): Promise<CalibrationTestingResponse> {
    const response = await api.post("calibration-testing", { json: data }).json()
    return response as CalibrationTestingResponse
  },

  async update(id: string, data: UpdateCalibrationTestingData): Promise<CalibrationTestingResponse> {
    const response = await api.patch(`calibration-testing/${id}`, { json: data }).json()
    return response as CalibrationTestingResponse
  },

  async delete(id: string): Promise<void> {
    await api.delete(`calibration-testing/${id}`)
  },

  async search(query: string, page: number = 1): Promise<CalibrationTestingListResponse> {
    const response = await api.get(`calibration-testing/search?q=${query}&page=${page}`).json()
    return response as CalibrationTestingListResponse
  },
}

export type {
  CalibrationTestingResponse,
  CalibrationTestingListResponse,
  CreateCalibrationTestingData,
  UpdateCalibrationTestingData,
}
