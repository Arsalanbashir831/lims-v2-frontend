import { z } from "zod"
import ky from "ky"
import { API_ROUTES } from "@/constants/api-routes"
import { api } from "./api/ky"

// Sample Details schemas
const TestMethodRefSchema = z.object({
  id: z.string(),
  name: z.string(),
})

const SampleDetailSchema = z.object({
  id: z.string(),
  sampleInformationId: z.string(),
  indexNo: z.number(),
  description: z.string(),
  mtcNo: z.string().nullable(),
  sampleType: z.string().nullable(),
  materialType: z.string().nullable(),
  heatNo: z.string().nullable(),
  storageLocation: z.string().nullable(),
  condition: z.string().nullable(),
  testMethods: z.array(TestMethodRefSchema),
  is_active: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  version: z.number().optional(),
  created_by: z.number().optional(),
  updated_by: z.number().optional(),
  created_by_name: z.string().optional(),
  updated_by_name: z.string().optional(),
})

const SampleDetailListResponseSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(SampleDetailSchema),
})

// TypeScript types
export type TestMethodRef = z.infer<typeof TestMethodRefSchema>
export type SampleDetail = z.infer<typeof SampleDetailSchema>

export type CreateSampleDetailData = {
  sampleInformationId: string
  indexNo: number
  description: string
  mtcNo?: string
  sampleType?: string
  materialType?: string
  heatNo?: string
  storageLocation?: string
  condition?: string
  testMethods: TestMethodRef[]
}

export type UpdateSampleDetailData = Partial<CreateSampleDetailData>

// API client
export const sampleDetailService = {
  async getAll(page: number = 1): Promise<{ results: SampleDetail[]; count: number; next: string | null; previous: string | null }> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.ALL_SAMPLE_DETAILS, {
      searchParams: { is_active: true, page }
    }).json()
    const validated = SampleDetailListResponseSchema.parse(response)
    return {
      results: validated.results,
      count: validated.count,
      next: validated.next ?? null,
      previous: validated.previous ?? null,
    }
  },

  async getById(id: string): Promise<SampleDetail> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.SAMPLE_DETAIL_BY_ID(id)).json()
    return SampleDetailSchema.parse(response)
  },

  async create(data: CreateSampleDetailData): Promise<SampleDetail> {
    const response = await api.post(API_ROUTES.Lab_MANAGERS.ADD_SAMPLE_DETAIL, {
      json: data
    }).json()
    return SampleDetailSchema.parse(response)
  },

  async update(id: string, data: UpdateSampleDetailData): Promise<SampleDetail> {
    const response = await api.put(API_ROUTES.Lab_MANAGERS.UPDATE_SAMPLE_DETAIL(id), {
      json: data
    }).json()
    return SampleDetailSchema.parse(response)
  },

  async delete(id: string): Promise<void> {
    await api.delete(API_ROUTES.Lab_MANAGERS.DELETE_SAMPLE_DETAIL(id))
  },

  async search(query: string, page: number = 1): Promise<{ results: SampleDetail[]; count: number; next: string | null; previous: string | null }> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.SEARCH_SAMPLE_DETAILS, {
      searchParams: { q: query, page }
    }).json()
    const validated = SampleDetailListResponseSchema.parse(response)
    return {
      results: validated.results,
      count: validated.count,
      next: validated.next ?? null,
      previous: validated.previous ?? null,
    }
  },
}
