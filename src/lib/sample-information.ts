import { z } from "zod"
import { API_ROUTES } from "@/constants/api-routes"
import { api } from "./api/ky"

// Sample Information schemas
const SampleInformationSchema = z.object({
  job_id: z.string(),
  project_name: z.string(),
  client_name: z.string(),
  end_user: z.string().nullable(),
  received_date: z.string(),
  remarks: z.string().nullable().optional(),
  sample_count: z.number(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

// Edit response schema (has additional fields and different client format)
const SampleInformationEditSchema = z.object({
  job_id: z.string(),
  project_name: z.string(),
  client: z.number(), // Client ID
  client_name: z.string(),
  end_user: z.string().nullable(),
  received_date: z.string(),
  remarks: z.string().nullable().optional(),
  sample_count: z.number(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  created_by: z.number().optional(),
  created_by_username: z.string().optional(),
  updated_by: z.number().optional(),
  updated_by_username: z.string().optional(),
})

// Update response schema (may have fewer fields than edit response)
const SampleInformationUpdateSchema = z.object({
  job_id: z.string().optional(),
  project_name: z.string().optional(),
  client: z.number().optional(),
  client_name: z.string().optional(),
  end_user: z.string().nullable().optional(),
  received_date: z.string().optional(),
  remarks: z.string().nullable().optional(),
  sample_count: z.number().optional(),
  is_active: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  created_by: z.number().optional(),
  created_by_username: z.string().optional(),
  updated_by: z.number().optional(),
  updated_by_username: z.string().optional(),
})

const SampleInformationListResponseSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(SampleInformationSchema),
})

// Search response might be different - handle both array and object formats
const SampleInformationSearchResponseSchema = z.union([
  // Standard paginated response
  SampleInformationListResponseSchema,
  // Direct array response
  z.array(SampleInformationSchema)
])

// TypeScript types
export type SampleInformation = z.infer<typeof SampleInformationSchema>
export type SampleInformationEdit = z.infer<typeof SampleInformationEditSchema>
export type SampleInformationUpdate = z.infer<typeof SampleInformationUpdateSchema>

export type CreateSampleInformationData = {
  project_name: string
  client: string
  end_user?: string
  received_date: string
  remarks?: string
}

export type UpdateSampleInformationData = Partial<CreateSampleInformationData>

// API client
export const sampleInformationService = {
  async getAll(page: number = 1): Promise<{ results: SampleInformation[]; count: number; next: string | null; previous: string | null }> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.ALL_SAMPLE_INFORMATION, {
      searchParams: { page }
    }).json()
    const validated = SampleInformationListResponseSchema.parse(response)
    return {
      results: validated.results,
      count: validated.count,
      next: validated.next ?? null,
      previous: validated.previous ?? null,
    }
  },

  async getById(id: string): Promise<SampleInformationEdit> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.SAMPLE_INFORMATION_BY_ID(id)).json()
    return SampleInformationEditSchema.parse(response)
  },

  async create(data: CreateSampleInformationData): Promise<SampleInformation> {
    const response = await api.post(API_ROUTES.Lab_MANAGERS.ADD_SAMPLE_INFORMATION, {
      json: data
    }).json()
    return SampleInformationSchema.parse(response)
  },

  async update(id: string, data: UpdateSampleInformationData): Promise<SampleInformationUpdate> {
    const response = await api.put(API_ROUTES.Lab_MANAGERS.UPDATE_SAMPLE_INFORMATION(id), {
      json: data
    }).json()
    return SampleInformationUpdateSchema.parse(response)
  },

  async delete(id: string): Promise<void> {
    await api.delete(API_ROUTES.Lab_MANAGERS.DELETE_SAMPLE_INFORMATION(id))
  },

  async search(query: string, page: number = 1): Promise<{ results: SampleInformation[]; count: number; next: string | null; previous: string | null }> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.SEARCH_SAMPLE_INFORMATION, {
      searchParams: { q: query, page }
    }).json()
    const validated = SampleInformationSearchResponseSchema.parse(response)
    
    // Handle both array and object response formats
    if (Array.isArray(validated)) {
      // Direct array response
      return {
        results: validated,
        count: validated.length,
        next: null,
        previous: null,
      }
    } else {
      // Standard paginated response
      return {
        results: validated.results,
        count: validated.count,
        next: validated.next ?? null,
        previous: validated.previous ?? null,
      }
    }
  },
}
