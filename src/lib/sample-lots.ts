import { z } from "zod"
import { API_ROUTES } from "@/constants/api-routes"
import { api } from "./api/ky"

const SampleLotSchema = z.object({
  id: z.string(),
  job_id: z.string(),
  item_no: z.string(),
  sample_type: z.string().nullable().optional(),
  material_type: z.string().nullable().optional(),
  condition: z.string().nullable().optional(),
  heat_no: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  mtc_no: z.string().nullable().optional(),
  storage_location: z.string().nullable().optional(),
  test_method_oids: z.array(z.string()).default([]),
  is_active: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

const SampleLotListResponseSchema = z.object({
  count: z.number(),
  next: z.union([z.number(), z.string()]).nullable(),
  previous: z.union([z.number(), z.string()]).nullable(),
  results: z.array(SampleLotSchema),
})

export type SampleLot = z.infer<typeof SampleLotSchema>

export type CreateSampleLotData = {
  job_id: string
  item_no?: string
  sample_type?: string | null
  material_type?: string | null
  condition?: string | null
  heat_no?: string | null
  description?: string | null
  mtc_no?: string | null
  storage_location?: string | null
  test_method_oids: string[]
}

export type UpdateSampleLotData = Partial<CreateSampleLotData>

export const sampleLotService = {
  async getAll(page: number = 1): Promise<{ results: SampleLot[]; count: number; next: string | null; previous: string | null }> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.ALL_SAMPLE_LOTS, { searchParams: { page } }).json()
    const validated = SampleLotListResponseSchema.parse(response)
    return { results: validated.results, count: validated.count, next: (validated.next as any) ?? null, previous: (validated.previous as any) ?? null }
  },

  async search(query: string, page: number = 1): Promise<{ results: SampleLot[]; count: number; next: string | null; previous: string | null }> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.SEARCH_SAMPLE_LOTS, { searchParams: { q: query, page } }).json()
    const validated = SampleLotListResponseSchema.parse(response)
    return { results: validated.results, count: validated.count, next: (validated.next as any) ?? null, previous: (validated.previous as any) ?? null }
  },

  async getById(id: string): Promise<SampleLot> {
    const response = await api.get(API_ROUTES.Lab_MANAGERS.SAMPLE_LOT_BY_ID(id)).json()
    return SampleLotSchema.parse(response)
  },

  async create(data: CreateSampleLotData): Promise<SampleLot> {
    const response = await api.post(API_ROUTES.Lab_MANAGERS.ADD_SAMPLE_LOT, { json: data }).json()
    return SampleLotSchema.parse(response)
  },

  async update(id: string, data: UpdateSampleLotData): Promise<SampleLot> {
    const response = await api.patch(API_ROUTES.Lab_MANAGERS.UPDATE_SAMPLE_LOT(id), { json: data }).json()
    return SampleLotSchema.parse(response)
  },

  async delete(id: string): Promise<void> {
    await api.delete(API_ROUTES.Lab_MANAGERS.DELETE_SAMPLE_LOT(id))
  },
}


