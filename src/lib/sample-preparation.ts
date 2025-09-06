import { z } from "zod"
import { api } from "@/lib/api/ky"
import { API_ROUTES } from "@/constants/api-routes"

// Complete Job Response Schema
export const CompleteJobSchema = z.object({
  job_id: z.string(),
  project_name: z.string(),
  client: z.object({
    id: z.number(),
    name: z.string(),
    contact_person: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address_line_1: z.string().optional(),
    address_line_2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postal_code: z.string().optional(),
    is_active: z.boolean(),
  }),
  end_user: z.string().optional(),
  received_date: z.string(),
  remarks: z.string().optional(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  created_by: z.string().optional(),
  updated_by: z.string().optional(),
  samples: z.array(z.object({
    id: z.number(),
    sample_id: z.string(),
    description: z.string(),
    mtc_no: z.string().optional(),
    sample_type: z.string().optional(),
    material_type: z.string().optional(),
    heat_no: z.string().optional(),
    material_storage_location: z.string().optional(),
    condition: z.string().optional(),
    status: z.string(),
    test_methods: z.array(z.string()),
    test_method_names: z.array(z.string()),
    is_active: z.boolean(),
  })),
  sample_count: z.number(),
})

export type CompleteJob = z.infer<typeof CompleteJobSchema>

// Complete Request Schema (API Response) - List View
export const CompleteRequestListSchema = z.object({
  request_id: z.string(),
  job_id: z.string(),
  job_project_name: z.string(),
  request_description: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
  test_items_count: z.number(),
  total_specimens: z.number(),
  created_by_name: z.string(),
})

// Complete Request Schema (API Response) - Detail View
export const CompleteRequestDetailSchema = z.object({
  id: z.string(),
  job: z.string(),
  test_items: z.array(z.object({
    id: z.string().optional(),
    sample: z.number(),
    test_method: z.string(),
    dimensions: z.string().optional(),
    no_of_samples: z.number(),
    no_of_specimens: z.number(),
    requested_by: z.string().optional(),
    remarks: z.string().optional(),
    planned_test_date: z.string().optional(),
    specimens: z.array(z.object({
      id: z.string().optional(),
      specimen_id: z.string(),
      isFromInitialData: z.boolean().optional(),
    })),
  })),
  created_at: z.string(),
  updated_at: z.string(),
})

// Union schema for both list and detail responses
export const CompleteRequestSchema = z.union([CompleteRequestListSchema, CompleteRequestDetailSchema])

export type CompleteRequestList = z.infer<typeof CompleteRequestListSchema>
export type CompleteRequestDetail = z.infer<typeof CompleteRequestDetailSchema>
export type CompleteRequest = CompleteRequestList | CompleteRequestDetail

// Create Request Data Type
export type CreateCompleteRequestData = {
  job: string
  test_items: Array<{
    sample: number
    test_method: string
    dimensions?: string
    no_of_samples: number
    no_of_specimens: number
    requested_by?: string
    remarks?: string
    planned_test_date?: string
    specimens: Array<{
      specimen_id: string
    }>
  }>
}

// Legacy types for backward compatibility
export type SamplePreparation = CompleteRequest
export type PreparationItem = CompleteRequestDetail['test_items'][0]
export type CreateSamplePreparationData = CreateCompleteRequestData
export type UpdateSamplePreparationData = Partial<CreateCompleteRequestData>

// Service
export const samplePreparationService = {
  async getCompleteJob(jobId: string): Promise<CompleteJob> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.GET_COMPLETE_JOB(jobId)).json()
    return CompleteJobSchema.parse(response)
  },

  async getAll(page: number = 1): Promise<{ results: CompleteRequest[], count: number, next: string | null, previous: string | null }> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.ALL_SAMPLE_PREPARATIONS, {
      searchParams: { page }
    }).json() as any
    
    // Parse the list response
    const parsedResults = (response.results || []).map((item: any) => {
      try {
        return CompleteRequestListSchema.parse(item)
      } catch (error) {
        console.warn('Failed to parse list item:', item, error)
        return item // Return as-is if parsing fails
      }
    })
    
    return {
      results: parsedResults,
      count: response.count || 0,
      next: response.next || null,
      previous: response.previous || null,
    }
  },

  async getById(id: string): Promise<CompleteRequest> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.GET_SAMPLE_PREPARATION(id)).json()
    
    try {
      return CompleteRequestDetailSchema.parse(response)
    } catch (error) {
      console.warn('Failed to parse detail response, trying list schema:', error)
      try {
        return CompleteRequestListSchema.parse(response)
      } catch (listError) {
        console.warn('Failed to parse with list schema, returning raw response:', listError)
        // If both schemas fail, return the raw response as it might be a different structure
        // This handles cases where the API returns a different format than expected
        return response as CompleteRequest
      }
    }
  },

  async create(data: CreateCompleteRequestData): Promise<CompleteRequest> {
    const response = await api.post(API_ROUTES.Lab_MANAGERS.ADD_SAMPLE_PREPARATION, {
      json: data
    }).json()
    
    try {
      return CompleteRequestSchema.parse(response)
    } catch (error) {
      console.error('Schema validation error:', error)
      
      // If the response has an id and looks like a valid response, return it anyway
      if (response && typeof response === 'object' && 'id' in response) {
        return response as CompleteRequest
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error'
      throw new Error(`API response validation failed: ${errorMessage}`)
    }
  },

  async update(id: string, data: UpdateSamplePreparationData): Promise<CompleteRequest> {
    const response = await api.put(API_ROUTES.Lab_MANAGERS.UPDATE_SAMPLE_PREPARATION(id), {
      json: data
    }).json()
    
    try {
      return CompleteRequestSchema.parse(response)
    } catch (error) {
      console.error('Schema validation error:', error)
      
      // If the response has an id and looks like a valid response, return it anyway
      if (response && typeof response === 'object' && 'id' in response) {
        return response as CompleteRequest
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error'
      throw new Error(`API response validation failed: ${errorMessage}`)
    }
  },

  async delete(id: string): Promise<void> {
    await api.delete(API_ROUTES.Lab_MANAGERS.DELETE_SAMPLE_PREPARATION(id))
  },

  async search(query: string, page: number = 1): Promise<{ results: CompleteRequest[], count: number, next: string | null, previous: string | null }> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.SEARCH_SAMPLE_PREPARATIONS, {
      searchParams: { q: query, page }
    }).json() as any
    
    return {
      results: response.results || [],
      count: response.count || 0,
      next: response.next || null,
      previous: response.previous || null,
    }
  },

  // Specimen operations
  async deleteSpecimen(specimenId: string): Promise<void> {
    await api.delete(`api/specimens/${specimenId}/`)
  },

  async updateSpecimen(specimenId: string, data: { test_item: string, specimen_id: string }): Promise<void> {
    await api.put(`api/specimens/${specimenId}/`, {
      json: data
    })
  },

  // Test item operations
  async updateTestItem(testItemId: string, data: {
    sample: string
    test_method: string
    dimensions?: string
    no_of_samples: string
    no_of_specimens: string
    requested_by?: string
    remarks?: string
    planned_test_date?: string
  }): Promise<void> {
    await api.put(`/api/test-items/${testItemId}/`, {
      json: data
    })
  },
}

// Helper function to generate prep number
export function generatePrepNo(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const time = now.getTime().toString().slice(-6)
  return `PREP-${year}${month}${day}-${time}`
}

// Helper function to create preparation item
export function createPreparationItem(data: Partial<PreparationItem>): PreparationItem {
  return {
    id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    sample: data.sample || 0,
    test_method: data.test_method || "",
    dimensions: data.dimensions || "",
    no_of_samples: data.no_of_samples || 0,
    no_of_specimens: data.no_of_specimens || 0,
    requested_by: data.requested_by,
    remarks: data.remarks,
    planned_test_date: data.planned_test_date,
    specimens: data.specimens || [],
  }
}