import { z } from "zod"
import { API_ROUTES } from "@/constants/api-routes"
import { api } from "./api/ky"

// Sample Details schemas
const TestMethodRefSchema = z.object({
  id: z.string(),
  name: z.string(),
})

const SampleDetailSchema = z.object({
  id: z.number(),
  sample_id: z.string(),
  job: z.string().optional(),
  job_id: z.string(),
  description: z.string().optional(),
  mtc_no: z.string().nullable().optional(),
  sample_type: z.string().nullable().optional(),
  material_type: z.string().nullable().optional(),
  heat_no: z.string().nullable().optional(),
  material_storage_location: z.string().nullable().optional(),
  condition: z.string().nullable().optional(),
  status: z.string(),
  test_methods: z.array(z.string()).optional(),
  test_methods_count: z.number(),
  is_active: z.boolean(),
  created_by: z.number().optional(),
  created_by_username: z.string().optional(),
  updated_by: z.number().optional(),
  updated_by_username: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
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
  job: string
  description: string
  mtc_no?: string
  sample_type?: string
  material_type?: string
  heat_no?: string
  material_storage_location?: string
  condition?: string
  test_methods: string[]
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
    
    // Create a more flexible schema for create response
    const CreateResponseSchema = z.object({
      id: z.number(),
      sample_id: z.string().optional(),
      job_id: z.string().optional(),
      material_type: z.string().nullable().optional(),
      sample_type: z.string().nullable().optional(),
      status: z.string().optional(),
      test_methods_count: z.number().optional(),
      is_active: z.boolean().optional(),
      created_by_username: z.string().optional(),
      created_at: z.string().optional(),
      updated_at: z.string().optional(),
    })
    
    const validated = CreateResponseSchema.parse(response)
    
    // Convert to SampleDetail format with defaults
    return {
      id: validated.id,
      sample_id: validated.sample_id || "",
      job_id: validated.job_id || data.job,
      material_type: validated.material_type || data.material_type || null,
      sample_type: validated.sample_type || data.sample_type || null,
      status: validated.status || "active",
      test_methods_count: validated.test_methods_count || data.test_methods.length,
      is_active: validated.is_active ?? true,
      created_by_username: validated.created_by_username,
      created_at: validated.created_at || new Date().toISOString(),
      updated_at: validated.updated_at || new Date().toISOString(),
    }
  },

  async update(id: string, data: UpdateSampleDetailData): Promise<SampleDetail> {
    const response = await api.put(API_ROUTES.Lab_MANAGERS.UPDATE_SAMPLE_DETAIL(id), {
      json: data
    }).json()
    
    // Create a more flexible schema for update response
    const UpdateResponseSchema = z.object({
      id: z.number().optional(),
      sample_id: z.string().optional(),
      job_id: z.string().optional(),
      description: z.string().optional(),
      mtc_no: z.string().nullable().optional(),
      sample_type: z.string().nullable().optional(),
      material_type: z.string().nullable().optional(),
      heat_no: z.string().nullable().optional(),
      material_storage_location: z.string().nullable().optional(),
      condition: z.string().nullable().optional(),
      status: z.string().optional(),
      test_methods: z.array(z.string()).optional(),
      test_methods_count: z.number().optional(),
      is_active: z.boolean().optional(),
      created_by: z.number().optional(),
      created_by_username: z.string().optional(),
      updated_by: z.number().optional(),
      updated_by_username: z.string().optional(),
      created_at: z.string().optional(),
      updated_at: z.string().optional(),
    })
    
    const validated = UpdateResponseSchema.parse(response)
    
    // Convert to SampleDetail format with defaults
    return {
      id: validated.id || parseInt(id),
      sample_id: validated.sample_id || "",
      job_id: validated.job_id || data.job || "",
      description: validated.description || data.description || "",
      mtc_no: validated.mtc_no || data.mtc_no || null,
      sample_type: validated.sample_type || data.sample_type || null,
      material_type: validated.material_type || data.material_type || null,
      heat_no: validated.heat_no || data.heat_no || null,
      material_storage_location: validated.material_storage_location || data.material_storage_location || null,
      condition: validated.condition || data.condition || null,
      status: validated.status || "active",
      test_methods: validated.test_methods || data.test_methods || [],
      test_methods_count: validated.test_methods_count || (data.test_methods?.length || 0),
      is_active: validated.is_active ?? true,
      created_by: validated.created_by,
      created_by_username: validated.created_by_username,
      updated_by: validated.updated_by,
      updated_by_username: validated.updated_by_username,
      created_at: validated.created_at || new Date().toISOString(),
      updated_at: validated.updated_at || new Date().toISOString(),
    }
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
