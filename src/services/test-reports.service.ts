import { api } from "@/lib/api/api"
import {
  TestReportResponse,
  TestReportListResponse,
  CreateTestReportData,
  UpdateTestReportData,
} from "@/lib/schemas/test-report"

export const testReportService = {
  async getAll(page: number = 1): Promise<TestReportListResponse> {
    const response = await api.get(`test-reports?page=${page}`).json()
    return response as TestReportListResponse
  },

  async getById(id: string): Promise<TestReportResponse> {
    const response = await api.get(`test-reports/${id}`).json()
    return response as TestReportResponse
  },

  async create(data: CreateTestReportData): Promise<TestReportResponse> {
    const response = await api.post("test-reports", { json: data }).json()
    return response as TestReportResponse
  },

  async update(id: string, data: UpdateTestReportData): Promise<TestReportResponse> {
    const response = await api.patch(`test-reports/${id}`, { json: data }).json()
    return response as TestReportResponse
  },

  async delete(id: string): Promise<void> {
    await api.delete(`test-reports/${id}`)
  },

  async search(query: string, page: number = 1): Promise<TestReportListResponse> {
    const response = await api.get(`test-reports/search?q=${query}&page=${page}`).json()
    return response as TestReportListResponse
  },
}

export type {
  TestReportResponse,
  TestReportListResponse,
  CreateTestReportData,
  UpdateTestReportData,
} from "@/lib/schemas/test-report"
